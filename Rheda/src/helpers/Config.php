<?php
namespace Rheda;

class Config
{
    /**
     * @var array
     */
    protected $_allowedYaku = [];
    /**
     * @var int
     */
    protected $_startPoints = 0;
    /**
     * @var int
     */
    protected $_goalPoints = 0;
    /**
     * @var bool
     */
    protected $_playAdditionalRounds = false;
    /**
     * @var bool
     */
    protected $_subtractStartPoints = false;
    /**
     * @var bool
     */
    protected $_withKazoe = false;
    /**
     * @var bool
     */
    protected $_withKiriageMangan = false;
    /**
     * @var bool
     */
    protected $_withAbortives = false;
    /**
     * @var bool
     */
    protected $_withNagashiMangan = false;
    /**
     * @var bool
     */
    protected $_withAtamahane = false;
    /**
     * @var string
     */
    protected $_rulesetTitle = '';
    /**
     * @var int
     */
    protected $_tenboDivider = 1;
    /**
     * @var int
     */
    protected $_ratingDivider = 1;
    /**
     * @var bool
     */
    protected $_tonpuusen = false;
    /**
     * @var int
     */
    protected $_startRating = 0;
    /**
     * @var bool
     */
    protected $_riichiGoesToWinner = false;
    /**
     * @var bool
     */
    protected $_extraChomboPayments = false;
    /**
     * @var int
     */
    protected $_chomboPenalty = 0;
    /**
     * @var bool
     */
    protected $_withKuitan = false;
    /**
     * @var bool
     */
    protected $_withButtobi = false;
    /**
     * @var bool
     */
    protected $_withMultiYakumans = false;
    /**
     * @var int
     */
    protected $_gameExpirationTime = 0;
    /**
     * @var int
     */
    protected $_minPenalty = 0;
    /**
     * @var int
     */
    protected $_maxPenalty = 0;
    /**
     * @var int
     */
    protected $_penaltyStep = 0;
    /**
     * @var string
     */
    protected $_eventTitle = '';
    /**
     * @var string
     */
    protected $_eventDescription = '';
    /**
     * @var string
     */
    protected $_eventStatHost = '';
    /**
     * @var int
     */
    protected $_redZone = 0;
    /**
     * @var int
     */
    protected $_yellowZone = 0;
    /**
     * @var string
     */
    protected $_timerPolicy = 'none';
    /**
     * @var bool
     */
    protected $_autoSeating = false;
    /**
     * @var bool
     */
    protected $_isOnline = false;
    /**
     * @var bool
     */
    protected $_isTeam = false;
    /**
     * @var int
     */
    protected $_gameDuration = 0;
    /**
     * @var bool
     */
    protected $_withLeadingDealerGameover = false;
    /**
     * @var bool
     */
    protected $_isTextlog = false;
    /**
     * @var bool
     */
    protected $_syncStart = false;
    /**
     * @var bool
     */
    protected $_syncEnd = false;
    /**
     * @var bool
     */
    protected $_sortByGames = false;
    /**
     * @var bool
     */
    protected $_allowPlayerAppend = false;
    /**
     * @var bool
     */
    protected $_useTimer = false;
    /**
     * @var bool
     */
    protected $_usePenalty = false;
    /**
     * @var int
     */
    protected $_seriesLength = 0;
    /**
     * @var int
     */
    protected $_minGamesCount = 0;
    /**
     * @var bool
     */
    protected $_gamesStatus = false;
    /**
     * @var bool
     */
    protected $_hideResults = false;
    /**
     * @var bool
     */
    protected $_hideAddReplayButton = false;
    /**
     * @var bool
     */
    protected $_isPrescripted = false;
    /**
     * @var int
     */
    protected $_chipsValue = 0;
    /**
     * @var bool
     */
    protected $_isFinished = false;

    /**
     * @var array
     */
    public static $_blankRules = [
        'allowedYaku' => [],
        'startPoints' => 0,
        'subtractStartPoints' => false,
        'withKazoe' => false,
        'withKiriageMangan' => false,
        'withAbortives' => false,
        'withNagashiMangan' => false,
        'withAtamahane' => false,
        'rulesetTitle' => 'blank',
        'tenboDivider' => 1,
        'ratingDivider' => 1,
        'tonpuusen' => false,
        'startRating' => 0,
        'riichiGoesToWinner' => false,
        'extraChomboPayments' => false,
        'chomboPenalty' => 0,
        'withKuitan' => false,
        'withButtobi' => false,
        'withMultiYakumans' => false,
        'gameExpirationTime' => 0,
        'minPenalty' => 0,
        'maxPenalty' => 0,
        'penaltyStep' => 1,
        'eventTitle' => 'Rheda',
        'eventDescription' => '',
        'eventStatHost' => '',
        'redZone' => 0,
        'yellowZone' => 0,
        'timerPolicy' => 'none',
        'autoSeating' => false,
        'isOnline' => false,
        'gameDuration' => 0,
        'withLeadingDealerGameover' => false,
        'isTextlog' => false,
        'syncStart' => false,
        'syncEnd' => false,
        'sortByGames' => false,
        'allowPlayerAppend' => false,
        'useTimer' => false,
        'usePenalty' => false,
        'seriesLength' => 0,
        'gamesStatus' => false,
        'hideResults' => false,
        'hideAddReplayButton' => false,
        'isPrescripted' => false,
        'minGamesCount' => 0,
        'isFinished' => false,
    ];

    /**
     * @return array
     */
    public static function getRuleDescriptions(): array
    {
        return [
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
            'tonpuusen' => _t('If games have east rounds only'),
            'startRating' => _t('Rating initial points amount'),
            'riichiGoesToWinner' => _t('If riichi bets left on the table go to winner of the hanchan'),
            'extraChomboPayments' => _t('If chombo should be payed in points'),
            'chomboPenalty' => _t('Chombo penalty in rating points'),
            'withKuitan' => _t('If tanyao in open hand is allowed'),
            'withButtobi' => _t('If game ends when any player goes bankrupt'),
            'withMultiYakumans' => _t('If multiple yakumans are enabled'),
            'minPenalty' => _t('Minimal arbitrary penalty amount'),
            'maxPenalty' => _t('Maximal arbitrary penalty amount'),
            'penaltyStep' => _t('Step of penalty amounts'),
            'redZone' => _t('Red zone duration'),
            'yellowZone' => _t('Yellow zone duration'),
            'timerPolicy' => _t('Timer policy'),
            'autoSeating' => _t('If automatic seating is allowed'),
            'isOnline' => _t('If event is online'),
            'isTeam' => _t('Team event'),
            'gameDuration' => _t('Game duration in minutes'),
            'withLeadingDealerGameover' => _t('If game ends when leading dealer wins in last round'),
            'syncStart' => _t('If all the games should be started simultaneously (tournament mode)'),
            'syncEnd' => _t('If all the games should be finished simultaneously (tournament mode)'),
            'sortByGames' => _t('If rating table should first be sorted by number of games played'),
            'allowPlayerAppend' => _t('If new players are allowed to join in the middle of event'),
            'useTimer' => _t('If timer should be used'),
            'usePenalty' => _t('If arbitrary penalties are enabled'),
            'seriesLength' => _t('If game series are enabled'),
            'isPrescripted' => _t('If seating for all games is entered in advance'),
            'minGamesCount' => _t('Minimal amount of games to be played for passing to finals'),
            'chipsValue' => _t('Chips value')
        ];
    }

    /**
     * @param array $arr
     * @return self
     */
    public static function fromRaw($arr): self
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
        foreach ($this as $k => $v) { // @phpstan-ignore-line
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
    public function playAdditionalRounds()
    {
        return $this->_playAdditionalRounds;
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
    public function isFinished()
    {
        return $this->_isFinished;
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
     * @return int
     */
    public function chipsValue()
    {
        return $this->_chipsValue;
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
