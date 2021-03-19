/*
 * Copyright (c) 2021 - Nathan P. Bombana, Mateus Rodrigues
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

import React from 'react'
import Styles from './login.module.scss'
import AppName from "../components/misc/AppName";
import Link from 'next/link';


const authUrl = provider => `/api/auth/oauth/authorize/${provider}?client_id=${process.env.NEXT_PUBLIC_REAUTH_CLIENT_ID}&response_type=code&scope=identity&redirect_uri=${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/auth/callback`

export default  function Login(){
  return (
    <main>
      <video src={"background.mp4"} autoPlay muted loop className={Styles.video}/>
      <div className={Styles.login}>
        <div className={Styles.loginContainer}>
          <section className={Styles.news}>
            <div className={Styles.newsTittle}>
              <h2>Whats New</h2>
            </div>
            <div className={Styles.newsContent}>
              <p>
                Lorem ipsum aenean lacus turpis justo id viverra ligula luctus, porta amet sed consequat volutpat etiam turpis pharetra nunc nisi, diam sodales suspendisse tempor luctus eleifend vitae velit. imperdiet id bibendum nullam dapibus facilisis senectus in, maecenas pellentesque sociosqu praesent curabitur tincidunt sociosqu gravida, sociosqu aenean ipsum erat diam platea.
              </p>
            </div>
          </section>
          <div className={Styles.loginLinksContainer}>
            <Link href="/">
              <a>
                <AppName dark/>
              </a>
            </Link>
            <br/>
            <section className={Styles.loginLinks}>
              <ul>
                <li>
                  <a href={authUrl('discord')}>
                    <div className={Styles.loginButton}>
                      <img draggable="false" alt="Login with Discord" src={"discord.svg"}/>
                      <span>Discord</span>
                    </div>
                  </a>
                </li>
                <li style={{ display: 'none' }}>
                  <a href={authUrl('google')}>
                    <div className={Styles.loginButton}>
                      <img draggable="false" alt="Login with Google" src={"google.svg"}/>
                      <span>Google</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href={authUrl('twitch')}>
                    <div className={Styles.loginButton}>
                      <img draggable="false" alt="Login With Twitch.tv" src={"twitch.svg"}/>
                      <span>Twitch</span>
                    </div>
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
