<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: proto/hugin.proto

namespace Common;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>common.HuginData</code>
 */
class HuginData extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>string datetime = 1;</code>
     */
    protected $datetime = '';
    /**
     * Generated from protobuf field <code>int32 event_count = 2;</code>
     */
    protected $event_count = 0;
    /**
     * Generated from protobuf field <code>int32 uniq_count = 3;</code>
     */
    protected $uniq_count = 0;
    /**
     * Generated from protobuf field <code>string site_id = 4;</code>
     */
    protected $site_id = '';
    /**
     * Generated from protobuf field <code>string country = 5;</code>
     */
    protected $country = '';
    /**
     * Generated from protobuf field <code>string city = 6;</code>
     */
    protected $city = '';
    /**
     * Generated from protobuf field <code>string browser = 7;</code>
     */
    protected $browser = '';
    /**
     * Generated from protobuf field <code>string os = 8;</code>
     */
    protected $os = '';
    /**
     * Generated from protobuf field <code>string device = 9;</code>
     */
    protected $device = '';
    /**
     * Generated from protobuf field <code>string screen = 10;</code>
     */
    protected $screen = '';
    /**
     * Generated from protobuf field <code>string language = 11;</code>
     */
    protected $language = '';
    /**
     * Generated from protobuf field <code>string event_type = 12;</code>
     */
    protected $event_type = '';
    /**
     * Generated from protobuf field <code>string hostname = 13;</code>
     */
    protected $hostname = '';

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type string $datetime
     *     @type int $event_count
     *     @type int $uniq_count
     *     @type string $site_id
     *     @type string $country
     *     @type string $city
     *     @type string $browser
     *     @type string $os
     *     @type string $device
     *     @type string $screen
     *     @type string $language
     *     @type string $event_type
     *     @type string $hostname
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Proto\Hugin::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>string datetime = 1;</code>
     * @return string
     */
    public function getDatetime()
    {
        return $this->datetime;
    }

    /**
     * Generated from protobuf field <code>string datetime = 1;</code>
     * @param string $var
     * @return $this
     */
    public function setDatetime($var)
    {
        GPBUtil::checkString($var, True);
        $this->datetime = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 event_count = 2;</code>
     * @return int
     */
    public function getEventCount()
    {
        return $this->event_count;
    }

    /**
     * Generated from protobuf field <code>int32 event_count = 2;</code>
     * @param int $var
     * @return $this
     */
    public function setEventCount($var)
    {
        GPBUtil::checkInt32($var);
        $this->event_count = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>int32 uniq_count = 3;</code>
     * @return int
     */
    public function getUniqCount()
    {
        return $this->uniq_count;
    }

    /**
     * Generated from protobuf field <code>int32 uniq_count = 3;</code>
     * @param int $var
     * @return $this
     */
    public function setUniqCount($var)
    {
        GPBUtil::checkInt32($var);
        $this->uniq_count = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string site_id = 4;</code>
     * @return string
     */
    public function getSiteId()
    {
        return $this->site_id;
    }

    /**
     * Generated from protobuf field <code>string site_id = 4;</code>
     * @param string $var
     * @return $this
     */
    public function setSiteId($var)
    {
        GPBUtil::checkString($var, True);
        $this->site_id = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string country = 5;</code>
     * @return string
     */
    public function getCountry()
    {
        return $this->country;
    }

    /**
     * Generated from protobuf field <code>string country = 5;</code>
     * @param string $var
     * @return $this
     */
    public function setCountry($var)
    {
        GPBUtil::checkString($var, True);
        $this->country = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string city = 6;</code>
     * @return string
     */
    public function getCity()
    {
        return $this->city;
    }

    /**
     * Generated from protobuf field <code>string city = 6;</code>
     * @param string $var
     * @return $this
     */
    public function setCity($var)
    {
        GPBUtil::checkString($var, True);
        $this->city = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string browser = 7;</code>
     * @return string
     */
    public function getBrowser()
    {
        return $this->browser;
    }

    /**
     * Generated from protobuf field <code>string browser = 7;</code>
     * @param string $var
     * @return $this
     */
    public function setBrowser($var)
    {
        GPBUtil::checkString($var, True);
        $this->browser = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string os = 8;</code>
     * @return string
     */
    public function getOs()
    {
        return $this->os;
    }

    /**
     * Generated from protobuf field <code>string os = 8;</code>
     * @param string $var
     * @return $this
     */
    public function setOs($var)
    {
        GPBUtil::checkString($var, True);
        $this->os = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string device = 9;</code>
     * @return string
     */
    public function getDevice()
    {
        return $this->device;
    }

    /**
     * Generated from protobuf field <code>string device = 9;</code>
     * @param string $var
     * @return $this
     */
    public function setDevice($var)
    {
        GPBUtil::checkString($var, True);
        $this->device = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string screen = 10;</code>
     * @return string
     */
    public function getScreen()
    {
        return $this->screen;
    }

    /**
     * Generated from protobuf field <code>string screen = 10;</code>
     * @param string $var
     * @return $this
     */
    public function setScreen($var)
    {
        GPBUtil::checkString($var, True);
        $this->screen = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string language = 11;</code>
     * @return string
     */
    public function getLanguage()
    {
        return $this->language;
    }

    /**
     * Generated from protobuf field <code>string language = 11;</code>
     * @param string $var
     * @return $this
     */
    public function setLanguage($var)
    {
        GPBUtil::checkString($var, True);
        $this->language = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string event_type = 12;</code>
     * @return string
     */
    public function getEventType()
    {
        return $this->event_type;
    }

    /**
     * Generated from protobuf field <code>string event_type = 12;</code>
     * @param string $var
     * @return $this
     */
    public function setEventType($var)
    {
        GPBUtil::checkString($var, True);
        $this->event_type = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string hostname = 13;</code>
     * @return string
     */
    public function getHostname()
    {
        return $this->hostname;
    }

    /**
     * Generated from protobuf field <code>string hostname = 13;</code>
     * @param string $var
     * @return $this
     */
    public function setHostname($var)
    {
        GPBUtil::checkString($var, True);
        $this->hostname = $var;

        return $this;
    }

}

