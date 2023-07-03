<?php
/*  Frey: ACL & user data storage
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

namespace Frey;

define('TEXT_DOMAIN', 'messages');
bindtextdomain(TEXT_DOMAIN, realpath(__DIR__ . '/../../i18n') ?: '');
textdomain(TEXT_DOMAIN);
bind_textdomain_codeset(TEXT_DOMAIN, 'UTF-8');

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
 * @param float $count
 * @return string
 */
function _n(string $entry, string $plural, float $count): string
{
    return sprintf(ngettext($entry, $plural, intval($count)), $count);
}

/**
 * With parameters substitution
 * @param string $entry
 * @param array $args
 * @return string
 */
function _p(string $entry, $args): string
{
    return vsprintf(gettext($entry), $args);
}

/**
 * With plural number and parameters substitution
 * @param string $entry
 * @param string $plural
 * @param float $count
 * @param mixed ...$args
 * @return string
 */
function _np(string $entry, string $plural, float $count, ...$args): string
{
    return vsprintf(ngettext($entry, $plural, intval($count)), $args);
}
