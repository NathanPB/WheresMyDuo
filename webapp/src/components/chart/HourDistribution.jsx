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
import {ApiContext} from "../../providers/ApiProvider";
import {Chart} from "primereact/chart";
import LoadingSpinner from "../misc/LoadingSpinner";

export default function HourDistribution() {
  const api = React.useContext(ApiContext);

  const [data, setData] = React.useState([]);
  const [min, setMin] = React.useState(0);
  const [max, setMax] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (api) {
      setLoading(true)
      api.analyticsHourDistribution()
        .then(response => {
          setData(response.data)
          const values = response.data.map(it => it.value).sort((a, b) => a - b)
          setMin(values[0] || 0)
          setMax(values[values.length - 1] || 0)
          setLoading(false)
        })
    }
  }, [api])

  if (loading) {
    return <LoadingSpinner/>
  }

  return (
    <Chart
      type="line"
      data={{
        labels: data.map(it => `${it.hour}h`),
        datasets: [
          {
            label: '',
            fill: true,
            data: data.map(it => it.value),
            borderColor: '#440473',
            backgroundColor: '#44047350'
          }
        ]
      }}
      options={{
        legend: {
          onClick: (e) => e.stopPropagation()
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Hour of the day'
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Active Profiles'
            },
            ticks: {
              min: (min * 0.998) | 0,
              max: (max * 1.002) | 0,
              beginAtZero: true
            }
          }]
        }
      }}
    />
  );
}
