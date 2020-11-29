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
import {UserContext} from '../../../providers/UserProvider';
import GamingProfileCard from '../GamingProfileCard';

import {ApiContext} from '../../../providers/ApiProvider';
import GamingProfileCardContainer from "../GamingProfileCard/GamingProfileCardContainer";
import {TabPanel, TabView} from "primereact/tabview";
import {useUserProfile} from "../../../hooks/useUserProfile";

export default function UserProfileScreen({ uid }) {
  const currentUser = React.useContext(UserContext)
  const api = React.useContext(ApiContext)
  const [profile] = useUserProfile(uid)

  const [gamingProfiles, setGamingProfiles] = React.useState([])

  function reloadGamingProfiles() {
    if (api) {
      api.getGamingProfiles(currentUser.uid)
        .then(response => setGamingProfiles(response.data))
    }
  }

  React.useEffect(reloadGamingProfiles, [api])

  return (
    <>
      <div className={Styles.ProfilePageWrapper}>
        <div className={Styles.ProfileHalfScreenCard}>
          <div>
            <img
              alt={`${profile?.nickname}'s Avatar`}
              className={Styles.ProfilePic}
              src={profile?.photoURL}
            />
            <span className={Styles.UserName}>
              {profile?.nickname}
            </span>
          </div>

        </div>
        <TabView>
          <TabPanel header="Gaming Profiles">
            <div style={{ padding: 8 }}>
              <GamingProfileCardContainer>
                {
                  gamingProfiles.map(profile => (
                    <GamingProfileCard
                      key={profile._id}
                      gameId={profile.game}
                    />
                  ))
                }
              </GamingProfileCardContainer>
            </div>
          </TabPanel>
        </TabView>

      </div>
    </>
  )
}
