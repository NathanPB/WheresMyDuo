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

export default function TagPicker({ id, value, setValue, exclude = [], style = {} }) {
  const api = React.useContext(ApiContext)
  const [data, setData] = React.useState()


  React.useEffect(() => onSearch({ query: '' }), [])

  function onSearch(event) {
    const query = event.query.trim()
    if (api) {
      api.getTags(query ? { query, limit: 10 } : undefined)
        .then(response => setData(
          response.data.filter(it => !(exclude || []).includes(it._id)))
        )
    }
  }

  return (
    <AutoComplete
      id={id}
      field="displayName"
      value={value}
      suggestions={data}
      completeMethod={onSearch}
      onChange={e => setValue(e.value)}
      itemTemplate={data => data.displayName}
      appendTo={document.body}
      style={{ width: '100%', ...style }}
      dropdown
    />
  )
}
