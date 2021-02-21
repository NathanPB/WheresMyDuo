/*
 * Copyright (c) 2021 - Nathan P. Bombana
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

package dev.nathanpb.wmd.controller

import dev.nathanpb.wmd.data.Auth0UserResume
import dev.nathanpb.wmd.data.ContactVisibility
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.utils.getSlugSuggestions
import org.litote.kmongo.eq
import org.litote.kmongo.or

object UserController {

    private fun byUid(uid: String) = UserProfile::uid eq uid
    private fun byUidOrSlug(uidOrSlug: String) = or(
        UserProfile::uid eq uidOrSlug,
        UserProfile::slug eq uidOrSlug
    )


    private val collection by lazy {
        mongoDb.getCollection<UserProfile>()
    }

    suspend fun getUserProfileOrCreate(user: Auth0UserResume): UserProfile {
        return collection.findOne(byUid(user.uid)) ?: kotlin.run {
            return@run UserProfile(
                uid = user.uid,
                slug = user.uid,
                nickname = user.name,
                photoURL = user.picture
            ).let {
                it.copy(slug = it.getSlugSuggestions(ContactVisibility.PUBLIC).first())
            }.also {
                collection.save(it)
            }

        }
    }

    suspend fun getUserProfile(uidOrSlug: String): UserProfile? {
        return collection.findOne(byUidOrSlug(uidOrSlug))
    }

    suspend fun hasUserProfile(uidOrSlug: String): Boolean {
        return collection.countDocuments(byUidOrSlug(uidOrSlug)) > 0

    }
}
