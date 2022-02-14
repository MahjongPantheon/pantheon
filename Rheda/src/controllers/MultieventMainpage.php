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

require_once __DIR__ . '/../Controller.php';

class MultieventMainpage extends Controller
{
    protected $_mainTemplate = 'MultieventMainpage';

    protected function _pageTitle()
    {
        return _t('Event list');
    }

    /**
     * @return array
     * @throws \Exception
     */
    protected function _run(): array
    {
        $page = empty($this->_path['page']) ? 1 : intval($this->_path['page']);
        $limit = 20;
        $offset = $limit * ($page - 1);
        $data = $this->_mimir->getEvents($limit, $offset, true);

        $hasNextButton = $offset + $limit < $data['total'];
        $hasPreviousButton = $page > 1;

        return [
            'events' => array_map(function ($event) {
                $ellipsis = mb_strlen($event['description']) > 50 ? '...' : '';
                $event['title'] = $this->_getByLang($event['titleEn'], $event['title']);
                $event['description'] = mb_substr($this->_getByLang($event['descriptionEn'], $event['description']), 0, 50) . $ellipsis;
                return $event;
            }, $data['events']),
            'prevPage' => $page > 1 ? $page - 1 : 1,
            'nextPage' => $page + 1,
            'hasNextButton' => $hasNextButton,
            'hasPreviousButton' => $hasPreviousButton
        ];
    }
}
