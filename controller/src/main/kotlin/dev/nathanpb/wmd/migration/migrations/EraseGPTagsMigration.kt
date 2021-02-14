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

import com.mongodb.reactivestreams.client.ClientSession
import dev.nathanpb.wmd.migration.DataLossPotential
import dev.nathanpb.wmd.migration.Migration
import dev.nathanpb.wmd.mongoDb
import kotlinx.coroutines.reactive.awaitFirst

@Suppress("unused")
class EraseGPTagsMigration(
    override val name: String = "Erase Gaming Profile Tags",
    override val description: String = "Removes every tag from every gaming profile",
    override val date: String = "2021-02-14",
    override val dataLossPotential: DataLossPotential = DataLossPotential.HIGH
) : Migration() {

    private val gamingProfiles by lazy {
        mongoDb.database.getCollection("gamingProfile")
    }

    override suspend fun up(session: ClientSession) {
        gamingProfiles.updateMany(
            session,
            com.mongodb.client.model.Filters.exists("_id"),
            com.mongodb.client.model.Updates.set("tags", emptyArray<String>())
        ).awaitFirst().also {
            println("Erased tags of ${it.modifiedCount} gaming profiles")
        }
    }

    override suspend fun down(session: ClientSession) {
        throw NotImplementedError("This migration does not support rollback")
    }

}
