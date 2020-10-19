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
import { ApiContext } from '../../../providers/ApiProvider';

export default function GamingProfileCard({ gameId }) {

  const api = React.useContext(ApiContext)

  const [gameData, setGameData] = React.useState()
  const [coverUrl, setCoverUrl] = React.useState()

  React.useEffect(() => {
    if (api) {
      api.igdb.fields('*')
        .where(`id = ${gameId}`)
        .request('/games')
        .then(response => setGameData(response.data[0]))

      api.igdb.fields('*')
        .where(`game = ${gameId}`)
        .request('/covers')
        .then(response => setCoverUrl(response.data[0].url))
    }
  }, [api])

  return (
    <div className={Styles.Card} title={gameData?.name}>
      <img
        alt={gameData?.name}
        className={Styles.Cover}
        src={`https:${coverUrl?.replace('t_thumb', 't_cover_big')}`}
        onErrorCapture={e => e.target.src = `https:${coverUrl}`}
      />
      <span className={Styles.GameTitle}>{gameData?.name}</span>
    </div>

  )
}
