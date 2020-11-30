import dev.nathanpb.wmd.data.GamingProfile
import dev.nathanpb.wmd.data.Tag
import dev.nathanpb.wmd.data.UserProfile
import kotlinx.coroutines.runBlocking
import org.bson.types.ObjectId
import org.litote.kmongo.coroutine.coroutine
import org.litote.kmongo.id.toId
import org.litote.kmongo.reactivestreams.KMongo
import kotlin.random.Random

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


val mongoClient = KMongo.createClient(System.getenv("MONGO_CONN_STRING") ?: "mongodb://localhost").coroutine
val mongoDb = mongoClient.getDatabase(System.getenv("MONGO_DB_NAME") ?: "wmd")
val collection = mongoDb.getCollection<GamingProfile>()

fun main() {
    val games = listOf(1912, 5447, 62678, 1942)
    val profilesPerUser = 1..3
    val tagsPerProfile = 0..3
    val tags = listOf(
        "5f8c478a13d7882d86317992",
        "5f8c479013d7882d86317997",
        "5f8c479c13d7882d8631799d",
        "5f8c47ae13d7882d863179a4",
        "5f8c47b313d7882d863179ac",
        "5f8c47cc13d7882d863179c5"
    ).map(::ObjectId)

    runBlocking {
        mongoDb.getCollection<UserProfile>().find().toList().forEach { user ->
            (0..profilesPerUser.random()).map {
                val game = games.random()
                val calendar = (0..167).filter { Random.nextBoolean() }
                val tags = tagsPerProfile
                    .map { tags.random().toId<Tag>() }
                    .take(tagsPerProfile.random())

                GamingProfile(
                    user = user.uid.orEmpty(),
                    game = game,
                    calendar = calendar,
                    tags = tags
                )
            }.let { profiles ->
                collection.insertMany(profiles)
            }
        }
    }
}
