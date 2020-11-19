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
import {Card} from 'primereact/card';
import GamingProfileCard from '../GamingProfileCard';

import GamingProfileCardStyles from '../GamingProfileCard/index.module.scss';
import {ApiContext} from '../../../providers/ApiProvider';
import GamingProfileAddDialog from '../../dialogs/GamingProfileAddDialog';
import GamingProfileEditDialog from '../../dialogs/GamingProfileEditDialog';
import {useSelfProfile} from "../../../hooks/useSelfProfile";
import SelfProfileInfoCard from "../../misc/SelfProfileInfoEditCard";

export default function SelfProfileScreen() {
  const user = React.useContext(UserContext)
  const api = React.useContext(ApiContext)
  const [profile] = useSelfProfile()

  const [gamingProfiles, setGamingProfiles] = React.useState([])

  const [addingProfile, setAddingProfile] = React.useState(false)
  const [gameProfileEdit, setGameProfileEdit] = React.useState()

  function reloadGamingProfiles() {
    if (api) {
      api.getGamingProfiles(user.uid)
        .then(response => setGamingProfiles(response.data))
    }
  }

  React.useEffect(reloadGamingProfiles, [api])

  function handleAddGamingProfile(data) {
    if (!gamingProfiles.some(it => it.game === data.id)) {
      api.createGamingProfile(data.id)
        .then(reloadGamingProfiles)
    }
  }

  return (
    <>
      <GamingProfileEditDialog
        id={gameProfileEdit}
        visible={!!gameProfileEdit}
        setVisible={flag => setGameProfileEdit(!flag ? undefined : gameProfileEdit)}
        notify={reloadGamingProfiles}
      />
      <GamingProfileAddDialog
        visible={addingProfile}
        setVisible={setAddingProfile}
        onPicked={handleAddGamingProfile}
      />
      <div className="p-grid" style={{ height: '100%', marginTop: 0 }}>
        <div className={`${Styles.ProfileHalfScreenCard}`}>
          <div>
            <img
              alt="Your Avatar"
              className={Styles.ProfilePic}
              src={(profile && profile.photoURL) || user.photoURL}
            />
            <span className={Styles.UserName}>{(profile && profile.nickname) || user.displayName}</span>
          </div>

          <div>
            <SelfProfileInfoCard style={{ margin: '1em' }} allowEdit/>
          </div>

        </div>
        <div className="p-col">
          <Card
            title={`${user.displayName}'s Games`}
            className={Styles.GamingProfiles}
            style={{ margin: '1em' }}
          >

            {
              gamingProfiles.map(profile => (
                <GamingProfileCard
                  key={profile._id}
                  gameId={profile.game}
                  onClick={() => setGameProfileEdit(profile._id)}
                />

              )) }

            <div
              className={`${GamingProfileCardStyles.Card} ${Styles.NewCard}`}
              onClick={() => setAddingProfile(true)}
              title="New Game"
            >
              <i className="pi pi-plus"/>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
