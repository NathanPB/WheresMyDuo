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
import {auth} from 'firebase';

import Styles from './UserDashboard.module.scss';
import {Menubar} from 'primereact/menubar';
import {TieredMenu} from 'primereact/tieredmenu';
import {Button} from 'primereact/button';
import {OverlayPanel} from 'primereact/overlaypanel';
import {AutoComplete} from "primereact/autocomplete";
import {gql, useQuery} from "@apollo/client";
import {useRouter} from "next/router";
import document from "../../document";

export default function UserDashboard({ children }) {
  const user = auth().currentUser
  const router = useRouter()

  const tieredMenu = React.useRef()
  const searchMenu = React.useRef()

  const [userQuery, setUserQuery] = React.useState('')

  const { data } = useQuery(gql`
    query GetUser($query: String!) { 
      users(query: $query) { uid, nickname }
    }
  `, { variables: { query: userQuery } })

  const desktopSearch = React.useRef()
  const mobileSearch = React.useRef()

  React.useEffect(() => {
    if (userQuery) {
      if (desktopSearch.current) desktopSearch.current.showOverlay()
      if (mobileSearch.current) mobileSearch.current.showOverlay()
    }
  }, [userQuery])

  if (!user) {
    return null
  }

  function onUserSelected(user) {
    router.push(`/u/${user.uid}`)
    setUserQuery('')
  }

  const menuStart = <>
    <Button
      icon="pi pi-users"
      label="Match my profile!"
      className={Styles.Match}
      onClick={() => router.push('/match')}
    />
    <div style={{ display: 'inline-block' }} className={Styles.Search}>
      <div className="p-inputgroup">
        <span className="p-inputgroup-addon" onClick={(e) => searchMenu.current.toggle(e)}>
          <i className="pi pi-search"/>
        </span>
        <AutoComplete
          appendTo={document.body}
          ref={desktopSearch}
          panelClassName={Styles.AutoCompleteUserQuery}
          field="nickname"
          value={userQuery}
          completeMethod={() => {}}
          suggestions={data?.users || []}
          onFocus={() => desktopSearch.current?.showOverlay()}
          onChange={e => setUserQuery(e.value)}
          onSelect={e => onUserSelected(e.value)}
          dropdown
        />
      </div>
    </div>
    <OverlayPanel ref={searchMenu} className={Styles.SearchPopup}>
      <AutoComplete
        appendTo={document.body}
        ref={mobileSearch}
        field="nickname"
        value={userQuery}
        completeMethod={() => {}}
        suggestions={data?.users || []}
        onChange={e => setUserQuery(e.value)}
        onSelect={e => onUserSelected(e.value)}
        onFocus={() => mobileSearch.current?.showOverlay()}
        panelClassName={Styles.AutoCompleteUserQuery}
        dropdown
      />
    </OverlayPanel>
  </>

  const userMenu = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      url: '/me'
    },
    {
      label: 'Logout',
      icon: 'pi pi-power-off',
      command: () => auth().signOut()
    }
  ]

  const menuEnd = <>
    <TieredMenu appendTo={document.body} ref={tieredMenu} model={userMenu} popup/>
    <img
      src={user.photoURL}
      className={Styles.Avatar}
      onClick={e => tieredMenu.current.toggle(e)}
    />
  </>

  const menu = [

  ]

  return (
    <>
      <Menubar
        className={Styles.TopMenu}
        start={menuStart}
        end={menuEnd}
        model={menu}
      />
      <main className={Styles.Main}>
        { children }
      </main>
    </>
  )
}
