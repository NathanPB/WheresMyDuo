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

package dev.nathanpb.wmd.server.routes

import com.github.kittinunf.fuel.Fuel
import com.github.kittinunf.fuel.core.FuelError
import com.github.kittinunf.fuel.coroutines.awaitString
import dev.nathanpb.wmd.data.RawTwitchToken
import dev.nathanpb.wmd.server.authenticate
import dev.nathanpb.wmd.twitchClientId
import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*

var _token: RawTwitchToken? = null

suspend fun token(): RawTwitchToken {
    return _token ?: RawTwitchToken.requestNew().also {
        _token = it
    }
}

private suspend fun proxyToIgdb(path: String, body: String, tryCount: Int = 0): String {
    return try {
        Fuel.post("https://api.igdb.com/v4/$path")
            .header(
                "Client-ID" to twitchClientId,
                "Authorization" to "Bearer ${token().token}",
                "Accept" to "application/json"
            ).body(body).awaitString()
    } catch (e: FuelError) {
        if (e.response.statusCode in arrayOf(401, 403) && tryCount < 1) {
            _token = null
            proxyToIgdb(path, body, tryCount + 1)
        } else {
            throw e
        }
    }
}

fun Route.igdbProxy() {
    post {
        context.authenticate() ?: return@post

        try {
            context.respondText(
                proxyToIgdb(
                    context.request.path()
                        .split("/")
                        .filterIndexed { index, _ -> index > 1 }
                        .joinToString("/"),
                    call.receiveText()
                )
            )
        } catch (e: FuelError) {
            context.respond(
                HttpStatusCode.fromValue(e.response.statusCode),
                e.response.body().asString("application/json")
            )
        }

    }
}
