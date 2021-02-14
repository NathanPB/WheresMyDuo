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

import java.io.File
import java.nio.file.Path
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.time.ExperimentalTime
import kotlin.time.measureTimedValue

object SnapshotController {
    val dbPath = Path.of(System.getenv("MONGODB_PATH") ?: "").toAbsolutePath()

    val snapshotsPath = Path.of(System.getenv("SNAPSHOTS_PATH") ?: "${System.getProperty("user.home")}/wmd-snapshots").also {
        if (!it.toFile().exists()) {
            it.toFile().mkdirs()
        }
    }.toAbsolutePath()

    @OptIn(ExperimentalTime::class)
    fun takeSnapshot() {
        val now = LocalDateTime.now()
        val dateString = now.format(DateTimeFormatter.ISO_DATE_TIME)
        val file = snapshotsPath.resolve("wmd-dbdata-${dateString}.tar.gz").toAbsolutePath()
        val command = """tar -czvf "$file" ."""
        val builder = ProcessBuilder().apply {
            command("sh", "-c", command)
            directory(dbPath.toFile())
            redirectOutput(File("$file.log"))
        }

        val (value, time) = measureTimedValue {
            kotlin.runCatching {
                val process = builder.start()
                println("Taking a snapshot of the database on PID ${process.pid()}...")
                process.waitFor()
            }
        }

        println(
            if (value.isFailure) {
                "Failed to take snapshot. Check logs to details. Took ${time.inMilliseconds} ms"
            } else {
                "Snapshot taken in ${time.inMilliseconds} ms"
            }
        )
    }
}
