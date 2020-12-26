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
import {ApiContext} from '../../../providers/ApiProvider';
import {Dialog} from 'primereact/dialog';

import Styles from './index.module.scss';
import {Card} from 'primereact/card';
import {Button} from 'primereact/button';
import Calendar from '../../misc/Calendar';
import {TabPanel, TabView} from 'primereact/tabview';
import {gql, useMutation, useQuery} from "@apollo/client";
import GamingProfileTagsForm from "../../forms/GamingProfileTagsForm";
import LoadingWrapper from "../../misc/LoadingWrapper";

const QUERY_GAMING_PROFILE = gql`
query QueryGamingProfile($id: String!) {
  gamingProfile(id: $id) {
    game
    calendar
    tags {
      id
      displayName
    }
  }
}`

const UPDATE_GAMING_PROFILE = gql`
mutation UpdateGamingProfile($id: String!, $tags: [String!], $calendar: [Int!]) {
  updateGamingProfile(id: $id, tags: $tags, calendar: $calendar) { id }
}`

const DELETE_GAMING_PROFILE = gql`
mutation DeleteGamingProfile($id: String!) {
  deleteGamingProfile(id: $id)
}
`

export default function GamingProfileEditDialog({ id, visible, setVisible, notify }) {
  const api = React.useContext(ApiContext)

  const { data: loadedData, loading } = useQuery(QUERY_GAMING_PROFILE, { variables: { id } })

  const [data, setData] = React.useState({})
  const [game, setGame] = React.useState()
  const [artwork, setArtwork] = React.useState()

  React.useEffect(() => {
    if (!loading) {
      setData(loadedData.gamingProfile)

      api.igdb
        .limit(1)
        .fields(['name', 'artworks', 'artworks.url'])
        .where(`id = ${loadedData.gamingProfile?.game}`)
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
  }, [api, loading])

  const [deleteGamingProfile] = useMutation(DELETE_GAMING_PROFILE, { variables: { id } })
  const [updateGamingProfile] = useMutation(UPDATE_GAMING_PROFILE, { variables: { id } })

  function hide() {
    setArtwork(undefined)
    setGame(undefined)
    setVisible(false)
  }

  function finish() {
    hide()
    notify()
  }

  function handleSave() {
    updateGamingProfile({
      variables: {
        tags: data?.tags?.map(it => it.id),
        calendar: data?.calendar
      }
    }).then(finish)
  }

  function footer() {
    return <>
      <Button
        icon="pi pi-trash"
        label="Delete"
        className="p-button-danger"
        onClick={() => deleteGamingProfile().then(finish)}
        style={{ marginRight: 8 }}
      />
      <Button
       icon="pi pi-save"
       label="Save"
       onClick={handleSave}
      />
    </>
  }

  return (
    <Dialog
      visible={visible}
      onHide={hide}
      className={Styles.Dialog}

      contentStyle={artwork ? { backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.81)), url(https:${artwork})` } : undefined}
      contentClassName={Styles.Content}

      footer={footer()}
      closeable
      modal
    >

      <div className={Styles.Header}>
        <h1>{game?.name}</h1>
      </div>

      <LoadingWrapper isLoading={loading} render={() => (
        <TabView>
          <TabPanel header="Tags">
            <Card>
              <GamingProfileTagsForm value={data?.tags} setValue={(tags) => setData({ ...data, tags })}/>
            </Card>
          </TabPanel>

          <TabPanel header="Calendar">
            <Card className={Styles.CalendarCard}>
              <Calendar value={data?.calendar} setValue={(calendar) => setData({ ...data, calendar })}/>
            </Card>
          </TabPanel>

        </TabView>
      )}/>
    </Dialog>
  )
}
