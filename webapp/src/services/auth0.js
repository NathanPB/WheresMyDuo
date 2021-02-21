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


import {initAuth0} from '@auth0/nextjs-auth0';

export const auth0 = initAuth0();

export async function sessionOrUndefined(req, res) {
  if (typeof window === 'undefined') {
    return auth0.getSession(req, res)?.user
  }
}

export async function sessionOrRedirect(req, res) {
  if (typeof window === 'undefined') {
    const user = sessionOrUndefined(req, res)
    if (!user) {
      res.writeHead(302, { Location: '/api/auth/login' })
      res.end()
    }

    return user || undefined
  }
}
