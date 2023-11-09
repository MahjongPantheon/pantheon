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
        'nickname'          => '_nickname',
        'person_id'         => '_personId',
        'friend_id'         => '_friendId',
        'account_id'        => '_accountId'
    ];

    /**
     * @return int
     */
    public function getFriendId(): int
    {
        return $this->_friendId;
    }

    /**
     * @return int
     */
    public function getAccountId(): int
    {
        return $this->_accountId;
    }

    /**
     * @return int
     */
    public function getPersonId(): int
    {
        return $this->_personId;
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
            '_nickname'  => $this->_stringTransform(),
            '_personId'  => $this->_integerTransform(false),
            '_friendId'  => $this->_integerTransform(false),
            '_accountId' => $this->_integerTransform(false)
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
     * @param IDb $db
     * @param string $query
     * @return MajsoulPlatformAccountsPrimitive[]|null
     */
    public static function findByAccountIdAndNickname(IDb $db, string $nickname, int $accountId)
    {
        $q = <<<QRY
            SELECT * FROM "majsoul_platform_accounts"
            WHERE account_id = :accountId and nickname = :nickname;
        QRY;

        $result = $db->table('majsoul_platform_accounts')
            ->rawQuery($q, [
                    ':accountId' => $accountId,
                    ':nickname' => $nickname,
                ])
            ->findArray();

        if (empty($result)) {
            return [];
        }

        return array_map(function ($data) use ($db) {
            return self::_recreateInstance($db, $data);
        }, $result);
    }


    protected function _create()
    {
        // TODO: Implement _create() method.
    }

    public function getId()
    {
        // TODO: Implement getId() method.
    }

    protected function _deident()
    {
        // TODO: Implement _deident() method.
    }
}
