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

import Styles from './AdminDashboard.module.scss';

import {Menubar} from 'primereact/menubar';
import {Button} from 'primereact/button';
import {TieredMenu} from 'primereact/tieredmenu';
import {gql, useQuery} from "@apollo/client";
import LoadingWrapper from "../../components/misc/LoadingWrapper";

export default function AdminDashboard({ children }) {
  const { loading, data } = useQuery(gql`{ me { isAdmin }}`)

  if (!loading && !data) {
    return null
  }

  const topMenu = [
    {
      label: 'Home',
      url: '/'
    },
    {
      label: 'Firebase Console',
      url: 'https://console.firebase.google.com/u/0/project/wheresmyduo/overview',
      target: '_blank'
    }
  ]

  const topMenuStart = <>
    <img alt="WMD Logo" src="https://www.primefaces.org/primereact/showcase/showcase/images/logo.png" height="40"/>
  </>

  const topMenuEnd = <>
    <Button label="Logout" icon="pi pi-power-off" href="/api/auth/logout"/>
  </>

  const asideMenu = [
    {
      label: 'Tags',
      icon: 'pi pi-tag',
      url: '/admin/tags',
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
      url: '/admin/analytics'
    },
    {
      label: 'Migrations',
      icon: 'pi pi-database',
      url: '/admin/migrations',
    }
  ]

  return (
    <LoadingWrapper
      isLoading={loading || !data?.me?.isAdmin}
      render={() => (
        <div className={Styles.AdminDashboard}>
          <header>
            <Menubar
              start={topMenuStart}
              end={topMenuEnd}
              model={topMenu}
            />
          </header>
          <div>
            <aside>
              <TieredMenu model={asideMenu}/>
            </aside>
            <main>
              { children }
            </main>
          </div>
        </div>
      )}
    />
  )
}
