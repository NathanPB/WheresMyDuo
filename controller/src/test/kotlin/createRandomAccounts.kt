import dev.nathanpb.wmd.data.GamingProfile
import dev.nathanpb.wmd.data.UserProfile
import kotlinx.coroutines.runBlocking
import org.litote.kmongo.coroutine.coroutine
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
        "7adcf68b-3ee0-47cf-9af4-448bcca35059",
        "312fc4a9-8ad5-4e1c-99fc-84893de87a7c",
        "951ee168-d777-4c1f-81b9-5acab05b5050",
        "4d43084a-3b43-45af-87d4-4ae6b92c6655",
    )

    runBlocking {
        mongoDb.getCollection<UserProfile>().find().toList().forEach { user ->
            (0..profilesPerUser.random()).map {
                val game = games.random()
                val calendar = (0..167).filter { Random.nextBoolean() }
                val tags = tagsPerProfile
                    .map { tags.random() }
                    .take(tagsPerProfile.random())

                GamingProfile(
                    user = user.uid,
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
