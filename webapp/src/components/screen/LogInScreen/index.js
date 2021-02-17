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

import * as Styles from './index.module.scss';
import AppName from "../../misc/AppName";

export default function LogInScreen() {

  function handleLogin() {
      auth().signInWithRedirect(new auth.GoogleAuthProvider())
  }

  return (
    <main className={Styles.LoginScreen}>
      <article className={Styles.LoginCard}>
        <span className={Styles.Subtitle}>Welcome to</span><br/>
        <AppName dark/>
        <hr/>

        <div className={Styles.LoginText}>
          <span onClick={handleLogin}>Login with Google</span>
          <br/>
          <i onClick={handleLogin} className="pi pi-google"/>
        </div>
      </article>
    </main>
  )
}
