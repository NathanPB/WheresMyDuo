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
import {Tooltip} from "primereact/tooltip";
import DiscordStyles from "./DiscordInput.module.scss";
import {InputText} from "primereact/inputtext"; // Stolen styles :P

const IS_URL_SAFE = /^[.a-zA-Z0-9_-]*$/g
const FB_URL = /(?:(?:http|https):\/\/)?(?:www.|m.)?facebook.com\/(?!home.php)(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\.-]+)/g

export default function FacebookInput(props) {
  const { infoIcon } = props

  function onChange(e) {
    const value = e.target.value
    const test = ([...value.matchAll(FB_URL)][0] || [])[1]

    if (test) {
      e.target.value = test
    }

    props.onChange && props.onChange(e)
  }

  return (
    <>
      <Tooltip target={`.${DiscordStyles.Info}`}/>

      { infoIcon && (
        <div className={DiscordStyles.Info} data-pr-tooltip="You can copy/paste your Facebook profile URL or type the username">
          { infoIcon }
        </div>
      ) }

      <InputText {...props} onChange={onChange} keyfilter={IS_URL_SAFE}/>
    </>
  )
}
