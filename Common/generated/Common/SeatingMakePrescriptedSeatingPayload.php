<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/mimir.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.SeatingMakePrescriptedSeatingPayload</code>
 */
class SeatingMakePrescriptedSeatingPayload extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>int32 event_id = 1;</code>
     */
    protected $event_id = 0;
    /**
     * Generated from protobuf field <code>bool randomize_at_tables = 2;</code>
     */
    protected $randomize_at_tables = false;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type int $event_id
     *     @type bool $randomize_at_tables
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Mimir::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>int32 event_id = 1;</code>
     * @return int
     */
    public function getEventId()
    {
        return $this->event_id;
    }

    /**
     * Generated from protobuf field <code>int32 event_id = 1;</code>
     * @param int $var
     * @return $this
     */
    public function setEventId($var)
    {
        GPBUtil::checkInt32($var);
        $this->event_id = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>bool randomize_at_tables = 2;</code>
     * @return bool
     */
    public function getRandomizeAtTables()
    {
        return $this->randomize_at_tables;
    }

    /**
     * Generated from protobuf field <code>bool randomize_at_tables = 2;</code>
     * @param bool $var
     * @return $this
     */
    public function setRandomizeAtTables($var)
    {
        GPBUtil::checkBool($var);
        $this->randomize_at_tables = $var;

        return $this;
    }

}

