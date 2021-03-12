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

import React from 'react';
import * as Styles from './AppName.module.scss';

export default function AppName({ purpleStyle = {}, size = '2rem', dark, ...props }) {
  return (
    <span
      {...props}
      style={{ fontSize: size, ...props.style }}
      className={`${Styles.AppName} ${dark ? Styles.Dark : Styles.Light} ${props.className || ''}`}
    >
      WheresMy
      <span style={purpleStyle} className={Styles.Purple}>
        Duo
      </span>
    </span>
  )
}
