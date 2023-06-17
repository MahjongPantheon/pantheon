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
     * @var string|null
     */
    protected $_hostname;
    /**
     * @var string|null
     */
    protected $_browser;
    /**
     * @var string|null
     */
    protected $_os;
    /**
     * @var string|null
     */
    protected $_device;
    /**
     * @var string|null
     */
    protected $_screen;
    /**
     * @var string|null
     */
    protected $_language;
    /**
     * @var string|null
     */
    protected $_createdAt;
    /**
     * @var string|null
     */
    protected $_eventType;
    /**
     * @var string|null
     */
    protected $_eventMeta;
    /**
     * @var string|null
     */
    protected $_country;
    /**
     * @var string|null
     */
    protected $_city;

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'site_id'       => '_siteId',
        'session_id'    => '_sessionId',
        'hostname'      => '_hostname',
        'browser'       => '_browser',
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
     * @return string|null
     */
    public function getHostname(): ?string
    {
        return $this->_hostname;
    }

    /**
     * @param string|null $hostname
     * @return EventPrimitive
     */
    public function setHostname(?string $hostname): EventPrimitive
    {
        $this->_hostname = $hostname;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getBrowser(): ?string
    {
        return $this->_browser;
    }

    /**
     * @param string|null $browser
     * @return EventPrimitive
     */
    public function setBrowser(?string $browser): EventPrimitive
    {
        $this->_browser = $browser;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getOs(): ?string
    {
        return $this->_os;
    }

    /**
     * @param string|null $os
     * @return EventPrimitive
     */
    public function setOs(?string $os): EventPrimitive
    {
        $this->_os = $os;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getDevice(): ?string
    {
        return $this->_device;
    }

    /**
     * @param string|null $device
     * @return EventPrimitive
     */
    public function setDevice(?string $device): EventPrimitive
    {
        $this->_device = $device;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getScreen(): ?string
    {
        return $this->_screen;
    }

    /**
     * @param string|null $screen
     * @return EventPrimitive
     */
    public function setScreen(?string $screen): EventPrimitive
    {
        $this->_screen = $screen;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getLanguage(): ?string
    {
        return $this->_language;
    }

    /**
     * @param string|null $language
     * @return EventPrimitive
     */
    public function setLanguage(?string $language): EventPrimitive
    {
        $this->_language = $language;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCreatedAt(): ?string
    {
        return $this->_createdAt;
    }

    /**
     * @param string|null $createdAt
     * @return EventPrimitive
     */
    public function setCreatedAt(?string $createdAt): EventPrimitive
    {
        $this->_createdAt = $createdAt;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getEventType(): ?string
    {
        return $this->_eventType;
    }

    /**
     * @param string|null $eventType
     * @return EventPrimitive
     */
    public function setEventType(?string $eventType): EventPrimitive
    {
        $this->_eventType = $eventType;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getEventMeta(): ?string
    {
        return $this->_eventMeta;
    }

    /**
     * @param string|null $eventMeta
     * @return EventPrimitive
     */
    public function setEventMeta(?string $eventMeta): EventPrimitive
    {
        $this->_eventMeta = $eventMeta;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCountry(): ?string
    {
        return $this->_country;
    }

    /**
     * @param string|null $country
     * @return EventPrimitive
     */
    public function setCountry(?string $country): EventPrimitive
    {
        $this->_country = $country;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCity(): ?string
    {
        return $this->_city;
    }

    /**
     * @param string|null $city
     * @return EventPrimitive
     */
    public function setCity(?string $city): EventPrimitive
    {
        $this->_city = $city;
        return $this;
    }
}
