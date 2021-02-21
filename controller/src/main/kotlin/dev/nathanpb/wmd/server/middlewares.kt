/*
 * Copyright (c) 2020 - Nathan P. Bombana
 *
 * This file is part of Wheres My Duo.
 *
 * Wheres My Duo is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wheres My Duo is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Wheres My Duo.  If not, see <https://www.gnu.org/licenses/>.
 */

package dev.nathanpb.wmd.server

import com.apurebase.kgraphql.Context
import com.auth0.exception.APIException
import dev.nathanpb.wmd.controller.Auth0Controller
import dev.nathanpb.wmd.data.Auth0UserResume
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.utils.HttpException
import dev.nathanpb.wmd.utils.exception
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*

private val AUTHORIZATION_HEADER_REGEX = "^(?i)Bearer (.*)(?-i)".toRegex()

suspend fun ApplicationCall.authenticate(respondCall: Boolean = true) : Auth0UserResume? {
    val token = request.header("Authorization")?.let {
        val match = AUTHORIZATION_HEADER_REGEX.findAll(it).firstOrNull()?.groupValues
        if (match?.size == 2) match[1] else null
    }

    if (token == null || token.isEmpty()) {
        if (respondCall) {
            response.status(HttpStatusCode.Unauthorized)
        }
        return null
    }

    try {
        return Auth0Controller.exchangeToken(token)
    } catch (e: HttpException) {
        if (respondCall) {
            respond(e.code, e.description)
        }
    } catch(e: APIException) {
        if (respondCall) {
            respond(HttpStatusCode.fromValue(e.statusCode), e.description)
        }
    } catch (e: Exception) {
        if (respondCall) {
            respond(HttpStatusCode.InternalServerError, e.message.orEmpty())
        }
    }

    return null
}

fun Context.userOrNull() = get<UserProfile>()

fun Context.userOrThrow(): UserProfile {
    return userOrNull() ?: throw HttpStatusCode.Unauthorized.exception()
}

suspend fun Context.checkIsAdmin() {
    val user = userOrThrow()
    if (!Auth0Controller.getUserPermissions(user.uid).contains("delete:users")) {
        throw HttpStatusCode.Forbidden.exception()
    }
}
