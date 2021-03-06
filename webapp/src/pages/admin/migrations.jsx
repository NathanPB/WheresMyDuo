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
import {gql, useQuery} from "@apollo/client";
import LoadingWrapper from "../../components/misc/LoadingWrapper";
import MigrationController from "../../components/controller/MigrationController";
import AdminDashboard from "../../components/dashboards/AdminDashboard";

const QUERY_MIGRATIONS = gql`{
  migrations {
    id
    name
    description
    date
    dataLossPotential
  }
 }`

export default function Migrations() {
  const { data, loading } = useQuery(QUERY_MIGRATIONS)

  return (
    <AdminDashboard>
      <div style={{ width: 'calc(100vw - 128px)', flexDirection: 'column' }}>
        <LoadingWrapper isLoading={loading} render={() => (
          data.migrations.map(migration => (
            <MigrationController
              id={migration.id}
              name={migration.name}
              description={migration.description}
              date={migration.date}
              dataLossPotential={migration.dataLossPotential}
            />
          ))
        )}/>
      </div>
    </AdminDashboard>
  )
}
