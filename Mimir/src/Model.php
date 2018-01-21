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

abstract class Model
{
    /**
     * @var Db
     */
    protected $_db;

    /**
     * @var Config
     */
    protected $_config;

    /**
     * @var Meta
     */
    protected $_meta;

    public function __construct(IDb $db, Config $config, Meta $meta)
    {
        $this->_db = $db;
        $this->_config = $config;
        $this->_meta = $meta;
    }

    /**
     * Check if token allows administrative operations
     * @return bool
     */
    public function checkAdminToken()
    {
        return $this->_meta->getAuthToken() === $this->_config->getValue('admin.god_token');
    }
}
