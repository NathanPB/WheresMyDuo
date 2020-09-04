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

import React from 'react'
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { UserContext } from '../../../providers/UserProvider';
import { Button } from 'primereact/button';
import {
  createUser,
  queryUser,
  updateUserData,
} from '../../../services/firebase/userManager';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function CompleteDataScreen({ visible }) {
  const user = React.useContext(UserContext)
  const [isLoading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const [name, setName] = React.useState(user.displayName)

  async function submit() {
    if (name && name.length > 3) {
      setLoading(true)
      const userData = await queryUser(user.email)
      const data = { displayName: name.trim() }
      const promise = (userData ? updateUserData(user.email, data) : createUser(user, data))
      promise.then(() => {
        setLoading(false)
        setSuccess(true)
        window.setTimeout(() => window.location.reload(), 2000)
      }).catch((e) => {
        console.error(e)
        setLoading(false)
      })
    }
  }


  function renderForm() {
    return (
      <>
        <span>Before you go, we wanna make sure we know you well</span>
        <div className="p-fluid p-grid" style={{ marginTop: '2em' }}>
          <div className="p-field p-col-12">
            <span className="p-float-label">
                <InputText
                  id="name"
                  value={name}
                  onChange={({ target }) => setName(target.value)}
                />
                <label htmlFor="name">How you wanna be called?</label>
            </span>
          </div>
          <Button label="Yes, lets go with that" onClick={submit}/>
        </div>
      </>
    )
  }

  function renderSuccess() {
    return (
      <h1>Welcome, {name}!</h1>
    )
  }

  return (
    <Dialog
      header={"One more thing"}
      visible={visible}
      onHide={() => {}}
      closable={false}
    >
      { isLoading ? <ProgressSpinner/> : success ? renderSuccess() : renderForm() }
    </Dialog>
  )
}
