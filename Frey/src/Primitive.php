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

use Idiorm\ORM;

define('EXTERNAL_RELATION_MARKER', '::');

abstract class Primitive
{
    /**
     * @var string
     */
    protected static $_table;

    /**
     * @var array
     */
    protected static $_fieldsMapping = [];

    /**
     * Default csv array serializer
     *
     * @param array $obj
     * @return string
     */
    protected function _serializeCsv($obj)
    {
        return $obj ? implode(',', $obj) : '';
    }

    /**
     * Default csv array deserializer
     *
     * @param string $str
     * @return array
     */
    protected function _deserializeCsv($str)
    {
        return $str ? explode(',', $str) : [];
    }

    /**
     * Default csv array transformer
     * @return array
     */
    protected function _csvTransform()
    {
        return [
            'serialize' => [$this, '_serializeCsv'],
            'deserialize' => [$this, '_deserializeCsv']
        ];
    }

    /**
     * This serialization should occur after primary entity is saved, to ensure it already has an id.
     * @see Primitive::save Save logic is handled by this.
     *
     * @param $obj object to serialize (usually array of ids)
     * @param $connectorTable
     * @param $currentEntityField
     * @param $foreignEntityField
     * @param $indexFields
     * @return bool
     */
    protected function _serializeManyToMany($obj, $connectorTable, $currentEntityField, $foreignEntityField, $indexFields)
    {
        $result = [];
        $i = 1;
        foreach ($obj as $id) {
            $result [] = [
                $currentEntityField => $this->getId(),
                $foreignEntityField => $id,
                'order' => $i++ // hardcoded column name; usually order matters, so it should exist in every * <-> *
            ];
        }

        // Delete existing relations that are not listed in array of ids
        $rels = $this->_db->table($connectorTable)
            ->where($currentEntityField, $this->getId());
        if (!empty($obj)) {
            $rels = $rels->whereNotIn($foreignEntityField, $obj);
        }
        $rels = $rels->findMany();
        foreach ($rels as $row) {
            $row->delete();
        }

        // Update/insert existing entries
        if (!empty($result)) {
            return $this->_db->upsertQuery($connectorTable, $result, $indexFields);
        }
        return true;
    }

    /**
     * @param $connectorTable
     * @param $currentEntityField
     * @param $foreignEntityField
     * @return array (usually array of ids)
     */
    protected function _deserializeManyToMany($connectorTable, $currentEntityField, $foreignEntityField)
    {
        $items = $this->_db
            ->table($connectorTable)
            ->where($currentEntityField, $this->getId())
            ->findArray();

        usort($items, function (&$item1, &$item2) {
            return $item1['order'] - $item2['order'];
        });

        return array_map(function ($item) use ($foreignEntityField) {
            return $item[$foreignEntityField];
        }, $items);
    }

    /**
     * Transform for many-to-many relation fields
     *
     * @param $connectorTable
     * @param $currentEntityField
     * @param $foreignEntityField
     * @param $indexFields
     * @return array
     */
    protected function _externalManyToManyTransform($connectorTable, $currentEntityField, $foreignEntityField, $indexFields)
    {
        return [
            'serialize' => function ($obj) use ($connectorTable, $currentEntityField, $foreignEntityField, $indexFields) {
                return $this->_serializeManyToMany($obj, $connectorTable, $currentEntityField, $foreignEntityField, $indexFields);
            },
            'deserialize' => function () use ($connectorTable, $currentEntityField, $foreignEntityField) {
                return $this->_deserializeManyToMany($connectorTable, $currentEntityField, $foreignEntityField);
            }
        ];
    }

    /**
     * Default integer cast transform
     * @param bool $nullable
     * @return array
     */
    protected function _integerTransform($nullable = false)
    {
        return [
            'serialize' => function ($obj) use ($nullable) {
                return (!$obj && $nullable) ? null : (int)$obj;
            },
            'deserialize' => function ($str) use ($nullable) {
                return (!$str && $nullable) ? null : (int)$str;
            }
        ];
    }

    /**
     * Default float cast transform
     * @param bool $nullable
     * @return array
     */
    protected function _floatTransform($nullable = false)
    {
        return [
            'serialize' => function ($obj) use ($nullable) {
                return (!$obj && $nullable) ? null : (float)$obj;
            },
            'deserialize' => function ($str) use ($nullable) {
                return (!$str && $nullable) ? null : (float)$str;
            }
        ];
    }

    /**
     * Default string cast transform
     * @param bool $nullable
     * @return array
     */
    protected function _stringTransform($nullable = false)
    {
        return [
            'serialize' => function ($obj) use ($nullable) {
                return (!$obj && $nullable) ? null : (string)$obj;
            },
            'deserialize' => function ($str) use ($nullable) {
                return (!$str && $nullable) ? null : (string)$str;
            }
        ];
    }

    /**
     * @var Db
     */
    protected $_db;

    /**
     * Primitive constructor.
     * @param IDb $db
     * @throws \Exception
     */
    public function __construct(IDb $db)
    {
        $this->_db = $db;
        if (empty(static::$_table)) {
            throw new \Exception('Table name must be set!');
        }

        if (empty(static::$_fieldsMapping)) {
            throw new \Exception('ORM field mapping must be set!');
        }
    }

    /**
     * Save instance to db
     * @return bool success
     */
    public function save()
    {
        $id = $this->getId();
        if (empty($id)) {
            $result = $this->_create();
        } else {
            $instance = $this->_db->table(static::$_table)->findOne($id);
            $result = ($instance ? $this->_save($instance) : $this->_create());
        }

        // external relations, just call serializer
        // Need to invoke this after save to ensure current entity has an id
        $fieldsTransform = $this->_getFieldsTransforms();
        foreach (static::$_fieldsMapping as $dst => $src) {
            if (strpos($dst, EXTERNAL_RELATION_MARKER) === 0) {
                call_user_func($fieldsTransform[$src]['serialize'], $this->$src);
            }
        }

        return $result;
    }

    /**
     * Update instance in db
     * @param ORM $instance
     * @return bool
     */
    protected function _save(ORM $instance)
    {
        $fieldsTransform = $this->_getFieldsTransforms();

        foreach (static::$_fieldsMapping as $dst => $src) {
            if (strpos($dst, EXTERNAL_RELATION_MARKER) === 0) {
                continue;
            }

            $val = empty($fieldsTransform[$src]['serialize'])
                ? $this->$src
                : call_user_func($fieldsTransform[$src]['serialize'], $this->$src);

            if ($dst === 'id' && empty($val)) {
                // Do not set NULL id, postgres does not like it
                continue;
            }

            $instance->set($dst, $val);
        }

        return $instance->save();
    }

    /**
     * Delete item from DB
     * @return Primitive
     */
    public function drop()
    {
        $success = $this->_db->table(static::$_table)
            ->findOne($this->getId())
            ->delete();

        if ($success) {
            $this->_deident();
        }

        return $this;
    }

    /**
     * Create instance to db
     * @return mixed
     */
    abstract protected function _create();

    abstract public function getId();

    /**
     * Remove identifier from primitive
     * Used for deletion
     * @return void
     */
    abstract protected function _deident();

    /**
     * @overrideMe
     * @return array
     */
    protected function _getFieldsTransforms()
    {
        return [];
    }

    /**
     * @param $data
     * @return $this
     */
    protected function _restore(array $data)
    {
        $fieldsTransform = $this->_getFieldsTransforms();

        foreach (static::$_fieldsMapping as $src => $dst) {
            $this->$dst = empty($fieldsTransform[$dst]['deserialize'])
                ? empty($data[$src]) ? '' : $data[$src]
                : call_user_func(
                    $fieldsTransform[$dst]['deserialize'],
                    empty($data[$src]) ? '' : $data[$src]
                );
        }

        return $this;
    }

    protected static function _recreateInstance(IDb $db, $data)
    {
        /** @var Primitive $instance */
        $instance = new static($db);
        return $instance->_restore($data);
    }

    /**
     * Find items by indexed search
     *
     * @param IDb $db
     * @param string $key
     * @param array $identifiers
     * @throws \Exception
     * @return static[]
     */
    protected static function _findBy(IDb $db, $key, $identifiers)
    {
        if (!is_array($identifiers)) {
            throw new \Exception("Identifiers should be an array in search by $key");
        }

        if (empty($identifiers)) {
            return [];
        }

        $result = $db->table(static::$_table)->whereIn($key, $identifiers)->findArray();
        if (empty($result)) {
            return [];
        }

        return array_map(function ($data) use ($db) {
            return self::_recreateInstance($db, $data);
        }, $result);
    }

    /**
     * @param IDb $db
     * @return Primitive[]
     */
    public static function findAll(IDb $db)
    {
        $result = $db->table(static::$_table)->findArray();
        if (empty($result)) {
            return [];
        }

        return array_map(function ($data) use ($db) {
            return self::_recreateInstance($db, $data);
        }, $result);
    }

    /**
     * Find items by indexed search by several fields
     *
     * @param IDb $db
     * @param array $conditions
     * @param array $params
     *      $params.onlyLast => return only last item (when sorted by primary key)
     *      $params.limit    => return no more items than this value
     *      $params.offset   => return items starting at this index
     *      $params.order    => asc or desc
     *      $params.orderBy  => field name for results ordering
     * @throws \Exception
     * @return Primitive|Primitive[]
     */
    protected static function _findBySeveral(IDb $db, $conditions, $params = [])
    {
        if (!is_array($conditions)) {
            throw new \Exception("Conditions should be assoc array: key => [values...]");
        }

        $orm = $db->table(static::$_table);
        foreach ($conditions as $key => $identifiers) {
            $orm = $orm->whereIn($key, $identifiers);
        }

        if (!empty($params['limit'])) {
            $orm->limit(abs(intval($params['limit'])));
        }

        if (!empty($params['offset'])) {
            $orm->offset(abs(intval($params['offset'])));
        }

        if (!empty($params['onlyLast'])) {
            $orm = $orm->orderByDesc('id'); // primary key
            $item = $orm->findOne();
            if (!empty($item)) {
                $item = $item->asArray();
            } else {
                return [];
            }
            return self::_recreateInstance($db, $item);
        }

        if (!empty($params['order']) && !empty($params['orderBy'])) {
            $orderBy = $params['orderBy'];
            if ($params['order'] == 'desc') {
                $orm = $orm->orderByDesc($orderBy);
            } else if ($params['order'] == 'asc') {
                $orm = $orm->orderByAsc($orderBy);
            }
        }

        $result = $orm->findArray();
        if (empty($result)) {
            return [];
        }

        return array_map(function ($data) use ($db) {
            return self::_recreateInstance($db, $data);
        }, $result);
    }
}
