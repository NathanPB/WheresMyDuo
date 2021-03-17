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


import {createProxyMiddleware} from 'http-proxy-middleware';

export const config = { api: { externalResolver: true, bodyParser: false } }

export default async (req, res) => {
  const proxy = createProxyMiddleware({
    target: process.env.NEXT_PUBLIC_REAUTH_BASE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
    secure: process.env.NEXT_PUBLIC_NODE_ENV !== 'development',
    headers: {
      'Reauth-Origin': `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/auth`,
    }
  })

  await proxy(req, res, () => { /* the middleware expects a "next" function, which is that */ })
}
