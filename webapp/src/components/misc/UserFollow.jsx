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
import {Avatar} from "primereact/avatar";
import {Divider} from "primereact/divider";
import abbreviate from "number-abbreviate"
import Link from "next/link";
import {Tooltip} from "primereact/tooltip";
import UserSmallAvatarGroup from "./UserSmallAvatarGroup";

const AVATAR_COUNT = 15

export default function UserFollow(props) {
  const { followingCount, followersCount } = props


  const followers = props.followers.slice().slice(0, followingCount >= AVATAR_COUNT ? AVATAR_COUNT - 1 : AVATAR_COUNT)
  const following = props.following.slice().slice(0, followersCount >= AVATAR_COUNT ? AVATAR_COUNT - 1 : AVATAR_COUNT)

  // https://stackoverflow.com/a/66196229/9893963
  const followersPlusFollowing = [
    ...[...followers, ...following].reduce(
      (map, obj) => map.set(obj.uid, obj), new Map()
    ).values()
  ]

  function renderFollowers() {
    if (followers.length === 0) {
      return null
    }

    const plus = followersCount - followers.length

    return (
      <>
        <h3 style={{ marginBottom: 4 }}>Followers</h3>
        <div style={{ marginLeft: 8 }}>
          <UserSmallAvatarGroup
            users={followers}
            lastAvatar={plus > 0 ? (
              <Link href={`#follow`}>
                <a>
                  <Avatar
                    style={{ fontSize: '1rem' }}
                    shape="circle"
                    label={`+${abbreviate(plus, 2)}`.toUpperCase()}
                  />
                </a>
              </Link>
            ) : undefined}
          />
        </div>
      </>
    )
  }

  function renderFollowing() {
    if (following.length === 0) {
      return null
    }

    const plus = followingCount - following.length
    console.log(plus)

    return (
      <>
        <h3 style={{ marginBottom: 4 }}>Following</h3>
        <div style={{ marginLeft: 8 }}>
          <UserSmallAvatarGroup
            users={following}
            lastAvatar={plus > 0 ? (
              <Link href={`#follow`}>
                <a>
                  <Avatar
                    style={{ fontSize: '1rem' }}
                    shape="circle"
                    label={`+${abbreviate(plus, 2)}`.toUpperCase()}
                  />
                </a>
              </Link>
            ) : undefined}
          />
        </div>
      </>
    )
  }

  return (
    <div style={{ padding: 8 }}>
      {
        followersPlusFollowing.map(it => (
          <Tooltip target={`#u-${it.uid}`} position="top">{it.nickname}</Tooltip>
        ))
      }
      { renderFollowers() }
      { (followers.length > 0 && following.length > 0) && <Divider/> }
      { renderFollowing() }
    </div>
  )
}
