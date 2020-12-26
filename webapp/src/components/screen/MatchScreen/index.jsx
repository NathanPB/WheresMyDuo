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
import LoadingSpinner from "../../misc/LoadingSpinner";
import GamingProfileCardContainer from "../GamingProfileCard/GamingProfileCardContainer";
import UserProfileCard from "../UserProfileCard";
import {gql, useQuery} from "@apollo/client";

const MATCH = gql`
query Match($profileId: String!) {
  profile: gamingProfile(id: $profileId) {
    calendar
    tags {
      id
    }
  }
  match(profileId: $profileId) {
    calendar
    user {
      uid
    }
    tags {
      id
    }
  }
}`

export default function MatchScreen({ history, match }) {
  const { data, loading } = useQuery(MATCH, { variables: { profileId: match.params.id } })

  if (loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>We are matching your profile!</h1>
        <span>It may take some time</span>
        <LoadingSpinner/>
      </div>
    )
  }

  if (data.match.length === 0) {
    return (
      <>
        <div style={{ textAlign: 'center' }}>
          <h1>It looks like there aren't great results for you yet :(</h1>
          <span>Why don't you come back in a few hours</span>
        </div>
      </>
    )
  }

  const getCommonCalendar = (match) => {
    if (data.profile.calendar.length > 0 && match.calendar.length > 0) {
      return match.calendar.filter(it => data.profile.calendar.includes(it)).length;
    }
    return 0;
  }

  const getCommonTags = (match) => {
    if (data.profile.tags.length > 0 && match.tags.length > 0) {
      return match.tags.filter(it => data.profile.tags.some(it2 => it2.id === it.id)).length
    }
    return 0;
  }


  function makeHeader(match) {
    const commonCalendar = getCommonCalendar(match)
    const commonTags = getCommonTags(match)

    return (
      <div style={{ width: '100%', display: 'flex' }}>
        { !!commonTags && (
          <div style={{ textAlign: 'center', flexGrow: 1 }} title={`Common Tags: ${commonTags}`}>
            <i className="pi pi-tags"/><br/>
            <span>{commonTags}</span>
          </div>
        ) }
        { !!commonCalendar && (
          <div style={{ textAlign: 'center', flexGrow: 1 }} title={`Common Weekly Hours: ${commonCalendar}h`}>
            <i className="pi pi-clock"/><br/>
            <span>{commonCalendar}h</span>
          </div>
        ) }
      </div>
    )
  }


  return (
    <div style={{ padding: '1em' }}>
      <GamingProfileCardContainer>
        {
          data.match.map(match =>
            <UserProfileCard
              onClick={() => history.push(`/u/${match.user.uid}`)}
              uid={match.user.uid}
              header={makeHeader(match)}
            />)
        }
      </GamingProfileCardContainer>
    </div>
  )
}
