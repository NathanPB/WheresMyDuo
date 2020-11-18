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
import {useProfileMatcher} from "../../../hooks/useProfileMatcher";
import {useGamingProfile} from "../../../hooks/useGamingProfile";

export default function MatchScreen({ match }) {
  const { id } = match.params

  const [profile, profileLoading] = useGamingProfile(id)
  const [matches, matchLoading] = useProfileMatcher(id)

  if (matchLoading || profileLoading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>We are matching your profile!</h1>
        <span>It may take some time</span>
        <LoadingSpinner/>
      </div>
    )
  }

  if (!profile || !matches || matches.length === 0) {
    return (
      <>
        <div style={{ textAlign: 'center' }}>
          <h1>It looks like there aren't great results for you yet :(</h1>
          <span>Why don't you come back in a few hours</span>
        </div>
      </>
    )
  }

  return (
    <ol>
      {
        matches.map(match => {
          return (
            <li>
              <b>Common Time:</b> {profile.calendar.filter(it => match.calendar.includes(it)).length} hours per week
            </li>
          )
        })
      }
    </ol>
  )
}
