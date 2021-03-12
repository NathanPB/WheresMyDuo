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

import Styles from './UserDashboard.module.scss';
import {Menubar} from 'primereact/menubar';
import {TieredMenu} from 'primereact/tieredmenu';
import document from "../../document";
import AppName from "../misc/AppName";
import UserDiscover from "../selectors/UserDiscover";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {gql, useQuery} from "@apollo/client";

const QUERY = gql`
{
  me {
    photoURL
  }
}`

export default function UserDashboard({ children }) {

  const { data } = useQuery(QUERY)
  const tieredMenu = React.useRef()

  const menuStart = <>
    <AppName dark/>
  </>

  const userMenu = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      url: '/me'
    },
    {
      label: 'Account Settings',
      icon: 'pi pi-cog',
      url: '/settings'
    },
    {
      label: 'Logout',
      icon: 'pi pi-power-off',
      url: '/api/auth/logout',
    }
  ]

  const menuEnd = <>
    <TieredMenu appendTo={document?.body} ref={tieredMenu} model={userMenu} popup/>
    <img
      src={data?.me?.photoURL}
      className={Styles.Avatar}
      onClick={e => tieredMenu.current.toggle(e)}
    />
  </>

  const menu = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      url: '/'
    },
    {
      label: 'Match My Profile',
      icon: 'pi pi-users',
      url: '/match'
    },
    {
      template: () => (
        <li className="p-menuitem" role="none">
          <a href="#" className="p-menuitem-link" role="menuitem" aria-haspopup="false">
            <FontAwesomeIcon icon={faSearch} className="p-menuicon"/>
            <UserDiscover/>
          </a>
        </li>
      )
    }
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
