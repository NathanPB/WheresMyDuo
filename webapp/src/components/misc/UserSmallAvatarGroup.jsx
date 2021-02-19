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
import Link from "next/link";
import {Avatar} from "primereact/avatar";
import {AvatarGroup} from "primereact/avatargroup";
import {Tooltip} from "primereact/tooltip";


export default function UserSmallAvatarGroup({ users, lastAvatar }) {
  return (
    <>
      { users.map(it => <Tooltip target={`#u-${it.uid}`} position="top">{it.nickname}</Tooltip>) }
      <AvatarGroup>
        {
          users.map(user => (
            <Link href={`/u/${user.slug}`}>
              <a id={`u-${user.uid}`}>
                <Avatar image={user.photoURL} shape="circle"/>
              </a>
            </Link>
          ))
        }
        { lastAvatar || null }
      </AvatarGroup>
    </>
  )
}
