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
import {Route, Switch} from 'react-router';
import logo from '../../../logo.svg';
import {auth} from '../../../services/firebase';
import SelfProfileScreen from '../SelfProfileScreen';

import Styles from './index.module.scss';
import {Menubar} from 'primereact/menubar';
import {InputText} from 'primereact/inputtext';
import {TieredMenu} from 'primereact/tieredmenu';
import {UserContext} from '../../../providers/UserProvider';
import {Button} from 'primereact/button';
import {OverlayPanel} from 'primereact/overlaypanel';
import MatchScreen from "../MatchScreen";
import MatchListScreen from "../MatchScreen/MatchListScreen";
import UserProfileScreen from "../UserProfileScreen";

export default function UserDashboard({ history }) {

  const user = React.useContext(UserContext)
  const tieredMenu = React.useRef()
  const searchMenu = React.useRef()

  const menuStart = <>
    <Button
      icon="pi pi-users"
      label="Match my profile!"
      className={Styles.Match}
      onClick={() => history.push('/match')}
    />
    <div style={{ display: 'inline-block' }} className={Styles.Search}>
      <div className="p-inputgroup">
        <span className="p-inputgroup-addon" onClick={(e) => searchMenu.current.toggle(e)}>
          <i className="pi pi-search"/>
        </span>
        <InputText/>
      </div>
    </div>
    <OverlayPanel ref={searchMenu} className={Styles.SearchPopup}>
      <InputText/>
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
      command: () => auth.signOut()
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
        <Switch>
          <Route path="/" exact>
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <span onClick={() => auth.signOut()}>
                  Logout
                </span>
              </header>
            </div>
          </Route>
          <Route path="/match/:id" component={MatchScreen}/>
          <Route path="/match" component={MatchListScreen}/>
          <Route path="/me" component={SelfProfileScreen} />
          <Route path="/u/:id" component={({ match, history }) => <UserProfileScreen uid={match.params.id} history={history}/>}/>
        </Switch>
      </main>
    </>
  )
}
