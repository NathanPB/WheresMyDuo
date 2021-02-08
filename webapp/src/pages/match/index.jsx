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
import {Button} from "primereact/button";
import {gql, useQuery} from "@apollo/client";
import LoadingWrapper from "../../components/misc/LoadingWrapper";
import GamingProfileCardContainer from "../../components/screen/GamingProfileCard/GamingProfileCardContainer";
import GamingProfileCard from "../../components/screen/GamingProfileCard";
import Link from "next/link";
import {useRouter} from "next/router";
import UserDashboard from "../../components/dashboards/UserDashboard";

const QUERY_GAMING_PROFILES = gql`{
  me {
    gamingProfiles {
      id
      game
    }
  }
}`

export default function Match() {
  const router = useRouter()

  const { loading, data } = useQuery(QUERY_GAMING_PROFILES)

  if (!loading && !data) {
    return null
  }

  return (
    <UserDashboard>
      <LoadingWrapper isLoading={loading} render={() => {
        if (data.me.gamingProfiles.length === 0) {
          return (
            <div style={{ textAlign: 'center' }}>
              <h1>Oh No :(</h1>
              <h2>It seems that you have not entered any games yet</h2>
              <span>You can go to your profile page and add your favorite games, so we will know what to suggest you.</span>
              <br/>
              <Link href={"/me"}>
                <Button
                  label="Go to Profile"
                  onClick={() => router.push('/me')}
                  style={{ marginTop: 8 }}
                />
              </Link>
            </div>
          )
        }

        return (
          <div style={{ padding: '0 1em' }}>
            <h1>Pick a game to match</h1>
            <GamingProfileCardContainer>
              {
                data.me.gamingProfiles.map(profile => (
                  <Link href={`match/${profile.id}`}>
                    <GamingProfileCard
                      gameId={profile.game}
                      onClick={() => router.push(`match/${profile.id}`)}
                    />
                  </Link>
                ))
              }
            </GamingProfileCardContainer>
          </div>
        )

      }}/>
    </UserDashboard>
  );

}
