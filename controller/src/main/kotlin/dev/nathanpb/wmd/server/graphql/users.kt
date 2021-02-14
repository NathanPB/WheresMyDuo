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
import com.google.firebase.auth.FirebaseAuth
import dev.nathanpb.wmd.ADMIN_EMAILS
import dev.nathanpb.wmd.data.FriendRequest
import dev.nathanpb.wmd.data.GamingProfile
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.mongoDb
import org.litote.kmongo.*
import org.litote.kmongo.coroutine.CoroutineCollection


suspend fun getUserProfile(
    uid: String,
    collection: CoroutineCollection<UserProfile> = mongoDb.getCollection()
): UserProfile? {
    return collection.findOne(UserProfile::uid eq uid)
}

suspend fun getUserProfileOrCreate(
    uid: String,
    collection: CoroutineCollection<UserProfile> = mongoDb.getCollection()
): UserProfile {
    var profile = getUserProfile(uid, collection)
    if (profile == null) {
        var nickname = "Unknown"
        var photoURL = ""

        try {
            val user = FirebaseAuth.getInstance().getUser(uid)

            if (user?.isDisabled == false) {
                nickname = user.displayName
                photoURL = user.photoUrl
            }

            profile = UserProfile(uid, nickname, photoURL)
            collection.insertOne(profile)
        } catch (e: Exception) {  }

    }
    return profile ?: UserProfile(uid, "Unknown", "")
}

fun SchemaBuilder.users() {
    val collection by lazy { mongoDb.getCollection<UserProfile>() }
    val gamingProfilesCollection by lazy { mongoDb.getCollection<GamingProfile>() }

    type<UserProfile> {
        property(UserProfile::uid) {}
        property(UserProfile::nickname) {}
        property(UserProfile::photoURL) {}
        property<List<UserProfile>>("friends") {
            resolver {
                collection.find(UserProfile::uid.`in`(it.friends)).toList()
            }
        }
        property<String?>("contactInfo") {
            resolver { profile: UserProfile, ctx: Context ->
                val user = ctx.get<UserProfile>() ?: error("Not Authenticated")
                return@resolver profile.contactInfo.takeIf {
                    user.uid == profile.uid || user.uid in profile.friends
                }
            }

            /*
            TODO make this access rule work properly
            accessRule { profile, ctx ->
                val user = ctx.get<UserProfile>() ?: return@accessRule IllegalStateException("Not Authenticated")
                if (user.uid != profile.uid && user.uid !in profile.friends) {
                    return@accessRule IllegalStateException("This user is not friends with you")
                }

                return@accessRule null
            }
            */
        }

        property<List<FriendRequest>>("incomingFriendRequests") {
            accessRule { userProfile, context ->
                IllegalStateException().takeIf {
                    userProfile.uid != context.get<UserProfile>()?.uid
                }
            }

            resolver {
                mongoDb.getCollection<FriendRequest>().find(FriendRequest::to eq it.uid).toList()
            }
        }

        property<List<FriendRequest>>("ongoingFriendRequests") {
            accessRule { userProfile, context ->
                IllegalStateException().takeIf {
                    userProfile.uid != context.get<UserProfile>()?.uid
                }
            }

            resolver {
                mongoDb.getCollection<FriendRequest>().find(FriendRequest::from eq it.uid).toList()
            }
        }

        property<List<GamingProfile>>("gamingProfiles") {
            resolver {
                gamingProfilesCollection.find(GamingProfile::user eq it.uid).toList()
            }
        }

        property<Boolean>("isAdmin") {
            resolver {
                val token = FirebaseAuth.getInstance().getUser(it.uid)
                token.email.toLowerCase() in ADMIN_EMAILS
            }
        }
    }

    query("me") {
        resolver { ctx: Context -> ctx.get<UserProfile>() ?: error("Not Authenticated")}
    }

    query("user") {
        resolver { uid: String -> collection.findOne(UserProfile::uid eq uid) }
    }

    query("users") {
        resolver { index: Int, query: String? ->
            collection.aggregate<UserProfile>(
                listOf(
                    match(
                        *listOfNotNull(
                            query?.let {
                                UserProfile::nickname regex ".*${it}.*".toRegex(RegexOption.IGNORE_CASE)
                            }
                        ).toTypedArray()
                    ),
                    limit(20),
                    skip(index * 20)
                )
            ).toList()
        }.withArgs {
            arg<Int> { name = "index"; defaultValue = 0 }
        }
    }

    mutation("removeFriend") {
        resolver { uid: String, ctx: Context ->
            val user = ctx.get<UserProfile>() ?: error("Not Authenticated")
            val toBeRemovedProfile = getUserProfile(uid) ?: error("$uid does not exists")

            collection.save(toBeRemovedProfile.copy(friends = toBeRemovedProfile.friends - user.uid))
            collection.save(user.copy(friends = user.friends - toBeRemovedProfile.uid))
            return@resolver getUserProfile(user.uid)
        }
    }
}
