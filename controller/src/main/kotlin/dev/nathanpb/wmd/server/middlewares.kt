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
import com.auth0.jwt.interfaces.DecodedJWT
import dev.nathanpb.wmd.ADMIN_UID
import dev.nathanpb.wmd.controller.ReauthController
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.utils.exception
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*

private val AUTHORIZATION_HEADER_REGEX = "^(?i)Bearer (.*)(?-i)".toRegex()

fun ApplicationCall.retrieveBearerToken(): String? {
    return request.header("Authorization")?.let {
        val match = AUTHORIZATION_HEADER_REGEX.findAll(it).firstOrNull()?.groupValues
        if (match?.size == 2) match[1] else null
    }
}

fun ApplicationCall.authenticate(): DecodedJWT {
    val token = retrieveBearerToken()

    if (token == null || token.isEmpty()) {
        throw HttpStatusCode.Unauthorized.exception()
    }

    try {
        return ReauthController.decodeToken(token)
    } catch (e: Exception) {
        throw HttpStatusCode.Forbidden.exception()
    }
}

fun Context.userOrNull() = get<UserProfile>()

fun Context.userOrThrow(): UserProfile {
    return userOrNull() ?: throw HttpStatusCode.Unauthorized.exception()
}

fun Context.checkIsAdmin() {
    val user = userOrThrow()
    if (ADMIN_UID != user.uid) {
        throw HttpStatusCode.Forbidden.exception()
    }
}
