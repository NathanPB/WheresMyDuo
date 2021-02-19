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
import {gql, useQuery} from "@apollo/client";
import {DataScroller} from "primereact/datascroller";
import LoadingSpinner from "./LoadingSpinner";
import UserSmallAvatarGroup from "./UserSmallAvatarGroup";
import Styles from './Feed.module.scss';
import {Card} from "primereact/card";
import Link from "next/link";
import {Avatar} from "primereact/avatar";

const YOUTUBE_ID_REGEX = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi

const QUERY_FOLLOW_SUGGESTIONS = gql`
{
  users(query: "") { uid, slug, nickname, photoURL }
}`

const QUERY = gql`
query QueryFeed($offset: Int!) {
  feed(offset: $offset) {
    id
    author { slug, nickname, photoURL }
    content
    date
  }
}`

export default function Feed({ setRefetcher }) {
  const { data, loading, fetchMore, ...other } = useQuery(QUERY, { variables: { offset: 0 } })
  const { data: suggestedFollows } = useQuery(QUERY_FOLLOW_SUGGESTIONS)

  React.useEffect(() => {
    console.log(other.refetch)
    setRefetcher(other.refetch)
  }, [])

  function itemTemplate(post) {
    if (!post) {
      return null
    }

    function header() {
      return (
        <div style={{ display: 'flex', padding: '.5rem .75rem 0 .75rem' }}>
          <Link href={`/u/${post.author.slug}`}>
            <a>
              <Avatar image={post.author.photoURL} shape="circle"/>
            </a>
          </Link>
          <div style={{ paddingLeft: 8 }}>
            <Link href={`/u/${post.author.slug}`}>
              <a style={{ color: 'var(--text-color)' }}>
                { post.author.nickname }
              </a>
            </Link>
          </div>
        </div>
      )
    }

    function footer() {
      const postedAt = new Date(post.date)
      return (
       <span className={Styles.Date}>{postedAt.toLocaleString()}</span>
      )
    }

    function parseYoutubeEmbed(content) {
      const youtubeId = [...content.matchAll(YOUTUBE_ID_REGEX)]
      if (youtubeId[0] && youtubeId[0][1]) {
        return (
          <iframe
            className="youtube-embed"
            src={`https://youtube.com/embed/${youtubeId[0][1]}?origin=${window.location.href}`}
          />
        )
      }
      return null
    }

    return (
      <Card header={header()} footer={footer()}>
        { parseYoutubeEmbed(post.content) || post.content }
      </Card>
    )
  }

  function footer() {
    if (loading) {
      return <LoadingSpinner/>
    }

    function getToKnowMorePeople() {
      return <h5 style={{ margin: '0' }}>It looks like we couldn't find much that would interest you</h5>
    }

    return (
      <section style={{ textAlign: 'center' }}>
        { !data?.feed?.length && getToKnowMorePeople() }
        <h6 style={{ margin: '1em' }}>Why don't you follow more people?</h6>
        <div style={{ display: 'inline-block' }}>

          <UserSmallAvatarGroup users={suggestedFollows?.users?.slice(0, 12) || []}/>
        </div>
      </section>
    )
  }

  return <DataScroller
    value={data?.feed || []}
    footer={footer()}
    itemTemplate={itemTemplate}
    className={Styles.Feed}
    rows={16}
    buffer={32}
    onLazyLoad={e => fetchMore({ variables: { offset: e.first } })}
    lazy
  />
}
