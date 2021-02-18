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
import {gql, useMutation, useQuery} from "@apollo/client";
import BigAvatar from "../misc/BigAvatar";
import OrSkeleton from "../misc/OrSkeleton";
import {Skeleton} from "primereact/skeleton";
import {Button} from "primereact/button";
import Styles from "./index.module.scss";
import {InputText} from "primereact/inputtext";
import {AutoComplete} from "primereact/autocomplete";

const QUERY = gql`
{
  me {
    nickname
    slug
    photoURL
    slugSuggestions
  }
}`

const SAVE = gql`
mutation Save($data: UserProfileInput!) {
  setProfileInfo(profile: $data) { uid }
}`

export default function Info() {
  const { loadingData, data, refetch } = useQuery(QUERY, { onCompleted: onUpdated })
  const [save, { loading: loadingSave, error }] = useMutation(SAVE)
  const loading = loadingData || loadingSave

  const [slug, setSlug] = React.useState("")
  const [nickname, setNickname] = React.useState("")

  function onUpdated(data) {
    setSlug(data.me.slug)
    setNickname(data.me.nickname)
  }

  function onSave() {
    if (nickname && slug) {
      save({ variables: { data: { nickname, slug } } })
        .then(() => refetch())
    }
  }

  const avatarSkeleton = <Skeleton width="256px" height="256px"/>
  const fieldSkeleton = <Skeleton width="100%" height="2.85rem"/>

  return (
    <section>
      <section className={Styles.ResponsiveFlex}>
        <OrSkeleton loading={loading} skeleton={avatarSkeleton}>
          <BigAvatar photoURL={data?.me?.photoURL} nickname={nickname} isSelf/>
        </OrSkeleton>
        <section className="p-formgrid p-fluid" style={{ flexGrow: '1', paddingLeft: '1em' }}>
          <div className="p-field">
            <OrSkeleton loading={loading} skeleton={fieldSkeleton}>
              <span className="p-float-label">
                <InputText
                  id="nickname"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={32}
                />
                <label htmlFor="nickname">Nickname</label>
              </span>
            </OrSkeleton>
          </div>
          <div className="p-field">
            <OrSkeleton loading={loading} skeleton={fieldSkeleton}>
              <span className="p-float-label">
                <AutoComplete
                  id="slug"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  field="value"
                  completeMethod={() => {}}
                  onSelect={e => setSlug(e.value.value)}
                  suggestions={data?.me?.slugSuggestions?.map(value => ({ value }))}
                />
                <label htmlFor="slug">Slug</label>
              </span>
            </OrSkeleton>
          </div>
        </section>
      </section>
      <div className="p-sm-12" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <OrSkeleton loading={loading} skeleton={<Skeleton height="40px" className={Styles.Save}/>}>
          <Button label="Save" icon="pi pi-save" className={Styles.Save} onClick={onSave}/>
        </OrSkeleton>
      </div>
    </section>

  )
}
