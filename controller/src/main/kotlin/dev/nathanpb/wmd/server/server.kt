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

import dev.nathanpb.wmd.server.routes.gamingProfileRoutes
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.jackson.*
import io.ktor.routing.*
import io.ktor.routing.route
import io.ktor.server.engine.*
import io.ktor.server.netty.*

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
        routing {

            install(CallLogging)
            install(ContentNegotiation) {
                register(ContentType.Application.Json, JacksonConverter())
            }

            route("/gamingProfile") {
                gamingProfileRoutes()
            }
        }
    }.start()
}
