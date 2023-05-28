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
require_once __DIR__ . '/../helpers/Mailer.php';
require_once __DIR__ . '/../primitives/Registrant.php';
require_once __DIR__ . '/../primitives/Person.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';
require_once __DIR__ . '/../exceptions/EntityNotFound.php';
require_once __DIR__ . '/../exceptions/AuthFailed.php';

class AuthModel extends Model
{
    /**
     * Request new registration.
     * Returns new approval code to be sent over email.
     *
     * @param string $email
     * @param string $title
     * @param string $password
     * @param boolean $sendEmail
     * @return string
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function requestRegistration(string $email, string $title, string $password, bool $sendEmail): string
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidParametersException('Invalid email provided', 401);
        }

        if ($this->_calcPasswordStrength($password) < 14) {
            throw new InvalidParametersException('Password is too weak', 411);
        }

        $pw = $this->makePasswordTokens($password);

        $reg = (new RegistrantPrimitive($this->_db))
            ->setEmail($email)
            ->setTitle($title)
            ->setApprovalCode(sha1($email . microtime(true)))
            ->setAuthSalt($pw['salt'])
            ->setAuthHash($pw['auth_hash']);
        $reg->save();

        if ($sendEmail) {
            $conf = $this->_config->getValue('mailer');
            $mailer = new Mailer($conf['gui_url'], $conf['mode'], $conf['mailer_addr'], $conf['remote_url'], $conf['remote_action_key']);
            return $mailer->sendSignupMail($email, '/profile/confirm/' . $reg->getApprovalCode());
        }
        return $reg->getApprovalCode();
    }

    /**
     * Approve registration with approval code.
     * Returns new person's ID on success, otherwise throws an exception.
     *
     * @param string $approvalCode
     *
     * @return int
     *
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function approveRegistration(string $approvalCode): int
    {
        $reg = RegistrantPrimitive::findByApprovalCode($this->_db, [$approvalCode]);
        if (empty($reg)) {
            throw new EntityNotFoundException('Approval code is invalid or already used', 402);
        }

        $alreadyRegistered = PersonPrimitive::findByEmail($this->_db, [$reg[0]->getEmail()]);
        if (!empty($alreadyRegistered)) {
            throw new InvalidParametersException('Email is already registered', 410);
        }

        $person = (new PersonPrimitive($this->_db))
            ->setEmail($reg[0]->getEmail())
            ->setAuthSalt($reg[0]->getAuthSalt())
            ->setAuthHash($reg[0]->getAuthHash())
            ->setTitle($reg[0]->getTitle())
            ->setDisabled(false);

        if (!$person->save()) {
            throw new \Exception('Couldn\'t save person to DB');
        }

        $reg[0]->drop();
        return (int)$person->getId();
    }

    /**
     * Authorize person ant return permanent client-side auth token iwth person id.
     * Throws exception if authorization was not successful.
     *
     * @param string $email
     * @param string $password
     *
     * @return (int|null|string)[]
     *
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     *
     * @psalm-return array{0: int|null, 1: string}
     */
    public function authorize(string $email, string $password): array
    {
        $person = PersonPrimitive::findByEmail($this->_db, [$email]);
        if (empty($person)) {
            throw new EntityNotFoundException('Email is not known to auth system', 403);
        }

        if (!$this->checkPasswordFull($password, $person[0]->getAuthHash(), $person[0]->getAuthSalt())) {
            throw new AuthFailedException('Password is incorrect', 404);
        }

        return [
            $person[0]->getId(),
            $this->_makeClientSideToken($password, $person[0]->getAuthSalt())
        ];
    }

    /**
     * Check if client-side token matches stored password hash.
     * WARNING:
     * This method is supposed to be VERY HOT. It should not contain any excessive business logic,
     * especially database queries or ORM usage.
     *
     * @param int $id
     * @param string $clientSideToken
     * @return bool
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function quickAuthorize(int $id, string $clientSideToken): bool
    {
        $person = PersonPrimitive::findById($this->_db, [$id]);
        if (empty($person)) {
            throw new EntityNotFoundException('Requested person ID is not known to auth system', 405);
        }

        return Model::checkPasswordQuick($clientSideToken, $person[0]->getAuthHash());
    }

    /**
     * Return information about person related to client token
     *
     * @param int $id
     * @param string $clientSideToken
     * @return array
     * @throws EntityNotFoundException
     * @throws AuthFailedException
     * @throws \Exception
     */
    public function me(int $id, string $clientSideToken): array
    {
        $person = PersonPrimitive::findById($this->_db, [$id]);
        if (empty($person)) {
            throw new EntityNotFoundException('Requested person ID is not known to auth system', 405);
        }

        $person = $person[0];
        if (!Model::checkPasswordQuick($clientSideToken, $person->getAuthHash())) {
            throw new AuthFailedException('Invalid token', 405);
        }

        return [
            'id' => $person->getId(),
            'country' => $person->getCountry(),
            'city' => $person->getCity(),
            'email' => $person->getEmail(),
            'phone' => $person->getPhone(),
            'tenhou_id' => $person->getTenhouId(),
            'groups' => $person->getGroupIds(),
            'title' => $person->getTitle(),
        ];
    }

    /**
     * Change password when old password is known.
     * Returns new client-side auth token on success, or throws exception on failure.
     *
     * @param string $email
     * @param string $password
     * @param string $newPassword
     * @return string
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function changePassword(string $email, string $password, string $newPassword): string
    {
        $person = PersonPrimitive::findByEmail($this->_db, [$email]);
        if (empty($person)) {
            throw new EntityNotFoundException('Email is not known to auth system', 406);
        }

        if (!$this->checkPasswordFull($password, $person[0]->getAuthHash(), $person[0]->getAuthSalt())) {
            throw new AuthFailedException('Password is incorrect', 404);
        }

        $pw = $this->makePasswordTokens($newPassword);
        $person[0]
            ->setEmail($email)
            ->setAuthSalt($pw['salt'])
            ->setAuthHash($pw['auth_hash'])
            ->save();

        return (string)$pw['client_hash'];
    }

    /**
     * Request password reset.
     * Returns reset approval token, which should be sent over email to user.
     *
     * @param string $email
     * @param bool $sendEmail
     * @return string
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function requestResetPassword(string $email, bool $sendEmail)
    {
        $person = PersonPrimitive::findByEmail($this->_db, [$email]);
        if (empty($person)) {
            throw new EntityNotFoundException('Email is not known to auth system', 407);
        }

        $person[0]->setAuthResetToken(sha1($email . microtime(true)))->save();

        if ($sendEmail) {
            $conf = $this->_config->getValue('mailer');
            $mailer = new Mailer($conf['gui_url'], $conf['mode'], $conf['mailer_addr'], $conf['remote_url'], $conf['remote_action_key']);
            return $mailer->sendPasswordRecovery($person[0]->getAuthResetToken(), $email);
        }

        return $person[0]->getAuthResetToken();
    }

    /**
     * Approve password reset.
     * Generates digit-code and uses it as a new password, updates all records
     * and returns the code. Code should be sent to person via email, and person
     * should be asked to change the password immediately.
     *
     * @param string $email
     * @param string $resetApprovalCode
     * @return string
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function approveResetPassword(string $email, string $resetApprovalCode)
    {
        $person = PersonPrimitive::findByEmail($this->_db, [$email]);
        if (empty($person)) {
            throw new EntityNotFoundException('Email is not known to auth system', 408);
        }

        if (empty($resetApprovalCode) || $person[0]->getAuthResetToken() != $resetApprovalCode) {
            throw new AuthFailedException('Password reset approval code is incorrect.', 409);
        }

        $newGeneratedPassword = (string)crc32(microtime(true) . $email);
        $pw = $this->makePasswordTokens($newGeneratedPassword);
        $person[0]
            ->setEmail($email)
            ->setAuthSalt($pw['salt'])
            ->setAuthHash($pw['auth_hash'])
            ->save();

        return (string)$newGeneratedPassword;
    }

    /**
     * Create all password facilities and return at once
     *
     * @param string $password
     * @return array
     */
    public function makePasswordTokens(string $password)
    {
        $salt = sha1((string)microtime(true));
        $clientHash = $this->_makeClientSideToken($password, $salt);
        $authHash = password_hash($clientHash, PASSWORD_DEFAULT);
        return [
            'salt' => $salt,
            'client_hash' => $clientHash,
            'auth_hash' => $authHash
        ];
    }

    /**
     * Calc strength of password by simple algorithm:
     * - 1 base point for every 2 symbols in password
     * - Multiply by 2 for every symbol class in password
     *
     * So:
     * - "123456" password will have strength of 3 * 2 = 6 (very weak)
     * - "Simple123" will have strength of 6 * 2 * 2 * 2 = 48 (normal)
     * - "thisismypasswordandidontcare" will have strength of 14 * 2 = 28 (below normal)
     *
     * Passwords with calculated strength less than 14 should be considered weak.
     *
     * @param string $password
     * @return float|int
     */
    protected function _calcPasswordStrength(string $password)
    {
        $hasLatinSymbols = preg_match('#[a-z]#', $password);
        $hasUppercaseLatinSymbols = preg_match('#[A-Z]#', $password);
        $hasDigits = preg_match('#[0-9]#', $password);
        $hasPunctuation = preg_match('#[-@\#\$%\^&*\(\),\./\\"\']#', $password);
        $hasOtherSymbols = mb_strlen((string)preg_replace('#[-a-z0-9@\#\$%\^&*\(\),\./\\"\']#ius', '', $password)) > 0;

        return ceil(mb_strlen($password) / 2)
            * ($hasDigits ? 2 : 1)
            * ($hasUppercaseLatinSymbols ? 2 : 1)
            * ($hasPunctuation ? 2 : 1)
            * ($hasOtherSymbols ? 2 : 1)
            * ($hasLatinSymbols ? 2 : 1)
            ;
    }

    /**
     * Make permanent client-side auth token
     *
     * @param string $password
     * @param string $salt
     * @return string
     */
    protected function _makeClientSideToken(string $password, string $salt): string
    {
        return hash('sha3-384', $password . $salt);
    }

    /**
     * Check if password matches hash & salt
     *
     * @param string $password
     * @param string $authHash
     * @param string $authSalt
     * @return bool
     */
    public function checkPasswordFull($password, string $authHash, string $authSalt): bool
    {
        $clientSideToken = $this->_makeClientSideToken($password, $authSalt);
        return Model::checkPasswordQuick($clientSideToken, $authHash);
    }
}
