/*
 * Copyright (c) 2021 - Nathan P. Bombana
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

package dev.nathanpb.wmd.server.graphql

import com.apurebase.kgraphql.Context
import com.apurebase.kgraphql.schema.dsl.SchemaBuilder
import dev.nathanpb.wmd.data.Post
import dev.nathanpb.wmd.data.PostEditHistory
import dev.nathanpb.wmd.data.PostReply
import dev.nathanpb.wmd.data.UserProfile
import dev.nathanpb.wmd.mongoDb
import org.litote.kmongo.eq
import org.litote.kmongo.limit
import org.litote.kmongo.match
import org.litote.kmongo.skip

fun SchemaBuilder.posts() {

    val posts by lazy {
        mongoDb.getCollection<Post>()
    }

    val replies by lazy {
        mongoDb.getCollection<PostReply>()
    }

    type<Post> {
        property(Post::id) {}
        property(Post::content) {}
        property(Post::date) {}
        property(Post::editHistory) {}

        property<UserProfile>("author") {
            resolver { getUserProfile(it.author)!! }
        }

        property<Long>("repliesCount") {
            resolver {
                replies.countDocuments(PostReply::post eq it.id)
            }
        }

       property<List<PostReply>>("replies") {
           resolver { post, limit: Int, offset: Int ->
               if (limit > 64) {
                   error("You cannot retrieve more than 64 replies at once")
               }

               replies.aggregate<PostReply>(
                   listOf(
                       match(PostReply::post eq post.id),
                       limit(limit),
                       skip(offset)
                   )
               ).toList()
           }.withArgs {
               arg<Int> { name = "offset"; defaultValue = 0 }
           }
       }
    }

    type<PostReply> {
        property(PostReply::id) {}
        property(PostReply::content) {}
        property(PostReply::date) {}
        property(PostReply::editHistory) {}

        property<UserProfile>("author") {
            resolver { getUserProfile(it.author)!! }
        }

        property<Post>("post") {
            resolver { posts.find(Post::id eq it.post).first()!! }
        }
    }

    type<PostEditHistory> {
        property(PostEditHistory::id) {}
        property(PostEditHistory::oldContent) {}
        property(PostEditHistory::newContent) {}
        property(PostEditHistory::date) {}

        property<UserProfile>("author") {
            resolver { getUserProfile(it.author)!! }
        }
    }

    mutation("post") {
        resolver { content: String, ctx: Context ->
            if (content.isEmpty()) {
                error("Text cannot be empty")
            }

            val requester = ctx.get<UserProfile>() ?: error("Not Authenticated")

            Post(author = requester.uid, content = content).also {
                posts.save(it)
            }
        }
    }

    mutation("reply") {
        resolver { content: String, postId: String, ctx: Context ->
            if (content.isEmpty()) {
                error("Content is empty")
            }

            val requester = ctx.get<UserProfile>() ?: error("Not Authenticated")
            val post = posts.findOne(Post::id eq postId) ?: error("Post not Found")

            PostReply(
                author = requester.uid,
                post = post.id,
                content = content
            ).also { replies.save(it) }
        }
    }

    mutation("editPost") {
        resolver { content: String, postId: String, ctx: Context ->
            val requester = ctx.get<UserProfile>() ?: error("Not Authenticated")
            val post = posts.findOne(Post::id eq postId) ?: error("Post Not Found")

            if (post.author != requester.uid) {
                error("Not Authorized")
            }

            PostEditHistory(
                author = requester.uid,
                oldContent = post.content,
                newContent = content
            ).also { history ->
                post.copy(
                    content = content,
                    editHistory = post.editHistory + history
                ).also { posts.save(it) }
            }
        }
    }

    mutation("editReply") {
        resolver { content: String,  replyId: String, ctx: Context ->
            val requester = ctx.get<UserProfile>() ?: error("Not Authenticated")
            val reply = replies.findOne(PostReply::id eq  replyId) ?: error("Reply Not Found")

            if (reply.author != requester.uid) {
                error("Not Authorized")
            }

            PostEditHistory(
                author = requester.uid,
                oldContent = reply.content,
                newContent = content
            ).also { history ->
                reply.copy(
                    content = content,
                    editHistory = reply.editHistory + history
                ).also { replies.save(it) }
            }
        }
    }
}
