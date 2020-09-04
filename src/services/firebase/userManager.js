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

export async function queryUser(uid) {
  const doc = await firestore.doc(`users/${uid}`).get()
  if (doc.exists) {
    return {
      uid, ...doc.data()
    }
  }
}

export async function createUser(user, data) {
  const userRef = firestore.doc(`users/${user.uid}`)
  const snapshot = await userRef.get()

  if (!snapshot.exists) {
    await userRef.set(data || {})
  }

  return queryUser(user.uid)
}

export async function updateUserData(uid, data) {
  return await firestore.doc(`users/${uid}`).update(data)
}
