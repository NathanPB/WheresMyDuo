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

import React from "react";
import {DataView} from "primereact/dataview";
import {gql, useQuery} from "@apollo/client";
import Link from "next/link";
import UserProfileCardStyles from "./UserProfileCard/index.module.scss";
import LabeledComponent from "../misc/LabeledComponent";
import {Avatar} from "primereact/avatar";

const ROWS = 12
const FOLLOWING_QUERY = gql`
query Following($uid: String!, $offset: Int!) {
  user(uid: $uid) {
    followingCount
    following(offset: $offset, limit: ${ROWS}) {
      slug
      nickname
      photoURL
    }
  }
}`

const FOLLOWERS_QUERY =  gql`
query Followers($uid: String!, $offset: Int!) {
  user(uid: $uid) {
    followersCount
    followers(offset: $offset, limit: ${ROWS}) {
      slug
      nickname
      photoURL
    }
  }
}`

export function FullFollowingList({ uid }) {
  const { data, loading, fetchMore } = useQuery(FOLLOWING_QUERY, { variables: { uid, offset: 0 } })

  return <FullFollowList
    users={data?.user?.following}
    fetchMore={fetchMore}
    totalRecords={data?.user?.followingCount}
    loading={loading}
  />
}

export function FullFollowersList({ uid }) {
  const { data, loading, fetchMore } = useQuery(FOLLOWERS_QUERY, { variables: { uid, offset: 0 } })

  return <FullFollowList
    users={data?.user?.followers}
    fetchMore={fetchMore}
    totalRecords={data?.user?.followersCount}
    loading={loading}
  />
}

function FullFollowList({ users, fetchMore, totalRecords, loading }) {

  const [startingAt, setStartingAt] = React.useState(0)
  const [layout, setLayout] = React.useState('grid')

  React.useEffect(() => {
    const onResize = () => setLayout(window.document.body.clientWidth <= 480 ? 'list' : 'grid')
    window.addEventListener('resize', onResize)
    onResize()
  }, [])

  function onPage(e) {
    setStartingAt(e.first)
    fetchMore({ variables: { offset: e.first } })
  }

  function itemTemplate(user, layout) {
    if (!user) {
      return null
    }

    if (layout === 'grid') {
      return (
        <div className="p-lg-2 p-md-4">
          <Link href={`/u/${user.slug}`}>
            <a>
              <LabeledComponent
                label={user.nickname}
                labelStyle={{
                  fontSize: user.nickname.length > 15 ? '.7rem' : '1rem',
                  color: 'var(--text-color)',
                  textDecoration: 'none'
                }}
                labelHeight="-2rem"
              >
                <img
                  alt={user.nickname}
                  className={UserProfileCardStyles.Cover}
                  src={user.photoURL}
                />
              </LabeledComponent>
            </a>
          </Link>
        </div>
      )
    }

    if (layout === 'list') {
      return (
        <div className="p-col-12" style={{ padding: '0 8px', marginTop: '1rem' }}>
          <Link href={`/u/${user.slug}`}>
            <a style={{ textDecoration: 'none' }}>
              <div className="p-grid">
                <div className="p-col-fixed" style={{ width: '5rem' }}>
                  <Avatar size="xlarge" image={user.photoURL}/>
                </div>
                <div className="p-col">
                  <span style={{ color: 'var(--text-color)'}}>{user.nickname}</span>
                </div>
              </div>
            </a>
          </Link>
        </div>
      )
    }
  }

  return <DataView
    value={users}
    itemTemplate={itemTemplate}
    layout={layout}

    loading={loading}
    totalRecords={totalRecords}
    emptyMessage="It looks like there is no one here yet :("

    onPage={onPage}
    first={startingAt}
    rows={ROWS}
    paginator
  />
}
