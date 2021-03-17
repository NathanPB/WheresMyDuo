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
import dev.nathanpb.wmd.data.GamingProfile
import dev.nathanpb.wmd.data.Tag
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.server.requireAdminAuthentication
import org.litote.kmongo.*

fun SchemaBuilder.tags() {
    val collection = mongoDb.getCollection<Tag>()
    type<Tag>()

    query("tag") {
        resolver { id: String -> collection.findOne(Tag::id eq id)}
    }

    query("tags") {
        resolver { index: Int, query: String? ->
            collection.aggregate<Tag>(
                listOf(
                    match(
                        *listOfNotNull(
                            query?.let {
                                Tag::displayName regex ".*${it}.*".toRegex(RegexOption.IGNORE_CASE)
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

    query("countTags") {
        resolver { query: String? ->
            if (query == null) {
                collection.countDocuments()
            } else {
                collection.countDocuments(Tag::displayName regex ".*${query}.*".toRegex(RegexOption.IGNORE_CASE))
            }
        }
    }

    mutation("createTag") {
        accessRule(Context::requireAdminAuthentication)
        resolver { displayName: String, description: String?, ctx: Context ->

            return@resolver Tag(displayName = displayName, description = description).also {
                collection.save(it)
            }
        }
    }

    mutation("updateTag") {
        accessRule(Context::requireAdminAuthentication)
        resolver { id: String, displayName: String, description: String?, ctx: Context ->

            val tag = collection.findOneById(id) ?: error("Not Found")

            return@resolver tag.copy(displayName = displayName, description = description).also {
                collection.save(it)
            }
        }
    }

    mutation("deleteTag") {
        accessRule(Context::requireAdminAuthentication)
        resolver { id: String, force: Boolean, ctx: Context ->

            if (!force) {
                val count = mongoDb.getCollection<GamingProfile>().countDocuments(GamingProfile::tags contains id)
                if (count > 0) {
                    error("Tag $id is already in use. Use force: true to force delete")
                }
            }

            return@resolver (collection.findOneById(id) ?: error("Not Found")).also {
                collection.deleteOneById(id)
            }
        }.withArgs {
            arg<Boolean> { name = "force"; defaultValue = false }
        }
    }
}
