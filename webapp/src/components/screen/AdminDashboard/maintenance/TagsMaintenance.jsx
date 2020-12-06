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
import {Button} from 'primereact/button';
import {DataTable} from 'primereact/datatable';
import {ApiContext} from '../../../../providers/ApiProvider';
import {Column} from 'primereact/column';
import {Checkbox} from 'primereact/checkbox';

import Styles from './TagsMaintenance.module.scss';
import {Dialog} from 'primereact/dialog';
import {InputText} from 'primereact/inputtext';
import {InputTextarea} from 'primereact/inputtextarea';

export default function TagsMaintenance() {
  const api = React.useContext(ApiContext)

  const [tags, setData] = React.useState([])
  const [filter, setFilter] = React.useState(false)

  const [dialogId, setDialogId] = React.useState()
  const [showDialog, setShowDialog] = React.useState(false)

  const [selection, setSelection] = React.useState([])

  function reload() {
    api.getTags().then(data => setData(data.data))
  }

  function deleteItems(items) {
    if (items.length) {
      const message = items.length === 1 ? 'Are you sure you want to delete?' : `Are you sure you want to delete ${items.length} items?`;
      if (window.confirm(message)) {
        Promise.all(items.map(api.deleteTag))
          .then(reload)
          .catch(e => {
            if (e.response.status === 409) {
              if (window.confirm("A tag is being used by one or more users. Do you want to force delete?")) {
                Promise.all(items.map(it => api.deleteTag(it, true)))
                  .then(reload)
              }
            }
          })
      }
    } else {
      window.alert("Please select at least one item to delete")
    }
  }

  React.useEffect(reload, [])

  function TagEditDialog({ id }) {

    const isCreating = !id

    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")

    React.useEffect(() => {
      if (id) {
        api.getTag(id).then(({ data }) => {
          setName(data.displayName)
          setDescription(data.description || "")
        })
      } else {
        setName("")
        setDescription("")
      }
    }, [id])

    function onSubmit(e) {
      e.preventDefault()

      function finish() {
        setShowDialog(false)
        reload()
      }

      const payload = { displayName: name, description: description || undefined }
      if (isCreating) {
        api.createTag(payload).then(finish)
      } else {
        api.editTag(id, payload).then(finish)
      }
    }

    return (
      <Dialog
        header={isCreating ? 'Creating Tag' : 'Editing Tag'}
        onHide={() => setShowDialog(false)}
        visible={showDialog}
        modal
      >
        <form onSubmit={onSubmit}>
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="displayName">Display Name</label>
              <InputText
                id="displayName"
                placeholder="Display Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="p-field">
              <label htmlFor="description">Description</label>
              <InputTextarea
                id="description"
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="p-field">
              <Button type="submit" label="Submit"/>
            </div>
          </div>
        </form>
      </Dialog>
    )
  }

  return (
    <div className={Styles.Wrapper}>
      <TagEditDialog id={dialogId}/>
      <div className={Styles.Buttons}>
        <Button
          icon="pi pi-plus"
          label="New"
          className="p-button-success"
          onClick={() => {
            setDialogId(undefined)
            setShowDialog(true)
          }}
        />
        <Button
          icon="pi pi-trash"
          label="Delete"
          className="p-button-danger"
          onClick={() => deleteItems(selection.map(it => it._id))}
        />
        <label>
          <Checkbox
            checked={filter}
            onChange={e => setFilter(e.checked)}
          />
          Filter
        </label>
      </div>

      <div className={Styles.TableWrapper}>
        <DataTable
          value={tags}
          selection={selection}
          onSelectionChange={e => setSelection(e.value)}
          scrollHeight="100%"
          scrollable
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3em' }}/>
          <Column header="#" field="_id" filter={filter}/>
          <Column header="Name" field="displayName" sortable filter={filter}/>
          <Column
            header="Created At"
            field="createdAt"
            body={data => new Date(data.createdAt).toLocaleString()}
            sortable
          />
          <Column body={data => <>
            <Button
              icon="pi pi-pencil"
              className="p-button-rounded"
              style={{ marginRight: 8 }}
              onClick={() => {
                setDialogId(data._id)
                setShowDialog(true)
              }}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger"
              onClick={() => deleteItems([data._id])}
            />
          </>}
          />
        </DataTable>
      </div>
    </div>
  )
}
