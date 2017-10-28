<?php
/*  Rheda: visualizer and control panel
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
namespace Rheda;

/**
 * Url helper class
 */
class Url
{
    public static function make($where, $eventId)
    {
        $pieces = array_filter(explode('/', $where));
        if (!empty($pieces[0]) && strpos($pieces[0], 'eid') === 0) {
            array_shift($pieces);
        }

        if (!Sysconf::SINGLE_MODE) {
            array_unshift($pieces, 'eid' . $eventId);
        }
        return '/' . implode('/', $pieces);
    }

    public static function interpolate($str, \Handlebars\Context $context)
    {
        return preg_replace_callback('#{([\w\d]+)}#is', function ($matches) use ($context) {
            return $context->get($matches[1]);
        }, $str);
    }
}
