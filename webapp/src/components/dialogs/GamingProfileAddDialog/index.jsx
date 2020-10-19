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
import { Dialog } from 'primereact/dialog';
import GamePicker from '../../selectors/GamePicker';
import { Button } from 'primereact/button';

export default function GamingProfileAddDialog({ visible, setVisible, onPicked }) {

  const [game, setGame] = React.useState()

  function handleAdd() {
    if (game && onPicked) {
      onPicked(game)
      setGame(undefined)
      setVisible(false)
    }
  }

  function footer() {
    return (
      <Button
        icon="pi pi-plus"
        style={{ width: '100%' }}
        onClick={handleAdd}
      />
    )
  }

  return (
    <Dialog
      visible={visible}
      onHide={() => setVisible(false)}
      footer={footer()}
      header="Add Gaming Profile"
    >
      <label htmlFor="gamePicker">Game:</label>
      <GamePicker id="gamePicker" value={game} setValue={setGame}/>
    </Dialog>
  )
}
