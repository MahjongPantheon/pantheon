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
 * Class RegistrantPrimitive
 * Similar to Person primitive, but used for non-approved registration requests.
 *
 * Low-level model with basic CRUD operations and relations
 * @package Frey
 */
class RegistrantPrimitive extends Primitive
{
    protected static $_table = 'registrant';

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'email'         => '_email',
        'auth_hash'     => '_authHash',
        'auth_salt'     => '_authSalt',
        'approval_code' => '_approvalCode',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'           => $this->_integerTransform(true),
            '_email'        => $this->_stringTransform(),
            '_authHash'     => $this->_stringTransform(),
            '_authSalt'     => $this->_stringTransform(),
            '_approvalCode' => $this->_stringTransform(),
        ];
    }

    /**
     * Local id
     * @var int | null
     */
    protected $_id;
    /**
     * Registrant's email. Used both as primary identifier and contact info.
     * @var string
     */
    protected $_email;
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
     * Code sent by email to approve this registration request
     * @var string
     */
    protected $_approvalCode;

    /**
     * Find registrants by local ids (primary key)
     *
     * @param IDb $db
     * @param int[] $ids
     * @throws \Exception
     * @return RegistrantPrimitive[]
     */
    public static function findById(IDb $db, $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * Find registrants by email addresses (indexed search)
     *
     * @param IDb $db
     * @param string[] $emails
     * @throws \Exception
     * @return RegistrantPrimitive[]
     */
    public static function findByEmail(IDb $db, $emails)
    {
        return self::_findBy($db, 'email', $emails);
    }

    /**
     * Find registrants by approval codes (indexed search)
     *
     * @param IDb $db
     * @param string[] $codes
     * @throws \Exception
     * @return RegistrantPrimitive[]
     */
    public static function findByApprovalCode(IDb $db, $codes)
    {
        return self::_findBy($db, 'approval_code', $codes);
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
     * @return int | null
     */
    public function getId()
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
     * @return RegistrantPrimitive
     */
    public function setEmail(string $email): RegistrantPrimitive
    {
        $this->_email = $email;
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
     * @return RegistrantPrimitive
     */
    public function setAuthHash(string $authHash): RegistrantPrimitive
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
     * @return RegistrantPrimitive
     */
    public function setAuthSalt(string $authSalt): RegistrantPrimitive
    {
        $this->_authSalt = $authSalt;
        return $this;
    }


    /**
     * @return string
     */
    public function getApprovalCode(): string
    {
        return $this->_approvalCode;
    }

    /**
     * @param string $approvalCode
     * @return RegistrantPrimitive
     */
    public function setApprovalCode(string $approvalCode): RegistrantPrimitive
    {
        $this->_approvalCode = $approvalCode;
        return $this;
    }
}
