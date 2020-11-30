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

import com.google.firebase.auth.FirebaseToken
import dev.nathanpb.wmd.data.FriendRequest
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.server.authenticate
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import org.bson.types.ObjectId
import org.litote.kmongo.and
import org.litote.kmongo.eq

fun Route.friendRequests() {

    val collection = mongoDb.getCollection<FriendRequest>()
    val userCollection = mongoDb.getCollection<UserProfile>()

    suspend fun respondFriendRequest(context: ApplicationCall, user: FirebaseToken, reqId: String, answer: Boolean) {

        val req = collection.findOne(
            and(
                FriendRequest::id eq ObjectId(reqId),
                FriendRequest::to eq user.uid
            )
        )

        if (req == null) {
            context.respond(HttpStatusCode.NotFound)
            return
        }

        if (answer) {
            val from = getUserProfileOrCreate(req.from, userCollection)
            val to = getUserProfileOrCreate(req.to, userCollection)

            userCollection.save(from.copy(friends = from.friends + to.uid.orEmpty()))
            userCollection.save(to.copy(friends = to.friends + from.uid.orEmpty()))
        }

        req.id?.let {
            collection.deleteOneById(it)
        }

        context.respond(HttpStatusCode.OK)
    }

    get {
        val user = context.authenticate() ?: return@get

        val requests = collection.find(FriendRequest::to eq user.uid).toList()
        context.respond(requests)
    }

    post("/{to}") {
        val from = context.authenticate() ?: return@post

        val to = getUserProfile(context.parameters["to"].orEmpty(), userCollection)
        if (to == null) {
            context.respond(HttpStatusCode.NotFound)
            return@post
        }

        if (from.uid == to.uid) {
            context.respond(HttpStatusCode.BadRequest, "We are always our own friend, comrade")
            return@post
        }

        if (from.uid in to.friends) {
            context.respond(HttpStatusCode.Conflict)
            return@post
        }

        val isUnresponded = collection.countDocuments(FriendRequest::to eq to.uid) > 0
        if (isUnresponded) {
            context.respond(HttpStatusCode.OK)
            return@post
        }

        collection.save(FriendRequest(null, from.uid, to.uid.orEmpty()))
        context.respond(HttpStatusCode.OK)
    }

    put("/{id}/accept") {
        val user = context.authenticate() ?: return@put
        val reqId = context.parameters["id"].orEmpty()
        respondFriendRequest(context, user, reqId, true)
    }

    put("/{id}/deny") {
        val user = context.authenticate() ?: return@put
        val reqId = context.parameters["id"].orEmpty()
        respondFriendRequest(context, user, reqId, false)
    }

    delete("/{id}") {
        val user = context.authenticate() ?: return@delete

        val userA = getUserProfile(context.parameters["id"].orEmpty())
        if (userA == null) {
            context.respond(HttpStatusCode.NotFound)
            return@delete
        }

        val userB = getUserProfileOrCreate(user.uid, userCollection)

        userCollection.save(userA.copy(friends = userA.friends - userB.uid.orEmpty()))
        userCollection.save(userB.copy(friends = userB.friends - userA.uid.orEmpty()))
        context.respond(HttpStatusCode.OK)
    }
}
