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

package dev.nathanpb.wmd.server.graphql

import com.api.igdb.request.IGDBWrapper
import com.api.igdb.utils.Endpoints
import com.apurebase.kgraphql.Context
import com.apurebase.kgraphql.schema.dsl.SchemaBuilder
import dev.nathanpb.wmd.controller.UserController
import dev.nathanpb.wmd.data.GamingProfile
import dev.nathanpb.wmd.data.Tag
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.matcher.matchProfiles
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.server.userOrThrow
import kotlinx.coroutines.runBlocking
import org.litote.kmongo.`in`
import org.litote.kmongo.and
import org.litote.kmongo.eq
import proto.GameResult

fun SchemaBuilder.gamingProfiles() {
    val collection by lazy { mongoDb.getCollection<GamingProfile>() }
    val tagsCollection by lazy { mongoDb.getCollection<Tag>() }

    type<GamingProfile> {
        property(GamingProfile::id) {}
        property<UserProfile?>("user") {
            resolver { UserController.getUserProfile(it.user) }
        }

        property(GamingProfile::game) {}
        property(GamingProfile::calendar) {}
        property<List<Tag>>("tags") {
            resolver {
                tagsCollection.find(Tag::id.`in`(it.tags)).toList()
            }
        }

        property(GamingProfile::createdAt) {}
    }

    query("gamingProfile") {
        resolver { id: String ->
            collection.findOne(GamingProfile::id eq id)
        }
    }

    query("match") {
        resolver { profileId: String, ctx: Context ->
            val user = ctx.userOrThrow()
            val profile = collection.findOne(and(GamingProfile::id eq profileId, GamingProfile::user eq user.uid)) ?: error("Not Found")

            matchProfiles(profile, 25)
        }
    }

    mutation("createGamingProfile") {
        resolver { game: Int, ctx: Context ->
            val user = ctx.userOrThrow()

            val validateGame by lazy {
                GameResult.parseFrom(
                    IGDBWrapper.apiProtoRequest(Endpoints.GAMES, "fields *; limit 1; where id = $game;")
                ).gamesCount > 0
            }

            val validateDuplicated by lazy {
                runBlocking {
                    collection.countDocuments(
                        and(
                            GamingProfile::user eq user.uid,
                            GamingProfile::game eq game
                        )
                    ) == 0L
                }
            }

            if (!validateGame) {
                error("Game $game is invalid")
            }

            if (!validateDuplicated) {
                error("A gaming profile for this user with the game $game already exists")
            }

            return@resolver GamingProfile(user = user.uid, game = game).also {
                collection.save(it)
            }
        }
    }

    mutation("updateGamingProfile") {
        resolver { id: String, tags: List<String>?, calendar: List<Int>?, ctx: Context ->
            val user = ctx.userOrThrow()
            val profile = collection.findOneById(id) ?: error("Gaming Profile $id not found")

            if (profile.user != user.uid) {
                error("This game profile does not belongs to you")
            }

            if (calendar != null) {
                val validateCalendar = calendar.size <= 168
                    && calendar.all { it in 0..167 }
                    && calendar.distinct().size == calendar.size

                if (!validateCalendar) {
                    error("Calendar format is invalid")
                }
            }

            if (tags != null) {
                val tagsOnDb = tagsCollection.countDocuments(Tag::id.`in`(tags)).toInt()
                if (tagsOnDb != tags.distinct().size) {
                    error("Mutation contains one or more invalid tags")
                }
            }

            return@resolver profile.copy(
                tags = tags?.distinct() ?: profile.tags,
                calendar = calendar?.distinct() ?: profile.calendar
            ).also {
                collection.save(it)
            }
        }
    }

    mutation("deleteGamingProfile") {
        resolver { id: String, ctx: Context ->
            val user = ctx.userOrThrow()
            val profile = collection.findOneById(id) ?: error("Gaming Profile $id not found")

            if (profile.user != user.uid) {
                error("This game profile does not belongs to you")
            }

            return@resolver profile.also {
                collection.deleteOneById(id)
            }
        }
    }
}
