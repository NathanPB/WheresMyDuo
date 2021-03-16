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

import Axios from 'axios';
import crypto from "crypto";
import JWT from 'jsonwebtoken';

export const Reauth = Axios.create({ baseURL: process.env.REAUTH_BASE_URL })

export const publicKey = Reauth.get('public_key.pub').data;

export async function serverUser(req) {
  let token = req.cookies.reauth_token

  if (token) {
    const decipher = crypto.createDecipheriv('aes-256-gcm',  process.env.COOKIE_SECRET, process.env.COOKIE_IV);
    token = decipher.update(token, 'base64', 'utf8')
  } else {
    return null
  }

  try {
    return JWT.verify(token, await publicKey, { issuer: 'wheresmyduo', subject: 'access_token' })
  } catch (e) {
    return null
  }
}
