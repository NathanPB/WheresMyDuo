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

import React from "react";
import {Chart} from "primereact/chart";
import stc from 'string-to-color';
import {ApiContext} from "../../../../providers/ApiProvider";
import LoadingSpinner from "../../../misc/LoadingSpinner";


export default function GameDistribution() {
  const api = React.useContext(ApiContext)

  const [labels, setLabels] = React.useState([])
  const [dataset, setDataset] = React.useState([])
  const [backgroundColor, setBackgroundColor] = React.useState([])

  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (api) {
      setLoading(true)
      api.analyticsGameDistribution()
        .then(({ data }) => {

          let dataSorted = data.sort((a, b) => b.count - a.count)
          if (dataSorted.length > 10) {
            dataSorted = dataSorted.reduce((buff, curr, index) => {
              if (index < 10) {
                return [ ...buff, curr ]
              } else if (index > 10) {
                const last = buff[10]
                console.log(last)
                return [ ...buff.slice(0, 10), { ...last, count: last.count + curr.count } ]
              } else {
                return [ ...buff, { _id: -1, count: curr.count } ]
              }
            }, [])
          }

          api.igdb
            .limit(50)
            .fields(['id', 'name'])
            .where(`id = (${dataSorted.slice(0, 10  ).map(it => it._id).join()})`)
            .request('/games')
            .then(({ data: games }) => {

              setLabels([
                ...dataSorted.slice(0, 10).map(it => games.find(game => game.id === it._id)?.name),
                ...(dataSorted.length >= 10 ? ['Others'] : [])
              ])
              setDataset(dataSorted.map(it => it.count))
              setBackgroundColor(dataSorted.map(it => stc(it._id)))
              setLoading(false)
            })
        })
    }
  }, [api])

  if (loading) {
    return <LoadingSpinner/>
  }

  return (
    <Chart
      type="pie"
      data={{
        labels,
        datasets: [{ data: dataset, backgroundColor }]
      }}
    />
  )
}
