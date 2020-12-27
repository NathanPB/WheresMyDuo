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
import {ApiContext} from '../../providers/ApiProvider';
import Carousel from "react-spring-3d-carousel";
import {InputText} from "primereact/inputtext";
import Styles from './GamePicker.module.scss'
import useDeepCompareMemoized from "../../hooks/useDeepCompareMemoized";

export default function GamePicker({ onChange }) {
  const api = React.useContext(ApiContext)
  const [query, setQuery] = React.useState('')
  const [games, setGames] = React.useState([])
  const [currentSlide, setCurrentSlide] = React.useState(0)

  function queryGames() {
    if (api) {
      if (query) {
        api.igdb
          .fields(['id', 'name', 'cover.url'])
          .limit(10)
          .search(query)
          .request('/games')
          .then(response => setGames(response.data))
          .catch(console.error)
      } else {
        api.igdb
          .fields(['id', 'name', 'cover.url'])
          .sort('total_rating asc')
          .limit(10)
          .request('/games')
          .then(response => setGames(response.data))
          .catch(console.error)
      }
    }
  }

  React.useEffect(queryGames, [api, query])
  React.useEffect(queryGames, [api])

  React.useEffect(() => {
    if (onChange) {
      onChange(games[currentSlide])
    }
  }, [currentSlide, useDeepCompareMemoized(games)])

  const slides = games.filter(it => it?.cover?.url).map((it, index) => ({
    key: it.id,
    content: <img
      style={{ maxWidth: 172 }}
      src={`https:${it.cover.url.replace('t_thumb', 't_cover_big')}`}
      alt={it.name}
      onClick={() => setCurrentSlide(index)}
    />
  }))

  return (
    <div className={Styles.GamePicker}>
      <span className={Styles.GameTitle}>{games[currentSlide]?.name}</span>
      {
        games.length > 0 && (
          <div className={Styles.CarouselWrapper}>
            <Carousel slides={slides} goToSlide={currentSlide}/>
          </div>
        )
      }

      {
        (games.length === 0 && query) && (
          <span>Well, we couldn't find anything about <code>{query}</code></span>
        )
      }

      <div className="p-inputgroup">
        <div className="p-inputgroup-addon">
          <i className="pi pi-search"/>
        </div>
        <InputText placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)}/>
      </div>
    </div>
  )

}
