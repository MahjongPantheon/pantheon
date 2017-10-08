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
namespace Riichi;

/**
 * Array helper class
 */
class ArrayHelpers
{
    /**
     * Make an array containing selected collection values as keys and collections as values
     * Example:
     * [
     *    ['a' => 1, 'b' => 2],
     *    ['a' => 3, 'b' => 4],
     *    ['a' => 5, 'b' => 6]
     * ]
     *  with elmKey = 'a' becomes:
     * [
     *   1 => ['a' => 1, 'b' => 2],
     *   3 => ['a' => 3, 'b' => 4],
     *   5 => ['a' => 5, 'b' => 6]
     * ]
     *
     * @throws Exception
     * @param array $array
     * @param string $elmKey
     * @param bool $append
     * @return array
     */
    public static function elm2Key(array $array, $elmKey, $append = false)
    {
        $result = [];

        if (!$array) {
            return $result;
        }

        foreach ($array as $k => $v) {
            if (!isset($v[$elmKey])) {
                throw new Exception('Wrong key');
            }
            if ($append) {
                $result[$v[$elmKey]] []= $v;
            } else {
                if (empty($result[$v[$elmKey]])) {
                    $result[$v[$elmKey]] = $v;
                }
            }
        }
        return $result;
    }
}
