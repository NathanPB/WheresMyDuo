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
import dev.nathanpb.wmd.controller.UserController
import dev.nathanpb.wmd.data.*
import dev.nathanpb.wmd.data.input.UserProfileInput
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.server.userOrNull
import dev.nathanpb.wmd.server.userOrThrow
import dev.nathanpb.wmd.utils.getSlugSuggestions
import dev.nathanpb.wmd.utils.slugify
import org.litote.kmongo.*
import org.litote.kmongo.coroutine.aggregate
import kotlin.reflect.KProperty

fun SchemaBuilder.users() {
    val collection by lazy { mongoDb.getCollection<UserProfile>() }
    val gamingProfilesCollection by lazy { mongoDb.getCollection<GamingProfile>() }
    val postsCollection by lazy { mongoDb.getCollection<Post>() }

    enum<ContactVisibility>()
    type<ContactField>()
    type<UserProfileInput>()
    type<UserContact> {
        fun contactField(key: String, prop: KProperty<ContactField?>) {
            property<ContactField?>(key) {
                resolver { contact, ctx: Context ->
                    // Viva reflection
                    // The context at this point has an object UserProfile
                    //   that was stored in there in the previous nodes,
                    //   but to access that we need to do a little hacky move
                    //   with reflection
                    val field = Context::class.java.getDeclaredField("map")
                    val map = field.also { it.isAccessible = true }.get(ctx) as LinkedHashMap<Any, Any>
                    val requester = ctx.userOrThrow()
                    val requested = map["requested"] as UserProfile
                    val contactField = prop.call(contact)

                    contactField?.takeIf {
                        it.visibility.canView(requested, requester)
                    }
                }
            }
        }

        contactField("discord", UserContact::discord)
        contactField("skype", UserContact::skype)
        contactField("telegram", UserContact::telegram)
        contactField("facebook", UserContact::facebook)
    }

    type<UserProfile> {
        property(UserProfile::uid) {}
        property(UserProfile::slug) {}
        property(UserProfile::nickname) {}
        property(UserProfile::photoURL) {}

        property<Boolean>("isMe") {
            resolver { it, ctx: Context ->
                it.uid == ctx.userOrNull()?.uid
            }
        }

        property<Long>("postsCount") {
            resolver {
                postsCollection.countDocuments(Post::author eq it.uid)
            }
        }

        property<List<Post>>("posts") {
            resolver { profile: UserProfile, offset: Int, limit: Int, ctx: Context ->
                if (limit > 20) {
                    error("Retrieving more than 20 posts is not allowed")
                }

                ctx.userOrThrow()

                postsCollection.aggregate<Post>(
                    match(Post::author eq profile.uid),
                    limit(limit),
                    skip(offset)
                ).toList()
            }.withArgs {
                arg<Int> { name = "offset"; defaultValue = 0 }
            }
        }

        property<List<String>>("slugSuggestions") {
            resolver { userProfile, ctx: Context ->
                val requester = ctx.userOrThrow()
                val privacy = ContactVisibility.values().first {
                    it.canView(userProfile, requester)
                }

                userProfile.getSlugSuggestions(privacy)
            }
        }

        property<UserContact>("contact") {
            resolver { userProfile, ctx: Context ->
                // Só vamo caraio
                // This is meant to store the requested user in the context
                //   so it can be used in upper layers of the node
                val field = Context::class.java.getDeclaredField("map")
                val map = field.also { it.isAccessible = true }.get(ctx) as LinkedHashMap<Any, Any>
                map["requested"] = userProfile

                userProfile.contact
            }
        }

        property<List<UserProfile>>("following") {
            resolver { it, limit: Int, offset: Int ->
                if (limit > 250) {
                    error("You cannot retrieve more than 250 follows at a time")
                }
                collection.aggregate<UserProfile>(
                    match(UserProfile::uid.`in`(it.following)),
                    skip(offset),
                    limit(limit),
                ).toList()
            }.withArgs {
                arg<Int> { name = "limit"; defaultValue = 250  }
                arg<Int> { name = "offset"; defaultValue = 0 }
            }
        }

        property<List<UserProfile>>("followers") {
            resolver { it, offset: Int, limit: Int ->
                if (limit > 250) {
                    error("You cannot retrieve more than 250 followers at a time")
                }
                collection.aggregate<UserProfile>(
                    match(UserProfile::following.`in`(it.uid)),
                    skip(offset),
                    limit(limit),
                ).toList()
            }.withArgs {
                arg<Int> { name = "limit"; defaultValue = 250  }
                arg<Int> { name = "offset"; defaultValue = 0 }
            }
        }

        property<Long>("followingCount") {
            resolver {
                collection.countDocuments(UserProfile::uid.`in`(it.following))
            }
        }
        property<Long>("followersCount") {
            resolver {
                collection.countDocuments(UserProfile::following.`in`(it.uid))
            }
        }

        property<List<GamingProfile>>("gamingProfiles") {
            resolver {
                gamingProfilesCollection.find(GamingProfile::user eq it.uid).toList()
            }
        }

        property<Boolean>("doesFollowMe") {
            resolver { it, ctx: Context ->
                ctx.userOrThrow().uid in it.following
            }
        }

        property<Boolean>("isFollowedByMe") {
            resolver { it, ctx: Context ->
                it.uid in ctx.userOrThrow().following
            }
        }
    }

    query("me") {
        resolver { ctx: Context -> ctx.userOrThrow()}
    }

    query("user") {
        resolver { uid: String -> UserController.getUserProfile(uid) }
        .withArgs {
            arg<String> { name = "uid"; description = "User uid or slug" }
        }
    }

    query("users") {
        resolver { offset: Int, query: String? ->
            collection.aggregate<UserProfile>(
                listOf(
                    match(
                        or(
                            *listOfNotNull(
                                query?.let {
                                    UserProfile::nickname regex ".*${it}.*".toRegex(RegexOption.IGNORE_CASE)
                                },
                                query?.let {
                                    UserProfile::slug regex ".*${it}.*".toRegex(RegexOption.IGNORE_CASE)
                                }
                            ).toTypedArray()
                        )
                    ),
                    limit(20),
                    skip(offset * 20)
                )
            ).toList()
        }.withArgs {
            arg<Int> { name = "offset"; defaultValue = 0 }
        }
    }

    mutation("follow") {
        resolver { uid: String, ctx: Context ->
            val user = ctx.userOrThrow()
            UserController.getUserProfile(uid) ?: error("$uid does not exists")
            if (uid == user.uid) {
                error("You cannot follow yourself")
            }

            user.copy(following = user.following + uid).also {
                collection.save(it)
            }
        }
    }

    mutation("unfollow") {
        resolver { uid: String, ctx: Context ->
            val user = ctx.userOrThrow()
            UserController.getUserProfile(uid) ?: error("$uid does not exists")

            user.copy(following = user.following - uid).also {
                collection.save(it)
            }
        }
    }

    mutation("setProfileInfo") {
        resolver { profile: UserProfileInput, ctx: Context ->
            val requester = ctx.userOrThrow()
            val (slug, nickname) = profile

            val slugValidated = slug.take(32).slugify()
            if (slugValidated.isEmpty()) {
                error("Slug is not valid")
            }

            UserController.getUserProfile(slugValidated)?.let {
                if (it.uid != requester.uid) {
                    error("Slug already in use")
                }
            }

            requester.copy(slug = slugValidated, nickname = nickname.take(32)).also {
                collection.save(it)
            }
        }
    }

    mutation("setContact") {
        resolver { contact: UserContact, ctx: Context ->
            val user = ctx.userOrThrow()
            contact.validate()

            user.copy(contact = contact).also {
                collection.save(it)
            }
        }
    }
}
