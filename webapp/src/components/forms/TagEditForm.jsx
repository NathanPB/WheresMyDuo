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
import {InputText} from "primereact/inputtext";
import {InputTextarea} from "primereact/inputtextarea";
import {Button} from "primereact/button";

export default function TagEditForm({ data, setData, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="displayName">Display Name</label>
          <InputText
            id="displayName"
            placeholder="Display Name"
            value={data.displayName}
            onChange={e => setData({ ...data, displayName: e.target.value })}
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            placeholder="Description"
            value={data.description}
            onChange={e => setData({ ...data, description: e.target.value })}
          />
        </div>
        <div className="p-field">
          <Button type="submit" label="Submit"/>
        </div>
      </div>
    </form>
  )
}
