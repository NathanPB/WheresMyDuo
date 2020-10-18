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

import Styles from './index.module.scss';

import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Route, Switch } from 'react-router-dom';
import TagsMaintenance from './maintenance/TagsMaintenance';
import { TieredMenu } from 'primereact/tieredmenu';
import { auth } from '../../../services/firebase';

export default function AdminDashboard({ history, match }) {

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
    <img src="https://www.primefaces.org/primereact/showcase/showcase/images/logo.png" height="40"/>
  </>

  const topMenuEnd = <>
    <Button label="Logout" icon="pi pi-power-off" onClick={() => auth.signOut()}/>
  </>

  const asideMenu = [
    {
      label: 'Tags',
      command: () => history.push(`${match.path}/tags`)
    }
  ]

  return (
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
            <Switch>
              <Route path={`${match.path}/tags`} component={TagsMaintenance}/>
            </Switch>
        </main>
      </div>
    </div>
  )
}
