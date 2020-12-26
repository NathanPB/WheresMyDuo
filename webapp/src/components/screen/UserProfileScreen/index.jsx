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
import {Button} from "primereact/button";
import UserProfileCard from "../UserProfileCard";
import {InputTextarea} from "primereact/inputtextarea";
import {gql, useMutation, useQuery} from "@apollo/client";
import LoadingSpinner from "../../misc/LoadingSpinner";

const REMOVE_FRIEND = gql`
 mutation RemoveFriend($uid: String!) {
    removeFriend(uid: $uid) { uid }
  }
`

const ANSWER_FRIEND_REQUEST = gql`
  mutation AnswerFriendRequest($id: String!, $flag: Boolean!) {
    answerFriendRequest(id: $id, flag: $flag) { id }
  }
`

const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($uid: String! $to: String!){
    sendFriendRequest(to: $uid) { id } 
  }
`

const QUERY = gql`
  query PageData($uid: String!) {
    user(uid: $uid) { nickname, photoURL, friends, contactInfo }
    friendRequest: friendRequestBetweenMeAnd(other: $uid) { id, to, from }
  } 
`


export default function UserProfileScreen({ uid, history }) {
  const currentUser = React.useContext(UserContext)
  const api = React.useContext(ApiContext)

  const [gamingProfiles, setGamingProfiles] = React.useState([])
  const [ongoingFriendRequest, setOngoingFriendRequest] = React.useState(false)

  const { data, loading } = useQuery(QUERY, { variables: { uid } })

  React.useEffect(() => {
    if (!loading) {
      setOngoingFriendRequest(data.friendRequest?.from === currentUser.uid)
    }
  }, [loading])

  const [removeFriend] = useMutation(REMOVE_FRIEND)
  const [answerFriendRequest] = useMutation(ANSWER_FRIEND_REQUEST)
  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST)

  function handleRemoveFriend() {
    if (window.confirm(`Are you sure you want to remove ${data.user.nickname} from your friends?`)) {
      removeFriend({ variables: { uid } })
        .then(() => window.location.reload())
    }
  }

  function handleAcceptFriendRequest() {
    answerFriendRequest({ variables: { id: data.friendRequest.id, flag: true } })
      .then(() => window.location.reload())
  }

  function handleDenyFriendRequest() {
    answerFriendRequest({ variables: { id: data.friendRequest.id, flag: false } })
      .then(() => window.location.reload())
  }

  function handleSendFriendRequest() {
    if (!ongoingFriendRequest) {
      sendFriendRequest({ variables: { uid } })
        .then(() => setOngoingFriendRequest(true))
    }
  }


  function reloadGamingProfiles() {
    if (api) {
      api.getGamingProfiles(uid)
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
          { loading ? <LoadingSpinner/> : (
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
          ) }

          <hr/>

          {
            (!loading && data.user.contactInfo) && (
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

          {
            !loading && (
              <div>
                {
                  data.user.friends.includes(currentUser.uid) && (
                    <Button
                      label="Remove Friend"
                      style={{display: 'block', marginRight: 'auto', marginLeft: 'auto'}}
                      onClick={handleRemoveFriend}
                    />
                  )
                }

                {
                  (
                    !data.user.friends.includes(currentUser.uid)
                    && (!data.friendRequest || ongoingFriendRequest)
                  ) && (
                    <Button
                      label={ongoingFriendRequest ? "Ongoing Friend Request" : "Send Friend Request"}
                      style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }}
                      onClick={handleSendFriendRequest}
                    />
                  )
                }

                {
                  data?.friendRequest?.to === currentUser.uid && (
                    <>
                      <h3 style={{ textAlign: 'center' }}>Friend Request Received</h3>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                          icon="pi pi-check"
                          label="Accept"
                          style={{ marginRight: 4 }}
                          onClick={handleAcceptFriendRequest}
                        />
                        <Button
                          icon="pi pi-times"
                          style={{ marginLeft: 4 }}
                          onClick={handleDenyFriendRequest}
                        />
                      </div>
                    </>
                  )
                }
              </div>
            )
          }
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
                      />
                    ))
                  }
                </GamingProfileCardContainer>
              </div>
            </TabPanel>

            <TabPanel header="Friends">
              {
                !loading && (
                  <>
                    <h1>Friends</h1>
                    <GamingProfileCardContainer>
                      {
                        data.user.friends.map(uid => {
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
      </div>
    </>
  )
}
