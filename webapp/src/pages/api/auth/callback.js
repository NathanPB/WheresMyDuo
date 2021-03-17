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

import Axios from "axios";
import Cookies from 'cookies';
import crypto from 'crypto';

const Reauth = Axios.create({ baseURL: process.env.REAUTH_BASE_URL })

export default async (req, res) => {
  if (req.query.code) {
    const data = (await Reauth.post('/oauth/token', {
      code: req.query.code,
      client_id: process.env.REAUTH_CLIENT_ID,
      client_secret: process.env.REAUTH_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: `${req.connection?.encrypted ? 'https' : 'http'}://${req.headers.host}/api/auth/callback`
    })).data

    const cookies = new Cookies(req, res)
    const cipher = crypto.createCipheriv('aes-256-gcm', process.env.COOKIE_SECRET, process.env.COOKIE_IV)
    const encrypted = cipher.update(data.access_token, 'utf8', 'base64')

    cookies.set('reauth_token', encrypted + cipher.final('base64'), {
      maxAge: 1036800000, // 12 days
      sameSite: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? 'lax' : 'strict',
      overwrite: true
    })
  }

  res.redirect('/')
}
