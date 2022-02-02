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

require_once __DIR__ . '/DataSource.php';

use Monolog\Logger;
use Michelf\Markdown;

abstract class Controller
{
    /**
     * @var DataSource
     */
    protected $_ds;

    /**
     * @var \Monolog\Logger
     */
    protected $_log;

    /**
     * @var Config
     */
    protected $_config;

    /**
     * @var Meta
     */
    protected $_meta;

    public function __construct(DataSource $ds, Logger $log, Config $config, Meta $meta)
    {
        $this->_ds = $ds;
        $this->_log = $log;
        $this->_config = $config;
        $this->_meta = $meta;

        $this->_meta->sendVersionHeader(
            $this->_config->getStringValue('api.version_major'),
            $this->_config->getStringValue('api.version_minor')
        );
    }

    /**
     * @param string $text
     * @return string
     */
    protected function _mdTransform(string $text)
    {
        $md = new Markdown();
        $md->no_markup = true;
        return $md->transform($text);
    }
}
