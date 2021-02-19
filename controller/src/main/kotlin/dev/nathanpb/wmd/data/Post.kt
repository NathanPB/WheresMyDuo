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
import java.sql.Timestamp
import java.time.LocalDateTime
import java.util.*

@Serializable
data class PostEditHistory(
    val id: String = UUID.randomUUID().toString(),
    val author: String,
    val date: Long = Timestamp.valueOf(LocalDateTime.now()).time,
    val oldContent: String?,
    val newContent: String?,
)

@Serializable
data class PostReply(
    val id: String = UUID.randomUUID().toString(),
    val author: String,
    val post: String,
    val content: String,
    val date: Long = Timestamp.valueOf(LocalDateTime.now()).time,
    val editHistory: List<PostEditHistory> = emptyList()
) {
    val isEdited = editHistory.isNotEmpty()
}

@Serializable
data class Post(
    val id: String = UUID.randomUUID().toString(),
    val author: String,
    val content: String,
    val date: Long = Timestamp.valueOf(LocalDateTime.now()).time,
    val editHistory: List<PostEditHistory> = emptyList(),
) {
    val isEdited = editHistory.isNotEmpty()
}
