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

package dev.nathanpb.wmd.utils

import dev.nathanpb.wmd.data.ContactField
import dev.nathanpb.wmd.data.ContactVisibility
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.server.graphql.hasUserProfile


suspend fun UserProfile.getSlugSuggestions(privacy: ContactVisibility): List<String> {
    val contacts = listOfNotNull(
        contact.discord?.run { copy(value = value.split("#")[0]) },
        contact.facebook,
        contact.skype,
    )
        .filter { it.visibility >= privacy  }
        .map(ContactField::value)
        .toTypedArray()

    return listOf(nickname, *contacts)
        .map(String::slugify)
        .filter(String::isNotEmpty)
        .filter { it != slug }
        .filterNot { hasUserProfile(it) }
        .let {
            listOf(uid.toLowerCase()).takeIf { _ -> it.isEmpty() } ?: it // If nothing is found, be content with your uid
        }
}
