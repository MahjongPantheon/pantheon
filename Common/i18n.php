<?php
/*  Pantheon common files
 *  Copyright (C) 2016  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
namespace Common;

/**
 * @param string $entry
 * @return string
 */
function _t(string $entry): string
{
    return gettext($entry);
}

/**
 * With plural number substitution
 * @param string $entry
 * @param string $plural
 * @param float|string $count   String here because integer/float zero is treated as falsy value by templater and replaced with param name!
 * @return string
 */
function _n(string $entry, string $plural, $count): string
{
    return sprintf(ngettext($entry, $plural, intval($count)), $count);
}

/**
 * With parameters substitution
 * @param string $entry
 * @param array $args
 * @return string
 * @phpstan-ignore-next-line
 */
function _p(string $entry, ...$args): string
{
    return vsprintf(gettext($entry), $args);
}

/**
 * With plural number and parameters substitution
 * @param string $entry
 * @param string $plural
 * @param float|string $count   String here because integer/float zero is treated as falsy value by templater and replaced with param name!
 * @param mixed ...$args
 * @return string
 */
function _np(string $entry, string $plural, $count, ...$args): string
{
    return vsprintf(ngettext($entry, $plural, intval($count)), $args);
}
