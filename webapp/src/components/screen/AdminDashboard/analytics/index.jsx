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
import {TabPanel, TabView} from "primereact/tabview";
import TagDistribution from "./TagDistribution";
import GameDistribution from "./GameDistribution";
import 'chartjs-plugin-labels';
import HourDistribution from "./HourDistribution";
import DayDistribution from "./DayDistribution";

export default function AnalyticsScreen() {
  return (
    <div style={{ textAlign: 'center' }}>
      <TabView>
        <TabPanel header="Games & Tags">
          <div className="p-grid">
            <div className="p-col-12 p-md-6">
              <h1>Distribution of Tags</h1>
              <TagDistribution/>
            </div>
            <div className="p-col-12 p-md-6">
              <h1>Distribution of Games</h1>
              <GameDistribution/>
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Calendar">
          <div className="p-grid">
            <div className="p-col-12 p-md-6">
              <h1>Peak Hours</h1>
              <HourDistribution/>
            </div>
            <div className="p-col-12 p-md-6">
              <h1>Peak Weekdays</h1>
              <DayDistribution/>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
  )
}
