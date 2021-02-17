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

import {ApolloClient, InMemoryCache} from "@apollo/client";
import {offsetLimitPagination} from "@apollo/client/utilities";

// https://www.apollographql.com/docs/react/pagination/core-api/#defining-a-field-policy
const cache = new InMemoryCache({
  typePolicies: {
    UserProfile: {
      fields: {
        following: offsetLimitPagination([]),
        followers: offsetLimitPagination([]),
      }
    }
  }
});

export function createClient(apiKey) {
  return new ApolloClient({
    uri: `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
    cache,
    connectToDevTools: process.env.NODE_ENV === 'development',
    queryDeduplication: true,
    headers: {
      Authorization: apiKey
    }
  })
}
