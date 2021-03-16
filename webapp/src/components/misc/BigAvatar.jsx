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
import Styles from './BigAvatar.module.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faHeart as faHeartSolid} from "@fortawesome/free-solid-svg-icons";
import {faHeart} from "@fortawesome/free-regular-svg-icons";
import dynamic from "next/dynamic"

const Tooltip = dynamic(import('primereact/tooltip').then(it => it.Tooltip), { ssr: false })

export default function BigAvatar({ photoURL, nickname, onFollowClick, isSelf, isFollowing }) {

  return (
    <div className="p-overlay-badge">
      <Tooltip target=".followbutton"/>
      {
        !isSelf && (
          <span
            className={`p-badge p-component p-badge-xl BigAvatar_Badge__WGWdh ${Styles.Badge}`}
            onClick={onFollowClick}
          >
            <FontAwesomeIcon
             icon={isFollowing ? faHeartSolid : faHeart}
             style={{ transform: `translateY(.25rem)`, fontSize: '1.75rem' }}
             data-pr-tooltip={isFollowing ? 'Unfollow' : 'Follow'}
            />
          </span>
        )
      }
      <img
        alt={`${nickname}'s Avatar`}
        className={Styles.Picture}
        src={photoURL}
      />
    </div>
  )
}
