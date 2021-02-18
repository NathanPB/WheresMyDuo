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
import Head from "next/head";
import AppName from "../components/misc/AppName";
import Link from "next/link";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faHome} from "@fortawesome/free-solid-svg-icons";

export default function WillToLive() {
  return (
    <>
      <Head>
        <title>Page Not Found - WheresMyDuo</title>
      </Head>
      <main style={{ height: '100%' }}>
        <section style={{
          position: 'absolute',
          right: '50%',
          transform: 'translate(50%, 50%)',
          textAlign: 'center',
        }}>
          <AppName dark/>
          <h1>It looks like the page you are trying to reach could not be found</h1>
          <Link href="/">
            <a style={{ color: 'var(--text-color)', textDecoration: 'none' }}>
              <FontAwesomeIcon icon={faHome} size="4x"/>
              <br/>
              Please take me home
            </a>
          </Link>
        </section>
      </main>
    </>
  )
}
