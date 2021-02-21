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

package dev.nathanpb.wmd.controller

import com.auth0.client.auth.AuthAPI
import com.auth0.client.mgmt.ManagementAPI
import com.auth0.client.mgmt.filter.PageFilter
import com.auth0.json.auth.TokenHolder
import com.auth0.json.mgmt.Permission
import com.github.benmanes.caffeine.cache.Caffeine
import dev.nathanpb.wmd.data.Auth0UserResume
import kotlinx.coroutines.future.await
import java.sql.Timestamp
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

object Auth0Controller {

    val clientId: String = System.getenv("AUTH0_CLIENT_ID").orEmpty()
    val clientSecret: String = System.getenv("AUTH0_CLIENT_SECRET").orEmpty()
    val domain: String = System.getenv("AUTH0_DOMAIN").orEmpty()

    private val userCache = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(1, TimeUnit.HOURS)
        .build<String, Auth0UserResume>()

    private val auth = AuthAPI(domain, clientId, clientSecret)

    private var apiToken: TokenHolder? = null
        get() {
            val isValid = field?.expiresIn?.let { it > Timestamp.valueOf(LocalDateTime.now()).time } ?: false
            return if (!isValid) {
                auth.requestToken("$domain/api/v2/").execute().also {
                    field = it
                    management.setApiToken(it.accessToken)
                }
            } else field
        }

    private val management by lazy {
        ManagementAPI(domain, apiToken?.accessToken)
    }

    suspend fun getUserPermissions(uid: String): List<String> {
        return management.users()
            .listPermissions(uid, PageFilter())
            .executeAsync()
            .await()
            .items
            .map(Permission::getName)
    }

    /*
     * Attempt to return the cached token, if not found attempt to exchange the token and build the user profile object.
     */
    suspend fun exchangeToken(token: String): Auth0UserResume {
        return userCache.getIfPresent(token) ?: run {
            auth.userInfo(token)
                .executeAsync()
                .await()
                .values
                .let {
                    Auth0UserResume(
                        it["sub"] as String,
                        (it["nickname"] ?: it["name"] ?: it["given_name"])?.toString().orEmpty(),
                        (it["avatar"] ?: it["picture"] ?: it["photoURL"])?.toString().orEmpty()
                    ).also { user ->
                        userCache.put(token, user)
                    }
                }
        }
    }
}
