<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: proto/frey.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.AccessUpdateRuleForPersonPayload</code>
 */
class AccessUpdateRuleForPersonPayload extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>int32 rule_id = 1;</code>
     */
    protected $rule_id = 0;
    /**
     * Generated from protobuf field <code>.common.RuleValue rule_value = 2;</code>
     */
    protected $rule_value = null;
    /**
     * Generated from protobuf field <code>string rule_type = 3;</code>
     */
    protected $rule_type = '';

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type int $rule_id
     *     @type \Common\RuleValue $rule_value
     *     @type string $rule_type
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Frey::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>int32 rule_id = 1;</code>
     * @return int
     */
    public function getRuleId()
    {
        return $this->rule_id;
    }

    /**
     * Generated from protobuf field <code>int32 rule_id = 1;</code>
     * @param int $var
     * @return $this
     */
    public function setRuleId($var)
    {
        GPBUtil::checkInt32($var);
        $this->rule_id = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>.common.RuleValue rule_value = 2;</code>
     * @return \Common\RuleValue|null
     */
    public function getRuleValue()
    {
        return $this->rule_value;
    }

    public function hasRuleValue()
    {
        return isset($this->rule_value);
    }

    public function clearRuleValue()
    {
        unset($this->rule_value);
    }

    /**
     * Generated from protobuf field <code>.common.RuleValue rule_value = 2;</code>
     * @param \Common\RuleValue $var
     * @return $this
     */
    public function setRuleValue($var)
    {
        GPBUtil::checkMessage($var, \Common\RuleValue::class);
        $this->rule_value = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string rule_type = 3;</code>
     * @return string
     */
    public function getRuleType()
    {
        return $this->rule_type;
    }

    /**
     * Generated from protobuf field <code>string rule_type = 3;</code>
     * @param string $var
     * @return $this
     */
    public function setRuleType($var)
    {
        GPBUtil::checkString($var, True);
        $this->rule_type = $var;

        return $this;
    }

}
