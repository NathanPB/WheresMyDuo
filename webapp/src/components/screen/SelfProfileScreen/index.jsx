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

import Styles from './index.module.scss';
import { UserContext } from '../../../providers/UserProvider';
import { Card } from 'primereact/card';
import GamingProfileCard from '../GamingProfileCard';

import GamingProfileCardStyles from '../GamingProfileCard/index.module.scss';

export default function SelfProfileScreen() {
  const user = React.useContext(UserContext)

  return (
    <>
      <div className="p-p-3">
        <img
          alt="Your Avatar"
          className={Styles.ProfilePic}
          src={user.photoURL}
        />
        <span className={Styles.UserName}>{user.displayName}</span>
      </div>
      <div className="p-m-3">
        <Card
          title={`${user.displayName}'s Games`}
          className={Styles.GamingProfiles}
        >

          <GamingProfileCard gameId="1912"/>
          <GamingProfileCard gameId="3277"/>
          <GamingProfileCard gameId="121"/>
          <GamingProfileCard gameId="5447"/>
          <GamingProfileCard gameId="1979"/>
          <GamingProfileCard gameId="18320"/>
          <div className={`${GamingProfileCardStyles.Card} ${Styles.NewCard}`} title="New Game">
            <i className="pi pi-plus"/>
          </div>
        </Card>
      </div>
    </>
  )
}
