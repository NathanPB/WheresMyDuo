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

import Styles from './[uid].module.scss';
import GamingProfileCard from '../../components/screen/GamingProfileCard';

import GamingProfileCardContainer from "../../components/screen/GamingProfileCard/GamingProfileCardContainer";
import {TabPanel, TabView} from "primereact/tabview";
import {gql, useMutation, useQuery} from "@apollo/client";
import LoadingWrapper from "../../components/misc/LoadingWrapper";
import {useRouter} from "next/router";
import UserDashboard from "../../components/dashboards/UserDashboard";
import Head from "next/head";
import {auth} from "firebase";
import LabeledComponent from "../../components/misc/LabeledComponent";
import UserFollow from "../../components/misc/UserFollow";
import BigAvatar from "../../components/misc/BigAvatar";
import {FullFollowersList, FullFollowingList} from "../../components/screen/FullFollowList";
import {Card} from "primereact/card";
import ContactOutputForm from "../../components/forms/ContactOutputForm";


const QUERY = gql`
  query PageData($uid: String!) {
    user(uid: $uid) {
     nickname
     photoURL
     following(limit: 15) { uid, nickname, photoURL }
     followers(limit: 15) { uid, nickname, photoURL }
     followingCount
     followersCount
     isFollowedByMe
     gamingProfiles {
       id
       game
     }
     contact {
       discord { value }
       skype { value }
       telegram { value }
       facebook { value }
     }
    }
  } 
`

const FOLLOW = gql`
mutation Follow($uid: String!) {
  follow(uid: $uid) { uid }
}`

const UNFOLLOW = gql`
mutation Unfollow($uid: String!) {
  unfollow(uid: $uid) { uid }
}`

export default function UserProfileScreen() {
  const currentUser = auth().currentUser

  const router = useRouter()
  const { uid } = router.query


  const { data, loading, refetch } = useQuery(QUERY, { variables: { uid } })
  const [follow] = useMutation(FOLLOW, { variables: { uid } })
  const [unfollow] = useMutation(UNFOLLOW, { variables: { uid } })
  const [activeIndex, setActiveIndex] = React.useState(0)


  React.useEffect(() => {
    const hash = router.asPath.split("#")[1]
    switch (hash) {
      case "followers": setActiveIndex(1)
      case "following": setActiveIndex(2)
    }
  }, [router])

  React.useEffect(() => {
    if (uid && uid === currentUser?.uid) {
      router.push('../me')
    }
  }, [currentUser?.uid, uid])

  if (!loading && !data) {
    return null
  }

  async function onFollowButtonHit() {
    await (data.user.isFollowedByMe ? unfollow() : follow())
    refetch()
  }

  return (
    <UserDashboard>
      <div className={Styles.ProfilePageWrapper}>
        <div className={Styles.ProfileHalfScreenCard}>
          <LoadingWrapper isLoading={loading} render={() => (
            <>
              <Head>
                <title>{data.user.nickname} on WheresMyDuo</title>
              </Head>
              <div>
                <LabeledComponent
                  label={data.user.nickname}
                  labelHeight="-3rem"
                  fontSize="2rem"
                  style={{ margin: 'auto' }}
                  autofixYCenter
                >
                  <BigAvatar
                    nickname={data.user.nickname}
                    isFollowing={data.user.isFollowedByMe}
                    photoURL={data.user.photoURL}
                    onFollowClick={onFollowButtonHit}
                  />
                </LabeledComponent>
              </div>

              <hr/>

              <div style={{ padding: '0 2em' }}>
                <UserFollow
                  following={data.user.following}
                  followers={data.user.followers}
                  followingCount={data.user.followingCount}
                  followersCount={data.user.followersCount}
                />
              </div>

              { (loading || !Object.keys(data?.user?.contact || {}).length) && (
                <div style={{ padding: '1em 2em' }}>
                  <Card style={{ boxShadow: '10px 10px 5px 0 rgba(0,0,0,0.75)' }}>
                    <ContactOutputForm loading={loading} data={data.user.contact} edit/>
                  </Card>
                </div>
              ) }
            </>
          )}/>

        </div>
        <div>
          <LoadingWrapper isLoading={loading} render={() => (
            <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
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
              <TabPanel header="Followers">
                <FullFollowersList uid={uid}/>
              </TabPanel>
              <TabPanel header="Following">
                <FullFollowingList uid={uid}/>
              </TabPanel>
            </TabView>
          )}/>
        </div>
      </div>
    </UserDashboard>
  )
}
