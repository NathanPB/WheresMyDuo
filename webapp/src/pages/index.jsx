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
import PublicLandingLayout from "../components/dashboards/PublicLandingLayout";
import AppName from "../components/misc/AppName";
import {Card} from "primereact/card";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faHandScissors, faShare, faTrophy} from "@fortawesome/free-solid-svg-icons";

const QUERY = gql`{
  me {
    nickname
    photoURL
  }
}`

function HomePage() {

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

function LandingPage() {
  return (
    <>
      <Head>
        <title>WheresMyDuo</title>
      </Head>
      <PublicLandingLayout>
        <AppName className={Styles.AppName} dark/>
        <span className={Styles.Slogan}>Meet, Share, <span>Play</span></span>
        <section className="p-grid">
          <section className={`p-col-12 p-sm-4 ${Styles.MeetShareGame}`}>
            <article>
              <h1><FontAwesomeIcon icon={faHandScissors}/>Meet</h1>
              <p>Find cool people to play the game you like the most</p>
            </article>
            <article>
              <h1><FontAwesomeIcon icon={faShare}/>Share</h1>
              <p>You don't need to keep re-watching that play you made alone</p>
            </article>
            <article>
              <h1><FontAwesomeIcon icon={faTrophy}/>Play</h1>
              <p>You know a lot about this part</p>
            </article>
          </section>
          <section className="p-col-12 p-sm-8">
            <section className={`p-grid p-pt-4 p-pl-3 p-pl-md-6 p-pr-3 p-pr-md-6 ${Styles.Cards}`}>
              <article className="p-col-12 p-sm-4">
                <Card title="Anonymous">
                  The choice of sharing your real identity is completely up to you
                </Card>
              </article>
              <article className="p-col-12 p-sm-4">
                <Card title="Free">
                  Enjoy the ambient of a completely free and open source platform
                </Card>
              </article>
              <article className="p-col-12 p-sm-4">
                <Card title="Passwordless">
                  You do not need to provide us with any passwords, let's just use the power of modern technology
                </Card>
              </article>
            </section>
          </section>
        </section>
      </PublicLandingLayout>
    </>
  )
}

export async function getServerSideProps({ req, res }) {
  return {
    props: {
      isLoggedIn: !!req.cookies.reauth_token
    }
  }
}

export default function Page(props) {
  return (props.isLoggedIn ? HomePage : LandingPage)(props)
}
