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
require_once __DIR__ . '/../../src/helpers/Db.php';
require_once __DIR__ . '/../../src/helpers/Config.php';
require_once __DIR__ . '/../../src/helpers/Meta.php';

class AuthModelTest extends \PHPUnit\Framework\TestCase
{
    protected $_db;
    /**
     * @var Config
     */
    protected $_config;
    /**
     * @var \Memcached
     */
    protected $_mc;
    /**
     * @var Meta
     */
    protected $_meta;

    protected function setUp(): void
    {
        $this->_db = Db::__getCleanTestingInstance();
        $this->_config = new Config(getenv('OVERRIDE_CONFIG_PATH'));
        $this->_meta = new Meta(new \Common\Storage('localhost'), $_SERVER);
        $this->_mc = new \Memcached();
        $this->_mc->addServer('127.0.0.1', 11211);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testRequestRegistration()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $this->assertNotEmpty($approvalCode);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testRequestRegistrationInvalidEmail()
    {
        $this->expectExceptionCode(401);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $model->requestRegistration('bademail.com', 'mytitle', 'greatpassword', false);
    }

    /**
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testRequestRegistrationWeakPassword()
    {
        $this->expectExceptionCode(411);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $model->requestRegistration('test@email.com', 'mytitle', 'badpw', false);
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testApproveRegistration()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $personId = $model->approveRegistration($approvalCode);
        $this->assertGreaterThan(0, $personId);
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testApproveRegistrationWithInvalidCode()
    {
        $this->expectExceptionCode(402);
        $this->expectException(\Frey\EntityNotFoundException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $model->approveRegistration('232314241');
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testApproveRegistrationWithRegisteredEmail()
    {
        $this->expectExceptionCode(410);
        $this->expectException(\Frey\InvalidParametersException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $model->approveRegistration($approvalCode);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'passwordagain', false);
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
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $model->approveRegistration($approvalCode);
        list($id, $authToken) = $model->authorize('test@test.com', 'greatpassword');
        $this->assertNotEmpty($authToken);
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testAuthorizeUnknownEmail()
    {
        $this->expectExceptionCode(403);
        $this->expectException(\Frey\EntityNotFoundException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $model->approveRegistration($approvalCode);
        $model->authorize('te1st@test.com', 'greatpassword');
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testAuthorizeWrongPassword()
    {
        $this->expectExceptionCode(404);
        $this->expectException(\Frey\AuthFailedException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
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
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $personId = $model->approveRegistration($approvalCode);
        list($id, $authToken) = $model->authorize('test@test.com', 'greatpassword');
        $this->assertEquals($personId, $id);
        $this->assertTrue($model->quickAuthorize($personId, $authToken));
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testQuickAuthorizeWrongPerson()
    {
        $this->expectExceptionCode(405);
        $this->expectException(\Frey\EntityNotFoundException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $model->quickAuthorize(123, 'oshdfhfsdisdfjl');
    }

    /**
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testQuickAuthorizeWrongToken()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
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
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $model->approveRegistration($approvalCode);
        $authToken = $model->changePassword(
            'test@test.com',
            'greatpassword',
            'newpassword'
        );
        $this->assertNotEmpty($authToken);
        // check if password really changed
        list($id, $authToken) = $model->authorize('test@test.com', 'newpassword');
        $this->assertNotEmpty($authToken);
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testChangePasswordUnknownEmail()
    {
        $this->expectExceptionCode(406);
        $this->expectException(\Frey\EntityNotFoundException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $model->changePassword('test@test.com', 'greatpassword', 'newpassword');
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testChangePasswordWrongPassword()
    {
        $this->expectExceptionCode(404);
        $this->expectException(\Frey\AuthFailedException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
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
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $model->approveRegistration($approvalCode);
        $passwordResetToken = $model->requestResetPassword('test@test.com', false);
        $this->assertNotEmpty($passwordResetToken);
    }

    /**
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function testRequestResetPasswordWrongEmail()
    {
        $this->expectExceptionCode(407);
        $this->expectException(\Frey\EntityNotFoundException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $model->requestResetPassword('test@test.com', false);
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testApproveResetPassword()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $model->approveRegistration($approvalCode);
        $passwordResetToken = $model->requestResetPassword('test@test.com', false);
        $newPassword = $model->approveResetPassword('test@test.com', $passwordResetToken);
        $this->assertNotEmpty($newPassword);
        // check if password really changed
        list($id, $authToken) = $model->authorize('test@test.com', $newPassword);
        $this->assertNotEmpty($authToken);
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testApproveResetPasswordWrongEmail()
    {
        $this->expectExceptionCode(408);
        $this->expectException(\Frey\EntityNotFoundException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $model->approveRegistration($approvalCode);
        $passwordResetToken = $model->requestResetPassword('test@test.com', false);
        $model->approveResetPassword('te12st@test.com', $passwordResetToken);
    }

    /**
     * @throws AuthFailedException
     * @throws EntityNotFoundException
     * @throws InvalidParametersException
     * @throws \Exception
     */
    public function testApproveResetPasswordWrongApprovalCode()
    {
        $this->expectExceptionCode(409);
        $this->expectException(\Frey\AuthFailedException::class);
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
        $approvalCode = $model->requestRegistration('test@test.com', 'mytitle', 'greatpassword', false);
        $model->approveRegistration($approvalCode);
        $model->approveResetPassword('test@test.com', '12354523');
    }

    public function testMakePasswordTokens()
    {
        $model = new AuthModel($this->_db, $this->_config, $this->_meta, $this->_mc);
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
