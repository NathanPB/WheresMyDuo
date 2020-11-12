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

package dev.nathanpb.wmd.matcher

import dev.nathanpb.wmd.data.GamingProfile
import dev.nathanpb.wmd.mongoDb
import org.litote.kmongo.*

private val collection = mongoDb.getCollection<GamingProfile>()

suspend fun matchProfiles(profile: GamingProfile, limit: Int = 10): List<GamingProfile> {
    assert(limit >= 1) {
        "There should be a minimum limit of 1 profile"
    }

    val potentialMatches = collection.find(
        and(
            not(GamingProfile::user eq profile.user),
            GamingProfile::game eq profile.game,
            or(
                GamingProfile::tags size 0,
                GamingProfile::tags in profile.tags
            ),
            or(
                GamingProfile::calendar size 0,
                GamingProfile::calendar in profile.calendar
            )
        )
    ).toList().sortedWith { a, b ->
        // https://github.com/NathanPB/wmd-profile-matcher-specification#tag-containment-ratio
        val tagContainment = {
            val intersect = a.tags.intersect(b.tags)
            val difference = a.tags - b.tags
            intersect.size - difference.size
        }()
        tagContainment
    }

    return potentialMatches.take(limit)
}
