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
import ContactOutput from "../input/ContactOutput";
import {faDiscord, faFacebook, faSkype, faTelegram} from "@fortawesome/free-brands-svg-icons";
import {Divider} from "primereact/divider";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Skeleton} from "primereact/skeleton";
import {Tooltip} from "primereact/tooltip";

export default function ContactOutputForm({ data, loading }) {

  const [showMore, setShowMore] = React.useState(false)

  // This is mutable, be careful
  const otherFields = [
    { label: 'Discord', icon: faDiscord, value: data?.discord?.value },
    { label: 'Skype', icon: faSkype, value: data?.skype?.value },
    { label: 'Facebook', icon: faFacebook, value: data?.facebook?.value, url: `https://fb.com/${data?.facebook?.value}` },
    { label: 'Telegram', icon: faTelegram, value: data?.telegram?.value },
  ].filter(it => !!it.value)

  const basicFields = otherFields.splice(0, 3)

  const makeContactField = (data) => (
    <div className="p-field p-col-12">
      <ContactOutput {...data} icon={<FontAwesomeIcon icon={data.icon}/>} clipboard/>
    </div>
  )

  return (
    <div className="p-grid p-formgrid p-fluid" style={{ padding: 8 }}>
    <Tooltip target=".clipboard"/>
    <Tooltip target=".newtab"/>

    { loading && (
      <>
        <div className="p-col-12 p-field">
          <Skeleton width="100%" height="2.85rem"/>
        </div>
        <div className="p-col-12 p-field">
          <Skeleton width="100%" height="2.85rem" style={{ marginBottom: 8 }}/>
        </div>
        <div className="p-col-12 p-field">
          <Skeleton width="100%" height="2.85rem" style={{ marginBottom: 8 }}/>
        </div>
      </>
    ) }
    { basicFields.map(makeContactField) }
    { (otherFields.length > 0 && !showMore) && (
      <div className="p-col-12" onClick={() => setShowMore(true)}>
        <Divider align="center" type="dashed" style={{ cursor: 'pointer' }}>Show More</Divider>
      </div>
    ) }
    { showMore && otherFields.map(makeContactField) }
  </div>
  )
}
