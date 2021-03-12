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

// https://github.com/vercel/next.js/discussions/14057
// Thank you so much athrunsun

import {createProxyMiddleware} from 'http-proxy-middleware';
import crypto from 'crypto';

export const config = { api: { externalResolver: true, bodyParser: false } }

export default async (req, res) => {
  let token = req.cookies.reauth_token

  if (token) {
    const decipher = crypto.createDecipheriv('aes-256-gcm',  process.env.COOKIE_SECRET, process.env.COOKIE_IV);
    token = decipher.update(token, 'base64', 'utf8')
  }

  const proxy = createProxyMiddleware({
    target: process.env.NEXT_PUBLIC_API_BASE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/proxy': '' },
    secure: process.env.NEXT_PUBLIC_NODE_ENV !== 'development',
    headers: {
      Authorization: token ? `Bearer ${token}` : null
    }
  })

  await proxy(req, res, () => { /* the middleware expects a "next" function, which is that */ })
}
