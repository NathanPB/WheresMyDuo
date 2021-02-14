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

import React from 'react';
import create from '../services/api';
import {auth} from 'firebase';

export const ApiContext = React.createContext({ api: null })

export function ApiProvider({ children }) {
  const [api, setApi] = React.useState(undefined)

  async function onUserUpdated(newUser) {
    if (newUser) {
      const tokenInfo = await newUser.getIdToken()
      setApi(create(tokenInfo))
    } else {
      setApi(null)
    }
  }

  React.useEffect(() => void auth().onAuthStateChanged(onUserUpdated), [])

  return (
    <ApiContext.Provider value={api}>
      { children }
    </ApiContext.Provider>
  );
}
