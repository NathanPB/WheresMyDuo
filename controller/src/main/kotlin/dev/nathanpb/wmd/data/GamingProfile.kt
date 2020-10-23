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

package dev.nathanpb.wmd.data

import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.litote.kmongo.Id
import org.litote.kmongo.id.MongoId
import org.litote.kmongo.newId

@Serializable
data class GamingProfile (
    @Contextual @SerialName("_id") @MongoId val id: Id<GamingProfile>? = newId(),
    val user: String,
    val game: Int,
    val hoursPerWeek: List<Int> = listOf(),
    val tags: List<@Contextual Id<Tag>> = listOf(),
    val createdAt: Long = System.currentTimeMillis()
) {
    fun validate(): Boolean {
        return hoursPerWeek.size <= 168
            && hoursPerWeek.all { it in 0..167 }
            && hoursPerWeek.distinct().size == hoursPerWeek.size
    }
}
