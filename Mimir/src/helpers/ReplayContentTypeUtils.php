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

namespace Mimir;

/**
 * @Author Steven Vch. <unstatik@staremax.com>
 */
class ReplayContentTypeUtils
{
    /**
     * Return ReplayContentType enum
     *
     * @param int $contentTypeId content type id
     * @return ReplayContentType|null XML or JSON
     */
    public static function getContentType($contentTypeId): ReplayContentType|null
    {
        return ReplayContentType::tryFrom($contentTypeId);
    }
}
