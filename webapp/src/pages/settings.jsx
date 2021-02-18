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
import Styles from './settings.module.scss';
import {Panel} from "primereact/panel";
import Contact from "../components/settings/Contact";
import UserDashboard from "../components/dashboards/UserDashboard";
import Head from "next/head";
import Info from "../components/settings/Info";

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Settings - WheresMyDuo</title>
      </Head>
      <UserDashboard>
        <section className={Styles.Wrapper}>
          <Panel header="Basic">
            <Info/>
          </Panel>
          <Panel header="Contact">
            <div>
              <b>Disclaimer:</b> Information put here will temporarily be PUBLIC! Visibility customization is work in progress.
            </div>
            <div style={{ paddingTop: '1em' }}>
              <Contact/>
            </div>
          </Panel>
        </section>
      </UserDashboard>
    </>
  )
}
