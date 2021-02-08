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
import {Chart} from "primereact/chart";
import {ApiContext} from "../../providers/ApiProvider";
import LoadingSpinner from "../misc/LoadingSpinner";

export default function DayDistribution() {
  const api = React.useContext(ApiContext)

  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (api) {
      setLoading(true)
      api.analyticsDayDistribution()
        .then(response => {
          setData(response.data.map(it => it.value));
          setLoading(false)
        })
    }
  }, [api])

  if (loading) {
    return <LoadingSpinner/>
  }

  return (
    <Chart
      type="bar"
      data={{
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
          {
            data: data,
            label: '',
            fill: true,
            backgroundColor: '#440473'
          }
        ]
      }}
      options={{
        legend: {
          onClick: (e) => e.stopPropagation()
        },
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Day of the week'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Active Profiles'
          }
        }]
      }}
    />
  );
}
