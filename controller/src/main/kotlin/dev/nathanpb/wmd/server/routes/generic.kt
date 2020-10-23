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

import dev.nathanpb.wmd.server.getRequestedObjectId
import dev.nathanpb.wmd.utils.combine
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import kotlinx.serialization.SerializationException
import org.litote.kmongo.coroutine.CoroutineCollection
import org.litote.kmongo.eq
import kotlin.reflect.KProperty

suspend fun ApplicationCall.genericGetAll(collection: CoroutineCollection<*>) {
    respond(collection.find().toList())
}

suspend fun ApplicationCall.genericGetOne(idParamKey: String = "id", idProp: KProperty<*>, collection: CoroutineCollection<*>) {
    val id = getRequestedObjectId(idParamKey) ?: return

    collection.findOne(idProp eq id)?.let {
        respond(it)
    } ?: response.status(HttpStatusCode.NotFound)
}

suspend inline fun <reified T: Any> ApplicationCall.genericPut(
    idParamKey: String = "id",
    collection: CoroutineCollection<T>,
    idProp: KProperty<*>,
    validator: T.()->Boolean,
    updateFields: (T)->Array<KProperty<*>>
) {
    try {
        val id = getRequestedObjectId(parameters[idParamKey].orEmpty()) ?: return

        val sample = receive<T>()
        if (!validator(sample)) {
            return response.status(HttpStatusCode.BadRequest)
        }

        collection.updateOne(
            idProp eq id,
            combine(*updateFields(sample))
        ).apply {
            if (wasAcknowledged() && matchedCount > 0) {
                respond(HttpStatusCode.OK)
            } else {
                respond(HttpStatusCode.NotFound)
            }
        }
    } catch (e: SerializationException) {
        respond(HttpStatusCode.BadRequest, e.message.orEmpty())
    }
}

suspend fun <T: Any> ApplicationCall.genericDelete(
    idParamKey: String = "id",
    collection: CoroutineCollection<T>,
    idProp: KProperty<*>,
) {
    val id = getRequestedObjectId(idParamKey) ?: return

    val deleteResult = collection.deleteOne(idProp eq id)

    if (deleteResult.wasAcknowledged() && deleteResult.deletedCount > 0) {
        response.status(HttpStatusCode.OK)
    } else {
        response.status(HttpStatusCode.NoContent)
    }
}
