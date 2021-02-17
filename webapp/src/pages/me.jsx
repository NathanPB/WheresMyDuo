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
import {TabPanel, TabView} from "primereact/tabview";
import GamingProfileCardContainer from "../components/screen/GamingProfileCard/GamingProfileCardContainer";
import GamingProfileCard from "../components/screen/GamingProfileCard";
import GamingProfileCardStyles from "../components/screen/GamingProfileCard/index.module.scss";
import {useRouter} from "next/router";
import UserDashboard from "../components/dashboards/UserDashboard";
import Head from "next/head";
import LabeledComponent from "../components/misc/LabeledComponent";
import UserFollow from "../components/misc/UserFollow";
import BigAvatar from "../components/misc/BigAvatar";
import {FullFollowersList, FullFollowingList} from "../components/screen/FullFollowList";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from "@fortawesome/free-solid-svg-icons";

const QUERY = gql`
    {
      me {
        uid
        nickname
        photoURL
        followers(limit: 15) { uid, nickname, photoURL }
        following(limit: 15) { uid, nickname, photoURL }
        followingCount
        followersCount
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
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    const hash = router.asPath.split("#")[1]
    switch (hash) {
      case "followers": setActiveIndex(1)
      case "following": setActiveIndex(2)
    }
  }, [router])

  if (!loading && !data) {
    return null
  }

  return (
    <UserDashboard>
      <Head>
        <title>My Profile - WheresMyDuo</title>
      </Head>
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
              <LabeledComponent
                label={data.me.nickname}
                labelHeight="-3rem"
                fontSize="2rem"
                style={{ margin: 'auto' }}
                autofixYCenter
              >
                <BigAvatar
                  photoURL={data.me.photoURL}
                  nickname={data.me.nickname}
                  isSelf
                />
              </LabeledComponent>

              <div>
                <div style={{ padding: '0 2em' }}>
                  <UserFollow
                    followers={data.me.followers}
                    following={data.me.following}
                    followersCount={data.me.followersCount}
                    followingCount={data.me.followingCount}
                  />
                </div>
              </div>
            </>
          )}/>
        </div>
        <div>
          <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
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
                      <FontAwesomeIcon icon={faPlus}/>
                    </div>
                  </GamingProfileCardContainer>
                </div>
              )}/>
            </TabPanel>
            <TabPanel header="Followers">
              { !loading&& <FullFollowersList uid={data?.me?.uid}/> }
            </TabPanel>
            <TabPanel header="Following">
              { !loading && <FullFollowingList uid={data?.me?.uid}/> }
            </TabPanel>
          </TabView>
        </div>

      </div>
    </UserDashboard>
  )
}
