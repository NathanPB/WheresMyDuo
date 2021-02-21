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
import dev.nathanpb.wmd.migration.DataLossPotential
import dev.nathanpb.wmd.migration.Migration
import dev.nathanpb.wmd.migration.MigrationController
import dev.nathanpb.wmd.migration.MigrationResult
import dev.nathanpb.wmd.server.checkIsAdmin

fun SchemaBuilder.migrations() {
    type<Migration>()
    type<MigrationResult> {
        property(MigrationResult::time) {}
        property<String?>("error") {
            resolver { it.error?.message }
        }
    }
    enum<DataLossPotential>()

    query("migrations") {
        resolver { query: String?, ctx: Context ->
            ctx.checkIsAdmin()
            MigrationController.migrations.filter {
                if (query != null) {
                    ".*${query}.*".toRegex(RegexOption.IGNORE_CASE).matches(it.name)
                } else true
            }
        }
    }

    query("migration") {
        resolver { id: String, ctx: Context ->
            ctx.checkIsAdmin()
            MigrationController.migrations.firstOrNull {
                it.id === id
            }
        }
    }

    mutation("runMigration") {
        resolver { id: String, ctx: Context ->
            ctx.checkIsAdmin()
            val migration = MigrationController.migrations.firstOrNull { it.id == id } ?: error("Not Found")
            MigrationController.run(migration)
        }
    }

    mutation("rollbackMigration") {
        resolver { id: String, ctx: Context ->
            ctx.checkIsAdmin()
            val migration = MigrationController.migrations.firstOrNull { it.id == id } ?: error("Not Found")
            MigrationController.rollback(migration)
        }
    }
}
