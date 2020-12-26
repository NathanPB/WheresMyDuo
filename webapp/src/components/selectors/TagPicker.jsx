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
import {AutoComplete} from 'primereact/autocomplete';
import {gql, useQuery} from "@apollo/client";

const QUERY_TAGS = gql`
query QueryTags($query: String!) {
  tags(query: $query) { id, displayName }
}`

export default function TagPicker({ id, value, setValue, exclude = [], style = {} }) {
  const [query, setQuery] = React.useState('')
  const { data } = useQuery(QUERY_TAGS, { variables: { query } })
  const ref = React.useRef()

  function onSearch(event) {
    setQuery(event.query.trim())
    ref.current.showOverlay()
  }

  return (
    <AutoComplete
      id={id}
      ref={ref}
      field="displayName"
      value={value}
      suggestions={data?.tags?.filter(it => !exclude.includes(it.id))}
      completeMethod={onSearch}
      onChange={e => setValue(e.value)}
      appendTo={document.body}
      style={{ width: '100%', ...style }}
      dropdown
    />
  )
}
