<?php
namespace Rheda;

class Config
{
    protected $_allowedYaku = [];
    protected $_startPoints = 0;
    protected $_goalPoints = 0;
    protected $_subtractStartPoints = false;
    protected $_withKazoe = false;
    protected $_withKiriageMangan = false;
    protected $_withAbortives = false;
    protected $_withNagashiMangan = false;
    protected $_withAtamahane = false;
    protected $_rulesetTitle = '';
    protected $_tenboDivider = 1;
    protected $_ratingDivider = 1;
    protected $_tonpuusen = false;
    protected $_startRating = 0;
    protected $_riichiGoesToWinner = false;
    protected $_extraChomboPayments = false;
    protected $_chomboPenalty = 0;
    protected $_withKuitan = false;
    protected $_withButtobi = false;
    protected $_withMultiYakumans = false;
    protected $_gameExpirationTime = 0;
    protected $_minPenalty = 0;
    protected $_maxPenalty = 0;
    protected $_penaltyStep = 0;
    protected $_eventTitle = '';
    protected $_eventDescription = '';
    protected $_eventStatHost = '';
    protected $_redZone = 0;
    protected $_yellowZone = 0;
    protected $_timerPolicy = 'none';
    protected $_autoSeating = false;
    protected $_isOnline = false;
    protected $_isTeam = false;
    protected $_gameDuration = 0;
    protected $_withLeadingDealerGameover = false;
    protected $_isTextlog = false;
    protected $_syncStart = false;
    protected $_syncEnd = false;
    protected $_sortByGames = false;
    protected $_allowPlayerAppend = false;
    protected $_useTimer = false;
    protected $_usePenalty = false;
    protected $_seriesLength = 0;
    protected $_minGamesCount = 0;
    protected $_gamesStatus = false;
    protected $_hideResults = false;
    protected $_hideAddReplayButton = false;
    protected $_isPrescripted = false;

    public static function getRuleDescriptions()
    {
        return [
            'allowedYaku' => _t('Allowed yaku'),
            'startPoints' => _t('Points to start with'),
            'goalPoints' => _t('Points to end game'),
            'playAdditionalRounds' => _t('Play additional rounds'),
            'subtractStartPoints' => _t('If start points should be subtracted from result'),
            'withKazoe' => _t('If kazoe should be yakuman, not sanbaiman'),
            'withKiriageMangan' => _t('If 4/30 and 3/60 should be rounded to mangan'),
            'withAbortives' => _t('If abortive draws are allowed'),
            'withNagashiMangan' => _t('If nagashi mangan is allowed'),
            'withAtamahane' => _t('If atamahane is enabled'),
            'rulesetTitle' => _t('Basic ruleset name'),
            'tenboDivider' => null, // not intended to be shown in rule overview
            'ratingDivider' => null, // not intended to be shown in rule overview
            'tonpuusen' => _t('If games have east rounds only'),
            'startRating' => _t('Rating initial points amount'),
            'riichiGoesToWinner' => _t('If riichi bets left on the table go to winner of the hanchan'),
            'extraChomboPayments' => _t('If chombo should be payed in points'),
            'chomboPenalty' => _t('Chombo penalty in rating points'),
            'withKuitan' => _t('If tanyao in open hand is allowed'),
            'withButtobi' => _t('If game ends when any player goes bankrupt'),
            'withMultiYakumans' => _t('If multiple yakumans are enabled'),
            'gameExpirationTime' => null, // not intended to be shown in rule overview
            'minPenalty' => _t('Minimal arbitrary penalty amount'),
            'maxPenalty' => _t('Maximal arbitrary penalty amount'),
            'penaltyStep' => _t('Step of penalty amounts'),
            'eventTitle' => null, // not intended to be shown in rule overview
            'eventDescription' => null, // not intended to be shown in rule overview
            'eventStatHost' => null, // not intended to be shown in rule overview
            'redZone' => _t('Red zone duration'),
            'yellowZone' => _t('Yellow zone duration'),
            'timerPolicy' => _t('Timer policy'),
            'autoSeating' => _t('If automatic seating is allowed'),
            'isOnline' => _t('If event is online'),
            'isTeam' => _t('Team event'),
            'gameDuration' => _t('Game duration in minutes'),
            'withLeadingDealerGameover' => _t('If game ends when leading dealer wins in last round'),
            'isTextlog' => null, // not intended to be shown in rule overview
            'syncStart' => _t('If all the games should be started simultaneously (tournament mode)'),
            'syncEnd' => _t('If all the games should be finished simultaneously (tournament mode)'),
            'sortByGames' => _t('If rating table should first be sorted by number of games played'),
            'allowPlayerAppend' => _t('If new players are allowed to join in the middle of event'),
            'useTimer' => _t('If timer should be used'),
            'usePenalty' => _t('If arbitrary penalties are enabled'),
            'seriesLength' => _t('If game series are enabled'),
            'gamesStatus' => null, // not intended to be shown in rule overview
            'hideResults' => null, // not intended to be shown in rule overview
            'hideAddReplayButton' => null, // not intended to be shown in rule overview
            'isPrescripted' => _t('If seating for all games is entered in advance')
        ];
    }

    public static function fromRaw($arr)
    {
        $cfg = new self();
        foreach ($arr as $k => $v) {
            $k = '_' . $k;
            if (!isset($cfg->{$k})) {
                continue;
            }

            $cfg->{$k} = $v;
        }

        return $cfg;
    }

    /**
     * @return array
     */
    public function toArray()
    {
        $arr = [];
        foreach ($this as $k => $v) {
            $arr[substr($k, 1)] = $v;
        }

        return $arr;
    }

    /**
     * @return array
     */
    public function allowedYaku()
    {
        return $this->_allowedYaku;
    }
    /**
     * @return int
     */
    public function startPoints()
    {
        return $this->_startPoints;
    }
    /**
     * @return int
     */
    public function goalPoints()
    {
        return $this->_goalPoints;
    }
    /**
     * @return bool
     */
    public function subtractStartPoints()
    {
        return $this->_subtractStartPoints;
    }
    /**
     * @return bool
     */
    public function withKazoe()
    {
        return $this->_withKazoe;
    }
    /**
     * @return bool
     */
    public function withKiriageMangan()
    {
        return $this->_withKiriageMangan;
    }
    /**
     * @return bool
     */
    public function withAbortives()
    {
        return $this->_withAbortives;
    }
    /**
     * @return bool
     */
    public function withNagashiMangan()
    {
        return $this->_withNagashiMangan;
    }
    /**
     * @return bool
     */
    public function withAtamahane()
    {
        return $this->_withAtamahane;
    }
    /**
     * @return string
     */
    public function rulesetTitle()
    {
        return $this->_rulesetTitle;
    }
    /**
     * @return int
     */
    public function tenboDivider()
    {
        return $this->_tenboDivider;
    }
    /**
     * @return int
     */
    public function ratingDivider()
    {
        return $this->_ratingDivider;
    }
    /**
     * @return bool
     */
    public function tonpuusen()
    {
        return $this->_tonpuusen;
    }
    /**
     * @return int
     */
    public function startRating()
    {
        return $this->_startRating;
    }
    /**
     * @return bool
     */
    public function riichiGoesToWinner()
    {
        return $this->_riichiGoesToWinner;
    }
    /**
     * @return bool
     */
    public function extraChomboPayments()
    {
        return $this->_extraChomboPayments;
    }
    /**
     * @return int
     */
    public function chomboPenalty()
    {
        return $this->_chomboPenalty;
    }
    /**
     * @return bool
     */
    public function withKuitan()
    {
        return $this->_withKuitan;
    }
    /**
     * @return bool
     */
    public function withButtobi()
    {
        return $this->_withButtobi;
    }
    /**
     * @return bool
     */
    public function withMultiYakumans()
    {
        return $this->_withMultiYakumans;
    }
    /**
     * @return int
     */
    public function gameExpirationTime()
    {
        return $this->_gameExpirationTime;
    }
    /**
     * @return int
     */
    public function minPenalty()
    {
        return $this->_minPenalty;
    }
    /**
     * @return int
     */
    public function maxPenalty()
    {
        return $this->_maxPenalty;
    }
    /**
     * @return int
     */
    public function penaltyStep()
    {
        return $this->_penaltyStep;
    }
    /**
     * @return string
     */
    public function eventTitle()
    {
        return $this->_eventTitle;
    }
    /**
     * @return string
     */
    public function eventDescription()
    {
        return $this->_eventDescription;
    }
    /**
     * @return string
     */
    public function eventStatHost()
    {
        return $this->_eventStatHost;
    }
    /**
     * @return int
     */
    public function redZone()
    {
        return $this->_redZone;
    }
    /**
     * @return int
     */
    public function yellowZone()
    {
        return $this->_yellowZone;
    }
    /**
     * @return string
     */
    public function timerPolicy()
    {
        return $this->_timerPolicy;
    }
    /**
     * @return int
     */
    public function gameDuration()
    {
        return $this->_gameDuration;
    }
    /**
     * @return bool
     */
    public function autoSeating()
    {
        return $this->_autoSeating;
    }
    /**
     * @return bool
     */
    public function isOnline()
    {
        return $this->_isOnline;
    }
    /**
     * @return bool
     */
    public function isTeam()
    {
        return $this->_isTeam;
    }
    /**
     * @return bool
     */
    public function withLeadingDealerGameover()
    {
        return $this->_withLeadingDealerGameover;
    }
    /**
     * @return bool
     */
    public function isTextlog()
    {
        return $this->_isTextlog;
    }
    /**
     * @return bool
     */
    public function syncStart()
    {
        return $this->_syncStart;
    }
    /**
     * @return bool
     */
    public function syncEnd()
    {
        return $this->_syncEnd;
    }
    /**
     * @return bool
     */
    public function sortByGames()
    {
        return $this->_sortByGames;
    }
    /**
     * @return bool
     */
    public function allowPlayerAppend()
    {
        return $this->_allowPlayerAppend;
    }
    /**
     * @return bool
     */
    public function useTimer()
    {
        return $this->_useTimer;
    }
    /**
     * @return bool
     */
    public function usePenalty()
    {
        return $this->_usePenalty;
    }
    /**
     * @return int
     */
    public function seriesLength()
    {
        return $this->_seriesLength;
    }
    /**
     * @return int
     */
    public function minGamesCount()
    {
        return $this->_minGamesCount;
    }
    /**
     * @return bool
     */
    public function gamesWaitingForTimer()
    {
        return ($this->_gamesStatus == 'seating_ready');
    }
    /**
     * @return bool
     */
    public function hideResults()
    {
        return $this->_hideResults;
    }
    /**
     * @return bool
     */
    public function hideAddReplayButton()
    {
        return $this->_hideAddReplayButton;
    }

    /**
     * @return bool
     */
    public function isPrescripted()
    {
        return $this->_isPrescripted;
    }
}
