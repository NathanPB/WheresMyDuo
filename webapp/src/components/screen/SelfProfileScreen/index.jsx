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

import GamingProfileCardStyles from '../GamingProfileCard/index.module.scss';
import {ApiContext} from '../../../providers/ApiProvider';
import GamingProfileAddDialog from '../../dialogs/GamingProfileAddDialog';
import GamingProfileEditDialog from '../../dialogs/GamingProfileEditDialog';
import {useSelfProfile} from "../../../hooks/useSelfProfile";
import SelfProfileInfoCard from "../../misc/SelfProfileInfoEditCard";
import GamingProfileCardContainer from "../GamingProfileCard/GamingProfileCardContainer";
import {TabPanel, TabView} from "primereact/tabview";
import {useSelfFriendRequests} from "../../../hooks/useSelfFriendRequests";
import UserProfileCard from "../UserProfileCard";

export default function SelfProfileScreen({ history }) {
  const user = React.useContext(UserContext)
  const api = React.useContext(ApiContext)
  const [profile] = useSelfProfile()
  const [friendRequests] = useSelfFriendRequests()

  const [gamingProfiles, setGamingProfiles] = React.useState([])

  const [addingProfile, setAddingProfile] = React.useState(false)
  const [gameProfileEdit, setGameProfileEdit] = React.useState()

  function reloadGamingProfiles() {
    if (api) {
      api.getGamingProfiles(user.uid)
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
              src={(profile && profile.photoURL) || user.photoURL}
            />
            <span className={Styles.UserName}>{(profile && profile.nickname) || user.displayName}</span>
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
                friendRequests && friendRequests.length > 0 && (
                  <>
                    <h1>Friend Requests</h1>
                    <GamingProfileCardContainer>
                      {
                        friendRequests.map(request => {

                          const header = <div style={{ width: '100%', display: 'flex' }}>
                            <i
                              style={{ textAlign: 'center', flexGrow: 1, color: '#673AB7', fontSize: '1.5rem' }}
                              title="Accept Friend Request"
                              className="pi pi-check"
                              onClick={() => {
                                api.acceptFriendRequest(request._id)
                                  .then(() => window.location.reload())
                              }}
                            />
                            <i
                              style={{ textAlign: 'center', flexGrow: 1, color: '#673AB7', fontSize: '1.5rem' }}
                              title="Deny Friend Request"
                              className="pi pi-times"
                              onClick={() => {
                                api.denyFriendRequest(request._id)
                                  .then(() => window.location.reload())
                              }}
                            />
                          </div>

                          return (
                            <UserProfileCard
                              onClick={() => history.push(`/u/${request.from}`)}
                              uid={request.from}
                              header={header}
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
                (profile && profile.friends && profile.friends.length > 0)
                  ? (
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
                  ) : <span>It seems like you have to meet someone, why don't you see <a href="/match">our recomendations?</a></span>
              }
            </TabPanel>
          </TabView>
        </div>

      </div>
    </>
  )
}
