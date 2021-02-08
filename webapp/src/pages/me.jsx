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
import {gql, useQuery} from "@apollo/client";
import GamingProfileEditDialog from "../components/dialogs/GamingProfileEditDialog";
import GamingProfileCreateDialog from "../components/dialogs/GamingProfileCreateDialog";
import Styles from "./me.module.scss";
import LoadingWrapper from "../components/misc/LoadingWrapper";
import SelfProfileInfoCard from "../components/misc/SelfProfileInfoEditCard";
import {TabPanel, TabView} from "primereact/tabview";
import GamingProfileCardContainer from "../components/screen/GamingProfileCard/GamingProfileCardContainer";
import GamingProfileCard from "../components/screen/GamingProfileCard";
import GamingProfileCardStyles from "../components/screen/GamingProfileCard/index.module.scss";
import UserProfileCard from "../components/screen/UserProfileCard";
import {FriendRequestAnswerButtons} from "../components/misc/FriendRequestPanel";
import {useRouter} from "next/router";
import Link from "next/link";
import UserDashboard from "../components/dashboards/UserDashboard";

const QUERY = gql`
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
        gamingProfiles {
          id
          game
        }
      }
    }
  `

export default function Me() {

  const { data, loading } = useQuery(QUERY)
  const router = useRouter()

  const [addingProfile, setAddingProfile] = React.useState(false)
  const [gameProfileEdit, setGameProfileEdit] = React.useState()

  if (!loading && !data) {
    return null
  }

  return (
    <UserDashboard>
      { !!gameProfileEdit && (
        <GamingProfileEditDialog
          id={gameProfileEdit}
          visible={!!gameProfileEdit}
          setVisible={flag => setGameProfileEdit(!flag ? undefined : gameProfileEdit)}
          notify={router.reload}
        />
      ) }

      <GamingProfileCreateDialog
        visible={addingProfile}
        setVisible={setAddingProfile}
        notify={router.reload}
      />
      <div className={Styles.ProfilePageWrapper}>
        <div className={Styles.ProfileHalfScreenCard}>
          <LoadingWrapper isLoading={loading} render={() => (
            <>
              <div>
                <img
                  alt="Your Avatar"
                  className={Styles.ProfilePic}
                  src={data.me.photoURL}
                />
                <span className={Styles.UserName}>{data.me.nickname}</span>
              </div>

              <div>
                <SelfProfileInfoCard style={{ margin: '1em' }} allowEdit/>
              </div>
            </>
          )}/>
        </div>
        <div>
          <TabView>
            <TabPanel header="Gaming Profiles">
              <LoadingWrapper isLoading={loading} render={() => (
                <div style={{ padding: 8 }}>
                  <GamingProfileCardContainer>
                    {
                      data.me.gamingProfiles.map(profile => (
                        <GamingProfileCard
                          key={profile.id}
                          gameId={profile.game}
                          onClick={() => setGameProfileEdit(profile.id)}
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
              )}/>
            </TabPanel>
            <TabPanel header="Friends">
              <LoadingWrapper isLoading={loading} render={() => (
                <>
                  {
                    data.me.incomingFriendRequests.length > 0 && (
                      <>
                        <h1>Friend Requests</h1>
                        <GamingProfileCardContainer>
                          {
                            data.me.incomingFriendRequests.map(request => {
                              return (
                                <Link href={`/u/${request.from.uid}`}>
                                  <UserProfileCard
                                    uid={request.from.uid}
                                    onClick={() => router.push(`/u/${request.from.uid}`)}
                                    header={
                                      <FriendRequestAnswerButtons
                                        friendRequestId={request.id}
                                        onAnswer={router.reload}
                                      />
                                    }
                                  />
                                </Link>
                              )
                            })
                          }
                        </GamingProfileCardContainer>
                      </>
                    )
                  }

                  <h1>Friends</h1>
                  {
                    (data.me.friends.length > 0) ? (
                      <GamingProfileCardContainer>
                        {
                          data.me.friends.map(friend => {
                            return (
                              <Link href={`/u/${friend.uid}`}>
                                <UserProfileCard
                                  onClick={() => router.push(`/u/${friend.uid}`)}
                                  uid={friend.uid}
                                />
                              </Link>
                            )
                          })
                        }
                      </GamingProfileCardContainer>
                    ) : <span>It seems like you have to meet someone, why don't you see <a href="/match">our recomendations?</a></span>
                  }
                </>
              )}/>
            </TabPanel>
          </TabView>
        </div>

      </div>
    </UserDashboard>
  )
}
