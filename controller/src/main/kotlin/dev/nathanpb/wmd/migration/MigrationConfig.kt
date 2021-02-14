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

package dev.nathanpb.wmd.migration

object MigrationConfig {
    val ENABLE_SNAPSHOT = run {
        val disabledByEnv = System.getenv("DISABLE_SNAPSHOTS") == "true"

        if (!disabledByEnv) {
            SnapshotController.dbPath.toFile().apply {
                if (!exists() || !isDirectory || !canRead()) {
                    println("[WARN] Snapshots on migrations disabled: MONGODB_PATH is invalid or not set")
                    return@run false
                }
            }

            SnapshotController.snapshotsPath.toFile().apply {
                if (!exists() || !isDirectory || !canWrite()) {
                    println("[WARN] Snapshots on migrations disabled: SNAPSHOTS_PATH is invalid or not set")
                    return@run false
                }
            }

        }

        return@run !disabledByEnv
    }
    val ENABLE_TRANSACTION = System.getenv("DISABLE_TRANSACTIONS") != "true"
}
