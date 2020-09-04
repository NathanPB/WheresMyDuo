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
import logo from './logo.svg';
import './App.css';
import { UserContext, UserProvider } from './providers/UserProvider';
import LogInScreen from './components/screen/auth/LogInScreen';
import { auth } from './services/firebase';

import 'primereact/resources/primereact.css'
import 'primereact/resources/themes/luna-pink/theme.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import { isDataCompleted } from './services/firebase/userManager';
import CompleteDataScreen from './components/screen/auth/CompleteDataScreen';

function App() {
  const user = React.useContext(UserContext)
  const userEmail = user?.email
  const [showProfileCompletePopup, setShowProfileCompletePopup] = React.useState(false)

  React.useEffect(() => {
    (async () => {
      setShowProfileCompletePopup(userEmail && !(await isDataCompleted(userEmail)))
    })()
  }, [userEmail])

  function renderLoggedIn() {
    return (
      <>
        <CompleteDataScreen visible={showProfileCompletePopup}/>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <span onClick={() => auth.signOut()}>
            Logout
          </span>
          </header>
        </div>
      </>
    );
  }

  return user ? renderLoggedIn() : <LogInScreen/>
}

export default function() {
  return (
    <UserProvider>
      <App/>
    </UserProvider>
  )
};
