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
import {Dialog} from 'primereact/dialog';
import {gql, useMutation, useQuery} from "@apollo/client";
import TagEditForm from "../../../forms/TagEditForm";
import TagsDatatable from "../../../datatable/TagsDatatable";

const TAG_DETAIL = gql`
query GetTag($id: String!) {
  tag(id: $id) { displayName, description }
}`

const NEW_TAG = gql`
mutation CreateTag($displayName: String!, $description: String) {
  createTag(displayName: $displayName, description: $description) { id }
}`

const UPDATE_TAG = gql`
mutation UpdateTag($id: String!, $displayName: String!, $description: String) {
  updateTag(id: $id, displayName: $displayName, description: $description) { id }
}`

function TagCreateController({ close, notify }) {
  const [data, setData] = React.useState({})
  const [createTag] = useMutation(NEW_TAG, { variables: data })

  function onSubmit(e) {
    e.preventDefault()
    if (data.displayName) {
      createTag().then(() => {
        close()
        notify()
      })
    }
  }

  return <TagEditForm data={data} setData={setData} onSubmit={onSubmit}/>
}

function TagEditController({ id, close, notify }) {
  const [formData, setFormData] = React.useState({})
  const { loading, data } = useQuery(TAG_DETAIL, { variables: { id } })
  const [updateTag] = useMutation(UPDATE_TAG, { variables: { id, ...formData } })


  React.useEffect(() => {
    if (loading) {
      setFormData({})
    }

    if (!loading && data) {
      setFormData(data.tag)
    }
  }, [loading])

  function onSubmit(e) {
    e.preventDefault()
    updateTag().then(() => {
      close()
      notify()
    })
  }

  return <TagEditForm data={formData} setData={setFormData} onSubmit={onSubmit}/>
}

export default function TagsMaintenance() {
  const [selectedItem, setSelectedItem] = React.useState()

  function reload() {
    window.location.reload()
  }

  function unselect() {
    setSelectedItem(undefined)
  }

  return (
    <>
      <Dialog header="Creating Tag" onHide={unselect} visible={selectedItem === 0} modal>
        <TagCreateController close={unselect} notify={reload}/>
      </Dialog>

      {
        selectedItem?.displayName && (
          <Dialog header={`Editing ${selectedItem.displayName}`} visible={!!selectedItem} onHide={unselect} modal>
            <TagEditController id={selectedItem.id} close={unselect} notify={reload}/>
          </Dialog>
        )
      }

      <TagsDatatable selectItem={setSelectedItem}/>
    </>
  )
}
