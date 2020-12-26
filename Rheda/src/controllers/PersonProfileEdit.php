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
            return $this->_saveData($_POST, $data[0], $personId);
        }

        return [
            'error' => null,
            'success' => null,
            'emailEditable' => $this->_superadmin,
            'id' => $personId,
            'title' => $data[0]['title'],
            'city' => $data[0]['city'],
            'email' => $data[0]['email'],
            'phone' => $data[0]['phone'],
            'tenhouid' => $data[0]['tenhou_id'],
        ];
    }

    /**
     * @param array $data
     * @param array $originalData
     * @param int $personId
     * @return array
     */
    protected function _saveData(array $data, array $originalData, int $personId)
    {
        try {
            $success = $this->_frey->updatePersonalInfo(
                (string)$personId, // TODO: should be int, check
                $data['title'],
                $data['city'],
                $this->_superadmin
                    ? $data['email']
                    : $originalData['email'], // email is not intended to be changed by user
                $data['phone'],
                $data['tenhouid']
            );

            return [
                'error' => $success ? null : _t('Failed to update personal information: insufficient privileges or server error'),
                'success' => $success ? _t('Personal information successfully updated') : null,
                'title' => $data['title'],
                'city' => $data['city'],
                'email' => $this->_superadmin
                    ? $data['email']
                    : $originalData['email'],
                'phone' => $data['phone'],
                'tenhouid' => $data['tenhouid'],
            ];
        } catch (\Exception $ex) {
            return [
                'error' => $ex->getMessage(),
                'success' => false,
                'title' => $data['title'],
                'city' => $data['city'],
                'email' => $this->_superadmin
                    ? $data['email']
                    : $originalData['email'],
                'phone' => $data['phone'],
                'tenhouid' => $data['tenhouid'],
            ];
        }
    }
}
