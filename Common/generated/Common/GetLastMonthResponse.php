<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: proto/hugin.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.GetLastMonthResponse</code>
 */
class GetLastMonthResponse extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>repeated .common.HuginData data = 1;</code>
     */
    private $data;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type array<\Common\HuginData>|\Google\Protobuf\Internal\RepeatedField $data
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Hugin::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>repeated .common.HuginData data = 1;</code>
     * @return \Google\Protobuf\Internal\RepeatedField
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Generated from protobuf field <code>repeated .common.HuginData data = 1;</code>
     * @param array<\Common\HuginData>|\Google\Protobuf\Internal\RepeatedField $var
     * @return $this
     */
    public function setData($var)
    {
        $arr = GPBUtil::checkRepeatedField($var, \Google\Protobuf\Internal\GPBType::MESSAGE, \Common\HuginData::class);
        $this->data = $arr;

        return $this;
    }

}
