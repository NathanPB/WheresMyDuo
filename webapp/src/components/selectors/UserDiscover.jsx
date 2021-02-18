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

import React from 'react';

import Styles from './UserDiscover.module.scss';
import {AutoComplete} from "primereact/autocomplete";
import document from "../../document";
import {gql, useQuery} from "@apollo/client";
import Link from "next/link";
import {Avatar} from "primereact/avatar";

const QUERY = gql`
    query GetUser($query: String!) { 
      users(query: $query) { uid, slug, nickname, photoURL }
    }
  `

export default function UserDiscover() {
  const [userQuery, setUserQuery] = React.useState('')
  const { data: suggestions } = useQuery(QUERY, { variables: { query: userQuery } })

  const ref = React.useRef()

  function itemTemplate(user) {
    return (
      <Link href={`/u/${user.slug}`}>
        <a style={{ display: 'block' }}>
          <Avatar image={user.photoURL} shape="circle"/>
          <span className={Styles.UserName}>
            {user.nickname}
          </span>
        </a>
      </Link>
    )
  }

  return (
    <AutoComplete
      placeholder="Discover"
      className={Styles.UserDiscover}

      ref={ref}
      appendTo={document.body}
      field="nickname"
      itemTemplate={itemTemplate}
      value={userQuery}
      completeMethod={() => {}}
      suggestions={suggestions?.users || []}
      onFocus={() => ref.current?.showOverlay()}
      onChange={e => setUserQuery(e.value)}
    />
  );
}
