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
import Styles from './index.module.scss';
import {gql, useMutation, useQuery} from "@apollo/client";
import {InputText} from "primereact/inputtext";
import OrSkeleton from "../misc/OrSkeleton";
import {Skeleton} from "primereact/skeleton";
import DiscordInput, {REGEX_CORRECT as REGEX_DISCORD_CORRECT} from "../input/DiscordInput";
import {Button} from "primereact/button";
import LoadingWrapper from "../misc/LoadingWrapper";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {faDiscord, faFacebook, faSkype, faTelegram} from "@fortawesome/free-brands-svg-icons";
import FacebookInput from "../input/FacebookInput";

const QUERY = gql`
{
  me {
    nickname
    contact {
      discord { value }
      skype { value }
      facebook { value }
      telegram { value }
    }
  }
}`

const SAVE = gql`
mutation Save($data: UserContact!) {
  setContact(contact: $data) { uid }
}`

export default function Contact() {
  const fieldStyles = { }
  const visibility = "PUBLIC"

  const [saveProfile, { loading: saveLoading }] = useMutation(SAVE)

  const { loading } = useQuery(QUERY, { onCompleted: onDataAcquired })
  const [nickname, setNickname] = React.useState()
  const [discord, setDiscord] = React.useState()
  const [skype, setSkype] = React.useState()
  const [facebook, setFacebook] = React.useState()
  const [telegram, setTelegram] = React.useState()

  function onDataAcquired(data) {
    setNickname(data.me.nickname)
    setDiscord(data.me.contact.discord?.value)
    setSkype(data.me.contact.skype?.value)
    setFacebook(data.me.contact.facebook?.value)
    setTelegram(data.me.contact.telegram?.value)
  }

  function onSave() {
    if (discord && !REGEX_DISCORD_CORRECT.test(discord)) {
      return
    }

    let payload = {}

    if (discord) {
      payload = { ...payload, discord: { value: discord, visibility } }
    }

    if (skype) {
      payload = { ...payload, skype: { value: skype, visibility } }
    }

    if (telegram) {
      payload = { ...payload, telegram: { value: telegram, visibility } }
    }

    if (facebook) {
      payload = { ...payload, facebook: { value: facebook, visibility } }
    }

    saveProfile({ variables: { data: payload } })
  }

  const skeleton = <Skeleton width="100%" height="2.85rem"/>

  return <LoadingWrapper isLoading={saveLoading} render={() => (
    <div className="p-grid p-fieldset p-fluid">
      <div className="p-col-12" style={fieldStyles}>
        <OrSkeleton loading={loading} skeleton={skeleton}>
          <span className="p-float-label">
            <InputText id="nickname" value={nickname} onChange={e => setNickname(e.target.value)}/>
            <label htmlFor="nickname">Nickname</label>
          </span>
        </OrSkeleton>
      </div>
      <div className="p-col-12 p-md-6" style={fieldStyles}>
        <OrSkeleton loading={loading} skeleton={skeleton}>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <FontAwesomeIcon icon={faDiscord}/>
            </span>
            <span className="p-float-label">
              <DiscordInput id="discord" value={discord} onChange={e => setDiscord(e.target.value)} infoIcon={<FontAwesomeIcon icon={faInfoCircle}/>}/>
              <label htmlFor="discord">Discord</label>
            </span>
          </div>
        </OrSkeleton>
      </div>
      <div className="p-col-12 p-md-6" style={fieldStyles}>
        <OrSkeleton loading={loading} skeleton={skeleton}>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <FontAwesomeIcon icon={faSkype}/>
            </span>
            <span className="p-float-label">
              <InputText id="skype" value={skype} onChange={e => setSkype(e.target.value)}/>
              <label htmlFor="skype">Skype</label>
            </span>
          </div>
        </OrSkeleton>
      </div>
      <div className="p-col-12 p-md-6" style={fieldStyles}>
        <OrSkeleton loading={loading} skeleton={skeleton}>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <FontAwesomeIcon icon={faFacebook}/>
            </span>
            <span className="p-float-label">
              <FacebookInput id="facebook" value={facebook} onChange={e => setFacebook(e.target.value)} infoIcon={<FontAwesomeIcon icon={faInfoCircle}/>}/>
              <label htmlFor="facebook">Facebook</label>
            </span>
          </div>
        </OrSkeleton>
      </div>
      <div className="p-col-12 p-md-6" style={fieldStyles}>
        <OrSkeleton loading={loading} skeleton={skeleton}>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <FontAwesomeIcon icon={faTelegram}/>
            </span>
            <span className="p-float-label">
              <InputText id="telegram" value={telegram} onChange={e => setTelegram(e.target.value)}/>
              <label htmlFor="telegram">Telegram</label>
            </span>
          </div>
        </OrSkeleton>
      </div>
      <div className="p-col-12" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Button label="Save" icon="pi pi-save" className={Styles.Save} onClick={onSave}/>
      </div>
    </div>
  )}/>
}
