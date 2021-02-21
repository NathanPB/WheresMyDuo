/*
 * Copyright (c) 2021 - Nathan P. Bombana
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

import React from "react";

import {ApiProvider} from "../providers/ApiProvider";
import {ApolloProvider} from "@apollo/client";
import {createClient} from "../services/apollo"
import {UserProvider} from '@auth0/nextjs-auth0';

import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/mdc-dark-deeppurple/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '../primereact-hack.scss';
import '../services/firebase';
import '../services/auth0';
import '../index.css'
import '../waves.css'


export default function App({ Component, pageProps }) {
  const apolloClient = React.useMemo(createClient, [])

  return (
    <ApiProvider>
      <ApolloProvider client={apolloClient}>
        <UserProvider>
          <Component {...pageProps}/>
        </UserProvider>
      </ApolloProvider>
    </ApiProvider>
  )
}
