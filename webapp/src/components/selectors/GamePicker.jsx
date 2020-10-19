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
import { ApiContext } from '../../providers/ApiProvider';
import { AutoComplete } from 'primereact/autocomplete';

export default function GamePicker({ id, value, setValue }) {
  const api = React.useContext(ApiContext)

  const [queriedGames, setQueriedGames] = React.useState([])

  React.useEffect(() => onSearch({ query: '' }), [])

  function onSearch(event) {
    const query = event.query.trim()
    if (api) {
      if (query) {
        api.igdb
          .fields(['name'])
          .limit(10)
          .search(query)
          .request('/games')
          .then(response => setQueriedGames(response.data))
      } else {
        api.igdb
          .fields(['name'])
          .sort('total_rating asc')
          .limit(20)
          .request('/games')
          .then(response => setQueriedGames(response.data))
      }
    }
  }

  return (
    <AutoComplete
      id={id}
      field="name"
      value={value}
      suggestions={queriedGames}
      completeMethod={onSearch}
      onChange={e => setValue(e.value)}
      itemTemplate={data => data.name}
      appendTo={document.body}
      style={{ width: '100%' }}
      dropdown
    />
  )

}
