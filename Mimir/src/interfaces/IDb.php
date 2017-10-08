<?php
/*  Mimir: mahjong games storage
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

interface IDb
{
    /**
     * @param $tableName
     * @return \Idiorm\ORM
     */
    public function table($tableName);

    /**
     * @return int
     */
    public function lastInsertId();

    /**
     * @param $table
     * @param $data [ [ field => value, field2 => value2 ], [ ... ] ] - nested arrays should be monomorphic
     * @param $tableUniqueField string Name of unique constraint to check
     * @return string
     */
    public function upsertQuery($table, $data, $tableUniqueField);

    public function debug();
}
