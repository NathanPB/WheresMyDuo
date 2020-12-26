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

import GamingProfileCardContainer from "../GamingProfileCard/GamingProfileCardContainer";
import {TabPanel, TabView} from "primereact/tabview";
import UserProfileCard from "../UserProfileCard";
import {InputTextarea} from "primereact/inputtextarea";
import {gql, useQuery} from "@apollo/client";
import {FriendRequestPanel} from "../../misc/FriendRequestPanel";
import LoadingWrapper from "../../misc/LoadingWrapper";


const QUERY = gql`
  query PageData($uid: String!) {
    user(uid: $uid) {
     nickname
     photoURL
     contactInfo
     friends { uid }
     gamingProfiles {
       id
       game
     }
    }
    friendRequest: friendRequestBetweenMeAnd(other: $uid) { id, to { uid }, from { uid } }
  } 
`

export default function UserProfileScreen({ uid, history }) {
  const currentUser = React.useContext(UserContext)
  const { data, loading } = useQuery(QUERY, { variables: { uid } })

  if (uid === currentUser.uid) {
    window.location.href = "/me"
  }

  return (
    <>
      <div className={Styles.ProfilePageWrapper}>
        <div className={Styles.ProfileHalfScreenCard}>
          <LoadingWrapper isLoading={loading} render={() => (
            <>
              <div>
                <img
                  alt={`${data.user.nickname}'s Avatar`}
                  className={Styles.ProfilePic}
                  src={data.user.photoURL}
                />
                <span className={Styles.UserName}>
                  {data.user.nickname}
                </span>
              </div>

              <hr/>

              {
                data.user.contactInfo && (
                  <>
                    <div style={{ marginBottom: '1em' }}>
                      <h3 style={{ textAlign: 'center' }}>Contact Information</h3>
                      <InputTextarea
                        style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                        value={data.user.contactInfo}
                        readOnly
                      />
                    </div>
                    <hr/>
                  </>
                )
              }

              <div>
                <FriendRequestPanel
                  friendRequest={data.friendRequest}
                  uid={uid}
                  nickname={data.user.nickname}
                  areFriends={data.user.friends.some(it => it.uid === currentUser.uid)}
                  onAnswer={() => window.location.reload()}
                  onDelete={() => window.location.reload()}
                />
              </div>
            </>
          )}/>

        </div>
        <div>
          <LoadingWrapper isLoading={loading} render={() => (
            <TabView>
              <TabPanel header="Gaming Profiles">
                <div style={{ padding: 8 }}>
                  <GamingProfileCardContainer>
                    {
                      data.user.gamingProfiles.map(profile => (
                        <GamingProfileCard
                          key={profile.id}
                          gameId={profile.game}
                        />
                      ))
                    }
                  </GamingProfileCardContainer>
                </div>
              </TabPanel>

              <TabPanel header="Friends">
                <h1>Friends</h1>
                <GamingProfileCardContainer>
                  {
                    data.user.friends.map(friend => {
                      return (
                        <UserProfileCard
                          onClick={() => history.push(`/u/${friend.uid}`)}
                          uid={friend.uid}
                        />
                      )
                    })
                  }
                </GamingProfileCardContainer>
              </TabPanel>
            </TabView>
          )}/>
        </div>
      </div>
    </>
  )
}
