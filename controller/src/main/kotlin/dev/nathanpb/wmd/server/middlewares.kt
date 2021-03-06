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

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthException
import com.google.firebase.auth.FirebaseToken
import dev.nathanpb.wmd.ADMIN_EMAILS
import dev.nathanpb.wmd.utils.parseObjectId
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import org.bson.types.ObjectId

fun ApplicationCall.authenticate(requireAdmin: Boolean = false, respondCall: Boolean = true) : FirebaseToken? {
    val token = request.header("Authorization").orEmpty()

    if (token.isEmpty()) {
        if (respondCall) {
            response.status(HttpStatusCode.Unauthorized)
        }
        return null
    }

    try {
        val user = FirebaseAuth.getInstance().verifyIdToken(token)

        // Validate if the user is admin
        if (user != null && requireAdmin && user.email.toLowerCase() !in ADMIN_EMAILS) {
            return null
        }

        return user
    } catch (e: IllegalArgumentException) {
        if (respondCall) {
            response.status(HttpStatusCode.ServiceUnavailable)
        }
    } catch (e: FirebaseAuthException) {
        if (respondCall) {
            response.status(HttpStatusCode.Forbidden)
        }
    }

    return null
}

suspend fun ApplicationCall.getRequestedObjectId(paramKey: String): ObjectId? {
    val id = parseObjectId(parameters[paramKey].orEmpty())
    if (id == null) {
        respond(HttpStatusCode.BadRequest, "$paramKey parameter is invalid")
    }
    return id
}
