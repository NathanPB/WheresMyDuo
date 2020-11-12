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
import dev.nathanpb.wmd.data.Tag
import dev.nathanpb.wmd.mongoDb
import org.litote.kmongo.*
import kotlin.math.ln

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
    ).toList().sortedBy { comparingWith ->
        // https://github.com/NathanPB/wmd-profile-matcher-specification#tag-containment-ratio

        fun compareTags(compareTags: List<Id<Tag>>): Int {
            val intersect = profile.tags.intersect(compareTags)
            val difference = profile.tags - compareTags
            return intersect.size - difference.size
        }

        fun compareCalendar(compareCalendar: List<Int>): Int {
            return compareCalendar.intersect(profile.calendar).size
        }

        compareTags(comparingWith.tags) * ln(
            compareCalendar(comparingWith.calendar) + 1.0
        ).plus(1)
    }

    return potentialMatches.take(limit)
}
