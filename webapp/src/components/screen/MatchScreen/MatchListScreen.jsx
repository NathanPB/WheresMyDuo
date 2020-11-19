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

import React from "react";
import {ApiContext} from "../../../providers/ApiProvider";
import {UserContext} from "../../../providers/UserProvider";
import LoadingSpinner from "../../misc/LoadingSpinner";
import {Button} from "primereact/button";
import GamingProfileCard from "../GamingProfileCard";
import GamingProfileCardContainer from "../GamingProfileCard/GamingProfileCardContainer";

export default function MatchListScreen({ history }) {
  const api = React.useContext(ApiContext)
  const user = React.useContext(UserContext)

  const [gamingProfiles, setGamingProfiles] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (api) {
      setLoading(true)
      api.getGamingProfiles(user.uid)
        .then(response => {
          setLoading(false)
          setGamingProfiles(response.data)
        }).catch(e => {
        setLoading(false)
        console.error(e)
      })
    }
  }, [api, user.uid])

  if (loading) {
    return <LoadingSpinner/>
  }

  if (gamingProfiles.length === 0) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Oh No :(</h1>
        <h2>It seems that you have not entered any games yet</h2>
        <span>You can go to your profile page and add your favorite games, so we will know what to suggest you.</span>
        <br/>
        <Button
          label="Go to Profile"
          onClick={() => history.push('/me')}
          style={{ marginTop: 8 }}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '0 1em' }}>
      <h1>Pick a game to match</h1>
      <GamingProfileCardContainer>
        {
          gamingProfiles.map(profile => <GamingProfileCard
            gameId={profile.game}
            onClick={() => history.push(`match/${profile._id}`)}
          />)
        }
      </GamingProfileCardContainer>
    </div>

  )

}

