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
import dev.nathanpb.wmd.controller.UserController
import dev.nathanpb.wmd.data.ContactVisibility
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.migration.DataLossPotential
import dev.nathanpb.wmd.migration.Migration
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.utils.getSlugSuggestions
import kotlinx.coroutines.reactive.awaitFirst
import org.litote.kmongo.coroutine.toList

@Suppress("unused")
class SlugUsersMigration(
    override val name: String = "Create Slugs",
    override val description: String = "Creates slugs for every user that does not have one",
    override val date: String = "2021-02-18",
    override val dataLossPotential: DataLossPotential = DataLossPotential.LOW
) : Migration() {

    private val users by lazy {
        mongoDb.database.getCollection("userProfile")
    }

    override suspend fun up(session: ClientSession) {

        val selectedUsers = users.find(session, com.mongodb.client.model.Filters.exists("slug", false)).toList()

        selectedUsers.forEach { user ->
            users.updateOne(
                session,
                com.mongodb.client.model.Filters.eq("_id", user.getString("_id")),
                com.mongodb.client.model.Updates.set("slug", user.getString("_id"))
            ).awaitFirst()
        }

        selectedUsers.forEach { user ->
            val profile = UserController.getUserProfile(user.getString("_id"))
            if (profile != null) {
                val slug = profile.getSlugSuggestions(ContactVisibility.PUBLIC).first()
                mongoDb.getCollection<UserProfile>().save(
                    profile.copy(slug = slug)
                )
                println("Set slug of ${profile.uid} ${profile.nickname} to $slug")
            }
        }
    }

    override suspend fun down(session: ClientSession) {
        // throw NotImplementedError("This migration does not support rollback")
        users.updateMany(
            session,
            com.mongodb.client.model.Filters.exists("slug"),
            com.mongodb.client.model.Updates.unset("slug")
        ).toList()

    }

}
