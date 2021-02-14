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

package dev.nathanpb.wmd.server

import com.apurebase.kgraphql.GraphQL
import dev.nathanpb.wmd.server.graphql.*
import dev.nathanpb.wmd.server.routes.analytics
import dev.nathanpb.wmd.server.routes.auth
import dev.nathanpb.wmd.server.routes.igdbProxy
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.routing.*
import io.ktor.serialization.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import kotlinx.coroutines.runBlocking

private fun getPort(): Int {
    return try {
        System.getenv("PORT").toInt()
    } catch (e: Exception) {
        8080
    }
}

fun startServer() {
    val port = getPort()
    println("Starting server at port $port")
    embeddedServer(Netty, getPort()) {

        install(CallLogging)
        install(ContentNegotiation) {
            json()
        }

        install(CORS) {
            method(HttpMethod.Options)
            method(HttpMethod.Get)
            method(HttpMethod.Post)
            method(HttpMethod.Put)
            method(HttpMethod.Delete)

            header("Authorization")
            header("Content-Type")

            anyHost()
        }

        install(GraphQL) {
            useDefaultPrettyPrinter = true

            context { call ->
                call.authenticate(requireAdmin = false)?.let {
                    + runBlocking { getUserProfileOrCreate(it.uid) }
                    + it
                }
            }

            schema {
                users()
                friendRequests()
                tags()
                gamingProfiles()
                migrations()
            }
        }

        routing {
            route("igdb/*") {
                igdbProxy()
            }

            route("/auth") {
                auth()
            }

            route("/analytics") {
                analytics()
            }
        }
    }.start()
}
