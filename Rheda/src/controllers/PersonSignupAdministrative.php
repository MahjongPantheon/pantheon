<?php
/*  Rheda: visualizer and control panel
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
namespace Rheda;

use libphonenumber\PhoneNumberUtil;

require_once __DIR__ . '/../helpers/Url.php';

class PersonSignupAdministrative extends Controller
{
    protected $_mainTemplate = 'PersonSignupAdministrative';

    protected function _pageTitle()
    {
        return _t('Create new user');
    }

    protected function _run()
    {
        // Only super admin is allowed to add users
        if (!$this->_superadmin) {
            return [
                'error' => _t("Only global administrators can register players")
            ];
        }

        if (!empty($_POST['save'])) {
            $checkedData = $this->_checkData($_POST);
            if ($checkedData['haveErrors']) {
                return array_merge($checkedData, [
                    'success' => false
                ]);
            }

            try {
                $this->_saveData($checkedData);
                return array_merge($checkedData, [
                    'success' => _t('Successfully save new user'),
                    'error' => false,
                ]);
            } catch (\Exception $ex) {
                return array_merge($checkedData, [
                    'error' => $ex->getMessage(),
                    'success' => false,
                ]);
            }
        }

        return [
            'error' => null,
            'success' => null,
        ];
    }

    /**
     * @param array $data
     * @return int
     */
    protected function _saveData(array $data)
    {
        return $this->_frey->createAccount(
            $data['email'],
            $data['password'],
            $data['title'],
            $data['city'],
            $data['phone'],
            $data['tenhou_id'] ?? ''
        );
    }

    /**
     * @param array $data
     * @return mixed
     * @throws \libphonenumber\NumberParseException
     */
    protected function _checkData($data)
    {
        $checkedData = $data;

        if (mb_strlen($data['title']) < 4) {
            $checkedData['error_title'] = _t('Player name must be at least 4 characters length. Please enter your real name (and surname).');
        }

        $emailSanitized = strtolower(trim($data['email']));
        if (!filter_var($emailSanitized, FILTER_VALIDATE_EMAIL)) {
            $checkedData['error_email'] = _t('Invalid email provided');
        }
        $checkedData['email'] = $emailSanitized;

        if (!empty($data['phone'])) {
            $phoneUtil = PhoneNumberUtil::getInstance();
            $phone = $phoneUtil->parse($data['phone'], $data['country']);
            if (!$phoneUtil->isValidNumber($phone)) {
                $checkedData['error_phone'] = _t('Provided number is invalid for selected country. Please provide valid phone number.');
            }
        }

        if (!empty($data['tenhou_id']) && preg_match('#^ID[a-z0-9]+-[a-z0-9]+$#is', $data['tenhou_id'])) {
            $checkedData['error_tenhou_id'] = _t('WARNING: you should NEVER pass your tenhou login string to any service! Please provide your username instead!');
        }

        foreach ($checkedData as $key => $val) {
            if (strpos($key, 'error_') === 0) {
                $checkedData['haveErrors'] = true;
                break;
            }
        }

        return $checkedData;
    }
}
