<?php
/*  Hugin: system statistics
 *  Copyright (C) 2023  o.klimenko aka ctizen
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
namespace Hugin;

require_once __DIR__ . '/../Primitive.php';

/**
 * Class SysErrorPrimitive
 * Primitive for arbitrary system errors
 *
 * Low-level model with basic CRUD operations and relations
 * @package Hugin
 */
class SysErrorPrimitive extends Primitive
{
    protected static $_table = 'sys_errors';

    /**
     * Local id
     * @var int | null
     */
    protected $_id;
    /**
     * @var string
     */
    protected $_createdAt;
    /**
     * @var string
     */
    protected $_source;
    /**
     * @var string
     */
    protected $_error;

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'created_at'    => '_createdAt',
        'source'        => '_source',
        'error'         => '_error',
    ];

    protected function _create()
    {
        $ev = $this->_db->table(static::$_table)->create();
        $success = $this->_save($ev);
        if ($success) {
            $this->_id = $this->_db->lastInsertId();
        }

        return $success;
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    /**
     * @param IDb $db
     * @param int[] $ids
     *
     * @return SysErrorPrimitive[]
     * @throws \Exception
     */
    public static function findById(IDb $db, array $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * @return int | null
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @return string
     */
    public function getCreatedAt(): string
    {
        return $this->_createdAt;
    }

    /**
     * @param string $createdAt
     * @return SysErrorPrimitive
     */
    public function setCreatedAt(string $createdAt): SysErrorPrimitive
    {
        $this->_createdAt = $createdAt;
        return $this;
    }

    /**
     * @return string
     */
    public function getSource(): string
    {
        return $this->_source;
    }

    /**
     * @param string $source
     * @return SysErrorPrimitive
     */
    public function setSource(string $source): SysErrorPrimitive
    {
        $this->_source = $source;
        return $this;
    }

    /**
     * @return string
     */
    public function getError(): string
    {
        return $this->_error;
    }

    /**
     * @param string $error
     * @return SysErrorPrimitive
     */
    public function setError(string $error): SysErrorPrimitive
    {
        $this->_error = $error;
        return $this;
    }
}
