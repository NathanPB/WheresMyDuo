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

package dev.nathanpb.wmd.utils

import java.text.Normalizer

// https://gist.github.com/raychenon/8fac7e5fb41364694f00e6ce8b8c32a8
fun String.slugify(): String {
    return Normalizer
        .normalize(this, Normalizer.Form.NFD)
        .replace("[^.\\w\\s-]".toRegex(), "") // Remove all non-word, non-space or non-dash characters
        .replace('-', ' ') // Replace dashes with spaces
        .trim()              // Trim leading/trailing whitespace (including what used to be leading/trailing dashes)
        .replace("\\s+".toRegex(), "-") // Replace whitespace (including newlines and repetitions) with single dashes
        .toLowerCase() // Lowercase the final results
        .take(32) // Limit to 32 characters
}
