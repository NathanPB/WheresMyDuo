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

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.DecodedJWT
import com.github.kittinunf.fuel.Fuel
import com.github.kittinunf.fuel.coroutines.awaitObjectResponse
import com.github.kittinunf.fuel.coroutines.awaitString
import com.github.kittinunf.fuel.serialization.kotlinxDeserializerOf
import dev.nathanpb.wmd.data.IdentityResume
import kotlinx.coroutines.runBlocking
import java.security.KeyFactory
import java.security.interfaces.RSAPublicKey
import java.security.spec.X509EncodedKeySpec
import java.util.*

object ReauthController {

    val BASE_URL: String = System.getenv("REAUTH_BASE_URL").orEmpty()
    val CLIENT_ID: String = System.getenv("REAUTH_CLIENT_ID").orEmpty()

    private val publicKey by lazy {
        runBlocking {
            val text = Fuel.get("$BASE_URL/public_key.pub")
                .awaitString()
                .replace("-----BEGIN RSA PUBLIC KEY-----", "")
                .replace(System.lineSeparator(), "")
                .replace("-----END RSA PUBLIC KEY-----", "")

            val keyFactor = KeyFactory.getInstance("RSA")
            val keySpec = X509EncodedKeySpec(Base64.getDecoder().decode(text))
            keyFactor.generatePublic(keySpec) as RSAPublicKey
        }
    }

    suspend fun identity(token: String): IdentityResume {
        return Fuel.get("${BASE_URL}/identity")
            .header("Authorization" to "Bearer $token")
            .awaitObjectResponse<IdentityResume>(kotlinxDeserializerOf())
            .third
    }

    fun decodeToken(token: String): DecodedJWT {
        return JWT.require(Algorithm.RSA256(publicKey, null))
            .withIssuer("wheresmyduo")
            .withSubject("access_token")
            .withClaimPresence("uid")
            .withClaimPresence("scope")
            .withClaim("client_id", CLIENT_ID)
            .build()
            .verify(token)
    }
}
