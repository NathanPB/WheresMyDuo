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

import dev.nathanpb.wmd.data.GamingProfile
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.server.authenticate
import dev.nathanpb.wmd.utils.parseObjectId
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.serialization.SerializationException
import org.litote.kmongo.and
import org.litote.kmongo.eq
import org.litote.kmongo.newId

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

    post {
        val user = context.authenticate() ?: return@post

        try {
            val sample = call.receive<GamingProfile>().copy(
                id = newId(),
                user = user.uid,
                createdAt = System.currentTimeMillis()
            )

            if (!sample.validate()) {
                context.response.status(HttpStatusCode.BadRequest)
                return@post
            }

            collection.insertOne(sample).apply {
                if (wasAcknowledged()) {
                    context.respondText("""{ "id": "${insertedId?.asObjectId()?.value}" }""")
                } else {
                    context.response.status(HttpStatusCode.NoContent)
                }
            }
        } catch (e: SerializationException) {
            e.printStackTrace()
            context.respond(HttpStatusCode.BadRequest, e.message.orEmpty())
        }
    }

    put("/{id}") {
        val user = context.authenticate() ?: return@put

        val id = parseObjectId(context.parameters["id"].orEmpty())
        if (id == null) {
            context.respond(HttpStatusCode.BadRequest, "malformed id parameter")
            return@put
        }

        val doc = collection.findOne(
            and(
                GamingProfile::id eq id,
                GamingProfile::user eq user.uid
            )
        )

        if (doc?.user != user.uid) {
            context.respond(HttpStatusCode.Forbidden)
            return@put
        }

        context.genericPut(
            collection = collection,
            idProp = GamingProfile::id,
            validator = { validate() },
            updateFields = { arrayOf(it::hoursPerWeek, it::tags) }
        )
    }

    delete("/{id}") {
        val user = context.authenticate() ?: return@delete

        val id = parseObjectId(context.parameters["id"].orEmpty())
        if (id == null) {
            context.respond(HttpStatusCode.BadRequest, "malformed id parameter")
            return@delete
        }

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
