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
import TagAddButton from "../misc/TagAddButton";
import Tag from "../misc/Tag";

export default function GamingProfileTagsForm({ value, setValue, readOnly = false }) {

  function removeTag(tagId) {
    setValue(value.filter(it => it.id !== tagId))
  }

  function addTag(tag) {
    setValue([ ...value, tag ])
  }


  return (
    <>
      { value?.map(it => <Tag displayName={it.displayName} description={it.description} onRemoved={!readOnly ? () => removeTag(it.id) : undefined}/>) }
      { !readOnly && <TagAddButton exclude={value?.tags?.map(it => it.id) || []} onAdded={addTag}/> }
    </>
  )
}
