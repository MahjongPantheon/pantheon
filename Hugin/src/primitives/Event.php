<?php
namespace Hugin;

require_once __DIR__ . '/../Primitive.php';

/**
 * Class EventPrimitive
 * Primitive for arbitrary analytics event
 *
 * Low-level model with basic CRUD operations and relations
 * @package Hugin
 */
class EventPrimitive extends Primitive
{
    protected static $_table = 'event';

    /**
     * Local id
     * @var int | null
     */
    protected $_id;
    /**
     * @var string
     */
    protected $_siteId;
    /**
     * @var string
     */
    protected $_sessionId;
    /**
     * @var string
     */
    protected $_hostname;
    /**
     * @var string
     */
    protected $_os;
    /**
     * @var string
     */
    protected $_device;
    /**
     * @var string
     */
    protected $_screen;
    /**
     * @var string
     */
    protected $_language;
    /**
     * @var string
     */
    protected $_createdAt;
    /**
     * @var string
     */
    protected $_eventType;
    /**
     * @var string
     */
    protected $_eventMeta;
    /**
     * @var string
     */
    protected $_country;
    /**
     * @var string
     */
    protected $_city;

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'site_id'       => '_siteId',
        'session_id'    => '_sessionId',
        'hostname'      => '_hostname',
        'os'            => '_os',
        'device'        => '_device',
        'screen'        => '_screen',
        'language'      => '_language',
        'created_at'    => '_createdAt',
        'event_type'    => '_eventType',
        'event_meta'    => '_eventMeta',
        'country'       => '_country',
        'city'          => '_city',
    ];

    protected function _create()
    {
        $ev = $this->_db->table(static::$_table)->create();
        $success = $this->_save($ev);
        if ($success) {
            $this->_id = $this->_db->lastInsertId();
        }

        return $success;
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    /**
     * @param IDb $db
     * @param int[] $ids
     *
     * @return EventPrimitive[]
     * @throws \Exception
     */
    public static function findById(IDb $db, array $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * @return int | null
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @return string
     */
    public function getSiteId(): string
    {
        return $this->_siteId;
    }

    /**
     * @param string $siteId
     * @return EventPrimitive
     */
    public function setSiteId(string $siteId): EventPrimitive
    {
        $this->_siteId = $siteId;
        return $this;
    }

    /**
     * @return string
     */
    public function getSessionId(): string
    {
        return $this->_sessionId;
    }

    /**
     * @param string $sessionId
     * @return EventPrimitive
     */
    public function setSessionId(string $sessionId): EventPrimitive
    {
        $this->_sessionId = $sessionId;
        return $this;
    }

    /**
     * @return string
     */
    public function getHostname(): string
    {
        return $this->_hostname;
    }

    /**
     * @param string $hostname
     * @return EventPrimitive
     */
    public function setHostname(string $hostname): EventPrimitive
    {
        $this->_hostname = $hostname;
        return $this;
    }

    /**
     * @return string
     */
    public function getOs(): string
    {
        return $this->_os;
    }

    /**
     * @param string $os
     * @return EventPrimitive
     */
    public function setOs(string $os): EventPrimitive
    {
        $this->_os = $os;
        return $this;
    }

    /**
     * @return string
     */
    public function getDevice(): string
    {
        return $this->_device;
    }

    /**
     * @param string $device
     * @return EventPrimitive
     */
    public function setDevice(string $device): EventPrimitive
    {
        $this->_device = $device;
        return $this;
    }

    /**
     * @return string
     */
    public function getScreen(): string
    {
        return $this->_screen;
    }

    /**
     * @param string $screen
     * @return EventPrimitive
     */
    public function setScreen(string $screen): EventPrimitive
    {
        $this->_screen = $screen;
        return $this;
    }

    /**
     * @return string
     */
    public function getLanguage(): string
    {
        return $this->_language;
    }

    /**
     * @param string $language
     * @return EventPrimitive
     */
    public function setLanguage(string $language): EventPrimitive
    {
        $this->_language = $language;
        return $this;
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
     * @return EventPrimitive
     */
    public function setCreatedAt(string $createdAt): EventPrimitive
    {
        $this->_createdAt = $createdAt;
        return $this;
    }

    /**
     * @return string
     */
    public function getEventType(): string
    {
        return $this->_eventType;
    }

    /**
     * @param string $eventType
     * @return EventPrimitive
     */
    public function setEventType(string $eventType): EventPrimitive
    {
        $this->_eventType = $eventType;
        return $this;
    }

    /**
     * @return string
     */
    public function getEventMeta(): string
    {
        return $this->_eventMeta;
    }

    /**
     * @param string $eventMeta
     * @return EventPrimitive
     */
    public function setEventMeta(string $eventMeta): EventPrimitive
    {
        $this->_eventMeta = $eventMeta;
        return $this;
    }

    /**
     * @return string
     */
    public function getCountry(): string
    {
        return $this->_country;
    }

    /**
     * @param string $country
     * @return EventPrimitive
     */
    public function setCountry(string $country): EventPrimitive
    {
        $this->_country = $country;
        return $this;
    }

    /**
     * @return string
     */
    public function getCity(): string
    {
        return $this->_city;
    }

    /**
     * @param string $city
     * @return EventPrimitive
     */
    public function setCity(string $city): EventPrimitive
    {
        $this->_city = $city;
        return $this;
    }
}
