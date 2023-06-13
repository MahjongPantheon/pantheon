<?php
namespace Hugin;

interface IDb
{
    /**
     * @param string $tableName
     * @return \Idiorm\ORM
     */
    public function table(string $tableName);

    /**
     * @return int
     */
    public function lastInsertId();

    /**
     * @param string $table
     * @param array $data [ [ field => value, field2 => value2 ], [ ... ] ] - nested arrays should be monomorphic
     * @param string[] $tableUniqueField Names of unique constraint to check
     * @return boolean
     */
    public function upsertQuery(string $table, array $data, array $tableUniqueField);

    /**
     * @return mixed
     */
    public function debug();

    /**
     * @param string $query
     * @param array $params
     * @return mixed
     */
    public function rawExec(string $query, $params = []);
}
