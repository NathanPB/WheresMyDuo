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

// https://auth0.com/blog/ultimate-guide-nextjs-authentication-auth0/
// https://github.com/vercel/next.js/discussions/14057
// Thank you so much athrunsun

import {auth0} from '../../../services/auth0';
import {createProxyMiddleware} from 'http-proxy-middleware';

export const config = { api: { externalResolver: true, bodyParser: false } }

export default async (...params) => {
  const [req, res] = params
  const session = await auth0.getSession(req, res)

  const proxy = createProxyMiddleware({
    target: process.env.NEXT_PUBLIC_API_BASE_URL,
    changeOrigin: true,
    pathRewrite: { ['^/api/proxy']: '' },
    secure: process.env.NEXT_PUBLIC_NODE_ENV !== 'development',
    headers: {
      Authorization: session ? `${session.token_type} ${session.accessToken}` : undefined
    }
  })

  await proxy(...params)
}
