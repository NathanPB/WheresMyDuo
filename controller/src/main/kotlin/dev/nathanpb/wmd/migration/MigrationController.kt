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

package dev.nathanpb.wmd.migration

import com.mongodb.reactivestreams.client.ClientSession
import dev.nathanpb.wmd.mongoClient
import kotlinx.coroutines.runBlocking
import org.litote.kmongo.coroutine.abortTransactionAndAwait
import org.litote.kmongo.coroutine.commitTransactionAndAwait
import org.reflections.Reflections
import java.text.SimpleDateFormat
import kotlin.math.roundToInt
import kotlin.time.ExperimentalTime
import kotlin.time.measureTimedValue

object MigrationController {
    val migrations by lazy {
        Reflections("dev.nathanpb.wmd.migration.migrations")
            .getSubTypesOf(Migration::class.java)
            .map { it.getDeclaredConstructor().newInstance() }
            .sortedByDescending {
                val format = SimpleDateFormat("y-M-d")
                format.parse(it.date)
            }
    }

    private suspend fun withTransaction(body: suspend (session: ClientSession)->Unit) {
        val session = mongoClient.startSession()

        if (MigrationConfig.ENABLE_TRANSACTION && session.hasActiveTransaction()) {
            throw Throwable("The database already has an active transaction running")
        }

        if (MigrationConfig.ENABLE_TRANSACTION) {
            session.startTransaction()
        }

        try {
            body(session)
            if (MigrationConfig.ENABLE_TRANSACTION) {
                session.commitTransactionAndAwait()
            }
        } catch (e: Throwable) {
            if (MigrationConfig.ENABLE_TRANSACTION) {
                session.abortTransactionAndAwait()
            }
            throw e
        }
    }

    private suspend fun withSnapshot(body: suspend ()->Unit) {
        if (MigrationConfig.ENABLE_SNAPSHOT) {
            SnapshotController.takeSnapshot()
        }
        body()
    }

    @OptIn(ExperimentalTime::class)
    private suspend fun transaction(body: suspend (session: ClientSession)->Unit): MigrationResult {
        val (result, time) = measureTimedValue {
            kotlin.runCatching {
                withSnapshot {
                    withTransaction(body)
                }
            }
        }

        return MigrationResult(time.inMilliseconds.roundToInt(), result.exceptionOrNull())
    }

    fun run(migration: Migration) = runBlocking {
        println("Migration Started: ${migration.name}")
        transaction {
            migration.up(it)
        }.also {
            println("Migration Finished: $it")
        }
    }

    fun rollback(migration: Migration) = runBlocking {
        println("Migration Rollback Started: ${migration.name}")
        transaction {
            migration.down(it)
        }.also {
            println("Migration Ended: $it")
        }
    }
}
