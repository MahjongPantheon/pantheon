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

class PersonProfileEdit extends Controller
{
    protected $_mainTemplate = 'PersonProfileEdit';

    protected function _pageTitle()
    {
        return _t('Profile management');
    }

    protected function _run()
    {
        if ($this->_currentPersonId === null) {
            return [
                'error' => _t("Can't proceed to profile management: please log in"),
                'critical' => true
            ];
        }

        $personId = $this->_currentPersonId;

        // Only super admin is allowed to edit other users data
        if (!empty($this->_path['action']) && $this->_path['action'] === 'edit' && $this->_superadmin) {
            $personId = intval($this->_path['id']);
        }

        try {
            $data = $this->_frey->getPersonalInfo([$personId]);
            $data[0]['available_countries'] = $this->_getCountries($data[0]['country'] ?? '');
        } catch (\Exception $ex) {
            $this->_handleTwirpEx($ex);
            $data = null;
        }

        if (empty($data)) {
            return [
                'error' => _t("Can't proceed to profile management: failed to fetch personal data"),
                'critical' => true
            ];
        }

        if (!empty($_POST['save'])) {
            $checkedData = $this->_checkData($_POST, $data[0]['email']);
            $checkedData['available_countries'] = $this->_getCountries($checkedData['country'] ?? '');
            if ($checkedData['haveErrors']) {
                return array_merge($checkedData, [
                    'success' => false,
                    'emailEditable' => $this->_superadmin,
                ]);
            }

            try {
                $success = $this->_saveData($checkedData, $personId);
                return array_merge($checkedData, [
                    'success' => $success
                        ? _t('Personal information successfully updated')
                        : false,
                    'error' => $success
                        ? false
                        : _t('Failed to update personal information: insufficient privileges or server error'),
                    'emailEditable' => $this->_superadmin,
                ]);
            } catch (\Exception $ex) {
                $this->_handleTwirpEx($ex);
                return array_merge($checkedData, [
                    'error' => $ex->getMessage(),
                    'success' => false,
                    'emailEditable' => $this->_superadmin,
                ]);
            }
        }

        return array_merge($data[0], [
            'error' => null,
            'success' => null,
            'emailEditable' => $this->_superadmin,
            'id' => $personId,
        ]);
    }

    /**
     * @param array $data
     * @param int $personId
     * @return bool
     */
    protected function _saveData(array $data, int $personId)
    {
        return $this->_frey->updatePersonalInfo(
            $personId,
            $data['title'],
            $data['country'],
            $data['city'],
            $data['email'],
            $data['phone'] ?: '',
            $data['tenhou_id'] ?: ''
        );
    }

    /**
     * @param array $data
     * @param string $originalEmail
     * @return mixed
     * @throws \libphonenumber\NumberParseException
     */
    protected function _checkData($data, $originalEmail)
    {
        $checkedData = $data;

        if (mb_strlen($data['title']) < 4) {
            $checkedData['error_title'] = _t('Player name must be at least 4 characters length. Please enter your real name (and surname).');
        }

        if ($this->_superadmin) {
            $emailSanitized = strtolower(trim($data['email']));
            if (!filter_var($emailSanitized, FILTER_VALIDATE_EMAIL)) {
                $checkedData['error_email'] = _t('Invalid email provided');
            }
        } else {
            $checkedData['email'] = $originalEmail; // Force non-changeable email for non-superadmin user
        }

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

    /**
     * @param string $current
     * @return array
     */
    protected function _getCountries($current)
    {
        $output = [];
        $data = $this->_mimir->getCountries($_SERVER['REMOTE_ADDR']);
        if (empty($current)) {
            $current = $data['preferredByIp'];
        }
        foreach ($data['countries'] as $country) {
            $output []= array_merge([
                'selected' => $current === $country['code']
            ], $country);
        }
        return $output;
    }
}
