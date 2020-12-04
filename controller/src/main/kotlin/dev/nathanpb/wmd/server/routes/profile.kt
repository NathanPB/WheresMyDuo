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
import org.litote.kmongo.*
import org.litote.kmongo.coroutine.CoroutineCollection

suspend fun getUserProfile(
    uid: String,
    collection: CoroutineCollection<UserProfile> = mongoDb.getCollection()
): UserProfile? {
    return collection.findOne(UserProfile::uid eq uid)
}

suspend fun getUserProfileOrCreate(
    uid: String,
    collection: CoroutineCollection<UserProfile> = mongoDb.getCollection()
): UserProfile {
    var profile = getUserProfile(uid, collection)
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

fun Route.profile() {
    val collection = mongoDb.getCollection<UserProfile>()

    get {
        val user = context.authenticate() ?: return@get
        val profile = getUserProfileOrCreate(user.uid, collection)
        context.respond(profile)
    }

    get("/query") {
        val authUser = context.authenticate() ?: return@get

        val query = context.request.queryParameters["query"].orEmpty()
        val result = collection.aggregate<UserProfile>(
            listOf(
                match(
                    and(
                        not(UserProfile::uid eq authUser.uid),
                        UserProfile::nickname regex ".*${query}.*".toRegex(RegexOption.IGNORE_CASE)
                    )
                ),
                limit(20)
            )
        ).toList()

        context.respond(
            result.map {
                it.copy(
                    favs = emptyList(),
                    contactInfo = if (authUser.uid in it.friends) it.contactInfo else ""
                )
            }
        )
    }

    // TODO allow by friend request
    get("/{uid}") {
        val authUser = context.authenticate() ?: return@get
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
        context.respond(profile.copy(
            contactInfo = if (authUser.uid in profile.friends) profile.contactInfo else ""
        ))
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

    post("/fav/{uid}") {
        val user = context.authenticate() ?: return@post
        val uid = context.parameters["uid"].orEmpty()

        if (uid.isEmpty()) {
            context.respond(HttpStatusCode.BadRequest)
            return@post
        }

        val profile = getUserProfileOrCreate(user.uid, collection).let {
            it.copy(favs = (it.favs + uid).distinct())
        }

        collection.save(profile)
        context.respond(HttpStatusCode.OK)
    }

    post("/unfav/{uid}") {
        val user = context.authenticate() ?: return@post
        val uid = context.parameters["uid"].orEmpty()

        if (uid.isEmpty()) {
            context.respond(HttpStatusCode.BadRequest)
            return@post
        }

        val profile = getUserProfileOrCreate(user.uid, collection).let {
            it.copy(favs = it.favs - uid)
        }

        collection.save(profile)
        context.respond(HttpStatusCode.OK)
    }
}
