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

import React from 'react'
import {gql, useMutation} from "@apollo/client";
import {Button} from "primereact/button";

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


export function FriendRequestAnswerButtons({ friendRequestId, onAnswer }) {
  const [answerFriendRequest] = useMutation(ANSWER_FRIEND_REQUEST)

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <i
        style={{ textAlign: 'center', flexGrow: 1, color: '#673AB7', fontSize: '1.5rem' }}
        title="Accept Friend Request"
        className="pi pi-check"
        onClick={() => {
          answerFriendRequest({ variables: { id: friendRequestId, flag: true } })
            .then(() => onAnswer && onAnswer(true))
        }}
      />
      <i
        style={{ textAlign: 'center', flexGrow: 1, color: '#673AB7', fontSize: '1.5rem' }}
        title="Deny Friend Request"
        className="pi pi-times"
        onClick={() => {
          answerFriendRequest({ variables: { id: friendRequestId, flag: false } })
            .then(() => onAnswer && onAnswer(false))
        }}
      />
    </div>
  )
}

export function FriendRequestPanel({ friendRequest, uid, nickname, areFriends, onAnswer, onSend , onDelete }) {
  const [removeFriend] = useMutation(REMOVE_FRIEND)
  const [answerFriendRequest] = useMutation(ANSWER_FRIEND_REQUEST)
  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST)

  const [ongoingFriendRequest, setOngoingFriendRequest] = React.useState(!!friendRequest)

  function handleRemoveFriend() {
    if (window.confirm(`Are you sure you want to remove ${nickname} from your friends?`)) {
      removeFriend({ variables: { uid } })
        .then(() => onDelete && onDelete())
    }
  }

  function handleAcceptFriendRequest() {
    answerFriendRequest({ variables: { id: friendRequest.id, flag: true } })
      .then(() => onAnswer && onAnswer(true))
  }

  function handleDenyFriendRequest() {
    answerFriendRequest({ variables: { id: friendRequest.id, flag: false } })
      .then(() => onAnswer && onAnswer(false))
  }

  function handleSendFriendRequest() {
    if (!ongoingFriendRequest) {
      sendFriendRequest({ variables: { uid } })
        .then(response => {
          setOngoingFriendRequest(true)
          onSend && onSend(response.data)
        })
    }
  }

  if (areFriends) {
    return (
      <Button
        label="Remove Friend"
        style={{display: 'block', marginRight: 'auto', marginLeft: 'auto'}}
        onClick={handleRemoveFriend}
      />
    )
  }

  if (friendRequest?.from?.uid === uid) {
    return (
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

  if (!friendRequest || ongoingFriendRequest) {
    return (
      <Button
        label={ongoingFriendRequest ? "Ongoing Friend Request" : "Send Friend Request"}
        style={{ display: 'block', marginRight: 'auto', marginLeft: 'auto' }}
        onClick={handleSendFriendRequest}
      />
    )
  }

}
