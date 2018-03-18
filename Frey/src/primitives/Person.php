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

require_once __DIR__ . '/../Primitive.php';

/**
 * Class PersonPrimitive
 *
 * Low-level model with basic CRUD operations and relations
 * @package Frey
 */
class PersonPrimitive extends Primitive
{
    protected static $_table = 'person';

    protected static $_fieldsMapping = [
        'id'                => '_id',
        'email'             => '_email',
        'title'             => '_title',
        'auth_hash'         => '_authHash',
        'auth_salt'         => '_authSalt',
        'auth_reset_token'  => '_authResetToken',
        'city'              => '_city',
        'tenhou_id'         => '_tenhouId',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'       => $this->_integerTransform(true),
            '_email'    => $this->_stringTransform(),
            '_title'    => $this->_stringTransform(),
            '_authHash' => $this->_stringTransform(),
            '_authSalt' => $this->_stringTransform(),
            '_authResetToken' => $this->_stringTransform(true),
            '_city'     => $this->_stringTransform(true),
            '_tenhouId' => $this->_stringTransform(true),
        ];
    }

    /**
     * Local id
     * @var int
     */
    protected $_id;
    /**
     * Person's email. Used both as primary identifier and contact info.
     * @var string
     */
    protected $_email;
    /**
     * How person should be called across systems
     * @var string
     */
    protected $_title;
    /**
     * Full stored password hash created as password_hash(client_side_token)
     * @var string
     */
    protected $_authHash;
    /**
     * Salt used to create permanent client-side token as hash(password.salt)
     * @var string
     */
    protected $_authSalt;
    /**
     * Used for check if user really wants to reset his password.
     * This token is sent over email as 2nd-factor auth.
     * @var string
     */
    protected $_authResetToken;
    /**
     * Personal data: person local city
     * @var string
     */
    protected $_city;
    /**
     * Personal data: associated tenhou.net ID
     * @var string
     */
    protected $_tenhouId;

    /**
     * Find persons by local ids (primary key)
     *
     * @param IDb $db
     * @param int[] $ids
     * @throws \Exception
     * @return PersonPrimitive[]
     */
    public static function findById(IDb $db, $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * Find persons by tenhou ids (indexed search)
     *
     * @param IDb $db
     * @param int[] $ids
     * @throws \Exception
     * @return PersonPrimitive[]
     */
    public static function findByTenhouId(IDb $db, $ids)
    {
        return self::_findBy($db, 'tenhou_id', $ids);
    }

    /**
     * Find persons by email addresses (indexed search)
     *
     * @param IDb $db
     * @param string[] $emails
     * @throws \Exception
     * @return PersonPrimitive[]
     */
    public static function findByEmail(IDb $db, $emails)
    {
        return self::_findBy($db, 'email', $emails);
    }

    protected function _create()
    {
        $person = $this->_db->table(self::$_table)->create();
        $success = $this->_save($person);
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
     * @return int
     */
    public function getId(): int
    {
        return $this->_id;
    }

    /**
     * @return string
     */
    public function getEmail(): string
    {
        return $this->_email;
    }

    /**
     * @param string $email
     * @return PersonPrimitive
     */
    public function setEmail(string $email): PersonPrimitive
    {
        $this->_email = $email;
        return $this;
    }

    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->_title;
    }

    /**
     * @param string $title
     * @return PersonPrimitive
     */
    public function setTitle(string $title): PersonPrimitive
    {
        $this->_title = $title;
        return $this;
    }

    /**
     * @return string
     */
    public function getAuthHash(): string
    {
        return $this->_authHash;
    }

    /**
     * @param string $authHash
     * @return PersonPrimitive
     */
    public function setAuthHash(string $authHash): PersonPrimitive
    {
        $this->_authHash = $authHash;
        return $this;
    }

    /**
     * @return string
     */
    public function getAuthSalt(): string
    {
        return $this->_authSalt;
    }

    /**
     * @param string $authSalt
     * @return PersonPrimitive
     */
    public function setAuthSalt(string $authSalt): PersonPrimitive
    {
        $this->_authSalt = $authSalt;
        return $this;
    }

    /**
     * @return string
     */
    public function getAuthResetToken(): string
    {
        return $this->_authResetToken;
    }

    /**
     * @param string $authResetToken
     * @return PersonPrimitive
     */
    public function setAuthResetToken(string $authResetToken): PersonPrimitive
    {
        $this->_authResetToken = $authResetToken;
        return $this;
    }

    /**
     * @return string
     */
    public function getCity(): string
    {
        return $this->_city;
    }

    /**
     * @param string $city
     * @return PersonPrimitive
     */
    public function setCity(string $city): PersonPrimitive
    {
        $this->_city = $city;
        return $this;
    }

    /**
     * @return string
     */
    public function getTenhouId(): string
    {
        return $this->_tenhouId;
    }

    /**
     * @param string $tenhouId
     * @return PersonPrimitive
     */
    public function setTenhouId(string $tenhouId): PersonPrimitive
    {
        $this->_tenhouId = $tenhouId;
        return $this;
    }
}
