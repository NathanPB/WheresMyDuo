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

package dev.nathanpb.wmd.data

import kotlinx.serialization.Serializable

private val DISCORD_DISCRIMINATOR_REGEX = """.+#[0-9]{4}$""".toRegex()

enum class ContactVisibility {
    PRIVATE, FRIENDS, PUBLIC;

    fun canView(user: UserProfile, otherUserId: String?) = when (this) {
        PRIVATE -> otherUserId != null && user.uid == otherUserId
        FRIENDS -> otherUserId != null && (user.uid == otherUserId || otherUserId in user.friends)
        PUBLIC -> true
    }
}

@Serializable
data class ContactField(val value: String, val visibility: ContactVisibility)

@Serializable
data class UserContact(
    val discord: ContactField? = null,
    val skype: ContactField? = null,
    val telegram: ContactField? = null,
    val facebook: ContactField? = null
) {
    fun validate() {
        discord?.let {
            if (!it.value.matches(DISCORD_DISCRIMINATOR_REGEX)) {
                error("Discord format must match regex $DISCORD_DISCRIMINATOR_REGEX")
            }
        }
    }
}
