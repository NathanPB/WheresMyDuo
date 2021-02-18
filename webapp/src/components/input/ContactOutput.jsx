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
import {InputText} from "primereact/inputtext";
import Styles from './ContactOutput.module.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClipboard, faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";
import {CopyToClipboard} from 'react-copy-to-clipboard';

export default function ContactOutput({ id, value, url, clipboard, label, icon, ...props }) {

  function renderInput() {
    return (
      <span className="p-float-label">
        <nav className={Styles.Icons}>
          { clipboard && (
            <CopyToClipboard text={value}>
              <a className="clipboard" data-pr-tooltip="Copy to Clipboard"><FontAwesomeIcon icon={faClipboard}/></a>
            </CopyToClipboard>
          ) }
          { url && (
            <a href={url} className="newtab" target="_blank" rel="noopener noreferrer" data-pr-tooltip="Open in New Tab">
              <FontAwesomeIcon icon={faExternalLinkAlt}/>
            </a>
          ) }
        </nav>
        <InputText {...props} id={id} value={value} readOnly/>
        <label htmlFor={id}>{label}</label>
      </span>
    )
  }

  return icon ? (
    <div className="p-inputgroup">
      <span className="p-inputgroup-addon">{icon}</span>
      { renderInput() }
    </div>
  ) : renderInput()
}
