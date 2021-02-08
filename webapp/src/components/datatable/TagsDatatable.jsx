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
import {gql, useMutation, useQuery} from "@apollo/client";
import Styles from "./TagsDatatable.module.scss";
import {Button} from "primereact/button";
import {Checkbox} from "primereact/checkbox";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";

const LIST_TAGS = gql`
query ListTags($index: Int!) {
  tags(index: $index) { id, displayName, createdAt }
  countTags
}`

const DELETE_TAG = gql`
mutation DeleteTag($id: String!, $force: Boolean = false) {
  deleteTag(id: $id, force: $force) { id }
}`

// TODO fix that primereact bug that it does not allow to select other pages

export default function TagsDatatable({ selectItem }) {
  const [filter, setFilter] = React.useState(false)
  const [showId, setShowId] = React.useState(false)
  const [page, setPage] = React.useState(0)

  const [selection, setSelection] = React.useState([])
  const { data, loading } = useQuery(LIST_TAGS, { variables: { index: page } })
  const [deleteTag] = useMutation(DELETE_TAG)

  function reload() {
    window.location.reload()
  }

  function deleteItems(items) {
    if (items.length) {
      const message = items.length === 1 ? 'Are you sure you want to delete?' : `Are you sure you want to delete ${items.length} items?`;
      if (window.confirm(message)) {
        Promise.all(items.map(id => deleteTag({ variables: { id } })))
          .then(reload)
          .catch(e => {
            console.log(e)
            if (e.response.status === 409) {
              if (window.confirm("A tag is being used by one or more users. Do you want to force delete?")) {
                Promise.all(items.map(id => deleteTag({ variables: { id, force: true }})))
                  .then(reload)
              }
            }
          })
      }
    } else {
      window.alert("Please select at least one item to delete")
    }
  }

  return (
    <div className={Styles.Wrapper}>
      <div className={Styles.Buttons}>
        <Button
          icon="pi pi-plus"
          label="New"
          className="p-button-success"
          onClick={() => selectItem(0)}
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
        <label>
          <Checkbox
            checked={showId}
            onChange={e => setShowId(e.checked)}
          />
          Show ID
        </label>
      </div>

      <div className={Styles.TableWrapper}>
        <DataTable
          loading={loading}
          value={data?.tags}
          selection={selection}
          onSelectionChange={e => setSelection(e.value)}
          scrollHeight="100%"
          scrollable

          paginator
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          rows={20}
          onPage={e => setPage(Math.floor(e.first / 20))}
          first={page * 20}
          totalRecords={data?.countTags || 0}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3em' }}/>
          { showId && <Column header="#" field="id" filter={filter}/> }
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
              onClick={() => selectItem(data)}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger"
              onClick={() => deleteItems([data.id])}
            />
          </>}
          />
        </DataTable>
      </div>
    </div>
  )
}

