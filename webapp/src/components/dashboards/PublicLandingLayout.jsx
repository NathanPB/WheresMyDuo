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

import Styles from './UserDashboard.module.scss';
import {Menubar} from 'primereact/menubar';
import UserDiscover from "../selectors/UserDiscover";
import {faHeart, faSearch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button} from "primereact/button";
import {faGithub} from "@fortawesome/free-brands-svg-icons";
import useLayout from "../../hooks/useLayout";
import Link from 'next/link';

export default function PublicLandingLayout({ children }) {

  const layout = useLayout()

  const menuEnd = <nav>
    <Link href="/login">
      <a>
        <Button className={layout === "mobile" ? "p-button-rounded" : undefined} label="Join"/>
      </a>
    </Link>

    { /* Having to do these buttons by hand due primereact poorly supporting foreign icons */ }
    { /* TODO open an issue about that on primereact repo */ }
    <a href="https://www.buymeacoffee.com/nathanpb" target="_blank" style={{ marginLeft: 8 }} rel="noreferrer noopener">
      <button className={`p-button p-component p-button-outlined ${layout === "mobile" ? "p-button-rounded p-button-icon-only" : ""}`}>
        <span className="p-button-icon-left">
          <FontAwesomeIcon icon={faHeart}/>
        </span>
        { layout === "desktop" && <span className="p-button-label">Sponsor</span> }
      </button>
    </a>

    <a href="https://github.com/NathanPB/WheresMyDuo" target="_blank" style={{ marginLeft: 8 }} rel="noreferrer noopener">
      <button className={`p-button p-component p-button-outlined ${layout === "mobile" ? "p-button-rounded p-button-icon-only" : ""}`}>
        <span className="p-button-icon-left">
          <FontAwesomeIcon icon={faGithub}/>
        </span>
        { layout === "desktop" && <span className="p-button-label">Develop</span> }
      </button>
    </a>
  </nav>

  const menu = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      url: '/'
    },
    {
      label: 'About',
      icon: 'pi pi-info-circle',
      url: '/about'
    },
    {
      label: 'Blog',
      icon: 'pi pi-comments',
      url: 'https://blog.nathanpb.dev'
    },
    {
      template: () => (
        <li className="p-menuitem" role="none">
          <a href="#" className="p-menuitem-link" role="menuitem" aria-haspopup="false">
            <FontAwesomeIcon icon={faSearch} className="p-menuicon"/>
            <UserDiscover/>
          </a>
        </li>
      )
    }
  ]

  return (
    <>
      <Menubar
        className={Styles.TopMenu}
        end={menuEnd}
        model={menu}
      />
      <main className={Styles.Main}>
        { children }
      </main>
    </>
  )
}
