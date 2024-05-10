<?php
/*  Mimir: mahjong games storage
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
namespace Mimir;

require_once __DIR__ . '/../Primitive.php';

/**
 * Class JobsQueuePrimitive
 *
 * @package Mimir
 */
class JobsQueuePrimitive extends Primitive
{
    protected static $_table = 'jobs_queue';

    const JOB_ACHIEVEMENTS = 'achievements';
    const JOB_PLAYER_STATS = 'playerStats';

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'created_at'    => '_createdAt',
        'job_name'      => '_jobName',
        'job_arguments' => '_jobArguments',
    ];

    protected function _getFieldsTransforms()
    {
        return [
            '_id'              => $this->_integerTransform(),
            '_createdAt'       => $this->_stringTransform(),
            '_jobName'         => $this->_stringTransform(),
            '_jobArguments'    => $this->_jsonTransform(),
        ];
    }

    /**
     * Local id
     * @var int|null
     */
    protected $_id;
    /**
     * Creation date
     * @var string
     */
    protected $_createdAt;
    /**
     * Job args, arbitrary json
     * @var array
     */
    protected $_jobArguments;
    /**
     * Job name
     * @var string
     */
    protected $_jobName;

    /**
     * Fetch pending jobs and delete the items from db
     *
     * @param DataSource $ds
     * @param int $limit
     * @throws \Exception
     * @return JobsQueuePrimitive[]
     */
    public static function getPendingJobs(DataSource $ds, int $limit)
    {
        $result = $ds->table(static::$_table)
            ->orderByAsc('created_at')
            ->limit($limit)
            ->findArray();
        if (empty($result)) {
            return [];
        }

        return array_map(function ($data) use ($ds) {
            $instance = self::_recreateInstance($ds, $data);
            $instance->drop();
            return $instance;
        }, $result);
    }

    /**
     * @return bool|mixed
     * @throws \Exception
     */
    protected function _create()
    {
        $session = $this->_ds->table(self::$_table)->create();
        $success = $this->_save($session);
        if ($success) {
            $this->_id = $this->_ds->local()->lastInsertId();
        }

        return $success;
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    /**
     * @return int|null
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @return string
     */
    public function getCreatedAt(): string
    {
        return $this->_createdAt;
    }

    /**
     * @param string $createdAt
     * @return JobsQueuePrimitive
     */
    public function setCreatedAt(string $createdAt): JobsQueuePrimitive
    {
        $this->_createdAt = $createdAt;
        return $this;
    }

    /**
     * @return array
     */
    public function getJobArguments(): array
    {
        return $this->_jobArguments;
    }

    /**
     * @param array $jobArguments
     * @return JobsQueuePrimitive
     */
    public function setJobArguments(array $jobArguments): JobsQueuePrimitive
    {
        $this->_jobArguments = $jobArguments;
        return $this;
    }

    /**
     * @return string
     */
    public function getJobName(): string
    {
        return $this->_jobName;
    }

    /**
     * @param string $jobName
     * @return JobsQueuePrimitive
     */
    public function setJobName(string $jobName): JobsQueuePrimitive
    {
        $this->_jobName = $jobName;
        return $this;
    }

    /**
     * @param DataSource $ds
     * @param int $eventId
     * @return bool success
     */
    public static function scheduleRebuildAchievements(DataSource $ds, $eventId)
    {
        try {
            $query = "insert into jobs_queue (created_at, job_name, job_arguments) VALUES (now(), 'achievements', '{\"eventId\":$eventId}')";
            $ds->table(self::$_table)->rawQuery($query)->findOne();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * @param DataSource $ds
     * @param int $eventId
     * @return bool success
     */
    public static function scheduleRebuildPlayerStats(DataSource $ds, $eventId)
    {
        try {
            $query = <<<QUERY
insert into jobs_queue (created_at, job_name, job_arguments)
select now(), 'playerStats', '{"playerId":' || player_id || ',"eventId":' || event_id || '}' from event_registered_players where event_id = {$eventId}
QUERY;
            $ds->table(self::$_table)->rawQuery($query)->findOne();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
