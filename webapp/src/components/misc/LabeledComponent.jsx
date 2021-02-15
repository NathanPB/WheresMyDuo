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

import React from 'react';
import classnames from 'classnames';
import Styles from './LabeledComponent.module.scss';

export default function LabeledComponent({
  label, labelHeight, fontSize, children, maxWidth, autofixYCenter,
  style = {}, labelStyle = {},
  className, labelClassName,
}) {

  return (
    <div
      style={{ transform: autofixYCenter ? `translateY(calc(${fontSize} / 2))` : undefined, ...style }}
      className={classnames(Styles.Wrapper, className)}
    >
      {children}
      <span
        className={classnames(Styles.Label, labelClassName)}
        style={{
          ...labelStyle,
          fontSize,
          maxWidth: maxWidth ?? 'initial',
          transform: `translateY(${labelHeight})`
        }}
      >
        {label}
      </span>

    </div>
  )
}
