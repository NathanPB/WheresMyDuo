import dev.nathanpb.wmd.data.UserProfile
import kotlinx.coroutines.runBlocking
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




fun main() {
    val mongoClient = KMongo.createClient(System.getenv("MONGO_CONN_STRING") ?: "mongodb://localhost").coroutine
    val mongoDb = mongoClient.getDatabase(System.getenv("MONGO_DB_NAME") ?: "wmd")
    val collection = mongoDb.getCollection<UserProfile>()

    val amount = 10000

    (0..amount).forEach { userCount ->
        val user = (0..16).map { "0123456789abcdef".random() }.joinToString("")
        val pictures = listOf(
            "https://fhox.com.br/wp-content/uploads/2018/03/funny-weird-wtf-stock-photos-59-5a3bb8d9f422e__700.jpg",
            "https://fhox.com.br/wp-content/uploads/2018/03/funny-weird-wtf-stock-photos-7-5a391ad5a43f9__700.jpg",
            "https://nexter.org/wp-content/uploads/2019/07/weird-stock-images-photos-funny-pic46.jpg",
            "https://www.liveabout.com/thmb/s6wcupyhjrstpTmxv_3K8kLIPYM=/768x0/filters:no_upscale():max_bytes(150000):strip_icc()/feet-face-599c412c22fa3a0011d92add.jpg",
            "https://preview.redd.it/1g1ztey635s41.jpg?width=640&crop=smart&auto=webp&s=30817cf4f3afc89f8493ff7669bc440a47eec044",
            "https://static5.depositphotos.com/1006844/519/i/600/depositphotos_5196564-stock-photo-beautiful-young-woman-kissing-a.jpg",
            "https://i.imgur.com/CtiDkqm.jpg",
            "https://64.media.tumblr.com/22f8cca39cb64e9b223fe8bab1dccead/tumblr_po8dh7Jks61wqb9aso1_1280.jpg",
            "https://64.media.tumblr.com/fcfb70766c05b14cd9ed80b538edae98/tumblr_p9x3uhl6DR1vvcp1fo1_1280.jpg",
            "https://i.pinimg.com/236x/4e/71/66/4e7166f7ad8e90a874668a07c9d719ae--girl-dancing-against-humanity.jpg",
            "https://i.pinimg.com/originals/d7/79/a8/d779a8b51a8cdf4ef333a3efda877abb.jpg",
            "https://i.ytimg.com/vi/9w3mVyXGKoY/maxresdefault.jpg",
            "https://i2.wp.com/creapills.com/wp-content/uploads/2018/03/30-photos-absurdes-banques-dimages-23.jpg?resize=800%2C536&ssl=1",
            "https://i.ytimg.com/vi/TmuXLFI_jxc/maxresdefault.jpg",
            "https://i.imgur.com/hwbqbXF.jpg",
            "https://toppng.com/uploads/preview/weird-stock-images-transparent-11550209993e4ehxtvpse.png",
            "https://i.pinimg.com/236x/a8/17/64/a817646a1b1c8740f7de07ef6f4f1a6e.jpg",
            "https://pm1.narvii.com/7213/28ad2cc7913db461298e90ca70e8b165026d33d1r1-496-612v2_uhq.jpg",
            "https://thepopularlist.com/wp-content/uploads/2019/11/weird-stock-images-photos-funny-pic35.jpg",
            "https://www.pleated-jeans.com/wp-content/uploads/2012/08/enhanced-buzz-5527-1301582032-1.jpg",
            "https://fhox.com.br/wp-content/uploads/2018/03/funny-weird-wtf-stock-photos-4-5a3927b70f562__700.jpg",
            "https://learn.g2.com/hs-fs/hubfs/man-with-sunburn.jpg?width=600&name=man-with-sunburn.jpg",
            "https://i.imgur.com/z4f0O.jpg",
            "https://cdn.ebaumsworld.com/2020/03/27/032224/86233087/weird-stock-photos-1.jpg"
        )
        runBlocking {
            collection.save(
                UserProfile(user, user, pictures.random())
            )
            println("Inserted user $userCount")
        }

    }
}
