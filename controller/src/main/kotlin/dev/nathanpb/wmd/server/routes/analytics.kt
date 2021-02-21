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

import com.mongodb.BasicDBObject
import dev.nathanpb.wmd.controller.Auth0Controller
import dev.nathanpb.wmd.data.GamingProfile
import dev.nathanpb.wmd.data.Tag
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.server.authenticate
import dev.nathanpb.wmd.utils.exception
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.litote.kmongo.*
import org.litote.kmongo.coroutine.toList


// TODO move to graphql
fun Route.analytics() {

    @Serializable
    data class TagDistribution(@Contextual val tag: Tag, val value: Long)

    @Serializable
    data class HourDistribution(@Contextual val hour: Int, val value: Int)

    @Serializable
    data class DayDistribution(@Contextual val day: Int, val value: Int)

    val gamingProfileCollection = mongoDb.getCollection<GamingProfile>()
    val tagsCollection = mongoDb.getCollection<Tag>()

    get("/tag_distribution") {
        val user = context.authenticate(true) ?: return@get
        if (!Auth0Controller.getUserPermissions(user.uid).contains("delete:users")) {
            throw HttpStatusCode.Forbidden.exception()
        }

        context.respond(
            tagsCollection.find().toList()
                .map {
                    TagDistribution(
                        it,
                        gamingProfileCollection.countDocuments(
                            GamingProfile::tags contains it.id
                        )
                    )
                }
        )
    }

    get("/game_distribution") {
        val user = context.authenticate(true) ?: return@get
        if (!Auth0Controller.getUserPermissions(user.uid).contains("delete:users")) {
            throw HttpStatusCode.Forbidden.exception()
        }

        val col = mongoDb.database.getCollection("gamingProfile")

        val groupFields = BasicDBObject("_id", "\$game")
        groupFields["count"] = BasicDBObject("\$sum", 1)
        val group = BasicDBObject("\$group", groupFields)

        val result = col.aggregate(listOf(group, limit(50))).toList()
        context.respond(result)
    }

    get("/hour_distribution") {
        val user = context.authenticate(true) ?: return@get
        if (!Auth0Controller.getUserPermissions(user.uid).contains("delete:users")) {
            throw HttpStatusCode.Forbidden.exception()
        }

        val data = (0..23).map { h ->
            val hours = (0..6).map { it * 24 + h }
            HourDistribution(
                h,
                gamingProfileCollection.countDocuments(GamingProfile::calendar.`in`(hours)).toInt()
            )
        }

        context.respond(data)
    }

    get("day_distribution") {
        val user = context.authenticate(true) ?: return@get
        if (!Auth0Controller.getUserPermissions(user.uid).contains("delete:users")) {
            throw HttpStatusCode.Forbidden.exception()
        }

        val data = (0..6).map { h ->
            val hours = (0..23).map { it * 24 + h }
            DayDistribution(
                h,
                gamingProfileCollection.countDocuments(GamingProfile::calendar.`in`(hours)).toInt()
            )
        }

        context.respond(data)
    }
}
