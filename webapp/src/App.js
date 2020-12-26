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
import './App.css';
import {UserContext, UserProvider} from './providers/UserProvider';
import LogInScreen from './components/screen/LogInScreen';

import {ApiProvider} from './providers/ApiProvider';
import useIsAdmin from './hooks/useIsAdmin';
import {Route} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import AdminDashboard from './components/screen/AdminDashboard';

import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/mdc-dark-deeppurple/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import UserDashboard from './components/screen/UserDashboard';
import {ApolloClientContext, ApolloClientProvider} from "./providers/ApolloClientProvider";
import {ApolloProvider} from "@apollo/client";

function App() {
  const user = React.useContext(UserContext)
  const apolloClient = React.useContext(ApolloClientContext)
  const isAdmin = useIsAdmin()

  const guestRoutes = <>
    <Route path="/" component={LogInScreen}/>
  </>

  const userRoutes = <Route path="/" component={UserDashboard}/>

  const adminRoutes = <Route path="/admin" component={AdminDashboard}/>

  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        { isAdmin && adminRoutes }
        { user ? userRoutes : guestRoutes }
      </BrowserRouter>
    </ApolloProvider>
  )
}

export default function() {
  return (
    <UserProvider>
      <ApiProvider>
        <ApolloClientProvider>
          <App/>
        </ApolloClientProvider>
      </ApiProvider>
    </UserProvider>
  )
};
