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
import GamingProfileCard from '../GamingProfileCard';

import GamingProfileCardStyles from '../GamingProfileCard/index.module.scss';
import {ApiContext} from '../../../providers/ApiProvider';
import GamingProfileAddDialog from '../../dialogs/GamingProfileAddDialog';
import GamingProfileEditDialog from '../../dialogs/GamingProfileEditDialog';
import SelfProfileInfoCard from "../../misc/SelfProfileInfoEditCard";
import GamingProfileCardContainer from "../GamingProfileCard/GamingProfileCardContainer";
import {TabPanel, TabView} from "primereact/tabview";
import UserProfileCard from "../UserProfileCard";
import {gql, useQuery} from "@apollo/client";
import {UserContext} from "../../../providers/UserProvider";
import {FriendRequestAnswerButtons} from "../../misc/FriendRequestPanel";

export default function SelfProfileScreen({ history }) {
  const api = React.useContext(ApiContext)
  const currentUser = React.useContext(UserContext)

  const { data, loading, error } = useQuery(gql`
    {
      me {
        nickname
        photoURL
        friends {
          uid
        }
        incomingFriendRequests {
          id
          from {
            uid
          }
        }
      }
    }
  `)

  const [gamingProfiles, setGamingProfiles] = React.useState([])

  const [addingProfile, setAddingProfile] = React.useState(false)
  const [gameProfileEdit, setGameProfileEdit] = React.useState()

  function reloadGamingProfiles() {
    if (api) {
      api.getGamingProfiles(currentUser?.uid)
        .then(response => setGamingProfiles(response.data))
    }
  }

  React.useEffect(reloadGamingProfiles, [api])

  function handleAddGamingProfile(data) {
    if (!gamingProfiles.some(it => it.game === data.id)) {
      api.createGamingProfile(data.id)
        .then(reloadGamingProfiles)
    }
  }

  return (
    <>
      <GamingProfileEditDialog
        id={gameProfileEdit}
        visible={!!gameProfileEdit}
        setVisible={flag => setGameProfileEdit(!flag ? undefined : gameProfileEdit)}
        notify={reloadGamingProfiles}
      />
      <GamingProfileAddDialog
        visible={addingProfile}
        setVisible={setAddingProfile}
        onPicked={handleAddGamingProfile}
      />
      <div className={Styles.ProfilePageWrapper}>
        <div className={Styles.ProfileHalfScreenCard}>
          <div>
            <img
              alt="Your Avatar"
              className={Styles.ProfilePic}
              src={data?.me?.photoURL}
            />
            <span className={Styles.UserName}>{data?.me?.nickname}</span>
          </div>

          <div>
            <SelfProfileInfoCard style={{ margin: '1em' }} allowEdit/>
          </div>

        </div>
        <div>
          <TabView>
            <TabPanel header="Gaming Profiles">
              <div style={{ padding: 8 }}>
                <GamingProfileCardContainer>
                  {
                    gamingProfiles.map(profile => (
                      <GamingProfileCard
                        key={profile._id}
                        gameId={profile.game}
                        onClick={() => setGameProfileEdit(profile._id)}
                      />

                    ))
                  }

                  <div
                    className={`${GamingProfileCardStyles.Card} ${Styles.NewCard}`}
                    onClick={() => setAddingProfile(true)}
                    title="New Game"
                  >
                    <i className="pi pi-plus"/>
                  </div>
                </GamingProfileCardContainer>
              </div>
            </TabPanel>
            <TabPanel header="Friends">
              {
                data?.me?.incomingFriendRequests?.length > 0 && (
                  <>
                    <h1>Friend Requests</h1>
                    <GamingProfileCardContainer>
                      {
                        data.me.incomingFriendRequests.map(request => {
                          return (
                            <UserProfileCard
                              onClick={() => history.push(`/u/${request.from.uid}`)}
                              uid={request.from.uid}
                              header={
                                <FriendRequestAnswerButtons
                                  friendRequestId={request.id}
                                  onAnswer={() => window.location.reload()}
                                />
                              }
                            />
                          )
                        })
                      }
                    </GamingProfileCardContainer>
                  </>
                )
              }
              <h1>Friends</h1>
              {
                (data?.me?.friends?.length > 0) ? (
                    <GamingProfileCardContainer>
                      {
                        data.me.friends.map(friend => {
                          return (
                            <UserProfileCard
                              onClick={() => history.push(`/u/${friend.uid}`)}
                              uid={friend.uid}
                            />
                          )
                        })
                      }
                    </GamingProfileCardContainer>
                  ) : <span>It seems like you have to meet someone, why don't you see <a href="/match">our recomendations?</a></span>
              }
            </TabPanel>
          </TabView>
        </div>

      </div>
    </>
  )
}
