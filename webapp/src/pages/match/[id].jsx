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
import LoadingSpinner from "../../components/misc/LoadingSpinner";
import GamingProfileCardContainer from "../../components/screen/GamingProfileCard/GamingProfileCardContainer";
import UserProfileCard from "../../components/screen/UserProfileCard";
import {gql, useQuery} from "@apollo/client";
import {useRouter} from "next/router";
import UserDashboard from "../../components/dashboards/UserDashboard";
import Head from "next/head";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClock} from "@fortawesome/free-regular-svg-icons";
import {faTags} from "@fortawesome/free-solid-svg-icons";

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
      slug
    }
    tags {
      id
    }
  }
}`

export default function MatchId() {

  const router = useRouter()
  const { id } = router.query

  const { data, loading } = useQuery(MATCH, { variables: { profileId: id } })

  if (loading) {
    return (
      <UserDashboard>
        <div style={{ textAlign: 'center' }}>
          <Head>
            <title>Matching - WheresMyDuo</title>
          </Head>
          <h1>We are matching your profile!</h1>
          <span>It may take some time</span>
          <LoadingSpinner/>
        </div>
      </UserDashboard>
    )
  }

  if (!loading && !data) {
    return null
  }

  if (data.match.length === 0) {
    return (
      <UserDashboard>
        <Head>
          <title>Matching - WheresMyDuo</title>
        </Head>
        <div style={{ textAlign: 'center' }}>
          <h1>It looks like there aren't great results for you yet :(</h1>
          <span>Why don't you come back in a few hours</span>
        </div>
      </UserDashboard>
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
            <FontAwesomeIcon icon={faTags}/><br/>
            <span>{commonTags}</span>
          </div>
        ) }
        { !!commonCalendar && (
          <div style={{ textAlign: 'center', flexGrow: 1 }} title={`Common Weekly Hours: ${commonCalendar}h`}>
            <FontAwesomeIcon icon={faClock}/><br/>
            <span>{commonCalendar}h</span>
          </div>
        ) }
      </div>
    )
  }


  return (
    <UserDashboard>
      <Head>
        <title>Matching - WheresMyDuo</title>
      </Head>
      <div style={{ padding: '1em' }}>
        <GamingProfileCardContainer>
          {
            data.match.map(match =>
              <UserProfileCard
                onClick={() => router.push(`/u/${match.user.slug}`)}
                uid={match.user.uid}
                header={makeHeader(match)}
              />)
          }
        </GamingProfileCardContainer>
      </div>
    </UserDashboard>
  )
}
