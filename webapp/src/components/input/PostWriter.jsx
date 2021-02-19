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
import {gql, useMutation} from "@apollo/client";
import {Avatar} from "primereact/avatar";
import Link from "next/link";
import OrSkeleton from "../misc/OrSkeleton";
import {Skeleton} from "primereact/skeleton";
import {InputTextarea} from "primereact/inputtextarea";
import {Card} from "primereact/card";
import {Button} from "primereact/button";
import SettingsStyles from '../settings/index.module.scss';

const POST = gql`
mutation Post($content: String!){
  post(content: $content) { id }
}
`

export default function PostWriter({ nickname, photoURL, loading, onPost }) {

  const [content, setContent] = React.useState("")
  const [post] = useMutation(POST, { variables: { content } })

  function tryPost() {
    if (content) {
      post().then((...args) => onPost && onPost(...args))
    }
  }

  const avatarSkeleton = <Skeleton shape="circle" width="2rem" height="2rem"/>
  const textSkeleton = <Skeleton width="100%" height=".8rem"/>
  const textareaSkeleton = <Skeleton width="100%" height="6em"/>
  const buttonSkeleton = <Skeleton style={SettingsStyles.Save} />

  function header() {
    return (
      <div style={{ display: 'flex', padding: '.5rem .75rem 0 .75rem' }}>
        <OrSkeleton loading={loading} skeleton={avatarSkeleton}>
          <Link href="/me">
            <a>
              <Avatar image={photoURL} shape="circle"/>
            </a>
          </Link>
        </OrSkeleton>
        <div style={{ paddingLeft: 8 }}>
          <OrSkeleton loading={loading} skeleton={textSkeleton}>
            <Link href="/me">
              <a style={{ color: 'var(--text-color)' }}>
                { nickname }
              </a>
            </Link>
          </OrSkeleton>
        </div>
      </div>
    )
  }

  function footer() {
    return (
      <div className={SettingsStyles.ResponsiveFlex} style={{ flexDirection: 'row-reverse' }}>
        <OrSkeleton loading={loading} skeleton={buttonSkeleton}>
          <Button label="Post" className={SettingsStyles.Save} style={{ height: 24 }} onClick={tryPost}/>
        </OrSkeleton>
      </div>
    )
  }

  return (
    <Card header={header()} footer={footer()} style={{ padding: 8, boxShadow: '0px 0px 5px 2px rgba(0,0,0,0.75)' }}>
      <OrSkeleton loading={loading} skeleton={textareaSkeleton}>
        <InputTextarea
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={256}
          style={{ height: '6em', width: '100%' }}
        />
      </OrSkeleton>
    </Card>
  )
}
