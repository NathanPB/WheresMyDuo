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

import com.apurebase.kgraphql.Context
import com.apurebase.kgraphql.schema.dsl.SchemaBuilder
import dev.nathanpb.wmd.data.FriendRequest
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.mongoDb
import org.litote.kmongo.and
import org.litote.kmongo.eq
import org.litote.kmongo.or

fun SchemaBuilder.friendRequests() {
    val collection = mongoDb.getCollection<FriendRequest>()
    type<FriendRequest>()

    fun involvesUser(uid: String) = or(FriendRequest::to eq uid, FriendRequest::from eq uid)
    fun betweenUsers(a: String, b: String) = or(
        and(FriendRequest::to eq a, FriendRequest::from eq b),
        and(FriendRequest::to eq b, FriendRequest::from eq a)
    )

    query("friendRequest") {
        resolver { id: String, ctx: Context ->
            val user = ctx.get<UserProfile>() ?: error("Not Authenticated")

            collection.findOne(
                and(
                    FriendRequest::id eq id,
                    involvesUser(user.uid)
                )
            )
        }
    }

    query("friendRequests") {
        resolver { ctx: Context ->
            val user = ctx.get<UserProfile>() ?: error("Not Authenticated")
            collection.find(involvesUser(user.uid)).toList()
        }
    }

    query("friendRequestsToMe") {
        resolver { ctx: Context ->
            val user = ctx.get<UserProfile>() ?: error("Not Authenticated")
            collection.find(FriendRequest::to eq user.uid).toList()
        }
    }

    query("friendRequestsFromMe") {
        resolver { ctx: Context ->
            val user = ctx.get<UserProfile>() ?: error("Not Authenticated")
            collection.find(FriendRequest::from eq user.uid).toList()
        }
    }

    query("friendRequestTo") {
        resolver { to: String, ctx: Context ->
            val user = ctx.get<UserProfile>() ?: error("Not Authenticated")
            collection.findOne(FriendRequest::from eq user.uid, FriendRequest::to eq to)
        }
    }

    query("friendRequestBetweenMeAnd") {
        resolver { other: String, ctx: Context ->
            val user = ctx.get<UserProfile>() ?: error("Not Authenticated")
            collection.findOne(betweenUsers(user.uid, other))
        }
    }

    mutation("sendFriendRequest") {
        resolver { to: String, ctx: Context ->

            val user = ctx.get<UserProfile>() ?: error("Not Authenticated")
            if (user.uid == to) {
                error("We are always our own friend, comrade")
            }

            val existing = collection.findOne(betweenUsers(user.uid, to))
            if (existing != null) {
                error("There is already an existing friend request between ${user.uid} and $to")
            }

            val toProfile = getUserProfile(to) ?: error("$to does not exists")
            if (user.uid in toProfile.friends) {
                error("${user.uid} and $to are already friends")
            }

            return@resolver FriendRequest(from = user.uid, to = to).also {
                collection.save(it)
            }
        }
    }

    mutation("answerFriendRequest") {
        resolver { id: String, flag: Boolean, ctx: Context ->
            val user = ctx.get<UserProfile>() ?: error("Not Authenticated")

            val request = collection.findOne(
                and(
                    FriendRequest::id eq id,
                    FriendRequest::to eq user.uid
                )
            ) ?:  error("This friend request is not ongoing or does not belongs to you")

            if (flag) {
                getUserProfileOrCreate(request.from).let {
                    mongoDb.getCollection<UserProfile>().save(
                        it.copy(friends = it.friends + request.to)
                    )
                }

                getUserProfileOrCreate(request.to).let {
                    mongoDb.getCollection<UserProfile>().save(
                        it.copy(friends = it.friends + request.from)
                    )
                }
            }

            collection.deleteOneById(id)
            return@resolver request
        }
    }
}
