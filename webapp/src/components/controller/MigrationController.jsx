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
import {gql, useMutation} from "@apollo/client";
import {Card} from "primereact/card";
import {Button} from "primereact/button";
import LoadingWrapper from "../misc/LoadingWrapper";
import {Panel} from "primereact/panel";

const RUN_MIGRATION = gql`
mutation Run($id: String!) {
  runMigration(id: $id) { time, error }
}`

const ROLLBACK_MIGRATION = gql`
mutation Rollback($id: String!) {
  rollbackMigration(id: $id) { time, error }
}`

export default function MigrationController({
  id,
  name,
  description,
  date,
  dataLossPotential
}) {

  const [result, setResult] = React.useState()
  const [run, { data: runData, loading: runLoading }] = useMutation(RUN_MIGRATION, { variables: { id } })
  const [rollback, { data: rollbackData, rollbackLoading }] = useMutation(ROLLBACK_MIGRATION, { variables: { id } })
  const loading = runLoading || rollbackLoading

  React.useEffect(() => {
    if (!runLoading && runData) {
      setResult(runData.runMigration)
    }
  }, [runLoading])

  React.useEffect(() => {
    if (!rollbackLoading && rollbackData) {
      setResult(rollbackData.rollbackMigration)
    }
  }, [rollbackLoading])

  function footer() {
    return (
      <>
        <Button
          label="Rollback"
          icon="pi pi-upload"
          disabled={loading}
          style={{ marginRight: 4 }}
          onClick={() => {
            if (window.confirm(`Rollback migration ${name}?`)) {
              rollback()
            }
          }}
        />
        <Button
          label="Run"
          icon="pi pi-download"
          disabled={loading}
          style={{ marginRight: 4 }}
          onClick={() => {
            if (window.confirm(`Run migration ${name}?`)) {
              run()
            }
          }}
        />
      </>
    )
  }

  function header() {
    function color() {
      switch (dataLossPotential) {
        case 'LOW': return 'green'
        case 'MEDIUM': return 'yellow'
        default: return 'red'
      }
    }

    return <div style={{ border: `solid 4px ${color()}` }}/>
  }

  function subtitle() {
    const timeText = result ? `Completed in ${result.time}ms` : ''
    return `${new Date(date).toLocaleDateString()} ${timeText}`
  }

  return (
    <Card title={name} header={header()} footer={footer()} subTitle={subtitle()}>
      <LoadingWrapper isLoading={loading} render={() => (
        <>
          { result?.error && <Panel header="Error" toggleable><code>{result?.error}</code></Panel> }
          { description }
        </>
      )}/>
    </Card>
  )
}
