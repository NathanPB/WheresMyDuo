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
import { Carousel } from 'primereact/carousel';

import Styles from './Calendar.module.scss';

const allHours = [...new Array(168).keys()]


export default function Calendar({ value = [], setValue }) {

  function itemTemplate(page) {
    const range = allHours.slice(page * 24, page * 24 + 24)
    return (
      <div className="p-grid">
        {
          range.map(hourKey => {

            const isActive = value.includes(hourKey)
            function onClick() {
              setValue (
                isActive
                  ? value.filter(it => it !== hourKey)
                  : [...value, hourKey].sort((a, b) => a - b)
              )
            }

            return (
              <div className="p-col-2">
                <button
                  className={`${Styles.Button} ${isActive ? Styles.Active : ''}`}
                  onClick={onClick}
                >
                  {hourKey % 24}:00
                </button>
              </div>
              )
          })
        }
      </div>
    )
  }

  const header = <div className={Styles.Header}>{`${value.length} hours per week selected`}</div>

  return (
    <Carousel
      contentClassName={Styles.Content}
      indicatorsContentClassName={Styles.Dots}

      header={header}
      value={[...new Array(7).keys()]}
      itemTemplate={itemTemplate}
      circular
    />
  )
}
