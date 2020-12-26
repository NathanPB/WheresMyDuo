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
import TagsDatatable from "../../../datatable/TagsDatatable";
import {TagCreateController, TagEditController} from '../../../controller/tag'

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
