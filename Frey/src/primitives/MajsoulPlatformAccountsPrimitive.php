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

use Idiorm\ORM;

require_once __DIR__ . '/../Primitive.php';

/**
 * @Author Steven Vch. <unstatik@staremax.com>
 *
 * Class MajsoulPlatformAccountsPrimitive
 *
 * Low-level model with basic CRUD operations and relations
 * @package Frey
 */
class MajsoulPlatformAccountsPrimitive extends Primitive
{
    protected static $_table = 'majsoul_platform_accounts';

    protected static $_fieldsMapping = [
        'id'                => '_id',
        'nickname'          => '_nickname',
        'person_id'         => '_personId',
        'friend_id'         => '_friendId',
        'account_id'        => '_accountId'
    ];

    /**
     * @param int $friendId
     * @return MajsoulPlatformAccountsPrimitive
     */
    public function setFriendId(int $friendId): MajsoulPlatformAccountsPrimitive
    {
        $this->_friendId = $friendId;
        return $this;
    }

    /**
     * @return int
     */
    public function getFriendId(): int
    {
        return $this->_friendId;
    }

    /**
     * @param int $accountId
     * @return MajsoulPlatformAccountsPrimitive
     */
    public function setAccountId(int $accountId): MajsoulPlatformAccountsPrimitive
    {
        $this->_accountId = $accountId;
        return $this;
    }

    /**
     * @return int
     */
    public function getAccountId(): int
    {
        return $this->_accountId;
    }

    /**
     * @param int $personId
     * @return MajsoulPlatformAccountsPrimitive
     */
    public function setPersonId(int $personId): MajsoulPlatformAccountsPrimitive
    {
        $this->_personId = $personId;
        return $this;
    }

    /**
     * @return int
     */
    public function getPersonId(): int
    {
        return $this->_personId;
    }

    /**
     * @param string $nickname
     * @return MajsoulPlatformAccountsPrimitive
     */
    public function setNickname(string $nickname): MajsoulPlatformAccountsPrimitive
    {
        $this->_nickname = $nickname;
        return $this;
    }

    /**
     * @return string
     */
    public function getNickname(): string
    {
        return $this->_nickname;
    }

    protected function _getFieldsTransforms()
    {
        return [
            '_id'       => $this->_integerTransform(true),
            '_nickname'  => $this->_stringTransform(),
            '_personId'  => $this->_integerTransform(),
            '_friendId'  => $this->_integerTransform(),
            '_accountId' => $this->_integerTransform()
        ];
    }

    /**
     * Majsoul account name
     * @var string
     */
    protected $_nickname;

    /**
     * Person's id
     * @var int
     */
    protected $_personId;

    /**
     * Majsoul friend id
     * @var int
     */
    protected $_friendId;

    /**
     * Majsoul account id
     * @var int
     */
    protected $_accountId;

    /**
     * Local id
     * @var int
     */
    protected $_id;

    /**
     * @param IDb $db
     * @param array $nicknames
     * @return MajsoulPlatformAccountsPrimitive[]|null
     */
    public static function findByMajsoulNicknames(IDb $db, array $nicknames)
    {
        $result = self::_findBySeveral($db, [
            'nickname' => $nicknames
        ]);

        if (empty($result)) {
            return [];
        }

        return array_map(function ($data) use ($db) {
            return self::_recreateInstance($db, $data);
        }, $result);
    }

    /**
     * @param IDb $db
     * @param array $personIds
     * @return MajsoulPlatformAccountsPrimitive[]|null
     */
    public static function findByPersonIds(IDb $db, array $personIds)
    {
        return !empty($personIds) ? self::_findBySeveral($db, [
            'person_id' => $personIds
        ]) : [];
    }

    protected function _create()
    {
        $majsoulAccount = $this->_db->table(self::$_table)->create();
        $success = $this->_save($majsoulAccount);
        if ($success) {
            $this->_id = $this->_db->lastInsertId();
        }

        return $success;
    }

    public function getId()
    {
        return $this->_id;
    }

    protected function _deident()
    {
        $this->_id = null;
    }
}
