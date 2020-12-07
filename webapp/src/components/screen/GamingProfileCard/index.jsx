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
import {ApiContext} from '../../../providers/ApiProvider';

export default function GamingProfileCard({ gameId, onClick }) {

  const api = React.useContext(ApiContext)

  const [gameData, setGameData] = React.useState()

  React.useEffect(() => {
    if (api) {
      api.igdb.fields(['*', 'cover.url'])
        .where(`id = ${gameId}`)
        .request('/games')
        .then(response => setGameData(response.data[0]))
    }
  }, [api])

  return (
    <div className={Styles.Card} title={gameData?.name} onClick={onClick}>
      <img
        alt={gameData?.name}
        className={Styles.Cover}
        src={`https:${gameData?.cover?.url?.replace('t_thumb', 't_cover_big')}`}
        onErrorCapture={e => {
          if (gameData?.cover?.url && e.target.src !== gameData?.cover?.url) {
            e.target.src = `https:${gameData?.cover?.url}`
          }
        }}
      />
      <span
        style={gameData?.name?.length > 15 ? { fontSize: '.7rem' } : undefined}
        className={Styles.GameTitle}
      >
        {gameData?.name}
      </span>
    </div>

  )
}
