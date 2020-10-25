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
import { ApiContext } from '../../../providers/ApiProvider';
import { Dialog } from 'primereact/dialog';

import Styles from './index.module.scss';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import Tag from '../../misc/Tag';
import TagAddButton from '../../misc/TagAddButton';
import Calendar from '../../misc/Calendar';
import { TabPanel, TabView } from 'primereact/tabview';

export default function GamingProfileEditDialog({ id, visible, setVisible, notify }) {
  const api = React.useContext(ApiContext)
  const [tabIndex, setTabIndex] = React.useState(0)

  const [data, setData] = React.useState()

  const [game, setGame] = React.useState()
  const [artwork, setArtwork] = React.useState()

  const [calendar, setCalendar] = React.useState([])

  React.useEffect(reload, [api, id])

  React.useEffect(() => {
    if (data?.game) {
      api.igdb
        .limit(1)
        .fields(['name', 'artworks', 'artworks.url'])
        .where(`id = ${data?.game}`)
        .request('/games')
        .then(response => {
          setGame(response.data[0])

          const artworks = response.data[0]?.artworks || []
          if (artworks.length > 0) {
            const artwork = artworks[Math.floor(Math.random() * artworks.length)];
            setArtwork(artwork.url.replace('thumb', 'cover_big'))
          } else {
            setArtwork(undefined)
          }
        })
    }
  }, [data?.game])

  function reload() {
    if (api && id) {
      api.getGamingProfile(id)
        .then(response =>  setData(response.data))
      reloadCalendar()
    }
  }

  function reloadCalendar() {
    api.gamingProfileGetCalendar(id)
      .then(response => setCalendar(response.data))
  }

  function requestSaveCalendar() {
    api.gamingProfileSetCalendar(id, calendar).then(reload)
  }

  function requestRemoveTag(tagId) {
    api.gamingProfileDeleteTag(id, tagId).then(reload)
  }

  function requestAddTag(tag) {
    api.gamingProfileAddTag(id, tag._id).then(reload)
  }

  function hide() {
    setArtwork(undefined)
    setGame(undefined)
    setVisible(false)
  }

  function handleDelete() {
    api.deleteGamingProfile(id)
      .then(() => {
        hide()
        notify()
      })
  }

  function footer() {
    return <>
      <Button
        icon="pi pi-trash"
        label="Delete"
        className="p-button-danger"
        onClick={handleDelete}
        style={{ marginRight: 8 }}
      />
      <Button icon="pi pi-save" label="Close" onClick={hide}/>
    </>
  }

  return (
    <Dialog
      visible={visible}
      onHide={hide}
      className={Styles.Dialog}

      contentStyle={artwork ? { backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.81)), url(https:${artwork})` } : undefined}
      contentClassName={Styles.Content}

      showHeader={false}
      footer={footer()}
      modal
    >
      <div className={Styles.Header}>
        <h1>{game?.name}</h1>
      </div>

      <TabView activeIndex={tabIndex} onTabChange={e => setTabIndex(e.index)}>

        <TabPanel header="Tags">
          <Card>
            { data?.tags?.map(it => <Tag id={it} onRemoved={() => requestRemoveTag(it)}/>) }
            <TagAddButton exclude={data?.tags || []} onAdded={requestAddTag} />
          </Card>
        </TabPanel>

        <TabPanel header="Calendar">
          <Card
            className={Styles.CalendarCard}
            footer={
              <>
                <Button label="Discard" className="p-button-warning" onClick={reloadCalendar}/>
                <Button label="Save" style={{ marginLeft: 8 }} onClick={requestSaveCalendar}/>
              </>
            }
          >
            <Calendar value={calendar} setValue={setCalendar}/>
          </Card>
        </TabPanel>

      </TabView>
    </Dialog>
  )
}
