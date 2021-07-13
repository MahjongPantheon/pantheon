<?php

namespace Rheda;

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
