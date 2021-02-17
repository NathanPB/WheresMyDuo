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

import Styles from './Tag.module.scss';
import {OverlayPanel} from 'primereact/overlaypanel';
import TagPicker from '../selectors/TagPicker';
import {Button} from 'primereact/button';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from "@fortawesome/free-solid-svg-icons";

export default function TagAddButton({ onAdded, exclude }) {

  const panel = React.useRef()
  const [tag, setTag] = React.useState()

  function handleClick(e) {
    // eslint-disable-next-line no-unused-expressions
    panel.current.toggle(e)
  }

  function handleSubmit() {
    panel.current.hide()
    if (tag && onAdded) {
      onAdded(tag)
    }
  }

  return (
    <>
      <OverlayPanel ref={panel} showCloseIcon dismissable appendTo={document.body}>
        <div className="p-field">
          <label htmlFor="picker">Select a Tag:</label>
          <div style={{ display: 'flex' }}>
            <TagPicker
              id="picker"
              value={tag}
              setValue={setTag}
              exclude={exclude}
              style={{ flexGrow: '100' }}
            />
            <Button
              icon="pi pi-plus"
              onClick={handleSubmit}
              style={{ marginLeft: 4 }}
            />
          </div>
        </div>

      </OverlayPanel>
      <span className={`p-tag pointer ${Styles.Tag}`} title="Add Tag" onClick={handleClick}>
        <FontAwesomeIcon icon={faPlus}/>
      </span>
    </>
  )
}
