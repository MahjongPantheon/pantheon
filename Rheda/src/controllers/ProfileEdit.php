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

require_once __DIR__ . '/../helpers/Url.php';

class ProfileEdit extends Controller
{
    protected $_mainTemplate = 'ProfileEdit';

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

        try {
            $data = $this->_frey->getPersonalInfo([$this->_currentPersonId]);
        } catch (\Exception $ex) {
            $data = null;
        }

        if (empty($data)) {
            return [
                'error' => _t("Can't proceed to profile management: failed to fetch personal data"),
                'critical' => true
            ];
        }

        if (!empty($_POST['save'])) {
            return $this->_saveData($_POST, $data[0]);
        }

        return [
            'error' => null,
            'success' => null,
            'id' => $this->_currentPersonId,
            'title' => $data[0]['title'],
            'city' => $data[0]['city'],
            'email' => $data[0]['email'],
            'phone' => $data[0]['phone'],
            'tenhouid' => $data[0]['tenhou_id'],
        ];
    }

    /**
     * @param array $data
     *
     * @return (false|mixed|string)[]
     *
     * @psalm-return array{error: mixed|string, success: false|mixed, title: mixed, city: mixed, email: mixed, phone: mixed, tenhouid: mixed}
     */
    protected function _saveData(array $data, $originalData)
    {
        try {
            $success = $this->_frey->updatePersonalInfo(
                $this->_currentPersonId,
                $data['title'],
                $data['city'],
                $originalData['email'], // email is not intended to be changed by user
                $data['phone'],
                $data['tenhouid']
            );

            return [
                'error' => $success ? null : _t('Failed to update personal information: insufficient privileges or server error'),
                'success' => $success ? _t('Personal information successfully updated') : null,
                'title' => $data['title'],
                'city' => $data['city'],
                'email' => $originalData['email'],
                'phone' => $data['phone'],
                'tenhouid' => $data['tenhouid'],
            ];
        } catch (\Exception $ex) {
            return [
                'error' => $ex->getMessage(),
                'success' => false,
                'title' => $data['title'],
                'city' => $data['city'],
                'email' => $originalData['email'],
                'phone' => $data['phone'],
                'tenhouid' => $data['tenhouid'],
            ];
        }
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
     * @see also Frey/src/models/Auth.php:_calcPasswordStrength - functions should match!
     * @param $password
     * @return float|int
     */
    protected function _calcPasswordStrength($password)
    {
        $hasLatinSymbols = preg_match('#[a-z]#', $password);
        $hasUppercaseLatinSymbols = preg_match('#[A-Z]#', $password);
        $hasDigits = preg_match('#[0-9]#', $password);
        $hasPunctuation = preg_match('#[-@\#\$%\^&*\(\),\./\\"\']#', $password);
        $hasOtherSymbols = mb_strlen(preg_replace('#[-a-z0-9@\#\$%\^&*\(\),\./\\"\']#ius', '', $password)) > 0;

        return ceil(mb_strlen($password) / 2)
            * ($hasDigits ? 2 : 1)
            * ($hasUppercaseLatinSymbols ? 2 : 1)
            * ($hasPunctuation ? 2 : 1)
            * ($hasOtherSymbols ? 2 : 1)
            * ($hasLatinSymbols ? 2 : 1)
        ;
    }
}
