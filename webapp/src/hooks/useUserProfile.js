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

import React from "react";
import {ApiContext} from "../providers/ApiProvider";

export function useUserProfile(id) {
  const api = React.useContext(ApiContext)

  const [data, setData] = React.useState({ loading: false })

  const refetch = () => {
    if (api && id) {
      setData({ loading: true })
      api.getUserProfile(id)
        .then(response => {
          setData({ loading: false, profile: { friends: [], ...response.data } })
        }).catch(e => {
        setData({ loading: false })
        console.error(e)
      })
    }
  }

  React.useEffect(refetch, [api, id])

  return [data.profile, data.loading, refetch]
}
