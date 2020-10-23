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

import com.api.igdb.request.IGDBWrapper
import com.api.igdb.utils.Endpoints
import dev.nathanpb.wmd.data.GamingProfile
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.server.authenticate
import dev.nathanpb.wmd.server.getRequestedObjectId
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.SerializationException
import org.litote.kmongo.*
import proto.GameResult

fun Route.gamingProfile() {
    val collection = mongoDb.getCollection<GamingProfile>()

    get {
        val user = context.parameters["user"]
        if (user == null || user.isEmpty()) {
            context.respond(HttpStatusCode.BadRequest, "user query parameter cannot be null or empty")
        } else {
            context.respond(
                collection.find(GamingProfile::user eq user).toList()
            )
        }
    }

    get("/{id}") {
        context.genericGetOne(collection = collection, idProp = GamingProfile::id)
    }

    post("/{gameId}") {
        val user = context.authenticate() ?: return@post

        try {
            val gameId = context.parameters["gameId"].orEmpty().toIntOrNull()

            val validateGame by lazy {
                GameResult.parseFrom(
                    IGDBWrapper.apiProtoRequest(Endpoints.GAMES, "fields *; limit 1; where id = $gameId;")
                ).gamesCount > 0
            }

            val validateDuplicated by lazy {
                runBlocking {
                    collection.countDocuments(
                        and(
                            GamingProfile::user eq user.uid,
                            GamingProfile::game eq gameId
                        )
                    ) == 0L
                }
            }

            if (gameId == null) {
                context.respond(HttpStatusCode.BadRequest, "gameId is not a 32 bit integer")
                return@post
            }

            if (!validateGame) {
                context.respond(HttpStatusCode.BadRequest, "ID is not valid")
                return@post
            }

            if (!validateDuplicated) {
                context.respond(HttpStatusCode.Conflict, "A gaming profile with this game and user already exists")
                return@post
            }

            collection.insertOne(GamingProfile(newId(), user.uid, gameId)).apply {
                if (wasAcknowledged()) {
                    context.respondText("""{ "_id": "${insertedId?.asObjectId()?.value}" }""")
                } else {
                    context.response.status(HttpStatusCode.InternalServerError)
                }
            }
        } catch (e: SerializationException) {
            e.printStackTrace()
            context.respond(HttpStatusCode.BadRequest, e.message.orEmpty())
        }
    }

    route("/{id}/tag") {
        get {
            val id = context.getRequestedObjectId("id") ?: return@get
            val data = collection.findOne(GamingProfile::id eq id)

            if (data == null) {
                context.respond(HttpStatusCode.NotFound)
            } else {
                context.respond(data.tags)
            }
        }

        post("/{tagId}") {
            val id = context.getRequestedObjectId("id") ?: return@post
            val tag = context.getRequestedObjectId("tagId") ?: return@post

            val data = collection.findOne(GamingProfile::id eq id)

            when {
                data == null -> context.respond(HttpStatusCode.NotFound)
                data.tags.any { it.equals(tag) } -> context.respond(HttpStatusCode.NotModified, "This profile already have this tag")
                else -> {
                    collection.updateMany(
                        GamingProfile::id eq id,
                        push(GamingProfile::tags, tag)
                    )
                }
            }
        }

        delete("/{tagId}") {
            val id = context.getRequestedObjectId("id") ?: return@delete
            val tag = context.getRequestedObjectId("tagId") ?: return@delete

            collection.updateMany(
                GamingProfile::id eq id,
                pull(GamingProfile::tags, tag)
            ).apply {
                when {
                    modifiedCount > 0 -> context.respond(HttpStatusCode.OK)
                    matchedCount == 0L -> context.respond(HttpStatusCode.NotFound)
                    else -> context.respond(HttpStatusCode.NotModified)
                }
            }
        }
    }

    delete("/{id}") {
        val user = context.authenticate() ?: return@delete
        val id = context.getRequestedObjectId("id") ?: return@delete

        val doc = collection.findOne(
            and(
                GamingProfile::id eq id,
                GamingProfile::user eq user.uid
            )
        )

        if (doc?.user != user.uid) {
            context.respond(HttpStatusCode.Forbidden)
            return@delete
        }

        context.genericDelete(
            collection = collection,
            idProp = GamingProfile::id
        )
    }
}
