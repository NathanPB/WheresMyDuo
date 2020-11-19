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

package dev.nathanpb.wmd.server.routes

import com.google.firebase.auth.FirebaseAuth
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.server.authenticate
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import org.litote.kmongo.eq


fun Route.profile() {
    val collection = mongoDb.getCollection<UserProfile>()

    suspend fun getUserProfileOrCreate(uid: String): UserProfile {
        var profile = collection.findOne(UserProfile::uid eq uid)
        if (profile == null) {
            var nickname = "Unknown"
            var photoURL = ""

            try {
                val user = FirebaseAuth.getInstance().getUser(uid)

                if (user?.isDisabled == false) {
                    nickname = user.displayName
                    photoURL = user.photoUrl
                }

                profile = UserProfile(uid, nickname, photoURL)
                collection.insertOne(profile)
            } catch (e: Exception) {  }

        }
        return profile ?: UserProfile(uid, "Unknown", "")
    }

    get {
        val user = context.authenticate() ?: return@get
        val profile = getUserProfileOrCreate(user.uid)
        context.respond(profile)
    }

    // TODO allow by friend request
    get("/{uid}") {
        context.authenticate() ?: return@get
        val uid = context.parameters["uid"].orEmpty()
        if (uid.isEmpty()) {
            context.respond(HttpStatusCode.BadRequest)
            return@get
        }

//        val user = FirebaseAuth.getInstance().getUser(uid)
//        if (user == null || user.isDisabled) {
//            context.respond(HttpStatusCode.NotFound)
//            return@get
//        }

        val profile = getUserProfileOrCreate(uid).copy(
            favs = emptyList()
        )
        context.respond(profile)
    }

    put {
        val user = context.authenticate() ?: return@put
        val sample = context.receive<UserProfile>().copy(
            uid = user.uid
        )

        if (sample.nickname.isEmpty()) {
            context.respond(HttpStatusCode.BadRequest, "Nickname cannot be empty")
            return@put
        }

        collection.save(sample)
        context.respond(HttpStatusCode.OK)
    }
}
