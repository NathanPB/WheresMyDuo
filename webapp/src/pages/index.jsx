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

import React from 'react';
import Feed from "../components/misc/Feed";
import UserDashboard from "../components/dashboards/UserDashboard";
import {gql, useQuery} from "@apollo/client";
import PostWriter from "../components/input/PostWriter";
import Styles from './index.module.scss';
import Head from "next/head";

const QUERY = gql`{
  me {
    nickname
    photoURL
  }
}`

export default function HomePage() {

  const { data, loading } = useQuery(QUERY)
  const [refetcher, setRefetcher] = React.useState({})

  return (
    <>
      <Head>
        <title>Feed - WheresMyDuo</title>
      </Head>
      <UserDashboard>
        <section className={Styles.Feed}>
          <PostWriter
            nickname={data?.me?.nickname}
            photoURL={data?.me?.photoURL}
            loading={loading}
            onPost={() => refetcher?.refetcher ? refetcher?.refetcher() : undefined}
          />
          <Feed setRefetcher={refetcher => setRefetcher({ refetcher })} />
        </section>
      </UserDashboard>
    </>
  )
}
