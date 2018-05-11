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

require_once __DIR__ . '/../Model.php';
require_once __DIR__ . '/../primitives/Registrant.php';
require_once __DIR__ . '/../primitives/Person.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class AuthModel extends Model
{
    /**
     * Request new registration.
     * Returns new approval code to be sent over email.
     *
     * @param string $email
     * @param string $password
     * @return string
     * @throws InvalidParametersException
     */
    public function requestRegistration(string $email, string $password): string
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidParametersException('Invalid email provided', 401);
        }

        $pw = $this->_makeTokens($password);

        $reg = (new RegistrantPrimitive($this->_db))
            ->setEmail($email)
            ->setApprovalCode(sha1($email . microtime(true)))
            ->setAuthSalt($pw['salt'])
            ->setAuthHash($pw['auth_hash']);
        $reg->save();

        return $reg->getApprovalCode();
    }

    /**
     * Approve registration with approval code.
     * Returns new person's ID on success, otherwise throws an exception.
     *
     * @param $approvalCode
     * @return int
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function approveRegistration($approvalCode): int
    {
        $reg = RegistrantPrimitive::findByApprovalCode($this->_db, [$approvalCode]);
        if (empty($reg)) {
            throw new EntityNotFoundException('Approval code is invalid or already used', 402);
        }

        $person = (new PersonPrimitive($this->_db))
            ->setEmail($reg[0]->getEmail())
            ->setAuthSalt($reg[0]->getAuthSalt())
            ->setAuthHash($reg[0]->getAuthHash());
        $person->save();

        return $person->getId();
    }

    /**
     * Authorize person ant return permanent client-side auth token.
     * Throws exception if authorization was not successful.
     *
     * @param $email
     * @param $password
     * @return string
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function authorize($email, $password): string
    {
        $person = PersonPrimitive::findByEmail($this->_db, [$email]);
        if (empty($person)) {
            throw new EntityNotFoundException('Email is not known to auth system', 403);
        }

        if (!$this->_checkPasswordFull($password, $person[0]->getAuthHash(), $person[0]->getAuthSalt())) {
            throw new AuthFailedException('Password is incorrect', 404);
        }

        return $this->_makeClientSideToken($password, $person[0]->getAuthSalt());
    }

    /**
     * Check if client-side token matches stored password hash.
     * WARNING:
     * This method is supposed to be VERY HOT. It should not contain any excessive business logic,
     * especially database queries or ORM usage.
     *
     * @param $id
     * @param $clientSideToken
     * @return bool
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function quickAuthorize($id, $clientSideToken): bool
    {
        $person = PersonPrimitive::findById($this->_db, [$id]);
        if (empty($person)) {
            throw new EntityNotFoundException('Requested person ID is not known to auth system', 403);
        }

        return $this->_checkPasswordQuick($clientSideToken, $person[0]->getAuthHash());
    }

    /**
     * Change password when old password is known.
     * Returns new client-side auth token on success, or throws exception on failure.
     *
     * @param $email
     * @param $password
     * @param $newPassword
     * @return mixed
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function changePassword($email, $password, $newPassword): string
    {
        $person = PersonPrimitive::findByEmail($this->_db, [$email]);
        if (empty($person)) {
            throw new EntityNotFoundException('Email is not known to auth system', 403);
        }

        if (!$this->_checkPasswordFull($password, $person[0]->getAuthHash(), $person[0]->getAuthSalt())) {
            throw new AuthFailedException('Password is incorrect', 404);
        }

        $pw = $this->_makeTokens($newPassword);
        $person[0]
            ->setEmail($email)
            ->setAuthSalt($pw['salt'])
            ->setAuthHash($pw['auth_hash'])
            ->save();

        return $pw['client_hash'];
    }

    /**
     * Request password reset.
     * Returns reset approval token, which should be sent over email to user.
     *
     * @param $email
     * @return string
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function requestResetPassword($email)
    {
        $person = PersonPrimitive::findByEmail($this->_db, [$email]);
        if (empty($person)) {
            throw new EntityNotFoundException('Email is not known to auth system', 403);
        }

        $person[0]->setAuthResetToken(sha1($email . microtime(true)))->save();
        return $person[0]->getAuthResetToken();
    }

    /**
     * Approve password reset.
     * Generates digit-code and uses it as a new password, updates all records
     * and returns the code. Code should be sent to person via email, and person
     * should be asked to change the password immediately.
     *
     * @param $email
     * @param $resetApprovalCode
     * @return int
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function approveResetPassword($email, $resetApprovalCode)
    {
        $person = PersonPrimitive::findByEmail($this->_db, [$email]);
        if (empty($person)) {
            throw new EntityNotFoundException('Email is not known to auth system', 403);
        }

        if (empty($resetApprovalCode) || $person[0]->getAuthResetToken() != $resetApprovalCode) {
            throw new AuthFailedException('Password reset approval code is incorrect.', 404);
        }

        $newGeneratedPassword = crc32(microtime(true) . $email);
        $pw = $this->_makeTokens($newGeneratedPassword);
        $person[0]
            ->setEmail($email)
            ->setAuthSalt($pw['salt'])
            ->setAuthHash($pw['auth_hash'])
            ->save();

        return $newGeneratedPassword;
    }

    /**
     * Create all password facilities and return at once
     *
     * @param string $password
     * @return array
     */
    protected function _makeTokens(string $password)
    {
        $salt = sha1(microtime(true));
        $clientHash = $this->_makeClientSideToken($password, $salt);
        $authHash = password_hash($clientHash, PASSWORD_DEFAULT);
        return [
            'salt' => $salt,
            'client_hash' => $clientHash,
            'auth_hash' => $authHash
        ];
    }

    /**
     * Make permanent client-side auth token
     *
     * @param $password
     * @param $salt
     * @return string
     */
    protected function _makeClientSideToken($password, $salt): string
    {
        return hash('sha3-384', $password . $salt);
    }

    /**
     * Check if password matches hash & salt
     *
     * @param $password
     * @param $authHash
     * @param $authSalt
     * @return bool
     */
    protected function _checkPasswordFull($password, $authHash, $authSalt): bool
    {
        $clientSideToken = $this->_makeClientSideToken($password, $authSalt);
        return $this->_checkPasswordQuick($clientSideToken, $authHash);
    }

    /**
     * Check if client-side auth token matches save password hash
     *
     * @param $clientSideToken
     * @param $authHash
     * @return bool
     */
    protected function _checkPasswordQuick($clientSideToken, $authHash): bool
    {
        return password_verify($clientSideToken, $authHash);
    }
}
