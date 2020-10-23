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

import dev.nathanpb.wmd.data.Tag
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.server.authenticate
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.serialization.SerializationException
import org.litote.kmongo.limit
import org.litote.kmongo.match
import org.litote.kmongo.newId
import org.litote.kmongo.regex

fun Route.tag() {
    val collection = mongoDb.getCollection<Tag>()

    get {
        val query = context.parameters["query"].orEmpty()
        val limit = context.parameters["limit"]?.toIntOrNull()?.coerceIn(1..50) ?: 50

        val queryList = if (query.isEmpty()) emptyArray() else arrayOf(
            match(
                Tag::displayName regex ".*${query}.*".toRegex(RegexOption.IGNORE_CASE)
            ),
        )

        collection.aggregate<Tag>(
            listOf(*queryList, limit(limit))
        ).toList().let {
            context.respond(it)
        }

    }

    get("/{id}") {
        context.genericGetOne(collection = collection, idProp = Tag::id)
    }

    post {
        context.authenticate(true) ?: return@post

        try {
            val sample = call.receive<Tag>().copy(
                id = newId(),
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
        context.authenticate(true) ?: return@put

        context.genericPut(
            collection = collection,
            idProp = Tag::id,
            validator = { validate() },
            updateFields = { arrayOf(it::displayName, it::description) }
        )
    }

    delete("/{id}") {
        context.authenticate(true) ?: return@delete

        context.genericDelete(
            collection = collection,
            idProp = Tag::id
        )
    }
}
