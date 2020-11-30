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
import {useSelfProfile} from "../../../hooks/useSelfProfile";
import {useSelfFriendRequests} from "../../../hooks/useSelfFriendRequests";
import {Button} from "primereact/button";
import UserProfileCard from "../UserProfileCard";
import {InputTextarea} from "primereact/inputtextarea";

export default function UserProfileScreen({ uid, history }) {
  const currentUser = React.useContext(UserContext)
  const api = React.useContext(ApiContext)
  const [profile] = useUserProfile(uid)

  const [gamingProfiles, setGamingProfiles] = React.useState([])

  const [selfProfile] = useSelfProfile()
  const [selfFriendRequests] = useSelfFriendRequests()
  const [ongoingFriendRequest, setOngoingFriendRequest] = React.useState(false)

  function reloadGamingProfiles() {
    if (api) {
      api.getGamingProfiles(currentUser.uid)
        .then(response => setGamingProfiles(response.data))
    }
  }

  React.useEffect(reloadGamingProfiles, [api])

  if (uid === currentUser.uid) {
    window.location.href = "/me"
  }

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
          <hr/>
          {
            profile && profile.contactInfo && (
              <>
                <div style={{ marginBottom: '1em' }}>
                  <h3 style={{ textAlign: 'center' }}>Contact Information</h3>
                  <InputTextarea
                    style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                    value={profile.contactInfo}
                    readOnly
                  />
                </div>
                <hr/>
              </>

            )
          }
          <div>
            {
              (
                selfFriendRequests
                && selfProfile
                && selfFriendRequests.some(it => it.to === selfProfile._id)
              ) && (
                <>
                  <h3 style={{ textAlign: 'center' }}>Friend Request Received</h3>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      icon="pi pi-check"
                      label="Accept"
                      style={{ marginRight: 4 }}
                      onClick={() => {
                        const request = selfFriendRequests.find(it => it.to === selfProfile._id)
                        api.acceptFriendRequest(request._id)
                          .then(() => window.location.reload())
                      }}
                    />
                    <Button
                      icon="pi pi-times"
                      style={{ marginLeft: 4 }}
                      onClick={() => {
                        const request = selfFriendRequests.find(it => it.to === selfProfile._id)
                        api.denyFriendRequest(request._id)
                          .then(() => window.location.reload())
                      }}
                    />
                  </div>
                </>
              )
            }
            {
              (profile && selfFriendRequests && selfProfile && !selfFriendRequests.some(it => it.to === selfProfile._id)) && (
                selfProfile.friends.includes(profile._id)
                  ? (
                    <Button
                      label="Remove Friend"
                      style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove ${profile.nickname} from your friends?`)) {
                          api.deleteFriend(profile._id)
                            .then(() => window.location.reload())
                        }
                      }}
                    />
                  ) : (
                    <Button
                      label={ongoingFriendRequest ? "Ongoing Friend Request" : "Send Friend Request"}
                      style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }}
                      onClick={() => {
                        if (!ongoingFriendRequest) {
                          api.sendFriendRequest(profile._id)
                            .then(() => setOngoingFriendRequest(true))
                        }
                      }}
                    />
                  )
              )
            }
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

          <TabPanel header="Friends">
            {
              profile && (
                <>
                  <h1>Friends</h1>
                  <GamingProfileCardContainer>
                    {
                      profile.friends.map(uid => {
                        return (
                          <UserProfileCard
                            onClick={() => history.push(`/u/${uid}`)}
                            uid={uid}
                          />
                        )
                      })
                    }
                  </GamingProfileCardContainer>
                </>
              )
            }
          </TabPanel>
        </TabView>

      </div>
    </>
  )
}
