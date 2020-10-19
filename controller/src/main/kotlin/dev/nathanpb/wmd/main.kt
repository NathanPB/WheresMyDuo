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

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import dev.nathanpb.wmd.boot.BootManager
import dev.nathanpb.wmd.data.Tag
import dev.nathanpb.wmd.server.startServer
import kotlinx.coroutines.runBlocking
import org.litote.kmongo.coroutine.CoroutineClient
import org.litote.kmongo.coroutine.CoroutineDatabase
import org.litote.kmongo.coroutine.coroutine
import org.litote.kmongo.reactivestreams.KMongo

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

val ADMIN_EMAILS by lazy {
    System.getenv("ADMIN_EMAIL").orEmpty().split(",").map {
        it.trim().toLowerCase()
    }.filter(String::isNotEmpty)
}

val twitchClientId = System.getenv("TWITCH_CLIENT_ID")
val twitchClientSecret = System.getenv("TWITCH_CLIENT_SECRET")

lateinit var mongoClient: CoroutineClient
lateinit var mongoDb: CoroutineDatabase

fun initFirebaseAdmin() {
    FirebaseOptions.builder()
        .setCredentials(GoogleCredentials.getApplicationDefault())
        .setDatabaseUrl(System.getenv("FIREBASE_DB_URL") ?: "https://wheresmyduo.firebaseio.com")
        .build()
        .run(FirebaseApp::initializeApp)
}

fun main() {
    BootManager().apply {
        phase {
            subphase("Connecting to external services") {
                subphase("Initializing Firebase Admin") {
                    execute {
                        initFirebaseAdmin()
                    }
                }
                subphase("Connecting to MongoDB") {
                    mongoClient = KMongo.createClient(System.getenv("MONGO_CONN_STRING") ?: "mongodb://localhost").coroutine
                    mongoDb = mongoClient.getDatabase(System.getenv("MONGO_DB_NAME") ?: "wmd")
                }
            }
            subphase("Starting HTTP api") {
                execute {
                    startServer()
                }
            }
        }
    }.startup()


    val collection = mongoDb.getCollection<Tag>()
    runBlocking {
        collection.insertOne(Tag(displayName = "foobar"))
    }
}

