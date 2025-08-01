<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/mimir.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.EventsGetPrescriptedEventConfigResponse</code>
 */
class EventsGetPrescriptedEventConfigResponse extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>int32 event_id = 1;</code>
     */
    protected $event_id = 0;
    /**
     * Generated from protobuf field <code>int32 next_session_index = 2;</code>
     */
    protected $next_session_index = 0;
    /**
     * Generated from protobuf field <code>optional string prescript = 3;</code>
     */
    protected $prescript = null;
    /**
     * Generated from protobuf field <code>repeated string errors = 4;</code>
     */
    private $errors;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type int $event_id
     *     @type int $next_session_index
     *     @type string $prescript
     *     @type array<string>|\Google\Protobuf\Internal\RepeatedField $errors
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
     * Generated from protobuf field <code>int32 next_session_index = 2;</code>
     * @return int
     */
    public function getNextSessionIndex()
    {
        return $this->next_session_index;
    }

    /**
     * Generated from protobuf field <code>int32 next_session_index = 2;</code>
     * @param int $var
     * @return $this
     */
    public function setNextSessionIndex($var)
    {
        GPBUtil::checkInt32($var);
        $this->next_session_index = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>optional string prescript = 3;</code>
     * @return string
     */
    public function getPrescript()
    {
        return isset($this->prescript) ? $this->prescript : '';
    }

    public function hasPrescript()
    {
        return isset($this->prescript);
    }

    public function clearPrescript()
    {
        unset($this->prescript);
    }

    /**
     * Generated from protobuf field <code>optional string prescript = 3;</code>
     * @param string $var
     * @return $this
     */
    public function setPrescript($var)
    {
        GPBUtil::checkString($var, True);
        $this->prescript = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>repeated string errors = 4;</code>
     * @return \Google\Protobuf\Internal\RepeatedField
     */
    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * Generated from protobuf field <code>repeated string errors = 4;</code>
     * @param array<string>|\Google\Protobuf\Internal\RepeatedField $var
     * @return $this
     */
    public function setErrors($var)
    {
        $arr = GPBUtil::checkRepeatedField($var, \Google\Protobuf\Internal\GPBType::STRING);
        $this->errors = $arr;

        return $this;
    }

}

