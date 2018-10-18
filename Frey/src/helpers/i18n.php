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
bindtextdomain(TEXT_DOMAIN, realpath(__DIR__ . '/../../i18n'));
textdomain(TEXT_DOMAIN);
bind_textdomain_codeset(TEXT_DOMAIN, 'UTF-8');

function _t($entry)
{
    return gettext($entry);
}

// With plural number substitution
function _n($entry, $plural, $count)
{
    return sprintf(
        ngettext(
            (string)$entry,
            (string)$plural,
            doubleval($count)
        ),
        $count
    );
}

// With parameters substitution
function _p($entry, ...$args)
{
    return vsprintf(
        gettext($entry),
        $args
    );
}

// With plural number and parameters substitution
function _np($entry, $plural, $count, ...$args)
{
    return vsprintf(
        ngettext(
            (string)$entry,
            (string)$plural,
            doubleval($count)
        ),
        $args
    );
}
