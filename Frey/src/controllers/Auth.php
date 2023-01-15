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

require_once __DIR__ . '/../Controller.php';
require_once __DIR__ . '/../models/Auth.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';
require_once __DIR__ . '/../exceptions/EntityNotFound.php';
require_once __DIR__ . '/../exceptions/AuthFailed.php';

class AuthController extends Controller
{
    /**
     * Request new registration with given email and password.
     * Approval code is returned. It is intended to be sent to provided email address.
     *
     * @param string $email
     * @param string $title
     * @param string $password
     * @return string
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function requestRegistration($email, $title, $password)
    {
        $this->_logStart(__METHOD__, [$this->_depersonalizeEmail($email), /*$password*/'******']);
        $approvalCode = $this->_getModel()->requestRegistration($email, $title, $password);
        $this->_logSuccess(__METHOD__, [$this->_depersonalizeEmail($email), /*$password*/'******']);
        return $approvalCode;
    }

    /**
     * Approve registration with approval code.
     * Returns new person's ID on success.
     *
     * @param string $approvalCode
     * @return int
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function approveRegistration($approvalCode)
    {
        $this->_logStart(__METHOD__, [$approvalCode]);
        $personId = $this->_getModel()->approveRegistration($approvalCode);
        $this->_logSuccess(__METHOD__, [$approvalCode]);
        return $personId;
    }

    /**
     * Authorize person ant return permanent client-side auth token.
     *
     * @param string $email
     * @param string $password
     * @return array
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function authorize($email, $password)
    {
        $this->_logStart(__METHOD__, [$this->_depersonalizeEmail($email), /*$password*/'******']);
        $clientData = $this->_getModel()->authorize($email, $password);
        $this->_logSuccess(__METHOD__, [$this->_depersonalizeEmail($email), /*$password*/'******']);
        return $clientData;
    }

    /**
     * Check if client-side token matches stored password hash.
     * Useful for cookie-check.
     *
     * @param int $id
     * @param string $clientSideToken
     * @return bool
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function quickAuthorize($id, $clientSideToken)
    {
        $this->_logStart(__METHOD__, [$id, /*$clientSideToken*/'******']);
        $success = $this->_getModel()->quickAuthorize($id, $clientSideToken);
        $this->_logSuccess(__METHOD__, [$id, /*$clientSideToken*/'******']);
        return $success;
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
    public function me($id, $clientSideToken)
    {
        $this->_logStart(__METHOD__, [$id, /*$clientSideToken*/'******']);
        $result = $this->_getModel()->me($id, $clientSideToken);
        $this->_logSuccess(__METHOD__, [$id, /*$clientSideToken*/'******']);
        return $result;
    }

    /**
     * Change password when old password is known.
     * Returns new client-side auth token on success
     *
     * @param string $email
     * @param string $password
     * @param string $newPassword
     * @return string
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function changePassword($email, $password, $newPassword)
    {
        $this->_logStart(__METHOD__, [$this->_depersonalizeEmail($email), /*$password*/'******', /*$newPassword*/'******']);
        $clientToken = $this->_getModel()->changePassword($email, $password, $newPassword);
        $this->_logSuccess(__METHOD__, [$this->_depersonalizeEmail($email), /*$password*/'******', /*$newPassword*/'******']);
        return $clientToken;
    }

    /**
     * Request password reset.
     * Returns reset approval token, which should be sent over email to user.
     *
     * @param string $email
     * @return string
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function requestResetPassword($email)
    {
        $this->_logStart(__METHOD__, [$this->_depersonalizeEmail($email)]);
        $resetToken = $this->_getModel()->requestResetPassword($email);
        $this->_logSuccess(__METHOD__, [$this->_depersonalizeEmail($email)]);
        return $resetToken;
    }

    /**
     * Approve password reset.
     * Generates digit-code and uses it as a new password, updates all records
     * and returns the code. Code should be sent to person via email, and person
     * should be asked to change the password immediately.
     *
     * @param string $email
     * @param string $resetApprovalCode
     *
     * @return string
     *
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function approveResetPassword($email, $resetApprovalCode): string
    {
        $this->_logStart(__METHOD__, [$this->_depersonalizeEmail($email), $resetApprovalCode]);
        $newPassword = $this->_getModel()->approveResetPassword($email, $resetApprovalCode);
        $this->_logSuccess(__METHOD__, [$this->_depersonalizeEmail($email), $resetApprovalCode]);
        return $newPassword;
    }

    /**
     * @return AuthModel
     */
    protected function _getModel()
    {
        return new AuthModel($this->_db, $this->_config, $this->_meta);
    }
}
