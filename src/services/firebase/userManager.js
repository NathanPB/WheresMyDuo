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

import { firestore } from './index'

export async function isDataCompleted(email) {
  const data = (await queryUser(email)) || {}
  return typeof data.displayName === 'string'
}

export async function queryUser(email) {
  try {
    const doc = await firestore.doc(`users/${email}`).get()
    if (doc.exists) {
      return {
        email, ...doc.data()
      }
    }
  } catch (ignored) { }
}

export async function createUser(user, data) {
  const userExists = !!(await queryUser(user.email))
  if (!userExists) {
    await firestore.doc(`users/${user.email}`).set(data || {})
  }

  return await queryUser(user.email)
}

export async function updateUserData(email, data) {
  return await firestore.doc(`users/${email}`).update(data)
}
