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


import {UserProvider} from "../providers/UserProvider";
import {ApiProvider} from "../providers/ApiProvider";
import {ApolloClientContext, ApolloClientProvider} from "../providers/ApolloClientProvider";
import {ApolloProvider} from "@apollo/client";

import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/mdc-dark-deeppurple/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import '../index.css'
import '../waves.css'

function ApolloWrapper({ children }) {
  const apolloClient = React.useContext(ApolloClientContext)

  return (
    <ApolloProvider client={apolloClient}>
      { children }
    </ApolloProvider>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <ApiProvider>
        <ApolloClientProvider>
          <ApolloWrapper>
            <Component {...pageProps}/>
          </ApolloWrapper>
        </ApolloClientProvider>
      </ApiProvider>
    </UserProvider>
  )
}
