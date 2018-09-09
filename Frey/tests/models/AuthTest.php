<?php
/*  Frey: ACL & user data storage
 *  Copyright (C) 2018  o.klimenko aka ctizen
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

require_once __DIR__ . '/../../src/exceptions/InvalidParameters.php';
require_once __DIR__ . '/../../src/exceptions/AuthFailed.php';
require_once __DIR__ . '/../../src/exceptions/EntityNotFound.php';
require_once __DIR__ . '/../../src/models/Auth.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Config.php';
require_once __DIR__ . '/../../src/Meta.php';

class AuthModelTest extends \PHPUnit_Framework_TestCase
{
    protected $_db;
    /**
     * @var Config
     */
    protected $_config;
    /**
     * @var Meta
     */
    protected $_meta;

    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
        $this->_config = new Config(getenv('OVERRIDE_CONFIG_PATH'));
        $this->_meta = new Meta($_SERVER);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testRequestRegistration()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $this->assertNotEmpty($approvalCode);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\InvalidParametersException
     * @expectedExceptionCode 401
     */
    public function testRequestRegistrationInvalidEmail()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $model->requestRegistration('bademail.com', 'greatpassword');
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\InvalidParametersException
     * @expectedExceptionCode 411
     */
    public function testRequestRegistrationWeakPassword()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $model->requestRegistration('test@email.com', 'badpw');
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testApproveRegistration()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $personId = $model->approveRegistration($approvalCode);
        $this->assertGreaterThan(0, $personId);
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\EntityNotFoundException
     * @expectedExceptionCode 402
     */
    public function testApproveRegistrationWithInvalidCode()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $model->approveRegistration('232314241');
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\InvalidParametersException
     * @expectedExceptionCode 410
     */
    public function testApproveRegistrationWithRegisteredEmail()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $model->approveRegistration($approvalCode);
        $approvalCode = $model->requestRegistration('test@test.com', 'passwordagain');
        $model->approveRegistration($approvalCode); // Here should be an exception
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testAuthorize()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $model->approveRegistration($approvalCode);
        $authToken = $model->authorize('test@test.com', 'greatpassword');
        $this->assertNotEmpty($authToken);
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\EntityNotFoundException
     * @expectedExceptionCode 403
     */
    public function testAuthorizeUnknownEmail()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $model->approveRegistration($approvalCode);
        $model->authorize('te1st@test.com', 'greatpassword');
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\AuthFailedException
     * @expectedExceptionCode 404
     */
    public function testAuthorizeWrongPassword()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $model->approveRegistration($approvalCode);
        $model->authorize('test@test.com', 'greatpassword123');
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testQuickAuthorize()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $personId = $model->approveRegistration($approvalCode);
        $authToken = $model->authorize('test@test.com', 'greatpassword');
        $this->assertTrue($model->quickAuthorize($personId, $authToken));
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\EntityNotFoundException
     * @expectedExceptionCode 405
     */
    public function testQuickAuthorizeWrongPerson()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $model->quickAuthorize(123, 'oshdfhfsdisdfjl');
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testQuickAuthorizeWrongToken()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $personId = $model->approveRegistration($approvalCode);
        $this->assertFalse($model->quickAuthorize($personId, 'kahfkjhsafljflkjfa'));
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testChangePassword()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $model->approveRegistration($approvalCode);
        $authToken = $model->changePassword(
            'test@test.com',
            'greatpassword',
            'newpassword'
        );
        $this->assertNotEmpty($authToken);
        // check if password really changed
        $authToken = $model->authorize('test@test.com', 'newpassword');
        $this->assertNotEmpty($authToken);
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\EntityNotFoundException
     * @expectedExceptionCode 406
     */
    public function testChangePasswordUnknownEmail()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $model->changePassword('test@test.com', 'greatpassword', 'newpassword');
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\AuthFailedException
     * @expectedExceptionCode 404
     */
    public function testChangePasswordWrongPassword()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $model->approveRegistration($approvalCode);
        $model->changePassword('test@test.com', 'great1password', 'newpassword');
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testRequestResetPassword()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $model->approveRegistration($approvalCode);
        $passwordResetToken = $model->requestResetPassword('test@test.com');
        $this->assertNotEmpty($passwordResetToken);
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     * @expectedException \Frey\EntityNotFoundException
     * @expectedExceptionCode 407
     */
    public function testRequestResetPasswordWrongEmail()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $model->requestResetPassword('test@test.com');
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testApproveResetPassword()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $model->approveRegistration($approvalCode);
        $passwordResetToken = $model->requestResetPassword('test@test.com');
        $newPassword = $model->approveResetPassword('test@test.com', $passwordResetToken);
        $this->assertNotEmpty($newPassword);
        // check if password really changed
        $authToken = $model->authorize('test@test.com', $newPassword);
        $this->assertNotEmpty($authToken);
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\EntityNotFoundException
     * @expectedExceptionCode 408
     */
    public function testApproveResetPasswordWrongEmail()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $model->approveRegistration($approvalCode);
        $passwordResetToken = $model->requestResetPassword('test@test.com');
        $model->approveResetPassword('te12st@test.com', $passwordResetToken);
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     * @expectedException \Frey\AuthFailedException
     * @expectedExceptionCode 409
     */
    public function testApproveResetPasswordWrongApprovalCode()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $approvalCode = $model->requestRegistration('test@test.com', 'greatpassword');
        $model->approveRegistration($approvalCode);
        $model->approveResetPassword('test@test.com', '12354523');
    }

    public function testMakePasswordTokens()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta);
        $tokens = $model->makePasswordTokens('password');
        $tokens2 = $model->makePasswordTokens('password');

        $this->assertNotEmpty($tokens['salt']);
        $this->assertNotEmpty($tokens['client_hash']);
        $this->assertNotEmpty($tokens['auth_hash']);

        $this->assertTrue($model->checkPasswordFull('password', $tokens['auth_hash'], $tokens['salt']));
        $this->assertTrue($model->checkPasswordFull('password', $tokens2['auth_hash'], $tokens2['salt']));
        $this->assertTrue(password_verify($tokens['client_hash'], $tokens['auth_hash']));
        $this->assertTrue(password_verify($tokens2['client_hash'], $tokens2['auth_hash']));
    }
}
