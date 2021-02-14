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

package dev.nathanpb.wmd.migration.migrations

import com.mongodb.client.result.UpdateResult
import com.mongodb.reactivestreams.client.ClientSession
import dev.nathanpb.wmd.migration.DataLossPotential
import dev.nathanpb.wmd.migration.Migration
import dev.nathanpb.wmd.mongoDb
import kotlinx.coroutines.reactive.awaitFirst
import org.bson.types.ObjectId
import org.litote.kmongo.coroutine.toList
import java.util.*

@Suppress("unused")
class ObjectIDToUUIDMigration(
    override val name: String = "ObjectId to UUID",
    override val description: String = "Changes the documents with _id ObjectIDs in the database to UUIDs",
    override val date: String = "2020-12-27",
    override val dataLossPotential: DataLossPotential = DataLossPotential.LOW
) : Migration() {

    private val tags by lazy {
        mongoDb.database.getCollection("tag")
    }

    private val gamingProfiles by lazy {
        mongoDb.database.getCollection("gamingProfile")
    }

    private val friendRequests by lazy {
        mongoDb.database.getCollection("friendRequest")
    }

    override suspend fun up(session: ClientSession) {

        tags.find().toList().forEach { tag ->
            val id = tag["_id"]
            if (id is ObjectId) {
                val newId = UUID.randomUUID().toString()
                println("Migrating tag ID $id to $newId")

                tags.insertOne(
                    session,
                    tag.also {
                        it["_id"] = newId
                    }
                ).awaitFirst()
                tags.deleteOne(session, com.mongodb.client.model.Filters.eq("_id", id)).awaitFirst()

                gamingProfiles.updateMany(
                    session,
                    com.mongodb.client.model.Filters.`in`("tags", id),
                    com.mongodb.client.model.Updates.set("tags.$", newId)
                ).toList().also {
                    if (!it.all(UpdateResult::wasAcknowledged)) {
                        throw Exception("The ID update for tag ${id.toHexString()} was not acknowledged: Failed to update gaming profile references")
                    }
                }

            }
        }

        gamingProfiles.find().toList().forEach { doc ->
            val id = doc["_id"]
            if (id is ObjectId) {
                val newId = UUID.randomUUID().toString()
                println("Migrating gamingProfile ID $id to $newId")

                gamingProfiles.insertOne(
                    session,
                    doc.also {
                        it["_id"] = newId
                    }
                ).awaitFirst()
                gamingProfiles.deleteOne(session, com.mongodb.client.model.Filters.eq("_id", id)).awaitFirst()
            }
        }

        friendRequests.find().toList().forEach { doc ->
            val id = doc["_id"]
            if (id is ObjectId) {
                val newId = UUID.randomUUID().toString()
                println("Migrating friendRequest ID $id to $newId")

                friendRequests.insertOne(
                    session,
                    doc.also {
                        it["_id"] = newId
                    }
                ).awaitFirst()
                friendRequests.deleteOne(session, com.mongodb.client.model.Filters.eq("_id", id)).awaitFirst()
            }
        }
    }

    override suspend fun down(session: ClientSession) {
        tags.find().toList().forEach { tag ->
            val id = tag["_id"]
            if (id is String) {
                val newId = ObjectId()
                println("Migrating tag ID $id to $newId")

                tags.insertOne(
                    tag.also {
                        it["_id"] = newId
                    }
                ).awaitFirst()
                tags.deleteOne(com.mongodb.client.model.Filters.eq("_id", id)).awaitFirst()

                gamingProfiles.updateMany(
                    session,
                    com.mongodb.client.model.Filters.`in`("tags", id),
                    com.mongodb.client.model.Updates.set("tags.$", newId)
                ).toList().also {
                    if (!it.all(UpdateResult::wasAcknowledged)) {
                        throw Exception("The ID update for tag $id was not acknowledged: Failed to update gaming profile references")
                    }
                }

            }
        }

        gamingProfiles.find().toList().forEach { doc ->
            val id = doc["_id"]
            if (id is String) {
                val newId = ObjectId()
                println("Migrating gamingProfile ID $id to $newId")

                gamingProfiles.insertOne(
                    session,
                    doc.also {
                        it["_id"] = newId
                    }
                ).awaitFirst()
                gamingProfiles.deleteOne(session, com.mongodb.client.model.Filters.eq("_id", id)).awaitFirst()
            }
        }

        friendRequests.find().toList().forEach { doc ->
            val id = doc["_id"]
            if (id is String) {
                val newId = ObjectId()
                println("Migrating friendRequest ID $id to $newId")

                friendRequests.insertOne(
                    session,
                    doc.also {
                        it["_id"] = newId
                    }
                ).awaitFirst()
                friendRequests.deleteOne(session, com.mongodb.client.model.Filters.eq("_id", id)).awaitFirst()
            }
        }
    }

}
