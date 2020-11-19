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

import React from "react";
import {Card} from "primereact/card";
import {InputText} from "primereact/inputtext";
import {ApiContext} from "../../providers/ApiProvider";
import {Button} from "primereact/button";

export default function SelfProfileInfoCard({ allowEdit, style }) {
  const api = React.useContext(ApiContext)

  const [edit, setEdit] = React.useState(false)

  const [nickname, setNickname] = React.useState()
  const [photoURL, setPhotoURL] = React.useState()

  function refresh() {
    if (api) {
      api.getSelfProfile()
        .then(response => {
          setNickname(response.data.nickname)
          setPhotoURL(response.data.photoURL)
        }).catch(console.error)
    }
  }

  function handleSave() {
    if (nickname) {
      api.saveSelfProfile({ nickname, photoURL })
        .then(() => setEdit(false))
    }
  }

  function handleDiscard() {
    setEdit(false)
    refresh()
  }

  React.useEffect(refresh, [api])

  React.useEffect(() => {
    if (!edit) refresh()
  }, [api, edit])

  return (
    <Card style={style}>
      <div className="p-fluid">

        <div className="p-field">
          <label>Nickname:</label>
          <InputText value={nickname} onChange={e => setNickname(e.target.value)} readOnly={!edit}/>
        </div>

        { edit && (
          <div className="p-grid">
            <div className="p-col-4">
              <Button className="p-button-danger" label="Discard" onClick={handleDiscard} style={{ marginRight: 8 }}/>
            </div>
            <div className="p-col-8">
              <Button icon="pi pi-save" label="Save" onClick={handleSave}/>
            </div>
          </div>
        ) }

        { (!edit && allowEdit) && <Button icon="pi pi-pencil" label="Edit" onClick={() => setEdit(true)}/> }

      </div>
    </Card>
  )

}
