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
import Styles from "./DiscordInput.module.scss";
import {Tooltip} from "primereact/tooltip";

export const REGEX_CORRECT = /.+#[0-9]{4}$/g

// I can't imagine the time I'm wasting on this shit
// TODO make this a library
export default function DiscordInput(props) {
  const { value, infoIcon } = props;
  const input = React.useRef()

  // https://stackoverflow.com/a/53215514/9893963
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const discriminator = (!value ? "" : value.split('#')[1] || "").substring(0, 4)

  const discriminatorTemplate = "0000"
    .substring(0, 4 - discriminator?.length)
    .split("")
    .reverse()
    .join("")

  const isCorrect = REGEX_CORRECT.test(value)

  function onChange(e) {
    const newValue = e.target.value
    if (value?.includes('#') && (value?.length || 0) < newValue.length) {
      const newChar = newValue[newValue.length - 1]
      if (newChar < "0" || newChar > "9") {
        e.stopPropagation()
        return
      }

      if (discriminator.length >= 4) {
        return;
      }
    }

    props.onChange && props.onChange(e)
  }

  function onFocus(e) {
    forceUpdate()
    props.onFocus && onFocus(e)
  }

  return (
    <>
      <Tooltip target={`.${Styles.Info}`}/>

      { infoIcon && (
        <div className={Styles.Info} data-pr-tooltip="You can find your Discord username by looking at the bottom left corner of your Discord app">
          { infoIcon }
        </div>
      ) }

      <input
        {...props}
        ref={input}
        onChange={onChange}
        onFocus={onFocus}
        className={`p-inputtext p-component ${value ? "p-filled" : ""} ${value?.length > 0 && !isCorrect ? "p-invalid" : ""} ${Styles.DiscordInput} ${props.className}`}
      />

      <span
        className={`${Styles.Value} ${Styles.HideWhenNotNeeded} ${!value ? Styles.Placeholder : ""} ${isCorrect ? Styles.Correct : ""}`}
        onClick={() => input.current?.focus()}
      >
        <span className={Styles.HideWhenNotNeeded}>
          { value || "Username" }
          <span className={`${Styles.Placeholder}`}>
            { (discriminator === "" && !value?.includes('#')) && "#" }
            { discriminatorTemplate }
          </span>
        </span>
      </span>
    </>
  )
}
