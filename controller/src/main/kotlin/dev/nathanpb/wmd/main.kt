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

package dev.nathanpb.wmd

import com.api.igdb.request.IGDBWrapper
import dev.nathanpb.wmd.controller.Auth0Controller
import dev.nathanpb.wmd.controller.igdbToken
import dev.nathanpb.wmd.migration.MigrationConfig
import dev.nathanpb.wmd.server.startServer
import io.github.nathanpb.bb.BootManager
import kotlinx.coroutines.runBlocking
import org.litote.kmongo.coroutine.CoroutineClient
import org.litote.kmongo.coroutine.CoroutineDatabase
import org.litote.kmongo.coroutine.coroutine
import org.litote.kmongo.reactivestreams.KMongo

val twitchClientId = System.getenv("TWITCH_CLIENT_ID")
val twitchClientSecret = System.getenv("TWITCH_CLIENT_SECRET")

lateinit var mongoClient: CoroutineClient
lateinit var mongoDb: CoroutineDatabase

fun main() {
    BootManager().apply {
        phase {
            subphase("Connecting to external services") {
                subphase("Connecting to MongoDB") {
                    mongoClient = KMongo.createClient(System.getenv("MONGO_CONN_STRING") ?: "mongodb://localhost").coroutine
                    mongoDb = mongoClient.getDatabase(System.getenv("MONGO_DB_NAME") ?: "wmd")
                }
                subphase("Connecting to IGDB") {
                    execute {
                        runBlocking {
                            IGDBWrapper.setCredentials(twitchClientId, igdbToken?.token ?: error("Could not acquire the Twitch token"))
                        }
                    }
                }
            }
            subphase("Performing configurations") {
                execute {
                    if (Auth0Controller.domain.isEmpty()) {
                        throw Error("AUTH0_DOMAIN is not defined")
                    }

                    if (Auth0Controller.clientId.isEmpty()) {
                        throw Error("AUTH0_CLIENT_ID is not defined")
                    }

                    if (Auth0Controller.clientSecret.isEmpty()) {
                        throw Error("AUTH0_CLIENT_SECRET is not defined")
                    }

                    if (!MigrationConfig.ENABLE_TRANSACTION) {
                        println("[WARN] Transactions on migrations are disabled!")
                    }

                    if (!MigrationConfig.ENABLE_SNAPSHOT) {
                        println("[WARN] Snapshots on migrations are disabled!")
                    }
                }
            }
            subphase("Starting HTTP api") {
                execute {
                    startServer()
                }
            }
        }
    }.startup()
}

