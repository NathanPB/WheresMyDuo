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

import Axios from 'axios';
import Apicalypse from 'apicalypse';

export default function create(token) {
  const axios = Axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
      Authorization: token
    }
  })

  const isAdmin = () => axios.get('/auth/isAdmin')

  const igdb = Apicalypse({
    method: 'POST',
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/igdb`,
    headers: {
      Authorization: token
    },
    responseType: 'json'
  })

  const getTags = ({ query, limit } = {}) => {
    const url = new URLSearchParams()
    if (query) url.set('query', query)
    if (limit) url.set('limit', limit)
    const queryString = query || limit ? '?' + url.toString() : ''

    return axios.get(`/tag${queryString}`)
  }
  const getTag = (id) => axios.get(`/tag/${id}`)
  const createTag = (payload) => axios.post('/tag', payload)
  const editTag = (id, payload) => axios.put(`/tag/${id}`, payload)
  const deleteTag = (id) => axios.delete(`/tag/${id}`)

  const getGamingProfiles = (user) => axios.get(`/gamingProfile?user=${user}`)
  const getGamingProfile = (id) => axios.get(`/gamingProfile/${id}`)
  const createGamingProfile = (gameId) => axios.post(`/gamingProfile/${gameId}`)
  const deleteGamingProfile = (id) => axios.delete(`/gamingProfile/${id}`)

  const gamingProfileListTags = (id) => axios.get(`/gamingProfile/${id}/tag`)
  const gamingProfileAddTag = (id, tagId) => axios.post(`/gamingProfile/${id}/tag/${tagId}`)
  const gamingProfileDeleteTag = (id, tagId) => axios.delete(`/gamingProfile/${id}/tag/${tagId}`)

  const gamingProfileGetCalendar = (id) => axios.get(`/gamingProfile/${id}/calendar`)
  const gamingProfileSetCalendar = (id, calendar) => axios.put(`/gamingProfile/${id}/calendar`, calendar)

  const getSelfProfile = () => axios.get('/profile/')
  const saveSelfProfile = (payload) => axios.put('/profile', payload)

  const match = (profileId) => axios.get(`/match/${profileId}`)

  return {
    isAdmin,
    igdb,
    match,

    getTags,
    getTag,
    createTag,
    editTag,
    deleteTag,

    getGamingProfiles,
    getGamingProfile,
    createGamingProfile,
    deleteGamingProfile,

    gamingProfileListTags,
    gamingProfileAddTag,
    gamingProfileDeleteTag,

    gamingProfileGetCalendar,
    gamingProfileSetCalendar,

    getSelfProfile,
    saveSelfProfile
  }

}
