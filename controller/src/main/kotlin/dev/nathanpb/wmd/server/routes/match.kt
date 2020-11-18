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

import dev.nathanpb.wmd.data.GamingProfile
import dev.nathanpb.wmd.matcher.matchProfiles
import dev.nathanpb.wmd.mongoDb
import dev.nathanpb.wmd.server.authenticate
import dev.nathanpb.wmd.server.getRequestedObjectId
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import org.litote.kmongo.eq

val collection = mongoDb.getCollection<GamingProfile>()

fun Route.match() {
    get("/{profileId}") {
        context.authenticate() ?: return@get

        val profileId = context.getRequestedObjectId("profileId")

        val profile = collection.findOne(GamingProfile::id eq profileId)
        if (profile == null) {
            context.respond(HttpStatusCode.NotFound)
            return@get
        }

        val matches = matchProfiles(profile, 25)
        context.respond(matches)
    }
}
