var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import ReactDOMServer, { renderToString } from "react-dom/server";
import { Tooltip, Avatar, useMantineTheme, useMantineColorScheme, Container, Divider, Stack, Group, ActionIcon, Text, Space, Center, Pagination, Anchor, Badge, Loader, Alert, Button, Box, LoadingOverlay, List, rem, Accordion, Tabs, TextInput, NumberInput, Radio, Checkbox, SimpleGrid, Title, Menu, createStyles, Header, Modal, MantineProvider, ColorSchemeProvider, AppShell, Footer, createEmotionCache } from "@mantine/core";
import { useLocation, Switch, Route, Router } from "wouter";
import * as React from "react";
import { createContext, useContext, useState, useEffect, Fragment as Fragment$1, Suspense, useCallback } from "react";
import { TranslationController, TranslationProvider } from "i18n-dialect";
import { IconFriends, IconTournament, IconNetwork, IconExclamationCircle, IconDownload, IconSortDescending2, IconSortAscending2, IconCoins, IconChevronLeft, IconChevronRight, IconX, IconShare, IconAlarm, IconAward, IconAdjustments, IconListCheck, IconUsers, IconHourglass, IconChartHistogram, IconNumbers, IconUserX, IconClockPlay, IconArrowBadgeDownFilled, IconCash, IconTargetArrow, IconMountain, IconHandStop, IconList, IconAdjustmentsAlt, IconDeviceMobileShare, IconChevronDown, IconNotes, IconOlympics, IconChartBar, IconChartLine, IconArrowBarToUp, IconSun, IconMoonStars, IconLanguageHiragana } from "@tabler/icons-react";
import { BinaryWriter, BinaryReader } from "protoscript";
import { useRemarkSync } from "react-remark";
import strip from "strip-markdown";
import { nprogress, NavigationProgress } from "@mantine/nprogress";
import { PBrequest } from "twirpscript";
import debounce from "lodash.debounce";
import { Helmet } from "react-helmet";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import { crc32 } from "@foxglove/crc";
import staticLocationHook from "wouter/static-location";
import { JSDOM } from "jsdom";
import { createStylesServer } from "@mantine/ssr";
const meta = {
  projectIdVersion: "PROJECT VERSION",
  reportMsgidBugsTo: "",
  potCreationDate: "2023-06-07 09:55+0300",
  poRevisionDate: "2023-06-07 10:01+0300",
  languageTeam: "",
  language: "ru",
  mimeVersion: "1.0",
  contentType: "text/plain; charset=UTF-8",
  contentTransferEncoding: "8bit",
  pluralForms: "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<12 || n%100>14) ? 1 : 2);",
  generatedBy: "i18n-json2po"
};
const items = [
  {
    type: "plural",
    entry: [
      "%1 bet",
      "%1 bets"
    ],
    context: "Achievements badge",
    translations: [
      "%1 ставка",
      "%1 ставки",
      "%1 ставок"
    ]
  },
  {
    type: "plural",
    entry: [
      "%1 dora",
      "%1 dora"
    ],
    context: "Achievements badge",
    translations: [
      "%1 дора",
      "%1 доры",
      "%1 дор"
    ]
  },
  {
    type: "plural",
    entry: [
      "%1 feed",
      "%1 feeds"
    ],
    context: "Achievements badge",
    translations: [
      "%1 наброс",
      "%1 наброса",
      "%1 набросов"
    ]
  },
  {
    type: "single",
    entry: "%1 fu",
    context: "Achievements badge",
    translation: "%1 фу"
  },
  {
    type: "single",
    entry: "%1 han",
    translation: "%1 хан"
  },
  {
    type: "single",
    entry: "%1 han",
    context: "Achievements badge",
    translation: "%1 хан"
  },
  {
    type: "single",
    entry: "%1 han, %2 fu",
    translation: "%1 хан, %2 фу"
  },
  {
    type: "single",
    entry: "%1 han, %2 fu",
    context: "Achievements badge",
    translation: "%1 хан, %2 фу"
  },
  {
    type: "single",
    entry: "%1 ippatsu",
    context: "Achievements badge",
    translation: "%1 иппацу"
  },
  {
    type: "single",
    entry: "%1 points",
    context: "Achievements badge",
    translation: "%1 очков"
  },
  {
    type: "plural",
    entry: [
      "%1 quickest hand",
      "%1 quickest hands"
    ],
    context: "Achievements badge",
    translations: [
      "%1 самая быстрая рука",
      "%1 самых быстрых руки",
      "%1 самых быстрых рук"
    ]
  },
  {
    type: "plural",
    entry: [
      "%1 riichi bet",
      "%1 riichi bets"
    ],
    context: "Achievements badge",
    translations: [
      "%1 риичи палочка",
      "%1 риичи палочки",
      "%1 риичи палочек"
    ]
  },
  {
    type: "single",
    entry: "%1 tsumo",
    context: "Achievements badge",
    translation: "%1 цумо"
  },
  {
    type: "plural",
    entry: [
      "%1 win",
      "%1 wins"
    ],
    context: "Achievements badge",
    translations: [
      "%1 победа",
      "%1 победы",
      "%1 побед"
    ]
  },
  {
    type: "single",
    entry: "%1 yaku",
    context: "Achievements badge",
    translation: "%1 яку"
  },
  {
    type: "plural",
    entry: [
      "%1 yakuhai",
      "%1 yakuhais"
    ],
    context: "Achievements badge",
    translations: [
      "%1 якухай",
      "%1 якухая",
      "%1 якухаев"
    ]
  },
  {
    type: "single",
    entry: "%1: <b>%2</b> - %3 (<b>%4</b>), %5. Riichi bets: %6",
    context: "Ron log item",
    translation: "%1: <b>%2</b> - %3 (<b>%4</b>), %5. Ставки риичи: %6"
  },
  {
    type: "single",
    entry: "%1: <b>%2</b> - %3 (tsumo), %4. Riichi bets: %5",
    context: "Tsumo log item",
    translation: "%1: <b>%2</b> - %3 (цумо), %4. Ставки риичи: %5"
  },
  {
    type: "single",
    entry: "%1: Abortive draw. Riichi bets: %2",
    context: "Abortive draw log item",
    translation: "%1: Абортивная ничья. Ставки риичи: %2"
  },
  {
    type: "single",
    entry: "%1: Chombo (<b>%2</b>)",
    context: "Chombo log item",
    translation: "%1: Чомбо (<b>%2</b>)"
  },
  {
    type: "single",
    entry: "%1: Exhaustive draw (tenpai: %2). Riichi bets: %3",
    context: "Draw log item",
    translation: "%1: Ничья (темпай: %2). Ставки риичи: %3"
  },
  {
    type: "single",
    entry: "%1: Nagashi mangan (<b>%2</b>). Riichi bets: %3",
    context: "Nagashi log item",
    translation: "%1: Нагаши манган (<b>%2</b>). Ставки риичи: %3"
  },
  {
    type: "single",
    entry: "%1: Ron (<b>%2</b>). Riichi bets: %3",
    context: "Multiron outer log item",
    translation: "%1: Рон (<b>%2</b>). Ставки риичи: %3"
  },
  {
    type: "single",
    entry: "1 player with score less than starting",
    translation: "1 игрок в минусе"
  },
  {
    type: "single",
    entry: "13+ han hands are considered yakuman, not sanbaiman.",
    translation: "Руки стоимостью в 13+ хан считаются якуманом, а не санбайманом."
  },
  {
    type: "single",
    entry: "1st",
    translation: "1е"
  },
  {
    type: "single",
    entry: "1st place: ",
    translation: "1 место: "
  },
  {
    type: "single",
    entry: "2nd",
    translation: "2е"
  },
  {
    type: "single",
    entry: "2nd place: ",
    translation: "2 место: "
  },
  {
    type: "single",
    entry: "3 players with score less than starting",
    translation: "3 игрока в минусе"
  },
  {
    type: "single",
    entry: "3rd",
    translation: "3е"
  },
  {
    type: "single",
    entry: "3rd place: ",
    translation: "3 место: "
  },
  {
    type: "single",
    entry: "4th",
    translation: "4е"
  },
  {
    type: "single",
    entry: "4th place: ",
    translation: "4 место: "
  },
  {
    type: "single",
    entry: "<li><b>%1</b> - %2, %3</li>",
    context: "Multiron inner log item",
    translation: "<li><b>%1</b> - %2, %3</li>"
  },
  {
    type: "single",
    entry: "Achievements",
    translation: "Номинации"
  },
  {
    type: "single",
    entry: "Achievements",
    context: "Event menu",
    translation: "Номинации"
  },
  {
    type: "single",
    entry: "Achievements are not available for aggregated events",
    translation: "Для агрегированных событий номинации недоступны"
  },
  {
    type: "single",
    entry: "Add online game",
    translation: "Добавить онлайн-игру"
  },
  {
    type: "single",
    entry: "Add online game",
    context: "Event menu",
    translation: "Добавить онлайн-игру"
  },
  {
    type: "single",
    entry: "Add replay",
    translation: "Добавить игру"
  },
  {
    type: "single",
    entry: "Agariyame",
    translation: "Агарияме"
  },
  {
    type: "single",
    entry: "Aggregated event",
    translation: "Агрегированное событие"
  },
  {
    type: "single",
    entry: "All riichi bets on the table will be given to the first winner. If not checked, winning riichi bets will always be given back, lost bets would be given to the first winner.",
    translation: "Все ставки на столе будут выданы первому победителю по порядку хода. Если не отмечено, выигравшие риичи-ставки всегда будут возвращены победителям, первому победителю достанутся только не выигравшие ставки."
  },
  {
    type: "single",
    entry: "Allow abortive draws",
    translation: "Разрешить абортивные ничьи"
  },
  {
    type: "single",
    entry: "Allow bankruptcy",
    translation: "Банкротство"
  },
  {
    type: "single",
    entry: "Allow combination of yakumans, e.g. tsuuisou + daisangen",
    translation: "Разрешить комбинации якуманов, напр. цуисо + дайсанген"
  },
  {
    type: "single",
    entry: "Amount of chombo penalty",
    translation: "Размер штрафа чомбо"
  },
  {
    type: "single",
    entry: "Amount of penalty applied in the end of the session after uma bonus.",
    translation: "Количество очков, вычитаемое из очков игрока за каждый штраф чомбо после окончания игры."
  },
  {
    type: "single",
    entry: "Amount of points given for each chip. Chips should be set up in tournament settings in Tenhou.net.",
    translation: "Количество очков, которое выдается за каждый чип. Чипы должны быть настроены на Tenhou.net."
  },
  {
    type: "single",
    entry: "Amount of points given to every player in the beginning of every session",
    translation: "Количество игровых очков у каждого игрока в начале игры"
  },
  {
    type: "single",
    entry: "Amount of points given to player at 1st place",
    translation: "Количество бонусных очков за первое место в игре"
  },
  {
    type: "single",
    entry: "Amount of score player should get to end the game.",
    translation: "Количество очков, которое нужно набрать для завершения игры."
  },
  {
    type: "single",
    entry: "And your riichi bet, please",
    translation: "И Ваша риичи палочка"
  },
  {
    type: "single",
    entry: "Atamahane",
    translation: "Атамахане"
  },
  {
    type: "single",
    entry: "Average deal-in: ",
    translation: "Средняя величина наброса: "
  },
  {
    type: "single",
    entry: "Average dora per hand: ",
    translation: "Среднее количество дор в руке: "
  },
  {
    type: "single",
    entry: "Average place",
    translation: "Среднее место"
  },
  {
    type: "single",
    entry: "Average points",
    translation: "Средние очки"
  },
  {
    type: "single",
    entry: "Average points lost: ",
    translation: "Среднее число потерянных очков: "
  },
  {
    type: "single",
    entry: "Average score",
    translation: "Средние очки"
  },
  {
    type: "single",
    entry: "Average win score: ",
    translation: "Среднее число выигранных очков: "
  },
  {
    type: "single",
    entry: "Average: ",
    translation: "Среднее: "
  },
  {
    type: "single",
    entry: "Avg place:",
    translation: "Ср. место:"
  },
  {
    type: "single",
    entry: "Back to top",
    translation: "К началу"
  },
  {
    type: "single",
    entry: "Because of riichi: ",
    translation: "Из-за риичи: "
  },
  {
    type: "single",
    entry: "Best hand",
    translation: "Лучшая рука"
  },
  {
    type: "single",
    entry: "Best series",
    translation: "Лучшая серия"
  },
  {
    type: "single",
    entry: "Bets lost: ",
    translation: "Потерянных ставок: "
  },
  {
    type: "single",
    entry: "Bets won: ",
    translation: "Выигравших ставок: "
  },
  {
    type: "single",
    entry: "Brave minesweeper",
    translation: "Бравый сапёр"
  },
  {
    type: "single",
    entry: "By ron: ",
    translation: "По рон: "
  },
  {
    type: "single",
    entry: "By tsumo: ",
    translation: "По цумо: "
  },
  {
    type: "single",
    entry: "Careful planning",
    translation: "Точный расчет"
  },
  {
    type: "single",
    entry: "Chankan",
    translation: "Чанкан"
  },
  {
    type: "single",
    entry: "Chanta",
    translation: "Чанта"
  },
  {
    type: "single",
    entry: "Chihou",
    translation: "Чихо"
  },
  {
    type: "single",
    entry: "Chiitoitsu",
    translation: "Чиитойцу"
  },
  {
    type: "single",
    entry: "Chinitsu",
    translation: "Чиницу"
  },
  {
    type: "single",
    entry: "Chinroutou",
    translation: "Чинрото"
  },
  {
    type: "single",
    entry: "Chips",
    translation: "Чипы"
  },
  {
    type: "single",
    entry: "Chips value",
    translation: "Стоимость чипа"
  },
  {
    type: "single",
    entry: "Chombo penalties: ",
    translation: "Штрафов чомбо: "
  },
  {
    type: "single",
    entry: "Chombo: %1",
    translation: "Чомбо: %1"
  },
  {
    type: "single",
    entry: "Chuuren poutou",
    translation: "Чууренпото"
  },
  {
    type: "single",
    entry: "Close game preview",
    translation: "Закрыть предпросмотр"
  },
  {
    type: "single",
    entry: "Collect riichi bets by atamahane",
    translation: "Риичи по атамахане"
  },
  {
    type: "single",
    entry: "Common stats",
    translation: "Общая статистика"
  },
  {
    type: "single",
    entry: "Complex position-based",
    translation: "Сложный, на основе позиций всех игроков"
  },
  {
    type: "single",
    entry: "Couldn't get nomination details",
    translation: "Не удалось получить данные номинаций"
  },
  {
    type: "single",
    entry: "Count of session in game series.",
    translation: "Количество сессий в одной серии."
  },
  {
    type: "single",
    entry: "Daburu riichi",
    translation: "Дабл-риичи"
  },
  {
    type: "single",
    entry: "Daisangen",
    translation: "Дайсанген"
  },
  {
    type: "single",
    entry: "Daisuushii",
    translation: "Дайсуши"
  },
  {
    type: "single",
    entry: "Deal-ins to ron: ",
    translation: "Набросов в рон: "
  },
  {
    type: "single",
    entry: "Description",
    translation: "Описание"
  },
  {
    type: "single",
    entry: "Description",
    context: "Event menu",
    translation: "Описание"
  },
  {
    type: "single",
    entry: "Die Hard",
    translation: "Крепкий орешек"
  },
  {
    type: "single",
    entry: "Disable renchans",
    translation: "Выключить ренчаны"
  },
  {
    type: "single",
    entry: "Do not interrupt session until it ends",
    translation: "Не прерывать игру до тех пор, пока она не закончена"
  },
  {
    type: "single",
    entry: "Dora collected: ",
    translation: "Собрано дор: "
  },
  {
    type: "single",
    entry: "Dora lord",
    translation: "Повелитель дор"
  },
  {
    type: "single",
    entry: "Draw: %1",
    translation: "Ничья: %1"
  },
  {
    type: "single",
    entry: "Draws: ",
    translation: "Ничьих: "
  },
  {
    type: "single",
    entry: 'Enable "Nagashi" outcome to record this special draw',
    translation: 'Включить возможность записи исхода "Нагаши манган"'
  },
  {
    type: "single",
    entry: "Equalize uma",
    translation: "Выравнивание умы"
  },
  {
    type: "single",
    entry: "Event administrators: ",
    translation: "Администраторы события: "
  },
  {
    type: "single",
    entry: "Event contents",
    translation: "Данные события"
  },
  {
    type: "single",
    entry: "Event list",
    translation: "Список событий"
  },
  {
    type: "single",
    entry: "Events list",
    translation: "Список событий"
  },
  {
    type: "single",
    entry: "Final game score",
    translation: "Финальный счет игры"
  },
  {
    type: "single",
    entry: "Fixed amount of rank penalty applied for each replacement player regardless of session results.",
    translation: "Фиксированный ранговый бонус/штраф, выдаваемый независимо от результатов игры."
  },
  {
    type: "single",
    entry: "Fixed amount of result score applied for each replacement player regardless of session results.",
    translation: "Фиксированное число очков, применямое независимо от результатов игры."
  },
  {
    type: "single",
    entry: "Fixed score applied to replacement player",
    translation: "Фиксированное число итоговых очков у игрока замены"
  },
  {
    type: "single",
    entry: "Fixed uma for replacement player",
    translation: "Фиксированная ума для игрока замены"
  },
  {
    type: "single",
    entry: "Game duration",
    translation: "Длительность сессии"
  },
  {
    type: "single",
    entry: "Game expiration time (in hours)",
    translation: "Время истечения игры (в часах)"
  },
  {
    type: "single",
    entry: "Game link",
    translation: "Ссылка на игру"
  },
  {
    type: "single",
    entry: "Game preview",
    translation: "Просмотр игры"
  },
  {
    type: "single",
    entry: "Games played",
    translation: "Сыграно игр"
  },
  {
    type: "single",
    entry: "Games played: ",
    translation: "Сыграно игр: "
  },
  {
    type: "single",
    entry: "Given for collecting a yakuman during tournament.",
    translation: "Дается за сбор якумана на турнире."
  },
  {
    type: "single",
    entry: "Given for collecting the hand with biggest han count (independent of cost).",
    translation: "Дается за сбор руки с наибольшим число хан (независимо от стоимости)"
  },
  {
    type: "single",
    entry: "Given for collecting the hand with biggest minipoints (fu) count.",
    translation: "Дается за сбор руки с наибольшим количеством минипойнтов (фу)."
  },
  {
    type: "single",
    entry: "Given for collecting the largest amount of other players' riichi bets during the tournament.",
    translation: "Дается за сбор максимального числа чужих риичи палочек."
  },
  {
    type: "single",
    entry: "Given for collecting the most of tsumo hands during single game.",
    translation: "Дается за сбор максимального числа цумо в рамках одного ханчана."
  },
  {
    type: "single",
    entry: "Given for collecting the most of yakuhais during the tournament.",
    translation: "Дается за сбор максимального числа якухаев за турнир."
  },
  {
    type: "single",
    entry: "Given for feeding into largest hand during tournament (but not while in riichi).",
    translation: "Дается за наброс в наибольшую по стоимости руку за весь турнир (но не из-под риичи)."
  },
  {
    type: "single",
    entry: "Given for getting largest number of ippatsu during tournament.",
    translation: "Дается за максимальное число побед с иппацу за турнир."
  },
  {
    type: "single",
    entry: "Given for having biggest score in the end of the session across the tournament.",
    translation: "Дается за максимальное число набранных очков в конце игры в рамках турнира."
  },
  {
    type: "single",
    entry: "Given for largest count of dealer wins during the tournament.",
    translation: "Дается за максимальное число побед на дилере суммарно за турнир."
  },
  {
    type: "single",
    entry: "Given for largest count of feeding into ron during the tournament.",
    translation: "Дается за максимальное число набросов в рон за турнир."
  },
  {
    type: "single",
    entry: "Given for losing largest amount of points as riichi bets.",
    translation: "Дается за потерю максимального числа очков за счет риичи-ставок."
  },
  {
    type: "single",
    entry: "Given for losing the smallest number of riichi bets.",
    translation: "Дается за потерю минимального числа очков за счет риичи-ставок."
  },
  {
    type: "single",
    entry: "Given for smallest count of feeding into ron during the tournament.",
    translation: "Дается за минимальное число набросов в рон за турнир."
  },
  {
    type: "single",
    entry: "Given for the largest amount of points received as ryuukyoku (draw) payments.",
    translation: "Дается за максимальную сумму, полученную за счет темпаев."
  },
  {
    type: "single",
    entry: "Given for the largest amount of unique yaku collected during the tournament.",
    translation: "Дается за самое большое число разнообразных яку за турнир."
  },
  {
    type: "single",
    entry: "Given for the largest average count of dora in player's hand.",
    translation: "Дается за максимальное среднее число дор в руке."
  },
  {
    type: "single",
    entry: "Given for the most of 1/30 wins during tournament.",
    translation: "Дается за максимальное число собранных рук в 1/30 за весь турнир."
  },
  {
    type: "single",
    entry: "Given for the smallest average cost of opponents hand that player has dealt.",
    translation: "Дается за минимальную среднюю величину наброса."
  },
  {
    type: "single",
    entry: "Given for winning the largest number of hands with damaten.",
    translation: "Дается за максимальное число побед из даматена."
  },
  {
    type: "single",
    entry: "Goal score",
    translation: "Целевое количество очков"
  },
  {
    type: "single",
    entry: "Gotta Catch'Em All",
    translation: "Собери их всех"
  },
  {
    type: "single",
    entry: "Guest of honors",
    translation: "Довакин aka The mother of dragons"
  },
  {
    type: "single",
    entry: "Haitei",
    translation: "Хайтей"
  },
  {
    type: "single",
    entry: "Hands value",
    translation: "Стоимость рук"
  },
  {
    type: "single",
    entry: "Hands valued as 4/30 and 3/60 are rounded to mangan.",
    translation: "Руки стоимостью в 4/30 и 3/60 округляются до мангана."
  },
  {
    type: "single",
    entry: "Honba payments will be given only to the first winner. If not checked, payment will be given to all winners.",
    translation: "Выплата по хонбе будет выдана только первому победителю по ходу игры. Если не отмечено, выплата производится всем победителям."
  },
  {
    type: "single",
    entry: "Honitsu",
    translation: "Хоницу"
  },
  {
    type: "single",
    entry: "Honored donor",
    translation: "Почетный донор"
  },
  {
    type: "single",
    entry: "Honroutou",
    translation: "Хонрото"
  },
  {
    type: "single",
    entry: "Houtei raoyui",
    translation: "Хотей раоюй"
  },
  {
    type: "single",
    entry: "How game sessions should end during the tournament",
    translation: "Как игровые сессии завершаются во время турнира"
  },
  {
    type: "single",
    entry: "I saw them dancing",
    translation: "Задолбал!"
  },
  {
    type: "single",
    entry: "If checked, players with equivalent score receive equivalent uma bonus. Otherwise, uma is assigned according to move order.",
    translation: "Если отмечено, игроки с одинаковыми очками получат одинаковый ранговый бонус, равный среднему их бонусу. В ином случае ума назначается по порядку хода."
  },
  {
    type: "single",
    entry: "If nobody reaches the goal score at the last hand, the game continues to west rounds (in hanchan) or to south rounds (in tonpuusen), until someone reaches the goal",
    translation: "Если никто не набирает заданное число очков после оорасу, игра продолжается в западных раундах (в ханчане) или в южных раундах (в тонпусене), до тех пор пока кто-либо не наберет заданное число очков"
  },
  {
    type: "single",
    entry: "If the dealer holds the 1st place after last hand in session, the game ends regardless of his winning hand or tempai.",
    translation: "Если дилер занимает первое место после последней раздачи в игре, игра завершается независимо от того, выиграл ли дилер (или был ли он темпай)."
  },
  {
    type: "single",
    entry: "Iipeikou",
    translation: "Иипейко"
  },
  {
    type: "single",
    entry: "Initial points",
    translation: "Начальные очки"
  },
  {
    type: "single",
    entry: "Initial rating",
    translation: "Начальный рейтинг"
  },
  {
    type: "single",
    entry: "Interval of time when played online game is still considered valid and can be added to the rating.",
    translation: "Интервал времени, в течение которого сыгранная игра все еще считается действительной и может быть внесена в рейтинг."
  },
  {
    type: "single",
    entry: "Ippatsu",
    translation: "Иппацу"
  },
  {
    type: "single",
    entry: "Ittsu",
    translation: "Иццу"
  },
  {
    type: "single",
    entry: "Jewelry included",
    translation: "Якуман-мастер"
  },
  {
    type: "single",
    entry: "Junchan",
    translation: "Джунчан"
  },
  {
    type: "single",
    entry: "Just as planned",
    translation: "Как и планировалось"
  },
  {
    type: "single",
    entry: "Kazoe yakuman",
    translation: "Казое якуман"
  },
  {
    type: "single",
    entry: "Kiriage mangan",
    translation: "Кириаге манган"
  },
  {
    type: "single",
    entry: "Kokushi musou",
    translation: "Кокуши мусо"
  },
  {
    type: "single",
    entry: "Kuitan",
    translation: "Куитан"
  },
  {
    type: "single",
    entry: "Language",
    translation: "Язык"
  },
  {
    type: "single",
    entry: "Last games",
    translation: "Последние игры"
  },
  {
    type: "single",
    entry: "Last series",
    translation: "Текущая серия"
  },
  {
    type: "single",
    entry: "Local event settings",
    translation: "Настройки локального рейтинга"
  },
  {
    type: "single",
    entry: "Local rating",
    translation: "Локальный рейтинг"
  },
  {
    type: "single",
    entry: "Loss stats",
    translation: "Статистика потерь"
  },
  {
    type: "single",
    entry: "Maximum: ",
    translation: "Максимум: "
  },
  {
    type: "single",
    entry: "Menzentsumo",
    translation: "Мензенцумо"
  },
  {
    type: "single",
    entry: "Minimal count of games the player should play to get into the rating table.",
    translation: "Минимальное число сыгранных игр для того, чтобы игрок попал в рейтинговую таблицу."
  },
  {
    type: "single",
    entry: "Minimal games count",
    translation: "Минимальное число игр"
  },
  {
    type: "single",
    entry: "Minimum: ",
    translation: "Минимум: "
  },
  {
    type: "single",
    entry: "Misc stats",
    translation: "Дополнительная статистика"
  },
  {
    type: "single",
    entry: "Multiple yakumans",
    translation: "Суммирование якуманов"
  },
  {
    type: "single",
    entry: "Nagashi mangan",
    translation: "Нагаши манган"
  },
  {
    type: "single",
    entry: "Nagashi: %1",
    translation: "Нагаши манган: %1"
  },
  {
    type: "single",
    entry: "Next game",
    translation: "Следующая игра"
  },
  {
    type: "single",
    entry: "Ninja",
    translation: "Ниндзя"
  },
  {
    type: "single",
    entry: "No yakumans have been collected",
    translation: "Ни одного якумана собрано не было"
  },
  {
    type: "single",
    entry: "Oka bonus",
    translation: "Ока"
  },
  {
    type: "single",
    entry: "Online event",
    translation: "Онлайн-рейтинг"
  },
  {
    type: "single",
    entry: "Online event settings",
    translation: "Настройки онлайн-события"
  },
  {
    type: "single",
    entry: "Only first player by the order of the move from the loser would be considered a winner. If not checked, all players declaring Ron are considered winners.",
    translation: "Только первый игрок по ходу раздачи считается победителем по рон. Если галочка не отмечена, все игроки, объявившие рон, считаются победителями."
  },
  {
    type: "single",
    entry: "Open assistant",
    translation: "Ассистент"
  },
  {
    type: "single",
    entry: "Open riichi",
    translation: "Опен риичи"
  },
  {
    type: "single",
    entry: "Otherwise",
    translation: "Прочие ситуации"
  },
  {
    type: "single",
    entry: "Over 9000 fu",
    translation: "Over 9000 fu"
  },
  {
    type: "single",
    entry: "Pao rule enabled for:",
    translation: "Пао разрешено для:"
  },
  {
    type: "single",
    entry: "Pay chombo as reverse mangan",
    translation: "Чомбо как обратный манган"
  },
  {
    type: "single",
    entry: "Pay chombo right on occasion. If not checked, chombo is subtracted from player score after uma is applied.",
    translation: "Выплата штрафа чомбо производится на месте в размере обратного мангана. Если не отмечено, штраф чомбо будет вычтен из очков игрока после умы в конце игры."
  },
  {
    type: "single",
    entry: "Pay for honba by atamahane",
    translation: "Хонба по атамахане"
  },
  {
    type: "single",
    entry: "Payments and scores",
    translation: "Выплаты и очки"
  },
  {
    type: "single",
    entry: "Penalties",
    translation: "Штрафы"
  },
  {
    type: "single",
    entry: "Pinfu",
    translation: "Пин-фу"
  },
  {
    type: "single",
    entry: "Place",
    translation: "Место"
  },
  {
    type: "single",
    entry: "Place / Session result",
    translation: "Место / результат"
  },
  {
    type: "single",
    entry: "Places stats",
    translation: "Статистика по местам"
  },
  {
    type: "single",
    entry: "Play additional rounds",
    translation: "Дополнительные раунды"
  },
  {
    type: "single",
    entry: "Play only east rounds",
    translation: "Играть только восточные раунды"
  },
  {
    type: "single",
    entry: "Player ID",
    translation: "ID игрока"
  },
  {
    type: "single",
    entry: "Player name",
    translation: "Имя игрока"
  },
  {
    type: "single",
    entry: "Player stats",
    translation: "Статистика игрока"
  },
  {
    type: "single",
    entry: "Previous game",
    translation: "Предыдущая игра"
  },
  {
    type: "single",
    entry: "Profile & admin panel",
    translation: "Профиль и админ-панель"
  },
  {
    type: "single",
    entry: "Rating",
    translation: "Рейтинг"
  },
  {
    type: "single",
    entry: "Rating points",
    translation: "Рейтинговые очки"
  },
  {
    type: "single",
    entry: "Rating table",
    translation: "Рейтинг"
  },
  {
    type: "single",
    entry: "Rating table",
    context: "Event menu",
    translation: "Рейтинг"
  },
  {
    type: "single",
    entry: "Rating table is hidden by tournament administrator",
    translation: "Рейтинговая таблица была скрыта администратором турнира"
  },
  {
    type: "single",
    entry: "Recent games",
    translation: "Последние игры"
  },
  {
    type: "single",
    entry: "Recent games",
    context: "Event menu",
    translation: "Последние игры"
  },
  {
    type: "single",
    entry: "Renhou",
    translation: "Ренхо"
  },
  {
    type: "single",
    entry: "Replay link is invalid. Please check if you copied it correctly",
    translation: "Ссылка на игру некорректна. Проверьте правильно ли вы ее скопировали"
  },
  {
    type: "single",
    entry: "Riichi",
    translation: "Риичи"
  },
  {
    type: "single",
    entry: "Riichi and honba",
    translation: "Риичи и хонба"
  },
  {
    type: "single",
    entry: "Riichi bets: ",
    translation: "Ставок риичи: "
  },
  {
    type: "single",
    entry: "Riichi goes to winner",
    translation: "Риичи уходит победителю"
  },
  {
    type: "single",
    entry: "Riichi left on table in case of draw in the end of the session will be given to session winner",
    translation: "После завершения игры все ставки риичи, оставшиеся на столе, отдаются победителю в игре"
  },
  {
    type: "single",
    entry: "Riichi mahjong events list",
    translation: "Список турниров и рейтингов"
  },
  {
    type: "single",
    entry: "Rinshan kaihou",
    translation: "Риншан кайхо"
  },
  {
    type: "single",
    entry: "Ron: %1",
    translation: "Рон: %1"
  },
  {
    type: "single",
    entry: "Round outcomes",
    translation: "Исходы раздач"
  },
  {
    type: "single",
    entry: "Rounds played: ",
    translation: "Сыграно раундов: "
  },
  {
    type: "single",
    entry: "Rounds won: ",
    translation: "Выиграно раундов: "
  },
  {
    type: "single",
    entry: "Rules overview",
    translation: "Обзор правил"
  },
  {
    type: "single",
    entry: "Rules overview",
    context: "Event menu",
    translation: "Обзор правил"
  },
  {
    type: "single",
    entry: "Ruleset details",
    translation: "Детали правил"
  },
  {
    type: "single",
    entry: "Ruleset details page is not available for aggregated events",
    translation: "Для агрегированных событий обзор правил недоступен"
  },
  {
    type: "single",
    entry: "Ryanpeikou",
    translation: "Рянпейко"
  },
  {
    type: "single",
    entry: "Ryuuiisou",
    translation: "Рюисо"
  },
  {
    type: "single",
    entry: "Sanankou",
    translation: "Сананко"
  },
  {
    type: "single",
    entry: "Sankantsu",
    translation: "Санканцу"
  },
  {
    type: "single",
    entry: "Sanshoku",
    translation: "Саншоку"
  },
  {
    type: "single",
    entry: "Sanshoku doukou",
    translation: "Саншоку доко"
  },
  {
    type: "single",
    entry: "Save as CSV",
    translation: "Экспорт в CSV"
  },
  {
    type: "single",
    entry: "Score given to all players in the beginning of the rating",
    translation: "Количество рейтинговых очков, изначально даваемое каждому новому игроку"
  },
  {
    type: "single",
    entry: "Score:",
    translation: "Очки:"
  },
  {
    type: "single",
    entry: "Seating is defined in advance",
    translation: "Предопределенная рассадка"
  },
  {
    type: "single",
    entry: "Series length",
    translation: "Длина серии"
  },
  {
    type: "single",
    entry: "Series rating",
    translation: "Рейтинг по сериям игр"
  },
  {
    type: "single",
    entry: "Series rating",
    context: "Event menu",
    translation: "Рейтинг по сериям игр"
  },
  {
    type: "single",
    entry: "Series rating is not available for aggregated events",
    translation: "Для агрегированных событий рейтинг по сериям недоступен"
  },
  {
    type: "single",
    entry: "Session duration in minutes",
    translation: "Длительность сессии в минутах"
  },
  {
    type: "single",
    entry: "Session ending policy",
    translation: "Политика окончания игры"
  },
  {
    type: "single",
    entry: "Shousangen",
    translation: "Шосанген"
  },
  {
    type: "single",
    entry: "Shousuushii",
    translation: "Шосуши"
  },
  {
    type: "single",
    entry: "Simple rank-based",
    translation: "Простой, на основе текущего места"
  },
  {
    type: "single",
    entry: "Suuankou",
    translation: "Сууанко"
  },
  {
    type: "single",
    entry: "Suukantsu",
    translation: "Сууканцу"
  },
  {
    type: "single",
    entry: "Tanyao",
    translation: "Таняо"
  },
  {
    type: "single",
    entry: "Tanyao costs 1 han on open hand. If not checked, tanyao does not work on open hand.",
    translation: "Тан-яо стоит 1 хан на открытой руке. Если не проставлено, тан-яо не работает на открытой руке."
  },
  {
    type: "single",
    entry: "Team",
    translation: "Команда"
  },
  {
    type: "single",
    entry: "Team tournament",
    translation: "Командный турнир"
  },
  {
    type: "single",
    entry: "Tenhou",
    translation: "Тенхо"
  },
  {
    type: "single",
    entry: "Tenhou Lobby ID. Please contact event administrator for proper link to lobby.",
    translation: "ID лобби на Tenhou. Свяжитесь с администратором события для получения ссылки на лобби."
  },
  {
    type: "single",
    entry: "The 1k Flash",
    translation: "Мистер Хэнки"
  },
  {
    type: "single",
    entry: "The Covetous Knight",
    translation: "Скупой рыцарь"
  },
  {
    type: "single",
    entry: "The favorite apprentice of ASAPIN",
    translation: "Любимый ученик Асапина"
  },
  {
    type: "single",
    entry: "The great dealer",
    translation: "Восточный мастер"
  },
  {
    type: "single",
    entry: 'There will be a separate "Abortive draw" outcome to record draws due to four riichi, four kans, suufon renda, kyuushu kyuuhai, etc.',
    translation: 'Включить отдельный исход "Абортивная ничья" для специальных ситуаций (4 риичи, 4 кана, одинаковый ветер в сбросе на первом круге, кюсюкюхай).'
  },
  {
    type: "single",
    entry: "This can't be your wait",
    translation: "Он не может на это ждать"
  },
  {
    type: "single",
    entry: "Timer",
    translation: "Таймер"
  },
  {
    type: "single",
    entry: "Timer & seating",
    translation: "Таймер и рассадка"
  },
  {
    type: "single",
    entry: "Timer & seating",
    context: "Event menu",
    translation: "Таймер и рассадка"
  },
  {
    type: "single",
    entry: "Timer is not available for aggregated events",
    translation: "Для агрегированных событий таймер недоступен"
  },
  {
    type: "single",
    entry: "Timer starting value. After time runs out, session ending policy is applied (see below).",
    translation: "Стартовое значение таймера. После истечения таймера, применяется политика окончания игры (см. ниже)"
  },
  {
    type: "single",
    entry: "To damaten hands: ",
    translation: "В даматен: "
  },
  {
    type: "single",
    entry: "To events list",
    translation: "К списку событий"
  },
  {
    type: "single",
    entry: "To hands with riichi: ",
    translation: "В руки с риичи: "
  },
  {
    type: "single",
    entry: "To open hands: ",
    translation: "В открытые руки: "
  },
  {
    type: "single",
    entry: "Toggle color scheme",
    translation: "Переключить цветовую схему"
  },
  {
    type: "single",
    entry: "Toitoi",
    translation: "Тойтой"
  },
  {
    type: "single",
    entry: "Tonpuusen",
    translation: "Тонпусены"
  },
  {
    type: "single",
    entry: "Total points gained: ",
    translation: "Всего набрано очков: "
  },
  {
    type: "single",
    entry: "Total points lost: ",
    translation: "Всего очков потеряно: "
  },
  {
    type: "single",
    entry: "Tournament",
    translation: "Турнир"
  },
  {
    type: "single",
    entry: "Tournament settings",
    translation: "Настройки турнира"
  },
  {
    type: "single",
    entry: "Tsumo payments: ",
    translation: "Выплаты по цумо: "
  },
  {
    type: "single",
    entry: "Tsumo: %1",
    translation: "Цумо: %1"
  },
  {
    type: "single",
    entry: "Tsuuiisou",
    translation: "Цуисо"
  },
  {
    type: "single",
    entry: "Uma bonus for 1st place",
    translation: "Ума за 1 место"
  },
  {
    type: "single",
    entry: "Uma bonus for 2nd place",
    translation: "Ума за 2 место"
  },
  {
    type: "single",
    entry: "Uma bonus type",
    translation: "Тип рангового бонуса ума"
  },
  {
    type: "single",
    entry: "Uma penalty for 3rd place",
    translation: "Ума за 3 место"
  },
  {
    type: "single",
    entry: "Uma penalty for 4th place",
    translation: "Ума за 4 место"
  },
  {
    type: "single",
    entry: "View game",
    translation: "Посмотреть реплей"
  },
  {
    type: "single",
    entry: "View selected game details",
    translation: "Подробнее об игре"
  },
  {
    type: "single",
    entry: "We need more gold",
    translation: "Нужно больше золота"
  },
  {
    type: "single",
    entry: "When a player runs out of score points, the game immediately ends",
    translation: "Когда игрок уходит в минус по очкам, игра немедленно завершается"
  },
  {
    type: "single",
    entry: "When dealer wins, or stays tempai after draw, seat winds will be changed. Honba is added only after draw.",
    translation: "Когда дилер выигрывает или остается темпай, ветра все равно меняются. Хонба добавляется только после ничьей."
  },
  {
    type: "single",
    entry: "When time is out, finish current hand and interrupt the session",
    translation: "Когда время вышло, завершить текущую раздачу и после этого прервать игру"
  },
  {
    type: "single",
    entry: "When time is out, finish current hand, play one more, and then interrup the session",
    translation: "Когда время вышло, завершить текущую раздачу, сыграть еще одну, после чего прервать игру"
  },
  {
    type: "single",
    entry: "Win stats",
    translation: "Статистика по победам"
  },
  {
    type: "single",
    entry: "With damaten: ",
    translation: "В даматене: "
  },
  {
    type: "single",
    entry: "With open hand: ",
    translation: "С открытой рукой: "
  },
  {
    type: "single",
    entry: "With riichi: ",
    translation: "С риичи: "
  },
  {
    type: "single",
    entry: "With tempai: ",
    translation: "С темпаем: "
  },
  {
    type: "single",
    entry: "Without declared riichi: ",
    translation: "Без объявления риичи: "
  },
  {
    type: "single",
    entry: "Yaku allowed",
    translation: "Разрешенные яку"
  },
  {
    type: "single",
    entry: "Yaku collected over all time",
    translation: "Собранные яку за все время"
  },
  {
    type: "single",
    entry: "Yaku settings",
    translation: "Настройки яку"
  },
  {
    type: "single",
    entry: "Yakuhai x1",
    translation: "Якухай 1"
  },
  {
    type: "single",
    entry: "Yakuhai x2",
    translation: "Якухай 2"
  },
  {
    type: "single",
    entry: "Yakuhai x3",
    translation: "Якухай 3"
  },
  {
    type: "single",
    entry: "Yakuhai x4",
    translation: "Якухай 4"
  },
  {
    type: "single",
    entry: "Yakuhai: total",
    translation: "Якухай: всего"
  },
  {
    type: "single",
    entry: "You should prepare the tournament script yourself. No automated seating functionality is available when this flag is set.",
    translation: "Вы должны подготовить скрипт рассадки самостоятельно. Функциональность автоматических рассадок недоступна в этом режиме."
  },
  {
    type: "single",
    entry: "dora %1",
    translation: "дора %1"
  },
  {
    type: "single",
    entry: "none",
    context: "Riichi bets count",
    translation: "нет"
  },
  {
    type: "single",
    entry: "yakuman!",
    translation: "якуман!"
  }
];
const langRu = {
  meta,
  items
};
const supportedLanguages = [
  "en",
  "ru"
  /* 'de'*/
];
const langs = {
  ru: langRu
  /*de: langDe,*/
};
class I18nService {
  constructor(storage2) {
    __publicField(this, "i18nController");
    __publicField(this, "i18n");
    this.storage = storage2;
    this.i18nController = new TranslationController(
      /* translationGetter: */
      (name, onReady) => {
        switch (name) {
          case "ru":
            onReady(name, JSON.stringify(langs[name]));
            break;
          case "en":
          default:
            const defaultTrn = {
              items: [],
              meta: {
                projectIdVersion: "1",
                reportMsgidBugsTo: "",
                potCreationDate: "",
                poRevisionDate: "",
                lastTranslator: {
                  name: "",
                  email: ""
                },
                language: "en",
                languageTeam: "",
                pluralForms: "nplurals=1; plural=(n==1 ? 0 : 1)",
                // (n: number) => number
                mimeVersion: "",
                contentType: "",
                contentTransferEncoding: "",
                generatedBy: ""
              }
            };
            onReady("en", JSON.stringify(defaultTrn));
            break;
        }
      },
      /* onFailedSubstitution: */
      (str, substitutions) => {
        console.error(`Failed i18n substitution: ${str}`, substitutions);
      },
      /* defaultPluralSelect: */
      (factor) => factor == 1 ? 0 : 1
      // default english plurality rule
    );
    this.i18n = new TranslationProvider(this.i18nController);
  }
  init(onReady, onError) {
    const lang = this.storage.getLang();
    if (lang) {
      if (!supportedLanguages.includes(lang)) {
        this.storage.deleteLang();
      } else {
        this.i18nController.setLocale(lang, onReady, onError);
        return;
      }
    }
    this.i18nController.setLocale("en", onReady, onError);
  }
  get _t() {
    return this.i18n._t;
  }
  get _pt() {
    return this.i18n._pt;
  }
  get _nt() {
    return this.i18n._nt;
  }
  get _npt() {
    return this.i18n._npt;
  }
  get _gg() {
    return this.i18n._gg;
  }
  get _ngg() {
    return this.i18n._ngg;
  }
  get _pgg() {
    return this.i18n._pgg;
  }
  get _npgg() {
    return this.i18n._npgg;
  }
}
const AUTH_TOKEN_KEY = "auth";
const PERSON_ID_KEY = "pid";
const EVENT_ID_KEY = "eid";
const LANG_KEY = "lng";
const THEME_KEY = "thm";
const SINGLE_DEVICE_MODE_KEY = "sdm";
class Storage {
  constructor() {
    __publicField(this, "strategy");
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  getAuthToken() {
    return this.get(AUTH_TOKEN_KEY, "string");
  }
  getPersonId() {
    return this.get(PERSON_ID_KEY, "int");
  }
  getEventId() {
    return this.get(EVENT_ID_KEY, "int");
  }
  getLang() {
    return this.get(LANG_KEY, "string");
  }
  getTheme() {
    return this.get(THEME_KEY, "string");
  }
  getSingleDeviceMode() {
    return !!this.get(SINGLE_DEVICE_MODE_KEY, "int");
  }
  setAuthToken(token) {
    this.set(AUTH_TOKEN_KEY, "string", token);
    return this;
  }
  setPersonId(id) {
    this.set(PERSON_ID_KEY, "int", id);
    return this;
  }
  setEventId(id) {
    this.set(EVENT_ID_KEY, "int", id);
    return this;
  }
  setLang(lang) {
    this.set(LANG_KEY, "string", lang);
    return this;
  }
  setTheme(theme) {
    this.set(THEME_KEY, "string", theme);
    return this;
  }
  setSingleDeviceMode(enabled) {
    if (enabled) {
      this.set(SINGLE_DEVICE_MODE_KEY, "int", 1);
    } else {
      this.deleteSingleDeviceMode();
    }
    return this;
  }
  deleteAuthToken() {
    this.delete(AUTH_TOKEN_KEY);
    return this;
  }
  deletePersonId() {
    this.delete(PERSON_ID_KEY);
    return this;
  }
  deleteEventId() {
    this.delete(EVENT_ID_KEY);
    return this;
  }
  deleteLang() {
    this.delete(LANG_KEY);
    return this;
  }
  deleteTheme() {
    this.delete(THEME_KEY);
    return this;
  }
  deleteSingleDeviceMode() {
    this.delete(SINGLE_DEVICE_MODE_KEY);
    return this;
  }
  get(key, type) {
    var _a;
    return (_a = this.strategy) == null ? void 0 : _a.get(key, type);
  }
  set(key, type, value) {
    var _a;
    (_a = this.strategy) == null ? void 0 : _a.set(key, type, value);
  }
  delete(key) {
    var _a;
    (_a = this.strategy) == null ? void 0 : _a.delete(key);
  }
  clear() {
    var _a;
    (_a = this.strategy) == null ? void 0 : _a.clear();
  }
}
const storage = new Storage();
const storageCtx = createContext(storage);
const useStorage = () => {
  return useContext(storageCtx);
};
const StorageProvider = ({ children }) => {
  return /* @__PURE__ */ jsx(storageCtx.Provider, { value: storage, children });
};
const i18n = new I18nService(storage);
const i18nCtx = createContext(i18n);
const useI18n = () => {
  return useContext(i18nCtx);
};
const I18nProvider = ({ children }) => {
  return /* @__PURE__ */ jsx(i18nCtx.Provider, { value: i18n, children });
};
const EventType = {
  EVENT_TYPE_UNSPECIFIED: "EVENT_TYPE_UNSPECIFIED",
  EVENT_TYPE_TOURNAMENT: "EVENT_TYPE_TOURNAMENT",
  EVENT_TYPE_LOCAL: "EVENT_TYPE_LOCAL",
  EVENT_TYPE_ONLINE: "EVENT_TYPE_ONLINE",
  /**
   * @private
   */
  _fromInt: function(i) {
    switch (i) {
      case 0: {
        return "EVENT_TYPE_UNSPECIFIED";
      }
      case 1: {
        return "EVENT_TYPE_TOURNAMENT";
      }
      case 2: {
        return "EVENT_TYPE_LOCAL";
      }
      case 3: {
        return "EVENT_TYPE_ONLINE";
      }
      default: {
        return i;
      }
    }
  },
  /**
   * @private
   */
  _toInt: function(i) {
    switch (i) {
      case "EVENT_TYPE_UNSPECIFIED": {
        return 0;
      }
      case "EVENT_TYPE_TOURNAMENT": {
        return 1;
      }
      case "EVENT_TYPE_LOCAL": {
        return 2;
      }
      case "EVENT_TYPE_ONLINE": {
        return 3;
      }
      default: {
        return i;
      }
    }
  }
};
const TournamentGamesStatus = {
  TOURNAMENT_GAMES_STATUS_UNSPECIFIED: "TOURNAMENT_GAMES_STATUS_UNSPECIFIED",
  TOURNAMENT_GAMES_STATUS_SEATING_READY: "TOURNAMENT_GAMES_STATUS_SEATING_READY",
  TOURNAMENT_GAMES_STATUS_STARTED: "TOURNAMENT_GAMES_STATUS_STARTED",
  /**
   * @private
   */
  _fromInt: function(i) {
    switch (i) {
      case 0: {
        return "TOURNAMENT_GAMES_STATUS_UNSPECIFIED";
      }
      case 1: {
        return "TOURNAMENT_GAMES_STATUS_SEATING_READY";
      }
      case 2: {
        return "TOURNAMENT_GAMES_STATUS_STARTED";
      }
      default: {
        return i;
      }
    }
  },
  /**
   * @private
   */
  _toInt: function(i) {
    switch (i) {
      case "TOURNAMENT_GAMES_STATUS_UNSPECIFIED": {
        return 0;
      }
      case "TOURNAMENT_GAMES_STATUS_SEATING_READY": {
        return 1;
      }
      case "TOURNAMENT_GAMES_STATUS_STARTED": {
        return 2;
      }
      default: {
        return i;
      }
    }
  }
};
const UmaType = {
  UMA_TYPE_UNSPECIFIED: "UMA_TYPE_UNSPECIFIED",
  UMA_TYPE_UMA_SIMPLE: "UMA_TYPE_UMA_SIMPLE",
  UMA_TYPE_UMA_COMPLEX: "UMA_TYPE_UMA_COMPLEX",
  /**
   * @private
   */
  _fromInt: function(i) {
    switch (i) {
      case 0: {
        return "UMA_TYPE_UNSPECIFIED";
      }
      case 1: {
        return "UMA_TYPE_UMA_SIMPLE";
      }
      case 2: {
        return "UMA_TYPE_UMA_COMPLEX";
      }
      default: {
        return i;
      }
    }
  },
  /**
   * @private
   */
  _toInt: function(i) {
    switch (i) {
      case "UMA_TYPE_UNSPECIFIED": {
        return 0;
      }
      case "UMA_TYPE_UMA_SIMPLE": {
        return 1;
      }
      case "UMA_TYPE_UMA_COMPLEX": {
        return 2;
      }
      default: {
        return i;
      }
    }
  }
};
const EndingPolicy = {
  ENDING_POLICY_EP_UNSPECIFIED: "ENDING_POLICY_EP_UNSPECIFIED",
  ENDING_POLICY_EP_ONE_MORE_HAND: "ENDING_POLICY_EP_ONE_MORE_HAND",
  ENDING_POLICY_EP_END_AFTER_HAND: "ENDING_POLICY_EP_END_AFTER_HAND",
  /**
   * @private
   */
  _fromInt: function(i) {
    switch (i) {
      case 0: {
        return "ENDING_POLICY_EP_UNSPECIFIED";
      }
      case 1: {
        return "ENDING_POLICY_EP_ONE_MORE_HAND";
      }
      case 2: {
        return "ENDING_POLICY_EP_END_AFTER_HAND";
      }
      default: {
        return i;
      }
    }
  },
  /**
   * @private
   */
  _toInt: function(i) {
    switch (i) {
      case "ENDING_POLICY_EP_UNSPECIFIED": {
        return 0;
      }
      case "ENDING_POLICY_EP_ONE_MORE_HAND": {
        return 1;
      }
      case "ENDING_POLICY_EP_END_AFTER_HAND": {
        return 2;
      }
      default: {
        return i;
      }
    }
  }
};
const EventAdmin = {
  /**
   * Serializes EventAdmin to protobuf.
   */
  encode: function(msg) {
    return EventAdmin._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes EventAdmin from protobuf.
   */
  decode: function(bytes) {
    return EventAdmin._readMessage(
      EventAdmin.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventAdmin with all fields set to their default value.
   */
  initialize: function() {
    return {
      ruleId: 0,
      personId: 0,
      personName: ""
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ruleId) {
      writer.writeInt32(1, msg.ruleId);
    }
    if (msg.personId) {
      writer.writeInt32(2, msg.personId);
    }
    if (msg.personName) {
      writer.writeString(3, msg.personName);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.ruleId = reader.readInt32();
          break;
        }
        case 2: {
          msg.personId = reader.readInt32();
          break;
        }
        case 3: {
          msg.personName = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const Event = {
  /**
   * Serializes Event to protobuf.
   */
  encode: function(msg) {
    return Event._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes Event from protobuf.
   */
  decode: function(bytes) {
    return Event._readMessage(Event.initialize(), new BinaryReader(bytes));
  },
  /**
   * Initializes Event with all fields set to their default value.
   */
  initialize: function() {
    return {
      id: 0,
      title: "",
      description: "",
      finished: false,
      isListed: false,
      isRatingShown: false,
      tournamentStarted: false,
      type: EventType._fromInt(0),
      isPrescripted: false,
      isTeam: false,
      hasSeries: false,
      withChips: false
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    if (msg.title) {
      writer.writeString(2, msg.title);
    }
    if (msg.description) {
      writer.writeString(3, msg.description);
    }
    if (msg.finished) {
      writer.writeBool(4, msg.finished);
    }
    if (msg.isListed) {
      writer.writeBool(5, msg.isListed);
    }
    if (msg.isRatingShown) {
      writer.writeBool(6, msg.isRatingShown);
    }
    if (msg.tournamentStarted) {
      writer.writeBool(7, msg.tournamentStarted);
    }
    if (msg.type && EventType._toInt(msg.type)) {
      writer.writeEnum(8, EventType._toInt(msg.type));
    }
    if (msg.isPrescripted) {
      writer.writeBool(9, msg.isPrescripted);
    }
    if (msg.isTeam) {
      writer.writeBool(10, msg.isTeam);
    }
    if (msg.hasSeries) {
      writer.writeBool(11, msg.hasSeries);
    }
    if (msg.withChips) {
      writer.writeBool(12, msg.withChips);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        case 2: {
          msg.title = reader.readString();
          break;
        }
        case 3: {
          msg.description = reader.readString();
          break;
        }
        case 4: {
          msg.finished = reader.readBool();
          break;
        }
        case 5: {
          msg.isListed = reader.readBool();
          break;
        }
        case 6: {
          msg.isRatingShown = reader.readBool();
          break;
        }
        case 7: {
          msg.tournamentStarted = reader.readBool();
          break;
        }
        case 8: {
          msg.type = EventType._fromInt(reader.readEnum());
          break;
        }
        case 9: {
          msg.isPrescripted = reader.readBool();
          break;
        }
        case 10: {
          msg.isTeam = reader.readBool();
          break;
        }
        case 11: {
          msg.hasSeries = reader.readBool();
          break;
        }
        case 12: {
          msg.withChips = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const GameConfig = {
  /**
   * Serializes GameConfig to protobuf.
   */
  encode: function(msg) {
    return GameConfig._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes GameConfig from protobuf.
   */
  decode: function(bytes) {
    return GameConfig._readMessage(
      GameConfig.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes GameConfig with all fields set to their default value.
   */
  initialize: function() {
    return {
      rulesetTitle: "",
      eventTitle: "",
      eventDescription: "",
      eventStatHost: "",
      useTimer: false,
      usePenalty: false,
      gameDuration: 0,
      timezone: "",
      isOnline: false,
      isTeam: false,
      autoSeating: false,
      syncStart: false,
      syncEnd: false,
      sortByGames: false,
      allowPlayerAppend: false,
      seriesLength: 0,
      minGamesCount: 0,
      gamesStatus: TournamentGamesStatus._fromInt(0),
      hideResults: false,
      hideAddReplayButton: false,
      isPrescripted: false,
      isFinished: false,
      rulesetConfig: RulesetConfig.initialize(),
      lobbyId: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.rulesetTitle) {
      writer.writeString(10, msg.rulesetTitle);
    }
    if (msg.eventTitle) {
      writer.writeString(26, msg.eventTitle);
    }
    if (msg.eventDescription) {
      writer.writeString(27, msg.eventDescription);
    }
    if (msg.eventStatHost) {
      writer.writeString(28, msg.eventStatHost);
    }
    if (msg.useTimer) {
      writer.writeBool(29, msg.useTimer);
    }
    if (msg.usePenalty) {
      writer.writeBool(30, msg.usePenalty);
    }
    if (msg.gameDuration) {
      writer.writeInt32(34, msg.gameDuration);
    }
    if (msg.timezone) {
      writer.writeString(35, msg.timezone);
    }
    if (msg.isOnline) {
      writer.writeBool(36, msg.isOnline);
    }
    if (msg.isTeam) {
      writer.writeBool(37, msg.isTeam);
    }
    if (msg.autoSeating) {
      writer.writeBool(38, msg.autoSeating);
    }
    if (msg.syncStart) {
      writer.writeBool(39, msg.syncStart);
    }
    if (msg.syncEnd) {
      writer.writeBool(40, msg.syncEnd);
    }
    if (msg.sortByGames) {
      writer.writeBool(41, msg.sortByGames);
    }
    if (msg.allowPlayerAppend) {
      writer.writeBool(42, msg.allowPlayerAppend);
    }
    if (msg.seriesLength) {
      writer.writeInt32(45, msg.seriesLength);
    }
    if (msg.minGamesCount) {
      writer.writeInt32(46, msg.minGamesCount);
    }
    if (msg.gamesStatus && TournamentGamesStatus._toInt(msg.gamesStatus)) {
      writer.writeEnum(47, TournamentGamesStatus._toInt(msg.gamesStatus));
    }
    if (msg.hideResults) {
      writer.writeBool(48, msg.hideResults);
    }
    if (msg.hideAddReplayButton) {
      writer.writeBool(49, msg.hideAddReplayButton);
    }
    if (msg.isPrescripted) {
      writer.writeBool(50, msg.isPrescripted);
    }
    if (msg.isFinished) {
      writer.writeBool(52, msg.isFinished);
    }
    if (msg.rulesetConfig) {
      writer.writeMessage(53, msg.rulesetConfig, RulesetConfig._writeMessage);
    }
    if (msg.lobbyId) {
      writer.writeInt32(54, msg.lobbyId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 10: {
          msg.rulesetTitle = reader.readString();
          break;
        }
        case 26: {
          msg.eventTitle = reader.readString();
          break;
        }
        case 27: {
          msg.eventDescription = reader.readString();
          break;
        }
        case 28: {
          msg.eventStatHost = reader.readString();
          break;
        }
        case 29: {
          msg.useTimer = reader.readBool();
          break;
        }
        case 30: {
          msg.usePenalty = reader.readBool();
          break;
        }
        case 34: {
          msg.gameDuration = reader.readInt32();
          break;
        }
        case 35: {
          msg.timezone = reader.readString();
          break;
        }
        case 36: {
          msg.isOnline = reader.readBool();
          break;
        }
        case 37: {
          msg.isTeam = reader.readBool();
          break;
        }
        case 38: {
          msg.autoSeating = reader.readBool();
          break;
        }
        case 39: {
          msg.syncStart = reader.readBool();
          break;
        }
        case 40: {
          msg.syncEnd = reader.readBool();
          break;
        }
        case 41: {
          msg.sortByGames = reader.readBool();
          break;
        }
        case 42: {
          msg.allowPlayerAppend = reader.readBool();
          break;
        }
        case 45: {
          msg.seriesLength = reader.readInt32();
          break;
        }
        case 46: {
          msg.minGamesCount = reader.readInt32();
          break;
        }
        case 47: {
          msg.gamesStatus = TournamentGamesStatus._fromInt(reader.readEnum());
          break;
        }
        case 48: {
          msg.hideResults = reader.readBool();
          break;
        }
        case 49: {
          msg.hideAddReplayButton = reader.readBool();
          break;
        }
        case 50: {
          msg.isPrescripted = reader.readBool();
          break;
        }
        case 52: {
          msg.isFinished = reader.readBool();
          break;
        }
        case 53: {
          reader.readMessage(msg.rulesetConfig, RulesetConfig._readMessage);
          break;
        }
        case 54: {
          msg.lobbyId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const PlayerInRating = {
  /**
   * Serializes PlayerInRating to protobuf.
   */
  encode: function(msg) {
    return PlayerInRating._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayerInRating from protobuf.
   */
  decode: function(bytes) {
    return PlayerInRating._readMessage(
      PlayerInRating.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayerInRating with all fields set to their default value.
   */
  initialize: function() {
    return {
      id: 0,
      title: "",
      tenhouId: "",
      rating: 0,
      chips: 0,
      winnerZone: false,
      avgPlace: 0,
      avgScore: 0,
      gamesPlayed: 0,
      teamName: void 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    if (msg.title) {
      writer.writeString(2, msg.title);
    }
    if (msg.tenhouId) {
      writer.writeString(3, msg.tenhouId);
    }
    if (msg.rating) {
      writer.writeFloat(4, msg.rating);
    }
    if (msg.chips) {
      writer.writeInt32(5, msg.chips);
    }
    if (msg.winnerZone) {
      writer.writeBool(6, msg.winnerZone);
    }
    if (msg.avgPlace) {
      writer.writeFloat(7, msg.avgPlace);
    }
    if (msg.avgScore) {
      writer.writeFloat(8, msg.avgScore);
    }
    if (msg.gamesPlayed) {
      writer.writeInt32(9, msg.gamesPlayed);
    }
    if (msg.teamName != void 0) {
      writer.writeString(10, msg.teamName);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        case 2: {
          msg.title = reader.readString();
          break;
        }
        case 3: {
          msg.tenhouId = reader.readString();
          break;
        }
        case 4: {
          msg.rating = reader.readFloat();
          break;
        }
        case 5: {
          msg.chips = reader.readInt32();
          break;
        }
        case 6: {
          msg.winnerZone = reader.readBool();
          break;
        }
        case 7: {
          msg.avgPlace = reader.readFloat();
          break;
        }
        case 8: {
          msg.avgScore = reader.readFloat();
          break;
        }
        case 9: {
          msg.gamesPlayed = reader.readInt32();
          break;
        }
        case 10: {
          msg.teamName = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const Player = {
  /**
   * Serializes Player to protobuf.
   */
  encode: function(msg) {
    return Player._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes Player from protobuf.
   */
  decode: function(bytes) {
    return Player._readMessage(Player.initialize(), new BinaryReader(bytes));
  },
  /**
   * Initializes Player with all fields set to their default value.
   */
  initialize: function() {
    return {
      id: 0,
      title: "",
      tenhouId: ""
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    if (msg.title) {
      writer.writeString(2, msg.title);
    }
    if (msg.tenhouId) {
      writer.writeString(3, msg.tenhouId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        case 2: {
          msg.title = reader.readString();
          break;
        }
        case 3: {
          msg.tenhouId = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const FinalResultOfSession = {
  /**
   * Serializes FinalResultOfSession to protobuf.
   */
  encode: function(msg) {
    return FinalResultOfSession._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes FinalResultOfSession from protobuf.
   */
  decode: function(bytes) {
    return FinalResultOfSession._readMessage(
      FinalResultOfSession.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes FinalResultOfSession with all fields set to their default value.
   */
  initialize: function() {
    return {
      playerId: 0,
      score: 0,
      ratingDelta: 0,
      place: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    if (msg.score) {
      writer.writeInt32(2, msg.score);
    }
    if (msg.ratingDelta) {
      writer.writeFloat(3, msg.ratingDelta);
    }
    if (msg.place) {
      writer.writeInt32(4, msg.place);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 2: {
          msg.score = reader.readInt32();
          break;
        }
        case 3: {
          msg.ratingDelta = reader.readFloat();
          break;
        }
        case 4: {
          msg.place = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const Penalty = {
  /**
   * Serializes Penalty to protobuf.
   */
  encode: function(msg) {
    return Penalty._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes Penalty from protobuf.
   */
  decode: function(bytes) {
    return Penalty._readMessage(Penalty.initialize(), new BinaryReader(bytes));
  },
  /**
   * Initializes Penalty with all fields set to their default value.
   */
  initialize: function() {
    return {
      who: 0,
      amount: 0,
      reason: void 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.who) {
      writer.writeInt32(1, msg.who);
    }
    if (msg.amount) {
      writer.writeInt32(2, msg.amount);
    }
    if (msg.reason != void 0) {
      writer.writeString(3, msg.reason);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.who = reader.readInt32();
          break;
        }
        case 2: {
          msg.amount = reader.readInt32();
          break;
        }
        case 3: {
          msg.reason = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const RonResult = {
  /**
   * Serializes RonResult to protobuf.
   */
  encode: function(msg) {
    return RonResult._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes RonResult from protobuf.
   */
  decode: function(bytes) {
    return RonResult._readMessage(
      RonResult.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes RonResult with all fields set to their default value.
   */
  initialize: function() {
    return {
      roundIndex: 0,
      honba: 0,
      winnerId: 0,
      loserId: 0,
      paoPlayerId: 0,
      han: 0,
      fu: 0,
      yaku: [],
      riichiBets: [],
      dora: 0,
      uradora: 0,
      kandora: 0,
      kanuradora: 0,
      openHand: false
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a, _b;
    if (msg.roundIndex) {
      writer.writeInt32(1, msg.roundIndex);
    }
    if (msg.honba) {
      writer.writeInt32(2, msg.honba);
    }
    if (msg.winnerId) {
      writer.writeInt32(3, msg.winnerId);
    }
    if (msg.loserId) {
      writer.writeInt32(4, msg.loserId);
    }
    if (msg.paoPlayerId) {
      writer.writeInt32(5, msg.paoPlayerId);
    }
    if (msg.han) {
      writer.writeInt32(6, msg.han);
    }
    if (msg.fu) {
      writer.writeInt32(7, msg.fu);
    }
    if ((_a = msg.yaku) == null ? void 0 : _a.length) {
      writer.writePackedInt32(8, msg.yaku);
    }
    if ((_b = msg.riichiBets) == null ? void 0 : _b.length) {
      writer.writePackedInt32(9, msg.riichiBets);
    }
    if (msg.dora) {
      writer.writeInt32(10, msg.dora);
    }
    if (msg.uradora) {
      writer.writeInt32(11, msg.uradora);
    }
    if (msg.kandora) {
      writer.writeInt32(12, msg.kandora);
    }
    if (msg.kanuradora) {
      writer.writeInt32(13, msg.kanuradora);
    }
    if (msg.openHand) {
      writer.writeBool(14, msg.openHand);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.roundIndex = reader.readInt32();
          break;
        }
        case 2: {
          msg.honba = reader.readInt32();
          break;
        }
        case 3: {
          msg.winnerId = reader.readInt32();
          break;
        }
        case 4: {
          msg.loserId = reader.readInt32();
          break;
        }
        case 5: {
          msg.paoPlayerId = reader.readInt32();
          break;
        }
        case 6: {
          msg.han = reader.readInt32();
          break;
        }
        case 7: {
          msg.fu = reader.readInt32();
          break;
        }
        case 8: {
          if (reader.isDelimited()) {
            msg.yaku.push(...reader.readPackedInt32());
          } else {
            msg.yaku.push(reader.readInt32());
          }
          break;
        }
        case 9: {
          if (reader.isDelimited()) {
            msg.riichiBets.push(...reader.readPackedInt32());
          } else {
            msg.riichiBets.push(reader.readInt32());
          }
          break;
        }
        case 10: {
          msg.dora = reader.readInt32();
          break;
        }
        case 11: {
          msg.uradora = reader.readInt32();
          break;
        }
        case 12: {
          msg.kandora = reader.readInt32();
          break;
        }
        case 13: {
          msg.kanuradora = reader.readInt32();
          break;
        }
        case 14: {
          msg.openHand = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const MultironWin = {
  /**
   * Serializes MultironWin to protobuf.
   */
  encode: function(msg) {
    return MultironWin._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes MultironWin from protobuf.
   */
  decode: function(bytes) {
    return MultironWin._readMessage(
      MultironWin.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes MultironWin with all fields set to their default value.
   */
  initialize: function() {
    return {
      winnerId: 0,
      paoPlayerId: 0,
      han: 0,
      fu: 0,
      yaku: [],
      dora: 0,
      uradora: 0,
      kandora: 0,
      kanuradora: 0,
      openHand: false
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if (msg.winnerId) {
      writer.writeInt32(1, msg.winnerId);
    }
    if (msg.paoPlayerId) {
      writer.writeInt32(2, msg.paoPlayerId);
    }
    if (msg.han) {
      writer.writeInt32(3, msg.han);
    }
    if (msg.fu) {
      writer.writeInt32(4, msg.fu);
    }
    if ((_a = msg.yaku) == null ? void 0 : _a.length) {
      writer.writePackedInt32(5, msg.yaku);
    }
    if (msg.dora) {
      writer.writeInt32(6, msg.dora);
    }
    if (msg.uradora) {
      writer.writeInt32(7, msg.uradora);
    }
    if (msg.kandora) {
      writer.writeInt32(8, msg.kandora);
    }
    if (msg.kanuradora) {
      writer.writeInt32(9, msg.kanuradora);
    }
    if (msg.openHand) {
      writer.writeBool(10, msg.openHand);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.winnerId = reader.readInt32();
          break;
        }
        case 2: {
          msg.paoPlayerId = reader.readInt32();
          break;
        }
        case 3: {
          msg.han = reader.readInt32();
          break;
        }
        case 4: {
          msg.fu = reader.readInt32();
          break;
        }
        case 5: {
          if (reader.isDelimited()) {
            msg.yaku.push(...reader.readPackedInt32());
          } else {
            msg.yaku.push(reader.readInt32());
          }
          break;
        }
        case 6: {
          msg.dora = reader.readInt32();
          break;
        }
        case 7: {
          msg.uradora = reader.readInt32();
          break;
        }
        case 8: {
          msg.kandora = reader.readInt32();
          break;
        }
        case 9: {
          msg.kanuradora = reader.readInt32();
          break;
        }
        case 10: {
          msg.openHand = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const MultironResult = {
  /**
   * Serializes MultironResult to protobuf.
   */
  encode: function(msg) {
    return MultironResult._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes MultironResult from protobuf.
   */
  decode: function(bytes) {
    return MultironResult._readMessage(
      MultironResult.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes MultironResult with all fields set to their default value.
   */
  initialize: function() {
    return {
      roundIndex: 0,
      honba: 0,
      loserId: 0,
      multiRon: 0,
      wins: [],
      riichiBets: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a, _b;
    if (msg.roundIndex) {
      writer.writeInt32(1, msg.roundIndex);
    }
    if (msg.honba) {
      writer.writeInt32(2, msg.honba);
    }
    if (msg.loserId) {
      writer.writeInt32(3, msg.loserId);
    }
    if (msg.multiRon) {
      writer.writeInt32(4, msg.multiRon);
    }
    if ((_a = msg.wins) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        5,
        msg.wins,
        MultironWin._writeMessage
      );
    }
    if ((_b = msg.riichiBets) == null ? void 0 : _b.length) {
      writer.writePackedInt32(6, msg.riichiBets);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.roundIndex = reader.readInt32();
          break;
        }
        case 2: {
          msg.honba = reader.readInt32();
          break;
        }
        case 3: {
          msg.loserId = reader.readInt32();
          break;
        }
        case 4: {
          msg.multiRon = reader.readInt32();
          break;
        }
        case 5: {
          const m = MultironWin.initialize();
          reader.readMessage(m, MultironWin._readMessage);
          msg.wins.push(m);
          break;
        }
        case 6: {
          if (reader.isDelimited()) {
            msg.riichiBets.push(...reader.readPackedInt32());
          } else {
            msg.riichiBets.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const TsumoResult = {
  /**
   * Serializes TsumoResult to protobuf.
   */
  encode: function(msg) {
    return TsumoResult._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes TsumoResult from protobuf.
   */
  decode: function(bytes) {
    return TsumoResult._readMessage(
      TsumoResult.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes TsumoResult with all fields set to their default value.
   */
  initialize: function() {
    return {
      roundIndex: 0,
      honba: 0,
      winnerId: 0,
      paoPlayerId: 0,
      han: 0,
      fu: 0,
      yaku: [],
      riichiBets: [],
      dora: 0,
      uradora: 0,
      kandora: 0,
      kanuradora: 0,
      openHand: false
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a, _b;
    if (msg.roundIndex) {
      writer.writeInt32(1, msg.roundIndex);
    }
    if (msg.honba) {
      writer.writeInt32(2, msg.honba);
    }
    if (msg.winnerId) {
      writer.writeInt32(3, msg.winnerId);
    }
    if (msg.paoPlayerId) {
      writer.writeInt32(4, msg.paoPlayerId);
    }
    if (msg.han) {
      writer.writeInt32(5, msg.han);
    }
    if (msg.fu) {
      writer.writeInt32(6, msg.fu);
    }
    if ((_a = msg.yaku) == null ? void 0 : _a.length) {
      writer.writePackedInt32(7, msg.yaku);
    }
    if ((_b = msg.riichiBets) == null ? void 0 : _b.length) {
      writer.writePackedInt32(8, msg.riichiBets);
    }
    if (msg.dora) {
      writer.writeInt32(9, msg.dora);
    }
    if (msg.uradora) {
      writer.writeInt32(10, msg.uradora);
    }
    if (msg.kandora) {
      writer.writeInt32(11, msg.kandora);
    }
    if (msg.kanuradora) {
      writer.writeInt32(12, msg.kanuradora);
    }
    if (msg.openHand) {
      writer.writeBool(13, msg.openHand);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.roundIndex = reader.readInt32();
          break;
        }
        case 2: {
          msg.honba = reader.readInt32();
          break;
        }
        case 3: {
          msg.winnerId = reader.readInt32();
          break;
        }
        case 4: {
          msg.paoPlayerId = reader.readInt32();
          break;
        }
        case 5: {
          msg.han = reader.readInt32();
          break;
        }
        case 6: {
          msg.fu = reader.readInt32();
          break;
        }
        case 7: {
          if (reader.isDelimited()) {
            msg.yaku.push(...reader.readPackedInt32());
          } else {
            msg.yaku.push(reader.readInt32());
          }
          break;
        }
        case 8: {
          if (reader.isDelimited()) {
            msg.riichiBets.push(...reader.readPackedInt32());
          } else {
            msg.riichiBets.push(reader.readInt32());
          }
          break;
        }
        case 9: {
          msg.dora = reader.readInt32();
          break;
        }
        case 10: {
          msg.uradora = reader.readInt32();
          break;
        }
        case 11: {
          msg.kandora = reader.readInt32();
          break;
        }
        case 12: {
          msg.kanuradora = reader.readInt32();
          break;
        }
        case 13: {
          msg.openHand = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const DrawResult = {
  /**
   * Serializes DrawResult to protobuf.
   */
  encode: function(msg) {
    return DrawResult._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes DrawResult from protobuf.
   */
  decode: function(bytes) {
    return DrawResult._readMessage(
      DrawResult.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes DrawResult with all fields set to their default value.
   */
  initialize: function() {
    return {
      roundIndex: 0,
      honba: 0,
      riichiBets: [],
      tempai: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a, _b;
    if (msg.roundIndex) {
      writer.writeInt32(1, msg.roundIndex);
    }
    if (msg.honba) {
      writer.writeInt32(2, msg.honba);
    }
    if ((_a = msg.riichiBets) == null ? void 0 : _a.length) {
      writer.writePackedInt32(3, msg.riichiBets);
    }
    if ((_b = msg.tempai) == null ? void 0 : _b.length) {
      writer.writePackedInt32(4, msg.tempai);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.roundIndex = reader.readInt32();
          break;
        }
        case 2: {
          msg.honba = reader.readInt32();
          break;
        }
        case 3: {
          if (reader.isDelimited()) {
            msg.riichiBets.push(...reader.readPackedInt32());
          } else {
            msg.riichiBets.push(reader.readInt32());
          }
          break;
        }
        case 4: {
          if (reader.isDelimited()) {
            msg.tempai.push(...reader.readPackedInt32());
          } else {
            msg.tempai.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const AbortResult = {
  /**
   * Serializes AbortResult to protobuf.
   */
  encode: function(msg) {
    return AbortResult._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes AbortResult from protobuf.
   */
  decode: function(bytes) {
    return AbortResult._readMessage(
      AbortResult.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes AbortResult with all fields set to their default value.
   */
  initialize: function() {
    return {
      roundIndex: 0,
      honba: 0,
      riichiBets: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if (msg.roundIndex) {
      writer.writeInt32(1, msg.roundIndex);
    }
    if (msg.honba) {
      writer.writeInt32(2, msg.honba);
    }
    if ((_a = msg.riichiBets) == null ? void 0 : _a.length) {
      writer.writePackedInt32(3, msg.riichiBets);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.roundIndex = reader.readInt32();
          break;
        }
        case 2: {
          msg.honba = reader.readInt32();
          break;
        }
        case 3: {
          if (reader.isDelimited()) {
            msg.riichiBets.push(...reader.readPackedInt32());
          } else {
            msg.riichiBets.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const ChomboResult = {
  /**
   * Serializes ChomboResult to protobuf.
   */
  encode: function(msg) {
    return ChomboResult._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes ChomboResult from protobuf.
   */
  decode: function(bytes) {
    return ChomboResult._readMessage(
      ChomboResult.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes ChomboResult with all fields set to their default value.
   */
  initialize: function() {
    return {
      roundIndex: 0,
      honba: 0,
      loserId: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.roundIndex) {
      writer.writeInt32(1, msg.roundIndex);
    }
    if (msg.honba) {
      writer.writeInt32(2, msg.honba);
    }
    if (msg.loserId) {
      writer.writeInt32(3, msg.loserId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.roundIndex = reader.readInt32();
          break;
        }
        case 2: {
          msg.honba = reader.readInt32();
          break;
        }
        case 3: {
          msg.loserId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const NagashiResult = {
  /**
   * Serializes NagashiResult to protobuf.
   */
  encode: function(msg) {
    return NagashiResult._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes NagashiResult from protobuf.
   */
  decode: function(bytes) {
    return NagashiResult._readMessage(
      NagashiResult.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes NagashiResult with all fields set to their default value.
   */
  initialize: function() {
    return {
      roundIndex: 0,
      honba: 0,
      riichiBets: [],
      tempai: [],
      nagashi: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a, _b, _c;
    if (msg.roundIndex) {
      writer.writeInt32(1, msg.roundIndex);
    }
    if (msg.honba) {
      writer.writeInt32(2, msg.honba);
    }
    if ((_a = msg.riichiBets) == null ? void 0 : _a.length) {
      writer.writePackedInt32(3, msg.riichiBets);
    }
    if ((_b = msg.tempai) == null ? void 0 : _b.length) {
      writer.writePackedInt32(4, msg.tempai);
    }
    if ((_c = msg.nagashi) == null ? void 0 : _c.length) {
      writer.writePackedInt32(5, msg.nagashi);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.roundIndex = reader.readInt32();
          break;
        }
        case 2: {
          msg.honba = reader.readInt32();
          break;
        }
        case 3: {
          if (reader.isDelimited()) {
            msg.riichiBets.push(...reader.readPackedInt32());
          } else {
            msg.riichiBets.push(reader.readInt32());
          }
          break;
        }
        case 4: {
          if (reader.isDelimited()) {
            msg.tempai.push(...reader.readPackedInt32());
          } else {
            msg.tempai.push(reader.readInt32());
          }
          break;
        }
        case 5: {
          if (reader.isDelimited()) {
            msg.nagashi.push(...reader.readPackedInt32());
          } else {
            msg.nagashi.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const Round = {
  /**
   * Serializes Round to protobuf.
   */
  encode: function(msg) {
    return Round._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes Round from protobuf.
   */
  decode: function(bytes) {
    return Round._readMessage(Round.initialize(), new BinaryReader(bytes));
  },
  /**
   * Initializes Round with all fields set to their default value.
   */
  initialize: function() {
    return {
      ron: void 0,
      tsumo: void 0,
      multiron: void 0,
      draw: void 0,
      abort: void 0,
      chombo: void 0,
      nagashi: void 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ron != void 0) {
      writer.writeMessage(1, msg.ron, RonResult._writeMessage);
    }
    if (msg.tsumo != void 0) {
      writer.writeMessage(2, msg.tsumo, TsumoResult._writeMessage);
    }
    if (msg.multiron != void 0) {
      writer.writeMessage(3, msg.multiron, MultironResult._writeMessage);
    }
    if (msg.draw != void 0) {
      writer.writeMessage(4, msg.draw, DrawResult._writeMessage);
    }
    if (msg.abort != void 0) {
      writer.writeMessage(5, msg.abort, AbortResult._writeMessage);
    }
    if (msg.chombo != void 0) {
      writer.writeMessage(6, msg.chombo, ChomboResult._writeMessage);
    }
    if (msg.nagashi != void 0) {
      writer.writeMessage(7, msg.nagashi, NagashiResult._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.ron = RonResult.initialize();
          reader.readMessage(msg.ron, RonResult._readMessage);
          break;
        }
        case 2: {
          msg.tsumo = TsumoResult.initialize();
          reader.readMessage(msg.tsumo, TsumoResult._readMessage);
          break;
        }
        case 3: {
          msg.multiron = MultironResult.initialize();
          reader.readMessage(msg.multiron, MultironResult._readMessage);
          break;
        }
        case 4: {
          msg.draw = DrawResult.initialize();
          reader.readMessage(msg.draw, DrawResult._readMessage);
          break;
        }
        case 5: {
          msg.abort = AbortResult.initialize();
          reader.readMessage(msg.abort, AbortResult._readMessage);
          break;
        }
        case 6: {
          msg.chombo = ChomboResult.initialize();
          reader.readMessage(msg.chombo, ChomboResult._readMessage);
          break;
        }
        case 7: {
          msg.nagashi = NagashiResult.initialize();
          reader.readMessage(msg.nagashi, NagashiResult._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const GameResult = {
  /**
   * Serializes GameResult to protobuf.
   */
  encode: function(msg) {
    return GameResult._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes GameResult from protobuf.
   */
  decode: function(bytes) {
    return GameResult._readMessage(
      GameResult.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes GameResult with all fields set to their default value.
   */
  initialize: function() {
    return {
      sessionHash: "",
      date: void 0,
      replayLink: "",
      players: [],
      finalResults: [],
      penaltyLogs: [],
      rounds: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a, _b, _c, _d;
    if (msg.sessionHash) {
      writer.writeString(1, msg.sessionHash);
    }
    if (msg.date != void 0) {
      writer.writeString(2, msg.date);
    }
    if (msg.replayLink) {
      writer.writeString(3, msg.replayLink);
    }
    if ((_a = msg.players) == null ? void 0 : _a.length) {
      writer.writePackedInt32(4, msg.players);
    }
    if ((_b = msg.finalResults) == null ? void 0 : _b.length) {
      writer.writeRepeatedMessage(
        5,
        msg.finalResults,
        FinalResultOfSession._writeMessage
      );
    }
    if ((_c = msg.penaltyLogs) == null ? void 0 : _c.length) {
      writer.writeRepeatedMessage(
        6,
        msg.penaltyLogs,
        Penalty._writeMessage
      );
    }
    if ((_d = msg.rounds) == null ? void 0 : _d.length) {
      writer.writeRepeatedMessage(7, msg.rounds, Round._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.sessionHash = reader.readString();
          break;
        }
        case 2: {
          msg.date = reader.readString();
          break;
        }
        case 3: {
          msg.replayLink = reader.readString();
          break;
        }
        case 4: {
          if (reader.isDelimited()) {
            msg.players.push(...reader.readPackedInt32());
          } else {
            msg.players.push(reader.readInt32());
          }
          break;
        }
        case 5: {
          const m = FinalResultOfSession.initialize();
          reader.readMessage(m, FinalResultOfSession._readMessage);
          msg.finalResults.push(m);
          break;
        }
        case 6: {
          const m = Penalty.initialize();
          reader.readMessage(m, Penalty._readMessage);
          msg.penaltyLogs.push(m);
          break;
        }
        case 7: {
          const m = Round.initialize();
          reader.readMessage(m, Round._readMessage);
          msg.rounds.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const PlayerPlaceInSeries = {
  /**
   * Serializes PlayerPlaceInSeries to protobuf.
   */
  encode: function(msg) {
    return PlayerPlaceInSeries._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayerPlaceInSeries from protobuf.
   */
  decode: function(bytes) {
    return PlayerPlaceInSeries._readMessage(
      PlayerPlaceInSeries.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayerPlaceInSeries with all fields set to their default value.
   */
  initialize: function() {
    return {
      sessionHash: "",
      place: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.sessionHash) {
      writer.writeString(1, msg.sessionHash);
    }
    if (msg.place) {
      writer.writeInt32(2, msg.place);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.sessionHash = reader.readString();
          break;
        }
        case 2: {
          msg.place = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const SeriesResult = {
  /**
   * Serializes SeriesResult to protobuf.
   */
  encode: function(msg) {
    return SeriesResult._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes SeriesResult from protobuf.
   */
  decode: function(bytes) {
    return SeriesResult._readMessage(
      SeriesResult.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes SeriesResult with all fields set to their default value.
   */
  initialize: function() {
    return {
      player: Player.initialize(),
      bestSeries: [],
      bestSeriesScores: 0,
      bestSeriesPlaces: 0,
      bestSeriesAvgPlace: "",
      currentSeries: [],
      currentSeriesScores: 0,
      currentSeriesPlaces: 0,
      currentSeriesAvgPlace: ""
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a, _b;
    if (msg.player) {
      writer.writeMessage(1, msg.player, Player._writeMessage);
    }
    if ((_a = msg.bestSeries) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        2,
        msg.bestSeries,
        PlayerPlaceInSeries._writeMessage
      );
    }
    if (msg.bestSeriesScores) {
      writer.writeFloat(3, msg.bestSeriesScores);
    }
    if (msg.bestSeriesPlaces) {
      writer.writeInt32(4, msg.bestSeriesPlaces);
    }
    if (msg.bestSeriesAvgPlace) {
      writer.writeString(5, msg.bestSeriesAvgPlace);
    }
    if ((_b = msg.currentSeries) == null ? void 0 : _b.length) {
      writer.writeRepeatedMessage(
        6,
        msg.currentSeries,
        PlayerPlaceInSeries._writeMessage
      );
    }
    if (msg.currentSeriesScores) {
      writer.writeFloat(7, msg.currentSeriesScores);
    }
    if (msg.currentSeriesPlaces) {
      writer.writeInt32(8, msg.currentSeriesPlaces);
    }
    if (msg.currentSeriesAvgPlace) {
      writer.writeString(9, msg.currentSeriesAvgPlace);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.player, Player._readMessage);
          break;
        }
        case 2: {
          const m = PlayerPlaceInSeries.initialize();
          reader.readMessage(m, PlayerPlaceInSeries._readMessage);
          msg.bestSeries.push(m);
          break;
        }
        case 3: {
          msg.bestSeriesScores = reader.readFloat();
          break;
        }
        case 4: {
          msg.bestSeriesPlaces = reader.readInt32();
          break;
        }
        case 5: {
          msg.bestSeriesAvgPlace = reader.readString();
          break;
        }
        case 6: {
          const m = PlayerPlaceInSeries.initialize();
          reader.readMessage(m, PlayerPlaceInSeries._readMessage);
          msg.currentSeries.push(m);
          break;
        }
        case 7: {
          msg.currentSeriesScores = reader.readFloat();
          break;
        }
        case 8: {
          msg.currentSeriesPlaces = reader.readInt32();
          break;
        }
        case 9: {
          msg.currentSeriesAvgPlace = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const ReplacementPlayer = {
  /**
   * Serializes ReplacementPlayer to protobuf.
   */
  encode: function(msg) {
    return ReplacementPlayer._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes ReplacementPlayer from protobuf.
   */
  decode: function(bytes) {
    return ReplacementPlayer._readMessage(
      ReplacementPlayer.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes ReplacementPlayer with all fields set to their default value.
   */
  initialize: function() {
    return {
      id: 0,
      title: ""
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    if (msg.title) {
      writer.writeString(2, msg.title);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        case 2: {
          msg.title = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const RegisteredPlayer = {
  /**
   * Serializes RegisteredPlayer to protobuf.
   */
  encode: function(msg) {
    return RegisteredPlayer._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes RegisteredPlayer from protobuf.
   */
  decode: function(bytes) {
    return RegisteredPlayer._readMessage(
      RegisteredPlayer.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes RegisteredPlayer with all fields set to their default value.
   */
  initialize: function() {
    return {
      id: 0,
      title: "",
      localId: void 0,
      teamName: void 0,
      tenhouId: "",
      ignoreSeating: false,
      replacedBy: void 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    if (msg.title) {
      writer.writeString(2, msg.title);
    }
    if (msg.localId != void 0) {
      writer.writeInt32(3, msg.localId);
    }
    if (msg.teamName != void 0) {
      writer.writeString(4, msg.teamName);
    }
    if (msg.tenhouId) {
      writer.writeString(5, msg.tenhouId);
    }
    if (msg.ignoreSeating) {
      writer.writeBool(6, msg.ignoreSeating);
    }
    if (msg.replacedBy != void 0) {
      writer.writeMessage(7, msg.replacedBy, ReplacementPlayer._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        case 2: {
          msg.title = reader.readString();
          break;
        }
        case 3: {
          msg.localId = reader.readInt32();
          break;
        }
        case 4: {
          msg.teamName = reader.readString();
          break;
        }
        case 5: {
          msg.tenhouId = reader.readString();
          break;
        }
        case 6: {
          msg.ignoreSeating = reader.readBool();
          break;
        }
        case 7: {
          msg.replacedBy = ReplacementPlayer.initialize();
          reader.readMessage(msg.replacedBy, ReplacementPlayer._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const SessionHistoryResult = {
  /**
   * Serializes SessionHistoryResult to protobuf.
   */
  encode: function(msg) {
    return SessionHistoryResult._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes SessionHistoryResult from protobuf.
   */
  decode: function(bytes) {
    return SessionHistoryResult._readMessage(
      SessionHistoryResult.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes SessionHistoryResult with all fields set to their default value.
   */
  initialize: function() {
    return {
      sessionHash: "",
      eventId: 0,
      playerId: 0,
      score: 0,
      ratingDelta: 0,
      place: 0,
      title: ""
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.sessionHash) {
      writer.writeString(1, msg.sessionHash);
    }
    if (msg.eventId) {
      writer.writeInt32(2, msg.eventId);
    }
    if (msg.playerId) {
      writer.writeInt32(3, msg.playerId);
    }
    if (msg.score) {
      writer.writeInt32(4, msg.score);
    }
    if (msg.ratingDelta) {
      writer.writeFloat(5, msg.ratingDelta);
    }
    if (msg.place) {
      writer.writeInt32(6, msg.place);
    }
    if (msg.title) {
      writer.writeString(7, msg.title);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.sessionHash = reader.readString();
          break;
        }
        case 2: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 3: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 4: {
          msg.score = reader.readInt32();
          break;
        }
        case 5: {
          msg.ratingDelta = reader.readFloat();
          break;
        }
        case 6: {
          msg.place = reader.readInt32();
          break;
        }
        case 7: {
          msg.title = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const SessionHistoryResultTable = {
  /**
   * Serializes SessionHistoryResultTable to protobuf.
   */
  encode: function(msg) {
    return SessionHistoryResultTable._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes SessionHistoryResultTable from protobuf.
   */
  decode: function(bytes) {
    return SessionHistoryResultTable._readMessage(
      SessionHistoryResultTable.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes SessionHistoryResultTable with all fields set to their default value.
   */
  initialize: function() {
    return {
      tables: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.tables) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        1,
        msg.tables,
        SessionHistoryResult._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = SessionHistoryResult.initialize();
          reader.readMessage(m, SessionHistoryResult._readMessage);
          msg.tables.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const PlacesSummaryItem = {
  /**
   * Serializes PlacesSummaryItem to protobuf.
   */
  encode: function(msg) {
    return PlacesSummaryItem._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlacesSummaryItem from protobuf.
   */
  decode: function(bytes) {
    return PlacesSummaryItem._readMessage(
      PlacesSummaryItem.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlacesSummaryItem with all fields set to their default value.
   */
  initialize: function() {
    return {
      place: 0,
      count: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.place) {
      writer.writeInt32(1, msg.place);
    }
    if (msg.count) {
      writer.writeInt32(2, msg.count);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.place = reader.readInt32();
          break;
        }
        case 2: {
          msg.count = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const PlayerWinSummary = {
  /**
   * Serializes PlayerWinSummary to protobuf.
   */
  encode: function(msg) {
    return PlayerWinSummary._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayerWinSummary from protobuf.
   */
  decode: function(bytes) {
    return PlayerWinSummary._readMessage(
      PlayerWinSummary.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayerWinSummary with all fields set to their default value.
   */
  initialize: function() {
    return {
      ron: 0,
      tsumo: 0,
      chombo: 0,
      feed: 0,
      tsumofeed: 0,
      winsWithOpen: 0,
      winsWithRiichi: 0,
      winsWithDama: 0,
      unforcedFeedToOpen: 0,
      unforcedFeedToRiichi: 0,
      unforcedFeedToDama: 0,
      draw: 0,
      drawTempai: 0,
      pointsWon: 0,
      pointsLostRon: 0,
      pointsLostTsumo: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ron) {
      writer.writeInt32(1, msg.ron);
    }
    if (msg.tsumo) {
      writer.writeInt32(2, msg.tsumo);
    }
    if (msg.chombo) {
      writer.writeInt32(3, msg.chombo);
    }
    if (msg.feed) {
      writer.writeInt32(4, msg.feed);
    }
    if (msg.tsumofeed) {
      writer.writeInt32(5, msg.tsumofeed);
    }
    if (msg.winsWithOpen) {
      writer.writeInt32(6, msg.winsWithOpen);
    }
    if (msg.winsWithRiichi) {
      writer.writeInt32(7, msg.winsWithRiichi);
    }
    if (msg.winsWithDama) {
      writer.writeInt32(8, msg.winsWithDama);
    }
    if (msg.unforcedFeedToOpen) {
      writer.writeInt32(9, msg.unforcedFeedToOpen);
    }
    if (msg.unforcedFeedToRiichi) {
      writer.writeInt32(10, msg.unforcedFeedToRiichi);
    }
    if (msg.unforcedFeedToDama) {
      writer.writeInt32(11, msg.unforcedFeedToDama);
    }
    if (msg.draw) {
      writer.writeInt32(12, msg.draw);
    }
    if (msg.drawTempai) {
      writer.writeInt32(13, msg.drawTempai);
    }
    if (msg.pointsWon) {
      writer.writeInt32(14, msg.pointsWon);
    }
    if (msg.pointsLostRon) {
      writer.writeInt32(15, msg.pointsLostRon);
    }
    if (msg.pointsLostTsumo) {
      writer.writeInt32(16, msg.pointsLostTsumo);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.ron = reader.readInt32();
          break;
        }
        case 2: {
          msg.tsumo = reader.readInt32();
          break;
        }
        case 3: {
          msg.chombo = reader.readInt32();
          break;
        }
        case 4: {
          msg.feed = reader.readInt32();
          break;
        }
        case 5: {
          msg.tsumofeed = reader.readInt32();
          break;
        }
        case 6: {
          msg.winsWithOpen = reader.readInt32();
          break;
        }
        case 7: {
          msg.winsWithRiichi = reader.readInt32();
          break;
        }
        case 8: {
          msg.winsWithDama = reader.readInt32();
          break;
        }
        case 9: {
          msg.unforcedFeedToOpen = reader.readInt32();
          break;
        }
        case 10: {
          msg.unforcedFeedToRiichi = reader.readInt32();
          break;
        }
        case 11: {
          msg.unforcedFeedToDama = reader.readInt32();
          break;
        }
        case 12: {
          msg.draw = reader.readInt32();
          break;
        }
        case 13: {
          msg.drawTempai = reader.readInt32();
          break;
        }
        case 14: {
          msg.pointsWon = reader.readInt32();
          break;
        }
        case 15: {
          msg.pointsLostRon = reader.readInt32();
          break;
        }
        case 16: {
          msg.pointsLostTsumo = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const HandValueStat = {
  /**
   * Serializes HandValueStat to protobuf.
   */
  encode: function(msg) {
    return HandValueStat._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes HandValueStat from protobuf.
   */
  decode: function(bytes) {
    return HandValueStat._readMessage(
      HandValueStat.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes HandValueStat with all fields set to their default value.
   */
  initialize: function() {
    return {
      hanCount: 0,
      count: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.hanCount) {
      writer.writeInt32(1, msg.hanCount);
    }
    if (msg.count) {
      writer.writeInt32(2, msg.count);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.hanCount = reader.readInt32();
          break;
        }
        case 2: {
          msg.count = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const YakuStat = {
  /**
   * Serializes YakuStat to protobuf.
   */
  encode: function(msg) {
    return YakuStat._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes YakuStat from protobuf.
   */
  decode: function(bytes) {
    return YakuStat._readMessage(
      YakuStat.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes YakuStat with all fields set to their default value.
   */
  initialize: function() {
    return {
      yakuId: 0,
      count: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.yakuId) {
      writer.writeInt32(1, msg.yakuId);
    }
    if (msg.count) {
      writer.writeInt32(2, msg.count);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.yakuId = reader.readInt32();
          break;
        }
        case 2: {
          msg.count = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const RiichiSummary = {
  /**
   * Serializes RiichiSummary to protobuf.
   */
  encode: function(msg) {
    return RiichiSummary._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes RiichiSummary from protobuf.
   */
  decode: function(bytes) {
    return RiichiSummary._readMessage(
      RiichiSummary.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes RiichiSummary with all fields set to their default value.
   */
  initialize: function() {
    return {
      riichiWon: 0,
      riichiLost: 0,
      feedUnderRiichi: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.riichiWon) {
      writer.writeInt32(1, msg.riichiWon);
    }
    if (msg.riichiLost) {
      writer.writeInt32(2, msg.riichiLost);
    }
    if (msg.feedUnderRiichi) {
      writer.writeInt32(3, msg.feedUnderRiichi);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.riichiWon = reader.readInt32();
          break;
        }
        case 2: {
          msg.riichiLost = reader.readInt32();
          break;
        }
        case 3: {
          msg.feedUnderRiichi = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const DoraSummary = {
  /**
   * Serializes DoraSummary to protobuf.
   */
  encode: function(msg) {
    return DoraSummary._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes DoraSummary from protobuf.
   */
  decode: function(bytes) {
    return DoraSummary._readMessage(
      DoraSummary.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes DoraSummary with all fields set to their default value.
   */
  initialize: function() {
    return {
      count: 0,
      average: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.count) {
      writer.writeInt32(1, msg.count);
    }
    if (msg.average) {
      writer.writeFloat(2, msg.average);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.count = reader.readInt32();
          break;
        }
        case 2: {
          msg.average = reader.readFloat();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const Achievement = {
  /**
   * Serializes Achievement to protobuf.
   */
  encode: function(msg) {
    return Achievement._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes Achievement from protobuf.
   */
  decode: function(bytes) {
    return Achievement._readMessage(
      Achievement.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes Achievement with all fields set to their default value.
   */
  initialize: function() {
    return {
      achievementId: "",
      achievementData: ""
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.achievementId) {
      writer.writeString(1, msg.achievementId);
    }
    if (msg.achievementData) {
      writer.writeString(2, msg.achievementData);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.achievementId = reader.readString();
          break;
        }
        case 2: {
          msg.achievementData = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const PlayerSeating = {
  /**
   * Serializes PlayerSeating to protobuf.
   */
  encode: function(msg) {
    return PlayerSeating._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayerSeating from protobuf.
   */
  decode: function(bytes) {
    return PlayerSeating._readMessage(
      PlayerSeating.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayerSeating with all fields set to their default value.
   */
  initialize: function() {
    return {
      order: 0,
      playerId: 0,
      sessionId: 0,
      tableIndex: 0,
      rating: 0,
      playerTitle: ""
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.order) {
      writer.writeInt32(1, msg.order);
    }
    if (msg.playerId) {
      writer.writeInt32(2, msg.playerId);
    }
    if (msg.sessionId) {
      writer.writeInt32(3, msg.sessionId);
    }
    if (msg.tableIndex) {
      writer.writeInt32(4, msg.tableIndex);
    }
    if (msg.rating) {
      writer.writeFloat(5, msg.rating);
    }
    if (msg.playerTitle) {
      writer.writeString(6, msg.playerTitle);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.order = reader.readInt32();
          break;
        }
        case 2: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 3: {
          msg.sessionId = reader.readInt32();
          break;
        }
        case 4: {
          msg.tableIndex = reader.readInt32();
          break;
        }
        case 5: {
          msg.rating = reader.readFloat();
          break;
        }
        case 6: {
          msg.playerTitle = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const Uma = {
  /**
   * Serializes Uma to protobuf.
   */
  encode: function(msg) {
    return Uma._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes Uma from protobuf.
   */
  decode: function(bytes) {
    return Uma._readMessage(Uma.initialize(), new BinaryReader(bytes));
  },
  /**
   * Initializes Uma with all fields set to their default value.
   */
  initialize: function() {
    return {
      place1: 0,
      place2: 0,
      place3: 0,
      place4: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.place1) {
      writer.writeInt32(1, msg.place1);
    }
    if (msg.place2) {
      writer.writeInt32(2, msg.place2);
    }
    if (msg.place3) {
      writer.writeInt32(3, msg.place3);
    }
    if (msg.place4) {
      writer.writeInt32(4, msg.place4);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.place1 = reader.readInt32();
          break;
        }
        case 2: {
          msg.place2 = reader.readInt32();
          break;
        }
        case 3: {
          msg.place3 = reader.readInt32();
          break;
        }
        case 4: {
          msg.place4 = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const ComplexUma = {
  /**
   * Serializes ComplexUma to protobuf.
   */
  encode: function(msg) {
    return ComplexUma._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },
  /**
   * Deserializes ComplexUma from protobuf.
   */
  decode: function(bytes) {
    return ComplexUma._readMessage(
      ComplexUma.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes ComplexUma with all fields set to their default value.
   */
  initialize: function() {
    return {
      neg1: Uma.initialize(),
      neg3: Uma.initialize(),
      otherwise: Uma.initialize()
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.neg1) {
      writer.writeMessage(1, msg.neg1, Uma._writeMessage);
    }
    if (msg.neg3) {
      writer.writeMessage(2, msg.neg3, Uma._writeMessage);
    }
    if (msg.otherwise) {
      writer.writeMessage(3, msg.otherwise, Uma._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.neg1, Uma._readMessage);
          break;
        }
        case 2: {
          reader.readMessage(msg.neg3, Uma._readMessage);
          break;
        }
        case 3: {
          reader.readMessage(msg.otherwise, Uma._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const RulesetConfig = {
  /**
   * Serializes RulesetConfig to protobuf.
   */
  encode: function(msg) {
    return RulesetConfig._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes RulesetConfig from protobuf.
   */
  decode: function(bytes) {
    return RulesetConfig._readMessage(
      RulesetConfig.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes RulesetConfig with all fields set to their default value.
   */
  initialize: function() {
    return {
      complexUma: ComplexUma.initialize(),
      endingPolicy: EndingPolicy._fromInt(0),
      uma: Uma.initialize(),
      umaType: UmaType._fromInt(0),
      doubleronHonbaAtamahane: false,
      doubleronRiichiAtamahane: false,
      equalizeUma: false,
      extraChomboPayments: false,
      playAdditionalRounds: false,
      riichiGoesToWinner: false,
      tonpuusen: false,
      withAbortives: false,
      withAtamahane: false,
      withButtobi: false,
      withKazoe: false,
      withKiriageMangan: false,
      withKuitan: false,
      withLeadingDealerGameOver: false,
      withMultiYakumans: false,
      withNagashiMangan: false,
      withWinningDealerHonbaSkipped: false,
      chipsValue: 0,
      chomboPenalty: 0,
      gameExpirationTime: 0,
      goalPoints: 0,
      maxPenalty: 0,
      minPenalty: 0,
      oka: 0,
      penaltyStep: 0,
      replacementPlayerFixedPoints: 0,
      replacementPlayerOverrideUma: 0,
      startPoints: 0,
      startRating: 0,
      allowedYaku: [],
      yakuWithPao: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a, _b;
    if (msg.complexUma) {
      writer.writeMessage(1, msg.complexUma, ComplexUma._writeMessage);
    }
    if (msg.endingPolicy && EndingPolicy._toInt(msg.endingPolicy)) {
      writer.writeEnum(2, EndingPolicy._toInt(msg.endingPolicy));
    }
    if (msg.uma) {
      writer.writeMessage(3, msg.uma, Uma._writeMessage);
    }
    if (msg.umaType && UmaType._toInt(msg.umaType)) {
      writer.writeEnum(4, UmaType._toInt(msg.umaType));
    }
    if (msg.doubleronHonbaAtamahane) {
      writer.writeBool(5, msg.doubleronHonbaAtamahane);
    }
    if (msg.doubleronRiichiAtamahane) {
      writer.writeBool(6, msg.doubleronRiichiAtamahane);
    }
    if (msg.equalizeUma) {
      writer.writeBool(7, msg.equalizeUma);
    }
    if (msg.extraChomboPayments) {
      writer.writeBool(8, msg.extraChomboPayments);
    }
    if (msg.playAdditionalRounds) {
      writer.writeBool(9, msg.playAdditionalRounds);
    }
    if (msg.riichiGoesToWinner) {
      writer.writeBool(10, msg.riichiGoesToWinner);
    }
    if (msg.tonpuusen) {
      writer.writeBool(11, msg.tonpuusen);
    }
    if (msg.withAbortives) {
      writer.writeBool(12, msg.withAbortives);
    }
    if (msg.withAtamahane) {
      writer.writeBool(13, msg.withAtamahane);
    }
    if (msg.withButtobi) {
      writer.writeBool(14, msg.withButtobi);
    }
    if (msg.withKazoe) {
      writer.writeBool(15, msg.withKazoe);
    }
    if (msg.withKiriageMangan) {
      writer.writeBool(16, msg.withKiriageMangan);
    }
    if (msg.withKuitan) {
      writer.writeBool(17, msg.withKuitan);
    }
    if (msg.withLeadingDealerGameOver) {
      writer.writeBool(18, msg.withLeadingDealerGameOver);
    }
    if (msg.withMultiYakumans) {
      writer.writeBool(19, msg.withMultiYakumans);
    }
    if (msg.withNagashiMangan) {
      writer.writeBool(20, msg.withNagashiMangan);
    }
    if (msg.withWinningDealerHonbaSkipped) {
      writer.writeBool(21, msg.withWinningDealerHonbaSkipped);
    }
    if (msg.chipsValue) {
      writer.writeInt32(22, msg.chipsValue);
    }
    if (msg.chomboPenalty) {
      writer.writeInt32(23, msg.chomboPenalty);
    }
    if (msg.gameExpirationTime) {
      writer.writeInt32(24, msg.gameExpirationTime);
    }
    if (msg.goalPoints) {
      writer.writeInt32(25, msg.goalPoints);
    }
    if (msg.maxPenalty) {
      writer.writeInt32(26, msg.maxPenalty);
    }
    if (msg.minPenalty) {
      writer.writeInt32(27, msg.minPenalty);
    }
    if (msg.oka) {
      writer.writeInt32(28, msg.oka);
    }
    if (msg.penaltyStep) {
      writer.writeInt32(29, msg.penaltyStep);
    }
    if (msg.replacementPlayerFixedPoints) {
      writer.writeInt32(30, msg.replacementPlayerFixedPoints);
    }
    if (msg.replacementPlayerOverrideUma) {
      writer.writeInt32(31, msg.replacementPlayerOverrideUma);
    }
    if (msg.startPoints) {
      writer.writeInt32(32, msg.startPoints);
    }
    if (msg.startRating) {
      writer.writeInt32(33, msg.startRating);
    }
    if ((_a = msg.allowedYaku) == null ? void 0 : _a.length) {
      writer.writePackedInt32(34, msg.allowedYaku);
    }
    if ((_b = msg.yakuWithPao) == null ? void 0 : _b.length) {
      writer.writePackedInt32(35, msg.yakuWithPao);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.complexUma, ComplexUma._readMessage);
          break;
        }
        case 2: {
          msg.endingPolicy = EndingPolicy._fromInt(reader.readEnum());
          break;
        }
        case 3: {
          reader.readMessage(msg.uma, Uma._readMessage);
          break;
        }
        case 4: {
          msg.umaType = UmaType._fromInt(reader.readEnum());
          break;
        }
        case 5: {
          msg.doubleronHonbaAtamahane = reader.readBool();
          break;
        }
        case 6: {
          msg.doubleronRiichiAtamahane = reader.readBool();
          break;
        }
        case 7: {
          msg.equalizeUma = reader.readBool();
          break;
        }
        case 8: {
          msg.extraChomboPayments = reader.readBool();
          break;
        }
        case 9: {
          msg.playAdditionalRounds = reader.readBool();
          break;
        }
        case 10: {
          msg.riichiGoesToWinner = reader.readBool();
          break;
        }
        case 11: {
          msg.tonpuusen = reader.readBool();
          break;
        }
        case 12: {
          msg.withAbortives = reader.readBool();
          break;
        }
        case 13: {
          msg.withAtamahane = reader.readBool();
          break;
        }
        case 14: {
          msg.withButtobi = reader.readBool();
          break;
        }
        case 15: {
          msg.withKazoe = reader.readBool();
          break;
        }
        case 16: {
          msg.withKiriageMangan = reader.readBool();
          break;
        }
        case 17: {
          msg.withKuitan = reader.readBool();
          break;
        }
        case 18: {
          msg.withLeadingDealerGameOver = reader.readBool();
          break;
        }
        case 19: {
          msg.withMultiYakumans = reader.readBool();
          break;
        }
        case 20: {
          msg.withNagashiMangan = reader.readBool();
          break;
        }
        case 21: {
          msg.withWinningDealerHonbaSkipped = reader.readBool();
          break;
        }
        case 22: {
          msg.chipsValue = reader.readInt32();
          break;
        }
        case 23: {
          msg.chomboPenalty = reader.readInt32();
          break;
        }
        case 24: {
          msg.gameExpirationTime = reader.readInt32();
          break;
        }
        case 25: {
          msg.goalPoints = reader.readInt32();
          break;
        }
        case 26: {
          msg.maxPenalty = reader.readInt32();
          break;
        }
        case 27: {
          msg.minPenalty = reader.readInt32();
          break;
        }
        case 28: {
          msg.oka = reader.readInt32();
          break;
        }
        case 29: {
          msg.penaltyStep = reader.readInt32();
          break;
        }
        case 30: {
          msg.replacementPlayerFixedPoints = reader.readInt32();
          break;
        }
        case 31: {
          msg.replacementPlayerOverrideUma = reader.readInt32();
          break;
        }
        case 32: {
          msg.startPoints = reader.readInt32();
          break;
        }
        case 33: {
          msg.startRating = reader.readInt32();
          break;
        }
        case 34: {
          if (reader.isDelimited()) {
            msg.allowedYaku.push(...reader.readPackedInt32());
          } else {
            msg.allowedYaku.push(reader.readInt32());
          }
          break;
        }
        case 35: {
          if (reader.isDelimited()) {
            msg.yakuWithPao.push(...reader.readPackedInt32());
          } else {
            msg.yakuWithPao.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const GenericEventPayload = {
  /**
   * Serializes GenericEventPayload to protobuf.
   */
  encode: function(msg) {
    return GenericEventPayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GenericEventPayload from protobuf.
   */
  decode: function(bytes) {
    return GenericEventPayload._readMessage(
      GenericEventPayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes GenericEventPayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      eventId: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventTypeIcon = ({
  event,
  iconSize,
  size
}) => {
  const i18n2 = useI18n();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    event.type === EventType.EVENT_TYPE_LOCAL && /* @__PURE__ */ jsx(Tooltip, { openDelay: 500, position: "bottom", withArrow: true, label: i18n2._t("Local rating"), children: /* @__PURE__ */ jsx(Avatar, { color: "green", radius: "xl", size, children: /* @__PURE__ */ jsx(IconFriends, { size: iconSize }) }) }),
    event.type === EventType.EVENT_TYPE_TOURNAMENT && /* @__PURE__ */ jsx(Tooltip, { openDelay: 500, position: "bottom", withArrow: true, label: i18n2._t("Tournament"), children: /* @__PURE__ */ jsx(Avatar, { color: "red", radius: "xl", size, children: /* @__PURE__ */ jsx(IconTournament, { size: iconSize }) }) }),
    event.type === EventType.EVENT_TYPE_ONLINE && /* @__PURE__ */ jsx(Tooltip, { openDelay: 500, position: "bottom", withArrow: true, label: i18n2._t("Online event"), children: /* @__PURE__ */ jsx(Avatar, { color: "blue", radius: "xl", size, children: /* @__PURE__ */ jsx(IconNetwork, { size: iconSize }) }) })
  ] });
};
const globals = {
  data: {
    eventId: null,
    type: null,
    isPrescripted: false,
    isTeam: false,
    hasSeries: false,
    ratingHidden: false,
    loading: false,
    withChips: false
  },
  setData: () => {
  }
};
const globalsCtx = createContext(globals);
const Isomorphic = createContext({});
const useIsomorphicState = (initial, key, effect, dependencies) => {
  const context = useContext(Isomorphic);
  const [data, setData] = useState(context[key] || initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(context[key + "__err"] || null);
  if (context.requests) {
    context.requests.push(
      effect().then((res) => context[key] = res).catch((err) => context[key + "__err"] = err)
    );
  }
  useEffect(() => {
    if (context[key]) {
      setData(context[key]);
    } else {
      setLoading(true);
      if (context.__running !== void 0 && context.__running === 0) {
        nprogress.reset();
        nprogress.start();
      }
      context.__running++;
      effect().then((res) => {
        setData(res);
      }).catch((err) => {
        setError(err);
      }).finally(() => {
        context.__running--;
        if (context.__running === 0) {
          nprogress.complete();
        }
        setLoading(false);
      });
    }
  }, dependencies);
  return [data, error, loading];
};
async function GetEvents(eventsGetEventsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetEvents",
    EventsGetEventsPayload.encode(eventsGetEventsPayload),
    config
  );
  return EventsGetEventsResponse.decode(response);
}
async function GetEventsById(eventsGetEventsByIdPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetEventsById",
    EventsGetEventsByIdPayload.encode(eventsGetEventsByIdPayload),
    config
  );
  return EventsGetEventsByIdResponse.decode(response);
}
async function GetGameConfig(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetGameConfig",
    GenericEventPayload.encode(genericEventPayload),
    config
  );
  return GameConfig.decode(response);
}
async function GetRatingTable(eventsGetRatingTablePayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetRatingTable",
    EventsGetRatingTablePayload.encode(eventsGetRatingTablePayload),
    config
  );
  return EventsGetRatingTableResponse.decode(response);
}
async function GetLastGames(eventsGetLastGamesPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetLastGames",
    EventsGetLastGamesPayload.encode(eventsGetLastGamesPayload),
    config
  );
  return EventsGetLastGamesResponse.decode(response);
}
async function GetGame(eventsGetGamePayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetGame",
    EventsGetGamePayload.encode(eventsGetGamePayload),
    config
  );
  return EventsGetGameResponse.decode(response);
}
async function GetGamesSeries(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetGamesSeries",
    GenericEventPayload.encode(genericEventPayload),
    config
  );
  return EventsGetGamesSeriesResponse.decode(response);
}
async function GetAllRegisteredPlayers(eventsGetAllRegisteredPlayersPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetAllRegisteredPlayers",
    EventsGetAllRegisteredPlayersPayload.encode(
      eventsGetAllRegisteredPlayersPayload
    ),
    config
  );
  return EventsGetAllRegisteredPlayersResponse.decode(response);
}
async function GetTimerState(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetTimerState",
    GenericEventPayload.encode(genericEventPayload),
    config
  );
  return EventsGetTimerStateResponse.decode(response);
}
async function GetPlayerStats(playersGetPlayerStatsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetPlayerStats",
    PlayersGetPlayerStatsPayload.encode(playersGetPlayerStatsPayload),
    config
  );
  return PlayersGetPlayerStatsResponse.decode(response);
}
async function AddOnlineReplay(gamesAddOnlineReplayPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/AddOnlineReplay",
    GamesAddOnlineReplayPayload.encode(gamesAddOnlineReplayPayload),
    config
  );
  return GamesAddOnlineReplayResponse.decode(response);
}
async function GetAchievements(eventsGetAchievementsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetAchievements",
    EventsGetAchievementsPayload.encode(eventsGetAchievementsPayload),
    config
  );
  return EventsGetAchievementsResponse.decode(response);
}
async function GetPlayer(playersGetPlayerPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetPlayer",
    PlayersGetPlayerPayload.encode(playersGetPlayerPayload),
    config
  );
  return PlayersGetPlayerResponse.decode(response);
}
async function GetCurrentSeating(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetCurrentSeating",
    GenericEventPayload.encode(genericEventPayload),
    config
  );
  return EventsGetCurrentSeatingResponse.decode(response);
}
const EventsGetEventsPayload = {
  /**
   * Serializes EventsGetEventsPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetEventsPayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetEventsPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetEventsPayload._readMessage(
      EventsGetEventsPayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetEventsPayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      limit: 0,
      offset: 0,
      filterUnlisted: false
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.limit) {
      writer.writeInt32(1, msg.limit);
    }
    if (msg.offset) {
      writer.writeInt32(2, msg.offset);
    }
    if (msg.filterUnlisted) {
      writer.writeBool(3, msg.filterUnlisted);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.limit = reader.readInt32();
          break;
        }
        case 2: {
          msg.offset = reader.readInt32();
          break;
        }
        case 3: {
          msg.filterUnlisted = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetEventsResponse = {
  /**
   * Serializes EventsGetEventsResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetEventsResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetEventsResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetEventsResponse._readMessage(
      EventsGetEventsResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetEventsResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      total: 0,
      events: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if (msg.total) {
      writer.writeInt32(1, msg.total);
    }
    if ((_a = msg.events) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        2,
        msg.events,
        Event._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.total = reader.readInt32();
          break;
        }
        case 2: {
          const m = Event.initialize();
          reader.readMessage(m, Event._readMessage);
          msg.events.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetEventsByIdPayload = {
  /**
   * Serializes EventsGetEventsByIdPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetEventsByIdPayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetEventsByIdPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetEventsByIdPayload._readMessage(
      EventsGetEventsByIdPayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetEventsByIdPayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      ids: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.ids) == null ? void 0 : _a.length) {
      writer.writePackedInt32(1, msg.ids);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.ids.push(...reader.readPackedInt32());
          } else {
            msg.ids.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetEventsByIdResponse = {
  /**
   * Serializes EventsGetEventsByIdResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetEventsByIdResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetEventsByIdResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetEventsByIdResponse._readMessage(
      EventsGetEventsByIdResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetEventsByIdResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      events: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.events) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        1,
        msg.events,
        Event._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = Event.initialize();
          reader.readMessage(m, Event._readMessage);
          msg.events.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetRatingTablePayload = {
  /**
   * Serializes EventsGetRatingTablePayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetRatingTablePayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetRatingTablePayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetRatingTablePayload._readMessage(
      EventsGetRatingTablePayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetRatingTablePayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      eventIdList: [],
      orderBy: "",
      order: "",
      withPrefinished: void 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.eventIdList) == null ? void 0 : _a.length) {
      writer.writePackedInt32(1, msg.eventIdList);
    }
    if (msg.orderBy) {
      writer.writeString(2, msg.orderBy);
    }
    if (msg.order) {
      writer.writeString(3, msg.order);
    }
    if (msg.withPrefinished != void 0) {
      writer.writeBool(4, msg.withPrefinished);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.eventIdList.push(...reader.readPackedInt32());
          } else {
            msg.eventIdList.push(reader.readInt32());
          }
          break;
        }
        case 2: {
          msg.orderBy = reader.readString();
          break;
        }
        case 3: {
          msg.order = reader.readString();
          break;
        }
        case 4: {
          msg.withPrefinished = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetRatingTableResponse = {
  /**
   * Serializes EventsGetRatingTableResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetRatingTableResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetRatingTableResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetRatingTableResponse._readMessage(
      EventsGetRatingTableResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetRatingTableResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      list: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.list) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        1,
        msg.list,
        PlayerInRating._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = PlayerInRating.initialize();
          reader.readMessage(m, PlayerInRating._readMessage);
          msg.list.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetLastGamesPayload = {
  /**
   * Serializes EventsGetLastGamesPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetLastGamesPayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetLastGamesPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetLastGamesPayload._readMessage(
      EventsGetLastGamesPayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetLastGamesPayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      eventIdList: [],
      limit: 0,
      offset: 0,
      orderBy: void 0,
      order: void 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.eventIdList) == null ? void 0 : _a.length) {
      writer.writePackedInt32(1, msg.eventIdList);
    }
    if (msg.limit) {
      writer.writeInt32(2, msg.limit);
    }
    if (msg.offset) {
      writer.writeInt32(3, msg.offset);
    }
    if (msg.orderBy != void 0) {
      writer.writeString(4, msg.orderBy);
    }
    if (msg.order != void 0) {
      writer.writeString(5, msg.order);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.eventIdList.push(...reader.readPackedInt32());
          } else {
            msg.eventIdList.push(reader.readInt32());
          }
          break;
        }
        case 2: {
          msg.limit = reader.readInt32();
          break;
        }
        case 3: {
          msg.offset = reader.readInt32();
          break;
        }
        case 4: {
          msg.orderBy = reader.readString();
          break;
        }
        case 5: {
          msg.order = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetLastGamesResponse = {
  /**
   * Serializes EventsGetLastGamesResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetLastGamesResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetLastGamesResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetLastGamesResponse._readMessage(
      EventsGetLastGamesResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetLastGamesResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      games: [],
      players: [],
      totalGames: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a, _b;
    if ((_a = msg.games) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        1,
        msg.games,
        GameResult._writeMessage
      );
    }
    if ((_b = msg.players) == null ? void 0 : _b.length) {
      writer.writeRepeatedMessage(
        2,
        msg.players,
        Player._writeMessage
      );
    }
    if (msg.totalGames) {
      writer.writeInt32(3, msg.totalGames);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = GameResult.initialize();
          reader.readMessage(m, GameResult._readMessage);
          msg.games.push(m);
          break;
        }
        case 2: {
          const m = Player.initialize();
          reader.readMessage(m, Player._readMessage);
          msg.players.push(m);
          break;
        }
        case 3: {
          msg.totalGames = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetGamePayload = {
  /**
   * Serializes EventsGetGamePayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetGamePayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetGamePayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetGamePayload._readMessage(
      EventsGetGamePayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetGamePayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      sessionHash: ""
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.sessionHash) {
      writer.writeString(1, msg.sessionHash);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.sessionHash = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetGameResponse = {
  /**
   * Serializes EventsGetGameResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetGameResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetGameResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetGameResponse._readMessage(
      EventsGetGameResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetGameResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      game: GameResult.initialize(),
      players: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if (msg.game) {
      writer.writeMessage(1, msg.game, GameResult._writeMessage);
    }
    if ((_a = msg.players) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        2,
        msg.players,
        Player._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.game, GameResult._readMessage);
          break;
        }
        case 2: {
          const m = Player.initialize();
          reader.readMessage(m, Player._readMessage);
          msg.players.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetGamesSeriesResponse = {
  /**
   * Serializes EventsGetGamesSeriesResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetGamesSeriesResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetGamesSeriesResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetGamesSeriesResponse._readMessage(
      EventsGetGamesSeriesResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetGamesSeriesResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      results: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.results) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        1,
        msg.results,
        SeriesResult._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = SeriesResult.initialize();
          reader.readMessage(m, SeriesResult._readMessage);
          msg.results.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetAllRegisteredPlayersPayload = {
  /**
   * Serializes EventsGetAllRegisteredPlayersPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetAllRegisteredPlayersPayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetAllRegisteredPlayersPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetAllRegisteredPlayersPayload._readMessage(
      EventsGetAllRegisteredPlayersPayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetAllRegisteredPlayersPayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      eventIds: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.eventIds) == null ? void 0 : _a.length) {
      writer.writePackedInt32(1, msg.eventIds);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.eventIds.push(...reader.readPackedInt32());
          } else {
            msg.eventIds.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetAllRegisteredPlayersResponse = {
  /**
   * Serializes EventsGetAllRegisteredPlayersResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetAllRegisteredPlayersResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetAllRegisteredPlayersResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetAllRegisteredPlayersResponse._readMessage(
      EventsGetAllRegisteredPlayersResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetAllRegisteredPlayersResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      players: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.players) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        1,
        msg.players,
        RegisteredPlayer._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = RegisteredPlayer.initialize();
          reader.readMessage(m, RegisteredPlayer._readMessage);
          msg.players.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetTimerStateResponse = {
  /**
   * Serializes EventsGetTimerStateResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetTimerStateResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetTimerStateResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetTimerStateResponse._readMessage(
      EventsGetTimerStateResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetTimerStateResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      started: false,
      finished: false,
      timeRemaining: 0,
      waitingForTimer: false,
      haveAutostart: false,
      autostartTimer: false,
      showSeating: false
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.started) {
      writer.writeBool(1, msg.started);
    }
    if (msg.finished) {
      writer.writeBool(2, msg.finished);
    }
    if (msg.timeRemaining) {
      writer.writeInt32(3, msg.timeRemaining);
    }
    if (msg.waitingForTimer) {
      writer.writeBool(4, msg.waitingForTimer);
    }
    if (msg.haveAutostart) {
      writer.writeBool(5, msg.haveAutostart);
    }
    if (msg.autostartTimer) {
      writer.writeBool(6, msg.autostartTimer);
    }
    if (msg.showSeating) {
      writer.writeBool(7, msg.showSeating);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.started = reader.readBool();
          break;
        }
        case 2: {
          msg.finished = reader.readBool();
          break;
        }
        case 3: {
          msg.timeRemaining = reader.readInt32();
          break;
        }
        case 4: {
          msg.waitingForTimer = reader.readBool();
          break;
        }
        case 5: {
          msg.haveAutostart = reader.readBool();
          break;
        }
        case 6: {
          msg.autostartTimer = reader.readBool();
          break;
        }
        case 7: {
          msg.showSeating = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const PlayersGetPlayerStatsPayload = {
  /**
   * Serializes PlayersGetPlayerStatsPayload to protobuf.
   */
  encode: function(msg) {
    return PlayersGetPlayerStatsPayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetPlayerStatsPayload from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetPlayerStatsPayload._readMessage(
      PlayersGetPlayerStatsPayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetPlayerStatsPayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      playerId: 0,
      eventIdList: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    if ((_a = msg.eventIdList) == null ? void 0 : _a.length) {
      writer.writePackedInt32(2, msg.eventIdList);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 2: {
          if (reader.isDelimited()) {
            msg.eventIdList.push(...reader.readPackedInt32());
          } else {
            msg.eventIdList.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const PlayersGetPlayerStatsResponse = {
  /**
   * Serializes PlayersGetPlayerStatsResponse to protobuf.
   */
  encode: function(msg) {
    return PlayersGetPlayerStatsResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetPlayerStatsResponse from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetPlayerStatsResponse._readMessage(
      PlayersGetPlayerStatsResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetPlayerStatsResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      ratingHistory: [],
      scoreHistory: [],
      playersInfo: [],
      placesSummary: [],
      totalPlayedGames: 0,
      totalPlayedRounds: 0,
      winSummary: PlayerWinSummary.initialize(),
      handsValueSummary: [],
      yakuSummary: [],
      riichiSummary: RiichiSummary.initialize(),
      doraStat: DoraSummary.initialize()
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a, _b, _c, _d, _e, _f;
    if ((_a = msg.ratingHistory) == null ? void 0 : _a.length) {
      writer.writePackedInt32(1, msg.ratingHistory);
    }
    if ((_b = msg.scoreHistory) == null ? void 0 : _b.length) {
      writer.writeRepeatedMessage(
        2,
        msg.scoreHistory,
        SessionHistoryResultTable._writeMessage
      );
    }
    if ((_c = msg.playersInfo) == null ? void 0 : _c.length) {
      writer.writeRepeatedMessage(
        3,
        msg.playersInfo,
        Player._writeMessage
      );
    }
    if ((_d = msg.placesSummary) == null ? void 0 : _d.length) {
      writer.writeRepeatedMessage(
        4,
        msg.placesSummary,
        PlacesSummaryItem._writeMessage
      );
    }
    if (msg.totalPlayedGames) {
      writer.writeInt32(5, msg.totalPlayedGames);
    }
    if (msg.totalPlayedRounds) {
      writer.writeInt32(6, msg.totalPlayedRounds);
    }
    if (msg.winSummary) {
      writer.writeMessage(
        7,
        msg.winSummary,
        PlayerWinSummary._writeMessage
      );
    }
    if ((_e = msg.handsValueSummary) == null ? void 0 : _e.length) {
      writer.writeRepeatedMessage(
        8,
        msg.handsValueSummary,
        HandValueStat._writeMessage
      );
    }
    if ((_f = msg.yakuSummary) == null ? void 0 : _f.length) {
      writer.writeRepeatedMessage(
        9,
        msg.yakuSummary,
        YakuStat._writeMessage
      );
    }
    if (msg.riichiSummary) {
      writer.writeMessage(
        10,
        msg.riichiSummary,
        RiichiSummary._writeMessage
      );
    }
    if (msg.doraStat) {
      writer.writeMessage(
        11,
        msg.doraStat,
        DoraSummary._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.ratingHistory.push(...reader.readPackedInt32());
          } else {
            msg.ratingHistory.push(reader.readInt32());
          }
          break;
        }
        case 2: {
          const m = SessionHistoryResultTable.initialize();
          reader.readMessage(
            m,
            SessionHistoryResultTable._readMessage
          );
          msg.scoreHistory.push(m);
          break;
        }
        case 3: {
          const m = Player.initialize();
          reader.readMessage(m, Player._readMessage);
          msg.playersInfo.push(m);
          break;
        }
        case 4: {
          const m = PlacesSummaryItem.initialize();
          reader.readMessage(m, PlacesSummaryItem._readMessage);
          msg.placesSummary.push(m);
          break;
        }
        case 5: {
          msg.totalPlayedGames = reader.readInt32();
          break;
        }
        case 6: {
          msg.totalPlayedRounds = reader.readInt32();
          break;
        }
        case 7: {
          reader.readMessage(
            msg.winSummary,
            PlayerWinSummary._readMessage
          );
          break;
        }
        case 8: {
          const m = HandValueStat.initialize();
          reader.readMessage(m, HandValueStat._readMessage);
          msg.handsValueSummary.push(m);
          break;
        }
        case 9: {
          const m = YakuStat.initialize();
          reader.readMessage(m, YakuStat._readMessage);
          msg.yakuSummary.push(m);
          break;
        }
        case 10: {
          reader.readMessage(
            msg.riichiSummary,
            RiichiSummary._readMessage
          );
          break;
        }
        case 11: {
          reader.readMessage(msg.doraStat, DoraSummary._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const GamesAddOnlineReplayPayload = {
  /**
   * Serializes GamesAddOnlineReplayPayload to protobuf.
   */
  encode: function(msg) {
    return GamesAddOnlineReplayPayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesAddOnlineReplayPayload from protobuf.
   */
  decode: function(bytes) {
    return GamesAddOnlineReplayPayload._readMessage(
      GamesAddOnlineReplayPayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesAddOnlineReplayPayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      eventId: 0,
      link: ""
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.link) {
      writer.writeString(2, msg.link);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.link = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const GamesAddOnlineReplayResponse = {
  /**
   * Serializes GamesAddOnlineReplayResponse to protobuf.
   */
  encode: function(msg) {
    return GamesAddOnlineReplayResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesAddOnlineReplayResponse from protobuf.
   */
  decode: function(bytes) {
    return GamesAddOnlineReplayResponse._readMessage(
      GamesAddOnlineReplayResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesAddOnlineReplayResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      game: GameResult.initialize(),
      players: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if (msg.game) {
      writer.writeMessage(1, msg.game, GameResult._writeMessage);
    }
    if ((_a = msg.players) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        2,
        msg.players,
        Player._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.game, GameResult._readMessage);
          break;
        }
        case 2: {
          const m = Player.initialize();
          reader.readMessage(m, Player._readMessage);
          msg.players.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetAchievementsPayload = {
  /**
   * Serializes EventsGetAchievementsPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetAchievementsPayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetAchievementsPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetAchievementsPayload._readMessage(
      EventsGetAchievementsPayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetAchievementsPayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      achievementsList: [],
      eventId: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.achievementsList) == null ? void 0 : _a.length) {
      writer.writeRepeatedString(2, msg.achievementsList);
    }
    if (msg.eventId) {
      writer.writeInt32(3, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 2: {
          msg.achievementsList.push(reader.readString());
          break;
        }
        case 3: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetAchievementsResponse = {
  /**
   * Serializes EventsGetAchievementsResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetAchievementsResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetAchievementsResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetAchievementsResponse._readMessage(
      EventsGetAchievementsResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetAchievementsResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      achievements: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.achievements) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        1,
        msg.achievements,
        Achievement._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = Achievement.initialize();
          reader.readMessage(m, Achievement._readMessage);
          msg.achievements.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const PlayersGetPlayerPayload = {
  /**
   * Serializes PlayersGetPlayerPayload to protobuf.
   */
  encode: function(msg) {
    return PlayersGetPlayerPayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetPlayerPayload from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetPlayerPayload._readMessage(
      PlayersGetPlayerPayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetPlayerPayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      id: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const PlayersGetPlayerResponse = {
  /**
   * Serializes PlayersGetPlayerResponse to protobuf.
   */
  encode: function(msg) {
    return PlayersGetPlayerResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetPlayerResponse from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetPlayerResponse._readMessage(
      PlayersGetPlayerResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetPlayerResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      players: Player.initialize()
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.players) {
      writer.writeMessage(1, msg.players, Player._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.players, Player._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const EventsGetCurrentSeatingResponse = {
  /**
   * Serializes EventsGetCurrentSeatingResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetCurrentSeatingResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetCurrentSeatingResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetCurrentSeatingResponse._readMessage(
      EventsGetCurrentSeatingResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetCurrentSeatingResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      seating: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.seating) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        1,
        msg.seating,
        PlayerSeating._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = PlayerSeating.initialize();
          reader.readMessage(m, PlayerSeating._readMessage);
          msg.seating.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
async function GetEventAdmins(accessGetEventAdminsPayload, config) {
  const response = await PBrequest(
    "/common.Frey/GetEventAdmins",
    AccessGetEventAdminsPayload.encode(accessGetEventAdminsPayload),
    config
  );
  return AccessGetEventAdminsResponse.decode(response);
}
const AccessGetEventAdminsPayload = {
  /**
   * Serializes AccessGetEventAdminsPayload to protobuf.
   */
  encode: function(msg) {
    return AccessGetEventAdminsPayload._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetEventAdminsPayload from protobuf.
   */
  decode: function(bytes) {
    return AccessGetEventAdminsPayload._readMessage(
      AccessGetEventAdminsPayload.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessGetEventAdminsPayload with all fields set to their default value.
   */
  initialize: function() {
    return {
      eventId: 0
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
const AccessGetEventAdminsResponse = {
  /**
   * Serializes AccessGetEventAdminsResponse to protobuf.
   */
  encode: function(msg) {
    return AccessGetEventAdminsResponse._writeMessage(
      msg,
      new BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AccessGetEventAdminsResponse from protobuf.
   */
  decode: function(bytes) {
    return AccessGetEventAdminsResponse._readMessage(
      AccessGetEventAdminsResponse.initialize(),
      new BinaryReader(bytes)
    );
  },
  /**
   * Initializes AccessGetEventAdminsResponse with all fields set to their default value.
   */
  initialize: function() {
    return {
      admins: []
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    var _a;
    if ((_a = msg.admins) == null ? void 0 : _a.length) {
      writer.writeRepeatedMessage(
        1,
        msg.admins,
        EventAdmin._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = EventAdmin.initialize();
          reader.readMessage(m, EventAdmin._readMessage);
          msg.admins.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
function handleReleaseTag(r) {
  {
    return r;
  }
}
const _Analytics = class {
  constructor(statDomain, siteId) {
    __publicField(this, "_eventId", null);
    __publicField(this, "_userId", null);
    __publicField(this, "_statDomain", null);
    __publicField(this, "_siteId", null);
    __publicField(this, "_track", null);
    __publicField(this, "_trackView", null);
    this._statDomain = statDomain;
    this._siteId = siteId;
    this._track = debounce(
      (action, params = {}, eventId) => {
        if (typeof window === "undefined") {
          return;
        }
        this._trackEvent(
          action,
          {
            eventId: (eventId ? eventId.toString() : (this._eventId ?? "").toString()) || _Analytics.NOT_INITIALIZED,
            userId: (this._userId ?? "").toString() || _Analytics.NOT_INITIALIZED,
            ...params
          },
          window.location.hostname
        );
      }
    );
    this._trackView = debounce((url) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("Location changed to: ", url);
      }
      if (typeof window === "undefined") {
        return;
      }
      this._trackViewEvent(url);
    });
  }
  _trackViewEvent(url) {
    if (!this._statDomain || !url) {
      return;
    }
    const payload = {
      website: this._siteId,
      hostname: window.location.hostname,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      title: window.document.title,
      cache: null,
      url,
      referrer: ""
    };
    fetch("https://" + this._statDomain + "/api/send", {
      credentials: "omit",
      headers: {
        "User-Agent": navigator.userAgent,
        Accept: "*/*",
        "Accept-Language": window.navigator.language,
        "Content-Type": "text/plain",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "Cache-Control": "max-age=0"
      },
      referrer: window.location.toString().substring(0, window.location.toString().indexOf("/", 9)),
      body: '{"type":"event","payload":' + JSON.stringify(payload) + "}",
      method: "POST",
      mode: "cors"
    });
  }
  _trackEvent(eventName, eventData, url) {
    if (!this._statDomain) {
      return;
    }
    const payload = {
      website: this._siteId,
      hostname: window.location.hostname,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      cache: null,
      url,
      event_name: eventName,
      event_data: eventData
    };
    fetch("https://" + this._statDomain + "/api/send", {
      credentials: "omit",
      headers: {
        "User-Agent": navigator.userAgent,
        Accept: "*/*",
        "Accept-Language": window.navigator.language,
        "Content-Type": "text/plain",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site"
      },
      referrer: window.location.toString().substring(0, window.location.toString().indexOf("/", 9)),
      body: '{"type":"event","payload":' + JSON.stringify(payload) + "}",
      method: "POST",
      mode: "cors"
    });
  }
  setUserId(userId) {
    if (!this._statDomain) {
      return;
    }
    this._userId = userId;
  }
  setEventId(eventId) {
    if (!this._statDomain) {
      return;
    }
    this._eventId = eventId;
  }
  track(action, params = {}, eventId) {
    var _a;
    if (!this._track) {
      return;
    }
    (_a = this._track) == null ? void 0 : _a.call(this, action, params, eventId);
  }
  trackView(url) {
    var _a;
    if (!this._trackView) {
      return;
    }
    (_a = this._trackView) == null ? void 0 : _a.call(this, url);
  }
};
let Analytics = _Analytics;
__publicField(Analytics, "NOT_INITIALIZED", "not_initialized");
__publicField(Analytics, "LOGOUT", "logout");
__publicField(Analytics, "LANG_CHANGED", "lang_changed");
__publicField(Analytics, "THEME_CHANGED", "theme_changed");
__publicField(Analytics, "SINGLE_DEVICE_MODE_CHANGED", "single_device_mode_changed");
__publicField(Analytics, "REMOTE_ERROR", "remote_error");
__publicField(Analytics, "SCREEN_ENTER", "screen_enter");
__publicField(Analytics, "CONFIG_RECEIVED", "config_received");
__publicField(Analytics, "LOAD_STARTED", "load_started");
__publicField(Analytics, "LOAD_SUCCESS", "load_success");
__publicField(Analytics, "LOAD_ERROR", "load_error");
class ApiService {
  constructor(freyUrl, mimirUrl) {
    __publicField(this, "_authToken", null);
    __publicField(this, "_personId", null);
    __publicField(this, "_eventId", null);
    __publicField(this, "_analytics", null);
    __publicField(this, "_clientConfMimir", {
      prefix: "/v2"
    });
    __publicField(this, "_clientConfFrey", {
      prefix: "/v2"
    });
    this._clientConfFrey.baseURL = freyUrl;
    this._clientConfMimir.baseURL = mimirUrl;
  }
  setAnalytics(analytics2) {
    this._analytics = analytics2;
    return this;
  }
  setEventId(eventId) {
    this._eventId = eventId ? eventId.toString() : "";
    return this;
  }
  setCredentials(personId, token) {
    this._authToken = token;
    this._personId = (personId || 0).toString();
    const headers = new Headers();
    headers.append("X-Auth-Token", this._authToken ?? "");
    headers.append("X-Current-Person-Id", this._personId ?? "");
    this._clientConfFrey.rpcTransport = this._clientConfMimir.rpcTransport = (url, opts) => {
      Object.keys(opts.headers ?? {}).forEach((key) => headers.set(key, opts.headers[key]));
      headers.set("X-Current-Event-Id", this._eventId ?? "");
      return fetch(url + (process.env.NODE_ENV === "production" ? "" : "?XDEBUG_SESSION=start"), {
        ...opts,
        headers
      }).then(handleReleaseTag).then((resp) => {
        if (!resp.ok) {
          return resp.json().then((err) => {
            if (err.code && err.code === "internal" && err.meta && err.meta.cause) {
              fetch(`${"https://rating.riichimahjong.org"}/servicelog`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  source: "Sigrun [twirp]",
                  requestTo: url,
                  requestFrom: typeof window !== "undefined" && window.location.href,
                  details: err.meta.cause
                })
              });
              throw new Error(err.meta.cause);
            }
            return resp;
          });
        }
        return resp;
      });
    };
  }
  getGameConfig(eventId) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, {
      method: "GetGameConfig"
    });
    return GetGameConfig({ eventId }, this._clientConfMimir);
  }
  getAllPlayers(eventId) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, {
      method: "GetAllRegisteredPlayers"
    });
    return GetAllRegisteredPlayers({ eventIds: [eventId] }, this._clientConfMimir).then(
      (val) => val.players
    );
  }
  getRatingTable(eventId, order, orderBy) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, {
      method: "GetRatingTable"
    });
    return GetRatingTable({ eventIdList: [eventId], order, orderBy }, this._clientConfMimir).then(
      (r) => r.list
    );
  }
  addOnlineGame(eventId, link) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, {
      method: "AddOnlineReplay"
    });
    return AddOnlineReplay({ eventId, link }, this._clientConfMimir);
  }
  getEvents(limit, offset, filterUnlisted) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, { method: "GetEvents" });
    return GetEvents({ limit, offset, filterUnlisted }, this._clientConfMimir);
  }
  getEventsById(ids) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, { method: "GetEventsById" });
    return GetEventsById({ ids }, this._clientConfMimir).then((r) => r.events);
  }
  getRecentGames(eventId, limit, offset) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, { method: "GetRecentGames" });
    return GetLastGames(
      { eventIdList: [eventId], limit, offset, order: "desc", orderBy: "id" },
      this._clientConfMimir
    );
  }
  getGame(sessionHash) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, { method: "GetGame" });
    return GetGame({ sessionHash }, this._clientConfMimir);
  }
  getGameSeries(eventId) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, { method: "GetGameSeries" });
    return GetGamesSeries({ eventId }, this._clientConfMimir).then((r) => r.results);
  }
  getPlayerStat(eventIdList, playerId) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, { method: "getPlayerStat" });
    return GetPlayerStats({ playerId, eventIdList }, this._clientConfMimir);
  }
  getTimerState(eventId) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, { method: "GetTimerState" });
    return GetTimerState({ eventId }, this._clientConfMimir);
  }
  getSeating(eventId) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, { method: "GetCurrentSeating" });
    return GetCurrentSeating({ eventId }, this._clientConfMimir).then((r) => r.seating);
  }
  getPlayer(playerId) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, { method: "getPlayer" });
    return GetPlayer({ id: playerId }, this._clientConfMimir).then((r) => r.players);
  }
  getEventAdmins(eventId) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, {
      method: "GetEventAdmins"
    });
    return GetEventAdmins({ eventId }, this._clientConfFrey).then((r) => r.admins);
  }
  getAchievements(eventId, achievementsList) {
    var _a;
    (_a = this._analytics) == null ? void 0 : _a.track(Analytics.LOAD_STARTED, {
      method: "GetEventAdmins"
    });
    return GetAchievements({ eventId, achievementsList }, this._clientConfMimir).then(
      (r) => r.achievements
    );
  }
}
const analytics = new Analytics(
  "pl.riichimahjong.org",
  "5e434a7e-2f8e-481c-a3ef-8f83672e1f0b"
);
analytics.setUserId(storage.getPersonId() ?? 0);
analytics.setEventId(storage.getEventId() ?? 0);
const analyticsCtx = createContext(analytics);
const useAnalytics = () => {
  return useContext(analyticsCtx);
};
const AnalyticsProvider = ({ children }) => {
  return /* @__PURE__ */ jsx(analyticsCtx.Provider, { value: analytics, children });
};
const api = new ApiService(
  "http://loopback.userapi.riichimahjong.org",
  "http://loopback.gameapi.riichimahjong.org"
);
api.setAnalytics(analytics).setCredentials(storage.getPersonId() ?? 0, storage.getAuthToken() ?? "");
const apiCtx = createContext(api);
const useApi = () => {
  return useContext(apiCtx);
};
const ApiProvider = ({ children }) => {
  return /* @__PURE__ */ jsx(apiCtx.Provider, { value: api, children });
};
const useEvent = (eventIdListStr) => {
  const globals2 = useContext(globalsCtx);
  const api2 = useApi();
  const eventsId = eventIdListStr == null ? void 0 : eventIdListStr.split(".").map((id) => parseInt(id, 10));
  const [events] = useIsomorphicState(
    null,
    "EventInfo_event_" + (eventIdListStr ?? "null"),
    () => eventsId ? api2.getEventsById(eventsId) : Promise.resolve(null),
    [eventIdListStr]
  );
  useEffect(() => {
    if (eventsId) {
      globals2.setData({ eventId: eventsId });
    }
  }, [eventIdListStr]);
  useEffect(() => {
    var _a, _b, _c, _d, _e, _f;
    if (!eventIdListStr) {
      globals2.setData({
        eventId: null,
        type: null,
        isPrescripted: false,
        isTeam: false,
        ratingHidden: false,
        hasSeries: false,
        withChips: false,
        loading: false
      });
    } else {
      if (events) {
        globals2.setData({
          isTeam: (_a = events[0]) == null ? void 0 : _a.isTeam,
          isPrescripted: (_b = events[0]) == null ? void 0 : _b.isPrescripted,
          type: (_c = events[0]) == null ? void 0 : _c.type,
          hasSeries: (_d = events[0]) == null ? void 0 : _d.hasSeries,
          ratingHidden: !((_e = events[0]) == null ? void 0 : _e.isRatingShown),
          withChips: (_f = events[0]) == null ? void 0 : _f.withChips,
          loading: false
        });
      } else {
        globals2.setData({
          type: null,
          isPrescripted: false,
          isTeam: false,
          ratingHidden: false,
          hasSeries: false,
          withChips: false,
          loading: true
        });
      }
    }
  }, [eventIdListStr, events]);
  return events ?? null;
};
let stripHtml;
{
  stripHtml = (dirtyString) => {
    return global.JSDOM.fragment(dirtyString).textContent ?? "";
  };
}
const PERPAGE$1 = 20;
const EventList = ({ params: { page } }) => {
  page = page ?? "1";
  const api2 = useApi();
  const i18n2 = useI18n();
  const theme = useMantineTheme();
  const largeScreen = useMediaQuery("(min-width: 768px)");
  const isDark = useMantineColorScheme().colorScheme === "dark";
  const [, navigate] = useLocation();
  useEvent(null);
  const [events] = useIsomorphicState(
    [],
    "EventList_events_" + page,
    () => api2.getEvents(PERPAGE$1, (parseInt(page ?? "1", 10) - 1) * PERPAGE$1, true),
    [page]
  );
  return /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsxs("title", { children: [
      i18n2._t("Event list"),
      " - Sigrun"
    ] }) }),
    /* @__PURE__ */ jsx("h2", { children: i18n2._t("Riichi mahjong events list") }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Stack, { justify: "flex-start", spacing: "0", children: ((events == null ? void 0 : events.events) ?? []).map((e, idx) => {
      const desc = useRemarkSync(e.description, {
        remarkPlugins: [strip]
      });
      const renderedDesc = stripHtml(renderToString(desc)).slice(0, 300);
      return /* @__PURE__ */ jsxs(
        Group,
        {
          style: {
            padding: "10px",
            backgroundColor: idx % 2 ? isDark ? theme.colors.dark[7] : theme.colors.gray[1] : "transparent"
          },
          children: [
            /* @__PURE__ */ jsx(EventTypeIcon, { event: e }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: `/event/${e.id}/order/rating`,
                onClick: (ev) => {
                  navigate(`/event/${e.id}/order/rating`);
                  ev.preventDefault();
                },
                children: /* @__PURE__ */ jsx(ActionIcon, { color: "grape", variant: "filled", title: i18n2._t("Rating table"), children: /* @__PURE__ */ jsx(PodiumIco, { size: "1.1rem" }) })
              }
            ),
            /* @__PURE__ */ jsxs(
              Stack,
              {
                spacing: 0,
                style: { flex: 1, maxWidth: largeScreen ? "calc(100% - 150px)" : "100%" },
                children: [
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      style: {
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        flex: 1
                      },
                      href: `/event/${e.id}/info`,
                      onClick: (ev) => {
                        navigate(`/event/${e.id}/info`);
                        ev.preventDefault();
                      },
                      children: e.title
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Text,
                    {
                      c: "dimmed",
                      style: {
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        flex: 1
                      },
                      children: renderedDesc
                    }
                  )
                ]
              }
            )
          ]
        },
        `ev_${idx}`
      );
    }) }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Center, { children: /* @__PURE__ */ jsx(
      Pagination,
      {
        value: parseInt(page, 10),
        onChange: (p) => {
          navigate(`/page/${p}`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        total: Math.ceil(((events == null ? void 0 : events.total) ?? 0) / PERPAGE$1)
      }
    ) })
  ] });
};
function PodiumIco({ size }) {
  const st = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "32px"
  };
  return /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 512 512", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M32,160V456a8,8,0,0,0,8,8H176V160a16,16,0,0,0-16-16H48A16,16,0,0,0,32,160Z",
        style: st
      }
    ),
    /* @__PURE__ */ jsx("path", { d: "M320,48H192a16,16,0,0,0-16,16V464H336V64A16,16,0,0,0,320,48Z", style: st }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M464,208H352a16,16,0,0,0-16,16V464H472a8,8,0,0,0,8-8V224A16,16,0,0,0,464,208Z",
        style: st
      }
    )
  ] });
}
const PlayerIcon = ({
  p,
  size,
  radius
}) => {
  size = size ?? "md";
  radius = radius ?? "xl";
  return /* @__PURE__ */ jsx(Avatar, { color: makeColor(p.title), radius, size, title: `#${p.id}`, children: makeInitials(p.title) });
};
function makeColor(input) {
  const colors2 = [
    "gray",
    "red",
    "pink",
    "grape",
    "violet",
    "indigo",
    "blue",
    "cyan",
    "green",
    "lime",
    "yellow",
    "orange",
    "teal"
  ];
  return colors2[crc32(Uint8Array.from(input, (x) => x.charCodeAt(0))) % colors2.length];
}
function makeInitials(input) {
  const [word1, word2] = input.trim().split(/\s+/).slice(0, 2);
  if (!word2) {
    return word1[0].toUpperCase();
  }
  return word1[0].toUpperCase() + word2[0].toUpperCase();
}
const EventInfo = ({ params: { eventId } }) => {
  const events = useEvent(eventId);
  const api2 = useApi();
  const i18n2 = useI18n();
  const [, navigate] = useLocation();
  const [admins] = useIsomorphicState(
    [],
    "EventInfo_admins_" + eventId,
    () => api2.getEventAdmins(parseInt(eventId, 10)),
    [eventId]
  );
  if (!events) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      (events == null ? void 0 : events.length) === 1 && /* @__PURE__ */ jsxs("title", { children: [
        events == null ? void 0 : events[0].title,
        " - Sigrun"
      ] }),
      ((events == null ? void 0 : events.length) ?? 0) > 1 && /* @__PURE__ */ jsxs("title", { children: [
        i18n2._t("Aggregated event"),
        " - Sigrun"
      ] })
    ] }),
    events == null ? void 0 : events.map((event, eid) => {
      return /* @__PURE__ */ jsxs(Fragment$1, { children: [
        /* @__PURE__ */ jsxs("h2", { style: { display: "flex", gap: "20px" }, children: [
          event && /* @__PURE__ */ jsx(EventTypeIcon, { event }),
          event == null ? void 0 : event.title
        ] }),
        /* @__PURE__ */ jsx(Divider, { size: "xs" }),
        /* @__PURE__ */ jsx(Space, { h: "md" }),
        useRemarkSync(event == null ? void 0 : event.description),
        /* @__PURE__ */ jsx(Space, { h: "md" }),
        /* @__PURE__ */ jsx(Divider, { size: "xs" }),
        /* @__PURE__ */ jsx(Space, { h: "md" })
      ] }, `ev_${eid}`);
    }),
    (events == null ? void 0 : events.length) === 1 && /* @__PURE__ */ jsxs(Group, { style: { fontSize: "small" }, children: [
      /* @__PURE__ */ jsx(Text, { c: "dimmed", children: i18n2._t("Event administrators: ") }),
      admins == null ? void 0 : admins.map((admin, idx) => /* @__PURE__ */ jsxs(Group, { children: [
        /* @__PURE__ */ jsx(PlayerIcon, { size: "xs", p: { title: admin.personName, id: admin.personId } }),
        /* @__PURE__ */ jsx(
          Anchor,
          {
            href: `/event/${eventId}/player/${admin.personId}`,
            onClick: (e) => {
              navigate(`/event/${eventId}/player/${admin.personId}`);
              e.preventDefault();
            },
            children: admin.personName
          }
        )
      ] }, `adm_${idx}`))
    ] })
  ] });
};
const TeamTable = ({ players, events }) => {
  const [, navigate] = useLocation();
  const largeScreen = useMediaQuery("(min-width: 768px)");
  const DataCmp = largeScreen ? Group : Stack;
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === "dark";
  const teams = /* @__PURE__ */ new Map();
  for (const player of players) {
    if (!player.teamName)
      continue;
    if (!teams.has(player.teamName)) {
      teams.set(player.teamName, { players: [], rating: 0 });
    }
    const team = teams.get(player.teamName);
    if (team) {
      team.players.push(player);
      team.rating += player.rating;
    }
  }
  const teamsIterable = [...teams.entries()].map(([name, data]) => ({ name, data })).sort((a, b) => b.data.rating - a.data.rating);
  return /* @__PURE__ */ jsx(Fragment, { children: teamsIterable.map((team, idx) => {
    return /* @__PURE__ */ jsx(
      DataCmp,
      {
        spacing: "xs",
        style: {
          padding: "10px",
          backgroundColor: idx % 2 ? isDark ? theme.colors.dark[7] : theme.colors.gray[1] : "transparent"
        },
        children: /* @__PURE__ */ jsxs(Group, { style: { flex: 1 }, position: "apart", children: [
          /* @__PURE__ */ jsxs(Group, { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsx(Badge, { w: 50, size: "xl", color: "blue", radius: "sm", style: { padding: 0 }, children: idx + 1 }),
            /* @__PURE__ */ jsxs(Text, { weight: "bold", style: { flex: 1 }, children: [
              /* @__PURE__ */ jsx(Text, { display: "inline-flex", mr: 14, children: team.name }),
              /* @__PURE__ */ jsx(
                Badge,
                {
                  w: 75,
                  size: "lg",
                  variant: "filled",
                  color: team.data.rating > 0 ? "lime" : "red",
                  radius: "sm",
                  style: { padding: 0 },
                  children: team.data.rating
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(Stack, { style: { minWidth: "290px" }, children: team.data.players.map((player, pidx) => {
            var _a;
            return /* @__PURE__ */ jsxs(Group, { position: "apart", children: [
              /* @__PURE__ */ jsxs(Group, { children: [
                /* @__PURE__ */ jsx(PlayerIcon, { p: player }),
                /* @__PURE__ */ jsxs(
                  Stack,
                  {
                    spacing: 2,
                    style: { width: largeScreen ? "auto" : "calc(100vw - 245px)" },
                    children: [
                      /* @__PURE__ */ jsx(
                        Anchor,
                        {
                          href: `/event/${events.map((ev) => ev.id).join(".")}/player/${player.id}`,
                          onClick: (e) => {
                            navigate(
                              `/event/${events.map((ev) => ev.id).join(".")}/player/${player.id}`
                            );
                            e.preventDefault();
                          },
                          children: player.title
                        }
                      ),
                      ((_a = events == null ? void 0 : events[0]) == null ? void 0 : _a.type) === EventType.EVENT_TYPE_ONLINE && /* @__PURE__ */ jsx(Text, { c: "dimmed", children: player.tenhouId })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                Badge,
                {
                  w: 75,
                  size: "lg",
                  variant: "filled",
                  color: player.winnerZone ? "lime" : "red",
                  radius: "sm",
                  style: { padding: 0 },
                  children: player.rating
                }
              )
            ] }, `pl_${pidx}`);
          }) })
        ] })
      },
      `pl_${idx}`
    );
  }) });
};
const RatingTable = ({ params: { eventId, orderBy } }) => {
  var _a;
  orderBy = orderBy ?? "rating";
  const order = {
    name: "asc",
    rating: "desc",
    avg_place: "asc",
    avg_score: "desc",
    team: "desc"
  }[orderBy];
  const api2 = useApi();
  const i18n2 = useI18n();
  const events = useEvent(eventId);
  const largeScreen = useMediaQuery("(min-width: 768px)");
  const [, navigate] = useLocation();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === "dark";
  const DataCmp = largeScreen ? Group : Stack;
  const globals2 = useContext(globalsCtx);
  const [players, , playersLoading] = useIsomorphicState(
    [],
    "RatingTable_event_" + eventId + order + orderBy,
    () => api2.getRatingTable(
      parseInt(eventId, 10),
      order ?? "desc",
      orderBy === "team" ? "rating" : orderBy ?? "rating"
    ),
    [eventId, order, orderBy]
  );
  if (!players || !events) {
    return null;
  }
  if (globals2.data.loading) {
    return /* @__PURE__ */ jsx(Container, { h: "100%", children: /* @__PURE__ */ jsx(Center, { h: "100%", children: /* @__PURE__ */ jsx(Loader, { size: "xl" }) }) });
  }
  if (events && !globals2.data.loading && globals2.data.ratingHidden) {
    return /* @__PURE__ */ jsxs(Container, { children: [
      /* @__PURE__ */ jsxs("h2", { style: { display: "flex", gap: "20px" }, children: [
        (events == null ? void 0 : events[0]) && /* @__PURE__ */ jsx(EventTypeIcon, { event: events == null ? void 0 : events[0] }),
        (_a = events == null ? void 0 : events[0]) == null ? void 0 : _a.title,
        " - ",
        i18n2._t("Rating table")
      ] }),
      /* @__PURE__ */ jsx(Alert, { icon: /* @__PURE__ */ jsx(IconExclamationCircle, {}), color: "yellow", children: i18n2._t("Rating table is hidden by tournament administrator") })
    ] });
  }
  return events && /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      (events == null ? void 0 : events.length) === 1 && /* @__PURE__ */ jsxs("title", { children: [
        i18n2._t("Rating table"),
        " - ",
        events == null ? void 0 : events[0].title,
        " - Sigrun"
      ] }),
      ((events == null ? void 0 : events.length) ?? 0) > 1 && /* @__PURE__ */ jsxs("title", { children: [
        i18n2._t("Rating table"),
        " - ",
        i18n2._t("Aggregated event"),
        " - Sigrun"
      ] })
    ] }),
    events == null ? void 0 : events.map((event, eid) => /* @__PURE__ */ jsxs(DataCmp, { position: "apart", children: [
      /* @__PURE__ */ jsxs("h2", { style: { display: "flex", gap: "20px" }, children: [
        event && /* @__PURE__ */ jsx(EventTypeIcon, { event }),
        event == null ? void 0 : event.title,
        " - ",
        i18n2._t("Rating table")
      ] }),
      orderBy !== "team" && events.length === 1 && /* @__PURE__ */ jsx(
        Button,
        {
          variant: "light",
          size: "xs",
          leftIcon: /* @__PURE__ */ jsx(IconDownload, { size: "1.1rem" }),
          onClick: () => {
            var _a2, _b, _c;
            downloadCsv(
              i18n2,
              (_a2 = events == null ? void 0 : events[0]) == null ? void 0 : _a2.isTeam,
              (_b = events == null ? void 0 : events[0]) == null ? void 0 : _b.withChips,
              players,
              `Rating_${(_c = events == null ? void 0 : events[0]) == null ? void 0 : _c.id}.csv`
            );
          },
          children: i18n2._t("Save as CSV")
        }
      )
    ] }, `ev_${eid}`)),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(DataCmp, { grow: largeScreen ? true : void 0, children: /* @__PURE__ */ jsx(Stack, { children: /* @__PURE__ */ jsxs(DataCmp, { position: "right", spacing: "md", children: [
      /* @__PURE__ */ jsxs(Group, { spacing: "md", grow: !largeScreen, children: [
        globals2.data.isTeam && /* @__PURE__ */ jsx(
          Badge,
          {
            size: "lg",
            color: "grape",
            radius: "sm",
            variant: orderBy === "team" ? "filled" : "light",
            component: "a",
            pl: 5,
            pr: 5,
            leftSection: /* @__PURE__ */ jsx(Box, { mt: 7, children: /* @__PURE__ */ jsx(IconSortDescending2, { size: "1rem" }) }),
            href: `/event/${eventId}/order/team`,
            onClick: (e) => {
              navigate(`/event/${eventId}/order/team`);
              e.preventDefault();
            },
            style: { cursor: "pointer" },
            children: i18n2._t("Team")
          }
        ),
        /* @__PURE__ */ jsx(
          Badge,
          {
            size: "lg",
            color: "lime",
            radius: "sm",
            variant: orderBy === "rating" ? "filled" : "light",
            component: "a",
            pl: 5,
            pr: 5,
            leftSection: /* @__PURE__ */ jsx(Box, { mt: 7, children: /* @__PURE__ */ jsx(IconSortDescending2, { size: "1rem" }) }),
            href: `/event/${eventId}/order/rating`,
            onClick: (e) => {
              navigate(`/event/${eventId}/order/rating`);
              e.preventDefault();
            },
            style: { cursor: "pointer" },
            children: i18n2._t("Rating")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Group, { spacing: "md", grow: !largeScreen, children: [
        /* @__PURE__ */ jsx(
          Badge,
          {
            size: "lg",
            color: "green",
            radius: "sm",
            variant: orderBy === "avg_score" ? "filled" : "light",
            component: "a",
            pl: 5,
            pr: 5,
            leftSection: /* @__PURE__ */ jsx(Box, { mt: 7, children: /* @__PURE__ */ jsx(IconSortDescending2, { size: "1rem" }) }),
            href: `/event/${eventId}/order/avg_score`,
            onClick: (e) => {
              navigate(`/event/${eventId}/order/avg_score`);
              e.preventDefault();
            },
            style: { cursor: "pointer" },
            children: i18n2._t("Average score")
          }
        ),
        /* @__PURE__ */ jsx(
          Badge,
          {
            size: "lg",
            color: "cyan",
            radius: "sm",
            variant: orderBy === "avg_place" ? "filled" : "light",
            component: "a",
            pl: 5,
            pr: 5,
            leftSection: /* @__PURE__ */ jsx(Box, { mt: 7, children: /* @__PURE__ */ jsx(IconSortAscending2, { size: "1rem" }) }),
            href: `/event/${eventId}/order/avg_place`,
            onClick: (e) => {
              navigate(`/event/${eventId}/order/avg_place`);
              e.preventDefault();
            },
            style: { cursor: "pointer" },
            children: i18n2._t("Average place")
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsxs(Box, { pos: "relative", children: [
      /* @__PURE__ */ jsx(LoadingOverlay, { visible: playersLoading, overlayBlur: 2 }),
      orderBy === "team" && /* @__PURE__ */ jsx(Stack, { justify: "flex-start", spacing: "0", children: /* @__PURE__ */ jsx(TeamTable, { players, events }) }),
      orderBy !== "team" && /* @__PURE__ */ jsx(Stack, { justify: "flex-start", spacing: "0", children: (players ?? []).map((player, idx) => {
        var _a2, _b, _c;
        return /* @__PURE__ */ jsxs(
          DataCmp,
          {
            spacing: "xs",
            style: {
              padding: "10px",
              backgroundColor: idx % 2 ? isDark ? theme.colors.dark[7] : theme.colors.gray[1] : "transparent"
            },
            children: [
              /* @__PURE__ */ jsxs(Group, { style: { flex: 1 }, children: [
                /* @__PURE__ */ jsx(Badge, { w: 50, size: "xl", color: "blue", radius: "sm", style: { padding: 0 }, children: idx + 1 }),
                /* @__PURE__ */ jsx(PlayerIcon, { p: player }),
                /* @__PURE__ */ jsxs(Stack, { spacing: 2, children: [
                  /* @__PURE__ */ jsx(
                    Anchor,
                    {
                      href: `/event/${eventId}/player/${player.id}`,
                      onClick: (e) => {
                        navigate(`/event/${eventId}/player/${player.id}`);
                        e.preventDefault();
                      },
                      children: player.title
                    }
                  ),
                  ((_a2 = events == null ? void 0 : events[0]) == null ? void 0 : _a2.type) === EventType.EVENT_TYPE_ONLINE && /* @__PURE__ */ jsx(Text, { c: "dimmed", children: player.tenhouId }),
                  ((_b = events == null ? void 0 : events[0]) == null ? void 0 : _b.isTeam) && player.teamName && /* @__PURE__ */ jsx(Text, { children: player.teamName })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(Group, { spacing: 2, grow: !largeScreen, children: [
                /* @__PURE__ */ jsx(
                  Badge,
                  {
                    w: 75,
                    size: "lg",
                    variant: orderBy === "rating" ? "filled" : "light",
                    color: player.winnerZone ? "lime" : "red",
                    radius: "sm",
                    style: { padding: 0 },
                    children: player.rating
                  }
                ),
                /* @__PURE__ */ jsx(
                  Badge,
                  {
                    w: 65,
                    size: "lg",
                    variant: orderBy === "avg_score" ? "filled" : "light",
                    color: player.winnerZone ? "green" : "pink",
                    radius: "sm",
                    style: { padding: 0 },
                    children: player.avgScore.toFixed(0)
                  }
                ),
                /* @__PURE__ */ jsx(
                  Badge,
                  {
                    w: 45,
                    size: "lg",
                    color: "cyan",
                    variant: orderBy === "avg_place" ? "filled" : "light",
                    radius: "sm",
                    style: { padding: 0 },
                    children: player.avgPlace.toFixed(2)
                  }
                ),
                /* @__PURE__ */ jsx(
                  Badge,
                  {
                    title: i18n2._t("Games played"),
                    w: 45,
                    size: "lg",
                    color: "gray",
                    radius: "sm",
                    style: { padding: 0 },
                    children: player.gamesPlayed.toFixed(0)
                  }
                ),
                ((_c = events == null ? void 0 : events[0]) == null ? void 0 : _c.withChips) && /* @__PURE__ */ jsx(
                  Badge,
                  {
                    title: i18n2._t("Chips"),
                    w: 45,
                    leftSection: /* @__PURE__ */ jsx(IconCoins, { size: "0.8rem", style: { marginTop: "8px" } }),
                    size: "lg",
                    color: "yellow",
                    radius: "sm",
                    style: { padding: 0 },
                    children: player.chips.toFixed(0)
                  }
                )
              ] })
            ]
          },
          `pl_${idx}`
        );
      }) })
    ] })
  ] });
};
function downloadCsv(i18n2, isTeam, withChips, content, fileName, mimeType) {
  const quoteValue = (val) => {
    const innerValue = val === null ? "" : val.toString();
    let result = innerValue.replace(/"/g, '""');
    if (result.search(/("|,|\n)/g) >= 0)
      result = '"' + result + '"';
    return result;
  };
  const finalVal = [
    [
      i18n2._t("Place"),
      i18n2._t("Player ID"),
      i18n2._t("Player name"),
      ...isTeam ? [i18n2._t("Team")] : [],
      ...withChips ? [i18n2._t("Chips")] : [],
      i18n2._t("Rating points"),
      i18n2._t("Average place"),
      i18n2._t("Average points"),
      i18n2._t("Games played")
    ].map(quoteValue).join(",")
  ];
  for (let i = 0; i < content.length; i++) {
    finalVal.push(
      [
        i + 1,
        content[i].id,
        content[i].title,
        ...isTeam ? [content[i].teamName] : [],
        ...withChips ? [content[i].chips] : [],
        content[i].rating,
        content[i].avgPlace,
        content[i].avgScore,
        content[i].gamesPlayed
      ].map(quoteValue).join(",")
    );
  }
  const a = document.createElement("a");
  mimeType = mimeType ?? "application/octet-stream";
  if (URL && "download" in a) {
    a.href = URL.createObjectURL(
      new Blob([finalVal.join("\n")], {
        type: mimeType
      })
    );
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    location.href = "data:application/octet-stream," + encodeURIComponent(finalVal.join("\n"));
  }
}
const PlayerStatsListing = ({
  playerStats,
  playerId
}) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa, _ba;
  const i18n2 = useI18n();
  const placeLabels = [
    void 0,
    i18n2._t("1st place: "),
    i18n2._t("2nd place: "),
    i18n2._t("3rd place: "),
    i18n2._t("4th place: ")
  ];
  const scoreSummary = getScoresSummary(parseInt(playerId, 10), playerStats == null ? void 0 : playerStats.scoreHistory);
  const totalWon = (((_a = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _a.ron) ?? 0) + (((_b = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _b.tsumo) ?? 0);
  const totalFeedUnforced = (((_c = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _c.unforcedFeedToRiichi) ?? 0) + (((_d = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _d.unforcedFeedToOpen) ?? 0) + (((_e = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _e.unforcedFeedToDama) ?? 0);
  const totalRiichi = (((_f = playerStats == null ? void 0 : playerStats.riichiSummary) == null ? void 0 : _f.riichiWon) ?? 0) + (((_g = playerStats == null ? void 0 : playerStats.riichiSummary) == null ? void 0 : _g.riichiLost) ?? 0);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(List, { children: [
      /* @__PURE__ */ jsxs(List.Item, { children: [
        /* @__PURE__ */ jsx(Text, { weight: "bold", children: i18n2._t("Common stats") }),
        /* @__PURE__ */ jsxs(List, { children: [
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Games played: "),
            /* @__PURE__ */ jsx("b", { children: playerStats == null ? void 0 : playerStats.totalPlayedGames })
          ] }),
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Rounds played: "),
            /* @__PURE__ */ jsx("b", { children: playerStats == null ? void 0 : playerStats.totalPlayedRounds })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(List.Item, { children: [
        /* @__PURE__ */ jsx(Text, { weight: "bold", children: i18n2._t("Places stats") }),
        /* @__PURE__ */ jsx(List, { children: (_h = playerStats == null ? void 0 : playerStats.placesSummary) == null ? void 0 : _h.sort((a, b) => a.place - b.place).map((item, idxp) => /* @__PURE__ */ jsxs(List.Item, { children: [
          placeLabels[item.place],
          /* @__PURE__ */ jsx("b", { children: item.count }),
          " (",
          (100 * item.count / (playerStats == null ? void 0 : playerStats.totalPlayedGames)).toFixed(2),
          "%)"
        ] }, `place_${idxp}`)) })
      ] }),
      /* @__PURE__ */ jsxs(List.Item, { children: [
        /* @__PURE__ */ jsx(Text, { weight: "bold", children: i18n2._t("Final game score") }),
        /* @__PURE__ */ jsxs(List, { children: [
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Minimum: "),
            /* @__PURE__ */ jsx("b", { children: scoreSummary.min.toFixed(2) })
          ] }),
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Maximum: "),
            /* @__PURE__ */ jsx("b", { children: scoreSummary.max.toFixed(2) })
          ] }),
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Average: "),
            /* @__PURE__ */ jsx("b", { children: scoreSummary.avg.toFixed(2) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(List.Item, { children: [
        /* @__PURE__ */ jsx(Text, { weight: "bold", children: i18n2._t("Misc stats") }),
        /* @__PURE__ */ jsxs(List, { children: [
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Draws: "),
            /* @__PURE__ */ jsx("b", { children: (_i = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _i.draw }),
            " (",
            makePercent((_j = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _j.draw, (playerStats == null ? void 0 : playerStats.totalPlayedRounds) ?? 0),
            ")",
            /* @__PURE__ */ jsx(List, { children: /* @__PURE__ */ jsxs(List.Item, { children: [
              i18n2._t("With tempai: "),
              /* @__PURE__ */ jsx("b", { children: (_k = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _k.drawTempai }),
              " (",
              makePercent(
                (_l = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _l.drawTempai,
                ((_m = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _m.draw) ?? 0
              ),
              ")"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Chombo penalties: "),
            /* @__PURE__ */ jsx("b", { children: (_n = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _n.chombo }),
            " (",
            makePercent((_o = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _o.chombo, (playerStats == null ? void 0 : playerStats.totalPlayedRounds) ?? 0),
            ")"
          ] }),
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Dora collected: "),
            /* @__PURE__ */ jsx("b", { children: (_p = playerStats == null ? void 0 : playerStats.doraStat) == null ? void 0 : _p.count }),
            /* @__PURE__ */ jsx(List, { children: /* @__PURE__ */ jsxs(List.Item, { children: [
              i18n2._t("Average dora per hand: "),
              /* @__PURE__ */ jsx("b", { children: (_q = playerStats == null ? void 0 : playerStats.doraStat) == null ? void 0 : _q.average.toFixed(2) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Riichi bets: "),
            /* @__PURE__ */ jsx("b", { children: totalRiichi }),
            /* @__PURE__ */ jsxs(List, { children: [
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("Bets won: "),
                /* @__PURE__ */ jsx("b", { children: (_r = playerStats == null ? void 0 : playerStats.riichiSummary) == null ? void 0 : _r.riichiWon }),
                " (",
                makePercent((_s = playerStats == null ? void 0 : playerStats.riichiSummary) == null ? void 0 : _s.riichiWon, totalRiichi),
                ")"
              ] }),
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("Bets lost: "),
                /* @__PURE__ */ jsx("b", { children: (_t = playerStats == null ? void 0 : playerStats.riichiSummary) == null ? void 0 : _t.riichiLost }),
                " (",
                makePercent((_u = playerStats == null ? void 0 : playerStats.riichiSummary) == null ? void 0 : _u.riichiLost, totalRiichi),
                ")"
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(List, { children: [
      /* @__PURE__ */ jsxs(List.Item, { children: [
        /* @__PURE__ */ jsx("b", { children: i18n2._t("Win stats") }),
        /* @__PURE__ */ jsxs(List, { children: [
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Rounds won: "),
            /* @__PURE__ */ jsx("b", { children: totalWon }),
            " (",
            makePercent(totalWon, (playerStats == null ? void 0 : playerStats.totalPlayedRounds) ?? 0),
            ")",
            /* @__PURE__ */ jsxs(List, { children: [
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("By ron: "),
                /* @__PURE__ */ jsx("b", { children: (_v = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _v.ron }),
                " (",
                makePercent((_w = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _w.ron, totalWon),
                ")"
              ] }),
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("By tsumo: "),
                /* @__PURE__ */ jsx("b", { children: (_x = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _x.tsumo }),
                " (",
                makePercent((_y = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _y.tsumo, totalWon),
                ")"
              ] }),
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("With open hand: "),
                /* @__PURE__ */ jsx("b", { children: (_z = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _z.winsWithOpen }),
                " (",
                makePercent((_A = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _A.winsWithOpen, totalWon),
                ")"
              ] }),
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("With riichi: "),
                /* @__PURE__ */ jsx("b", { children: (_B = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _B.winsWithRiichi }),
                " (",
                makePercent((_C = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _C.winsWithRiichi, totalWon),
                ")"
              ] }),
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("With damaten: "),
                /* @__PURE__ */ jsx("b", { children: (_D = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _D.winsWithDama }),
                " (",
                makePercent((_E = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _E.winsWithDama, totalWon),
                ")"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Total points gained: "),
            /* @__PURE__ */ jsx("b", { children: ((_F = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _F.pointsWon) ?? 0 })
          ] }),
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Average win score: "),
            /* @__PURE__ */ jsx("b", { children: ((((_G = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _G.pointsWon) ?? 0) / totalWon).toFixed(0) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(List.Item, { children: [
        /* @__PURE__ */ jsx("b", { children: i18n2._t("Loss stats") }),
        /* @__PURE__ */ jsxs(List, { children: [
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Deal-ins to ron: "),
            /* @__PURE__ */ jsx("b", { children: (_H = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _H.feed }),
            " (",
            makePercent((_I = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _I.feed, (playerStats == null ? void 0 : playerStats.totalPlayedRounds) ?? 0),
            ")",
            /* @__PURE__ */ jsxs(List, { children: [
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("Because of riichi: "),
                /* @__PURE__ */ jsx("b", { children: (_J = playerStats == null ? void 0 : playerStats.riichiSummary) == null ? void 0 : _J.feedUnderRiichi }),
                " (",
                makePercent(
                  (_K = playerStats == null ? void 0 : playerStats.riichiSummary) == null ? void 0 : _K.feedUnderRiichi,
                  ((_L = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _L.feed) ?? 0
                ),
                ") )"
              ] }),
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("Without declared riichi: "),
                /* @__PURE__ */ jsx("b", { children: totalFeedUnforced }),
                " (",
                makePercent(totalFeedUnforced, ((_M = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _M.feed) ?? 0),
                ")",
                /* @__PURE__ */ jsxs(List, { children: [
                  /* @__PURE__ */ jsxs(List.Item, { children: [
                    i18n2._t("To open hands: "),
                    /* @__PURE__ */ jsx("b", { children: (_N = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _N.unforcedFeedToOpen }),
                    " (",
                    makePercent(
                      (_O = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _O.unforcedFeedToOpen,
                      ((_P = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _P.feed) ?? 0
                    ),
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxs(List.Item, { children: [
                    i18n2._t("To hands with riichi: "),
                    /* @__PURE__ */ jsx("b", { children: (_Q = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _Q.unforcedFeedToRiichi }),
                    " (",
                    makePercent(
                      (_R = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _R.unforcedFeedToRiichi,
                      ((_S = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _S.feed) ?? 0
                    ),
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxs(List.Item, { children: [
                    i18n2._t("To damaten hands: "),
                    /* @__PURE__ */ jsx("b", { children: (_T = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _T.unforcedFeedToDama }),
                    " (",
                    makePercent(
                      (_U = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _U.unforcedFeedToDama,
                      ((_V = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _V.feed) ?? 0
                    ),
                    ")"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("Total points lost: "),
                /* @__PURE__ */ jsx("b", { children: ((_W = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _W.pointsLostRon) ?? 0 })
              ] }),
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("Average deal-in: "),
                /* @__PURE__ */ jsx("b", { children: ((((_X = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _X.pointsLostRon) ?? 0) / (((_Y = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _Y.feed) ?? 1)).toFixed(0) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(List.Item, { children: [
            i18n2._t("Tsumo payments: "),
            /* @__PURE__ */ jsx("b", { children: (_Z = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _Z.tsumofeed }),
            " (",
            makePercent((__ = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : __.tsumofeed, (playerStats == null ? void 0 : playerStats.totalPlayedRounds) ?? 0),
            ")",
            /* @__PURE__ */ jsxs(List, { children: [
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("Total points lost: "),
                /* @__PURE__ */ jsx("b", { children: ((_$ = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _$.pointsLostTsumo) ?? 0 })
              ] }),
              /* @__PURE__ */ jsxs(List.Item, { children: [
                i18n2._t("Average points lost: "),
                /* @__PURE__ */ jsx("b", { children: ((((_aa = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _aa.pointsLostTsumo) ?? 0) / (((_ba = playerStats == null ? void 0 : playerStats.winSummary) == null ? void 0 : _ba.tsumofeed) ?? 1)).toFixed(0) })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
function getScoresSummary(playerId, scoreHistory) {
  let total = 0;
  let count = 0;
  let min = 0;
  let max = 0;
  scoreHistory == null ? void 0 : scoreHistory.forEach(
    (item) => item.tables.forEach((seat) => {
      if (seat.playerId === playerId) {
        count++;
        total += seat.score;
        if (!min) {
          min = seat.score;
        }
        if (seat.score > max) {
          max = seat.score;
        }
        if (seat.score < min) {
          min = seat.score;
        }
      }
    })
  );
  return {
    min,
    max,
    avg: count ? total / count : 0
  };
}
function makePercent(piece, total) {
  if (!piece || total === 0)
    return "0.00%";
  return (100 * piece / total).toFixed(2) + "%";
}
const HandsGraph = React.lazy(() => import("./assets/HandsGraph-b68f9f02.js"));
const YakuGraph = React.lazy(() => import("./assets/YakuGraph-135ac97d.js"));
const RatingGraph = React.lazy(() => import("./assets/RatingGraph-f226ff40.js"));
const PlayerStats = ({
  params: { eventId, playerId }
}) => {
  var _a;
  const winds2 = ["東", "南", "西", "北"];
  const api2 = useApi();
  const i18n2 = useI18n();
  const [, navigate] = useLocation();
  const events = useEvent(eventId);
  const largeScreen = useMediaQuery("(min-width: 768px)");
  const DataCmp = largeScreen ? Group : Stack;
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === "dark";
  const [lastSelectionX, setLastSelectionX] = useState(null);
  const [lastSelectionHash, setLastSelectionHash] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [player] = useIsomorphicState(
    [],
    "PlayerStats_player_" + eventId + playerId,
    () => api2.getPlayer(parseInt(playerId, 10)),
    [eventId, playerId]
  );
  const [playerStats] = useIsomorphicState(
    [],
    "PlayerStats_playerstats_" + eventId + playerId,
    () => api2.getPlayerStat(
      eventId.split(".").map((e) => parseInt(e, 10)),
      parseInt(playerId, 10)
    ),
    [eventId, playerId]
  );
  if (!events || !player || !playerStats) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsxs("title", { children: [
      player.title,
      " - ",
      i18n2._t("Player stats"),
      " - Sigrun"
    ] }) }),
    /* @__PURE__ */ jsx("h2", { children: player.title }),
    events == null ? void 0 : events.map((event, eid) => {
      return /* @__PURE__ */ jsx(Group, { children: /* @__PURE__ */ jsxs("h4", { style: { display: "flex", gap: "20px" }, children: [
        event && /* @__PURE__ */ jsx(EventTypeIcon, { size: "sm", iconSize: 14, event }),
        event == null ? void 0 : event.title
      ] }) }, `ev_${eid}`);
    }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Loader, {}), children: /* @__PURE__ */ jsx(
      RatingGraph,
      {
        lastSelectionHash,
        lastSelectionX,
        setLastSelectionHash,
        setLastSelectionX,
        playerStats,
        onSelectGame: setSelectedGame,
        playerId: parseInt(playerId, 10)
      }
    ) }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    selectedGame && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(Group, { position: "apart", children: [
        /* @__PURE__ */ jsx(
          Anchor,
          {
            href: `/event/${eventId}/game/${selectedGame.tables[0].sessionHash}`,
            onClick: (e) => {
              navigate(`/event/${eventId}/game/${selectedGame.tables[0].sessionHash}`);
              e.preventDefault();
            },
            children: i18n2._t("View selected game details")
          }
        ),
        /* @__PURE__ */ jsxs(Group, { children: [
          /* @__PURE__ */ jsx(
            ActionIcon,
            {
              size: "lg",
              color: "blue",
              variant: "filled",
              title: i18n2._t("Previous game"),
              disabled: lastSelectionX === null || lastSelectionX < 2,
              onClick: () => {
                if (lastSelectionX !== null) {
                  setLastSelectionX((x) => {
                    var _a2;
                    const newSelection = x ? x - 1 : 1;
                    setSelectedGame(((_a2 = playerStats == null ? void 0 : playerStats.scoreHistory) == null ? void 0 : _a2[newSelection - 1]) ?? null);
                    return newSelection;
                  });
                }
              },
              children: /* @__PURE__ */ jsx(IconChevronLeft, { size: "1.5rem" })
            }
          ),
          /* @__PURE__ */ jsx(
            ActionIcon,
            {
              size: "lg",
              color: "blue",
              variant: "filled",
              title: i18n2._t("Next game"),
              disabled: lastSelectionX === null || (playerStats == null ? void 0 : playerStats.scoreHistory) && lastSelectionX >= ((_a = playerStats == null ? void 0 : playerStats.scoreHistory) == null ? void 0 : _a.length),
              onClick: () => {
                if (lastSelectionX !== null) {
                  setLastSelectionX((x) => {
                    var _a2;
                    const newSelection = x ? x + 1 : 1;
                    setSelectedGame(((_a2 = playerStats == null ? void 0 : playerStats.scoreHistory) == null ? void 0 : _a2[newSelection - 1]) ?? null);
                    return newSelection;
                  });
                }
              },
              children: /* @__PURE__ */ jsx(IconChevronRight, { size: "1.5rem" })
            }
          ),
          /* @__PURE__ */ jsx(Space, { w: "xl" }),
          /* @__PURE__ */ jsx(
            ActionIcon,
            {
              size: "lg",
              color: "red",
              variant: "filled",
              title: i18n2._t("Close game preview"),
              onClick: () => {
                setLastSelectionX(null);
                setSelectedGame(null);
              },
              children: /* @__PURE__ */ jsx(IconX, { size: "1.5rem" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(Space, { h: "md" }),
      /* @__PURE__ */ jsx(Divider, { size: "xs" }),
      /* @__PURE__ */ jsx(Space, { h: "md" }),
      /* @__PURE__ */ jsx(Stack, { spacing: 0, children: selectedGame.tables.map((seat, idx) => /* @__PURE__ */ jsx(Group, { grow: true, children: /* @__PURE__ */ jsxs(
        DataCmp,
        {
          spacing: "xs",
          style: {
            padding: "10px",
            backgroundColor: idx % 2 ? isDark ? theme.colors.dark[7] : theme.colors.gray[1] : "transparent"
          },
          children: [
            /* @__PURE__ */ jsxs(Group, { style: { flex: 1 }, children: [
              /* @__PURE__ */ jsx(
                Badge,
                {
                  w: 50,
                  size: "xl",
                  color: "blue",
                  radius: "sm",
                  style: { padding: 0, fontSize: "22px" },
                  children: winds2[idx]
                }
              ),
              /* @__PURE__ */ jsx(PlayerIcon, { p: { title: seat.title, id: seat.playerId } }),
              seat.playerId === player.id ? /* @__PURE__ */ jsx(Text, { weight: "bold", children: seat.title }) : /* @__PURE__ */ jsx(
                Anchor,
                {
                  href: `/event/${eventId}/player/${seat.playerId}`,
                  onClick: (e) => {
                    navigate(`/event/${eventId}/player/${seat.playerId}`);
                    e.preventDefault();
                  },
                  children: seat.title
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(Group, { spacing: 2, grow: !largeScreen, children: [
              /* @__PURE__ */ jsx(Badge, { w: 65, size: "lg", color: "cyan", radius: "sm", style: { padding: 0 }, children: seat.score }),
              /* @__PURE__ */ jsx(
                Badge,
                {
                  w: 75,
                  size: "lg",
                  variant: "filled",
                  color: seat.ratingDelta > 0 ? "lime" : "red",
                  radius: "sm",
                  style: { padding: 0 },
                  children: seat.ratingDelta
                }
              )
            ] })
          ]
        }
      ) }, `pl_${idx}`)) }),
      /* @__PURE__ */ jsx(Space, { h: "md" }),
      /* @__PURE__ */ jsx(Divider, { size: "xs" }),
      /* @__PURE__ */ jsx(Space, { h: "md" })
    ] }),
    /* @__PURE__ */ jsx(DataCmp, { spacing: 0, grow: largeScreen ? true : void 0, children: /* @__PURE__ */ jsx(PlayerStatsListing, { playerStats, playerId }) }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Loader, {}), children: /* @__PURE__ */ jsx(HandsGraph, { handValueStat: playerStats == null ? void 0 : playerStats.handsValueSummary }) }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Loader, {}), children: /* @__PURE__ */ jsx(YakuGraph, { yakuStat: playerStats == null ? void 0 : playerStats.yakuSummary }) })
  ] });
};
var YakuId = /* @__PURE__ */ ((YakuId2) => {
  YakuId2[YakuId2["__OPENHAND"] = -1] = "__OPENHAND";
  YakuId2[YakuId2["TOITOI"] = 1] = "TOITOI";
  YakuId2[YakuId2["HONROTO"] = 2] = "HONROTO";
  YakuId2[YakuId2["SANANKOU"] = 3] = "SANANKOU";
  YakuId2[YakuId2["SANSHOKUDOUKOU"] = 4] = "SANSHOKUDOUKOU";
  YakuId2[YakuId2["SANKANTSU"] = 5] = "SANKANTSU";
  YakuId2[YakuId2["SUUKANTSU"] = 6] = "SUUKANTSU";
  YakuId2[YakuId2["SUUANKOU"] = 7] = "SUUANKOU";
  YakuId2[YakuId2["PINFU"] = 8] = "PINFU";
  YakuId2[YakuId2["IIPEIKOU"] = 9] = "IIPEIKOU";
  YakuId2[YakuId2["RYANPEIKOU"] = 10] = "RYANPEIKOU";
  YakuId2[YakuId2["SANSHOKUDOUJUN"] = 11] = "SANSHOKUDOUJUN";
  YakuId2[YakuId2["ITTSU"] = 12] = "ITTSU";
  YakuId2[YakuId2["YAKUHAI1"] = 13] = "YAKUHAI1";
  YakuId2[YakuId2["YAKUHAI2"] = 14] = "YAKUHAI2";
  YakuId2[YakuId2["YAKUHAI3"] = 15] = "YAKUHAI3";
  YakuId2[YakuId2["YAKUHAI4"] = 16] = "YAKUHAI4";
  YakuId2[YakuId2["SHOSANGEN"] = 18] = "SHOSANGEN";
  YakuId2[YakuId2["DAISANGEN"] = 19] = "DAISANGEN";
  YakuId2[YakuId2["SHOSUUSHII"] = 20] = "SHOSUUSHII";
  YakuId2[YakuId2["DAISUUSHII"] = 21] = "DAISUUSHII";
  YakuId2[YakuId2["TSUUIISOU"] = 22] = "TSUUIISOU";
  YakuId2[YakuId2["TANYAO"] = 23] = "TANYAO";
  YakuId2[YakuId2["CHANTA"] = 24] = "CHANTA";
  YakuId2[YakuId2["JUNCHAN"] = 25] = "JUNCHAN";
  YakuId2[YakuId2["CHINROTO"] = 26] = "CHINROTO";
  YakuId2[YakuId2["HONITSU"] = 27] = "HONITSU";
  YakuId2[YakuId2["CHINITSU"] = 28] = "CHINITSU";
  YakuId2[YakuId2["CHUURENPOUTO"] = 29] = "CHUURENPOUTO";
  YakuId2[YakuId2["RYUUIISOU"] = 30] = "RYUUIISOU";
  YakuId2[YakuId2["CHIITOITSU"] = 31] = "CHIITOITSU";
  YakuId2[YakuId2["KOKUSHIMUSOU"] = 32] = "KOKUSHIMUSOU";
  YakuId2[YakuId2["RIICHI"] = 33] = "RIICHI";
  YakuId2[YakuId2["DOUBLERIICHI"] = 34] = "DOUBLERIICHI";
  YakuId2[YakuId2["IPPATSU"] = 35] = "IPPATSU";
  YakuId2[YakuId2["MENZENTSUMO"] = 36] = "MENZENTSUMO";
  YakuId2[YakuId2["HAITEI"] = 37] = "HAITEI";
  YakuId2[YakuId2["RINSHANKAIHOU"] = 38] = "RINSHANKAIHOU";
  YakuId2[YakuId2["TENHOU"] = 39] = "TENHOU";
  YakuId2[YakuId2["CHIHOU"] = 40] = "CHIHOU";
  YakuId2[YakuId2["HOUTEI"] = 41] = "HOUTEI";
  YakuId2[YakuId2["CHANKAN"] = 42] = "CHANKAN";
  YakuId2[YakuId2["RENHOU"] = 43] = "RENHOU";
  YakuId2[YakuId2["OPENRIICHI"] = 44] = "OPENRIICHI";
  return YakuId2;
})(YakuId || {});
const yakuList = [
  {
    id: 33,
    name: (i18n2) => i18n2._t("Riichi")
  },
  {
    id: 34,
    name: (i18n2) => i18n2._t("Daburu riichi")
  },
  {
    id: 44,
    name: (i18n2) => i18n2._t("Open riichi")
  },
  {
    id: 35,
    name: (i18n2) => i18n2._t("Ippatsu")
  },
  {
    id: 36,
    name: (i18n2) => i18n2._t("Menzentsumo")
  },
  {
    id: 31,
    name: (i18n2) => i18n2._t("Chiitoitsu")
  },
  {
    id: 8,
    name: (i18n2) => i18n2._t("Pinfu")
  },
  {
    id: 23,
    name: (i18n2) => i18n2._t("Tanyao")
  },
  {
    id: 24,
    name: (i18n2) => i18n2._t("Chanta")
  },
  {
    id: 25,
    name: (i18n2) => i18n2._t("Junchan")
  },
  {
    id: 9,
    name: (i18n2) => i18n2._t("Iipeikou")
  },
  {
    id: 10,
    name: (i18n2) => i18n2._t("Ryanpeikou")
  },
  {
    id: 11,
    name: (i18n2) => i18n2._t("Sanshoku")
  },
  {
    id: 4,
    name: (i18n2) => i18n2._t("Sanshoku doukou")
  },
  {
    id: 12,
    name: (i18n2) => i18n2._t("Ittsu")
  },
  {
    id: 13,
    name: (i18n2) => i18n2._t("Yakuhai x1")
  },
  {
    id: 14,
    name: (i18n2) => i18n2._t("Yakuhai x2")
  },
  {
    id: 15,
    name: (i18n2) => i18n2._t("Yakuhai x3")
  },
  {
    id: 16,
    name: (i18n2) => i18n2._t("Yakuhai x4")
  },
  {
    id: 1,
    name: (i18n2) => i18n2._t("Toitoi")
  },
  {
    id: 27,
    name: (i18n2) => i18n2._t("Honitsu")
  },
  {
    id: 2,
    name: (i18n2) => i18n2._t("Honroutou")
  },
  {
    id: 3,
    name: (i18n2) => i18n2._t("Sanankou")
  },
  {
    id: 18,
    name: (i18n2) => i18n2._t("Shousangen")
  },
  {
    id: 5,
    name: (i18n2) => i18n2._t("Sankantsu")
  },
  {
    id: 41,
    name: (i18n2) => i18n2._t("Houtei raoyui")
  },
  {
    id: 37,
    name: (i18n2) => i18n2._t("Haitei")
  },
  {
    id: 38,
    name: (i18n2) => i18n2._t("Rinshan kaihou")
  },
  {
    id: 42,
    name: (i18n2) => i18n2._t("Chankan")
  },
  {
    id: 43,
    name: (i18n2) => i18n2._t("Renhou")
  },
  {
    id: 6,
    name: (i18n2) => i18n2._t("Suukantsu")
  },
  {
    id: 7,
    name: (i18n2) => i18n2._t("Suuankou")
  },
  {
    id: 19,
    name: (i18n2) => i18n2._t("Daisangen")
  },
  {
    id: 20,
    name: (i18n2) => i18n2._t("Shousuushii")
  },
  {
    id: 21,
    name: (i18n2) => i18n2._t("Daisuushii")
  },
  {
    id: 22,
    name: (i18n2) => i18n2._t("Tsuuiisou")
  },
  {
    id: 26,
    name: (i18n2) => i18n2._t("Chinroutou")
  },
  {
    id: 28,
    name: (i18n2) => i18n2._t("Chinitsu")
  },
  {
    id: 29,
    name: (i18n2) => i18n2._t("Chuuren poutou")
  },
  {
    id: 30,
    name: (i18n2) => i18n2._t("Ryuuiisou")
  },
  {
    id: 32,
    name: (i18n2) => i18n2._t("Kokushi musou")
  },
  {
    id: 39,
    name: (i18n2) => i18n2._t("Tenhou")
  },
  {
    id: 40,
    name: (i18n2) => i18n2._t("Chihou")
  }
];
const yakuNameMap = (i18n2) => Object.values(yakuList).reduce((acc, y) => {
  acc.set(y.id, y.name(i18n2));
  return acc;
}, /* @__PURE__ */ new Map());
const yakuWithPao = [
  {
    id: 19,
    name: (i18n2) => i18n2._t("Daisangen")
  },
  {
    id: 21,
    name: (i18n2) => i18n2._t("Daisuushii")
  },
  {
    id: 22,
    name: (i18n2) => i18n2._t("Tsuuiisou")
  },
  {
    id: 30,
    name: (i18n2) => i18n2._t("Ryuuiisou")
  },
  {
    id: 26,
    name: (i18n2) => i18n2._t("Chinroutou")
  },
  {
    id: 6,
    name: (i18n2) => i18n2._t("Suukantsu")
  }
];
const makeLog = (rounds, players, i18n2) => {
  const noRiichi = i18n2._pt("Riichi bets count", "none");
  const yakuNameMap$1 = yakuNameMap(i18n2);
  return rounds.map((round) => {
    var _a, _b, _c, _d, _e;
    if (round.ron) {
      return i18n2._pt("Ron log item", "%1: <b>%2</b> - %3 (<b>%4</b>), %5. Riichi bets: %6", [
        makeRound(round.ron.roundIndex),
        (_a = players[round.ron.winnerId]) == null ? void 0 : _a.title,
        makeYaku(round.ron.yaku, round.ron.dora + round.ron.uradora, i18n2, yakuNameMap$1),
        (_b = players[round.ron.loserId]) == null ? void 0 : _b.title,
        makeHanFu(round.ron.han, round.ron.fu, i18n2),
        makeCsvPlayers(players, round.ron.riichiBets) || noRiichi
      ]);
    }
    if (round.tsumo) {
      return i18n2._pt("Tsumo log item", "%1: <b>%2</b> - %3 (tsumo), %4. Riichi bets: %5", [
        makeRound(round.tsumo.roundIndex),
        (_c = players[round.tsumo.winnerId]) == null ? void 0 : _c.title,
        makeYaku(round.tsumo.yaku, round.tsumo.dora + round.tsumo.uradora, i18n2, yakuNameMap$1),
        makeHanFu(round.tsumo.han, round.tsumo.fu, i18n2),
        makeCsvPlayers(players, round.tsumo.riichiBets) || noRiichi
      ]);
    }
    if (round.draw) {
      return i18n2._pt("Draw log item", "%1: Exhaustive draw (tenpai: %2). Riichi bets: %3", [
        makeRound(round.draw.roundIndex),
        round.draw.tempai.length === 4 ? i18n2._t("all tenpai") : makeCsvPlayers(players, round.draw.tempai) || i18n2._t("all noten"),
        makeCsvPlayers(players, round.draw.riichiBets) || noRiichi
      ]);
    }
    if (round.abort) {
      return i18n2._pt("Abortive draw log item", "%1: Abortive draw. Riichi bets: %2", [
        makeRound(round.abort.roundIndex),
        makeCsvPlayers(players, round.abort.riichiBets) || noRiichi
      ]);
    }
    if (round.chombo) {
      return i18n2._pt("Chombo log item", "%1: Chombo (<b>%2</b>)", [
        makeRound(round.chombo.roundIndex),
        (_d = players[round.chombo.loserId]) == null ? void 0 : _d.title
      ]);
    }
    if (round.nagashi) {
      return i18n2._pt("Nagashi log item", "%1: Nagashi mangan (<b>%2</b>). Riichi bets: %3", [
        makeRound(round.nagashi.roundIndex),
        makeCsvPlayers(players, round.nagashi.nagashi),
        makeCsvPlayers(players, round.nagashi.riichiBets) || noRiichi
      ]);
    }
    if (round.multiron) {
      const list = "<ul>" + round.multiron.wins.map((win) => {
        var _a2;
        return i18n2._pt("Multiron inner log item", "<li><b>%1</b> - %2, %3</li>", [
          (_a2 = players[win.winnerId]) == null ? void 0 : _a2.title,
          makeYaku(win.yaku, win.dora + win.uradora, i18n2, yakuNameMap$1),
          makeHanFu(win.han, win.fu, i18n2)
        ]);
      }).join("\n") + "</ul>";
      return i18n2._pt("Multiron outer log item", "%1: Ron (<b>%2</b>). Riichi bets: %3", [
        makeRound(round.multiron.roundIndex),
        (_e = players[round.multiron.loserId]) == null ? void 0 : _e.title,
        makeCsvPlayers(players, round.multiron.riichiBets) || noRiichi
      ]) + list;
    }
    return "";
  });
};
const winds$1 = [
  "?",
  "東1",
  "東2",
  "東3",
  "東4",
  "南1",
  "南2",
  "南3",
  "南4",
  "西1",
  "西2",
  "西3",
  "西4",
  "北1",
  "北2",
  "北3",
  "北4"
];
function makeRound(roundIndex) {
  return winds$1[roundIndex] ?? "?";
}
function makeYaku(yaku, dora, i18n2, yakuNames) {
  const yakuList2 = yaku.map((id) => yakuNames.get(id));
  if (dora > 0) {
    yakuList2.push(i18n2._t("dora %1", [dora]));
  }
  return yakuList2.join(", ");
}
function makeHanFu(han, fu, i18n2) {
  if (han < 0) {
    return i18n2._t("yakuman!");
  }
  if (han >= 5) {
    return i18n2._t("%1 han", [han]);
  }
  return i18n2._t("%1 han, %2 fu", [han, fu]);
}
function makeCsvPlayers(players, actualList) {
  return actualList.map((id) => {
    var _a;
    return (_a = players[id]) == null ? void 0 : _a.title;
  }).join(", ");
}
const GameListing = ({
  eventId,
  isOnline,
  game,
  players,
  rowStyle,
  showShareLink
}) => {
  const [, navigate] = useLocation();
  const i18n2 = useI18n();
  const largeScreen = useMediaQuery("(min-width: 768px)");
  const DataCmp = largeScreen ? Group : Stack;
  const winds2 = ["東", "南", "西", "北"];
  const outcomes = { ron: 0, tsumo: 0, draw: 0, chombo: 0, nagashi: 0 };
  game.rounds.forEach((r) => {
    if (r.ron || r.multiron) {
      outcomes.ron++;
    } else if (r.tsumo) {
      outcomes.tsumo++;
    } else if (r.draw || r.abort) {
      outcomes.draw++;
    } else if (r.chombo) {
      outcomes.chombo++;
    } else if (r.nagashi) {
      outcomes.nagashi++;
    }
  });
  return /* @__PURE__ */ jsxs(
    DataCmp,
    {
      grow: largeScreen ? true : void 0,
      style: { ...rowStyle, alignItems: "flex-start", position: "relative" },
      children: [
        /* @__PURE__ */ jsx("div", { style: { position: "absolute", right: "16px" }, children: showShareLink && /* @__PURE__ */ jsx(
          Anchor,
          {
            href: `/event/${eventId}/game/${game.sessionHash}`,
            onClick: (e) => {
              navigate(`/event/${eventId}/game/${game.sessionHash}`);
              e.preventDefault();
            },
            children: /* @__PURE__ */ jsx(Button, { leftIcon: /* @__PURE__ */ jsx(IconShare, { size: rem(15) }), size: "xs", variant: "light", children: i18n2._t("Game link") })
          }
        ) }),
        /* @__PURE__ */ jsxs(Stack, { style: { flexGrow: 0, minWidth: "300px" }, children: [
          /* @__PURE__ */ jsx(Text, { children: game.date }),
          game.finalResults.map((result, idx) => {
            var _a, _b, _c, _d;
            return /* @__PURE__ */ jsxs(Group, { style: { alignItems: "flex-start" }, children: [
              /* @__PURE__ */ jsx(
                Badge,
                {
                  w: 54,
                  pr: 0,
                  pl: 5,
                  size: "lg",
                  color: "blue",
                  radius: "xl",
                  style: { fontSize: "16px" },
                  rightSection: ((_a = players[result.playerId]) == null ? void 0 : _a.title) && /* @__PURE__ */ jsx(
                    PlayerIcon,
                    {
                      size: "sm",
                      p: { title: (_b = players[result.playerId]) == null ? void 0 : _b.title, id: result.playerId }
                    }
                  ),
                  children: winds2[idx]
                }
              ),
              /* @__PURE__ */ jsx(Group, { style: { maxWidth: "230px" }, children: /* @__PURE__ */ jsxs(Stack, { spacing: 0, children: [
                /* @__PURE__ */ jsx(
                  Anchor,
                  {
                    href: `/event/${eventId}/player/${result.playerId}`,
                    onClick: (e) => {
                      navigate(`/event/${eventId}/player/${result.playerId}`);
                      e.preventDefault();
                    },
                    children: (_c = players[result.playerId]) == null ? void 0 : _c.title
                  }
                ),
                isOnline && /* @__PURE__ */ jsx(Text, { c: "dimmed", children: (_d = players[result.playerId]) == null ? void 0 : _d.tenhouId }),
                /* @__PURE__ */ jsxs(Group, { spacing: 2, mt: 10, children: [
                  /* @__PURE__ */ jsx(
                    Badge,
                    {
                      w: 75,
                      size: "lg",
                      variant: "filled",
                      color: result.ratingDelta > 0 ? "lime" : "red",
                      radius: "sm",
                      style: { padding: 0 },
                      children: result.ratingDelta
                    }
                  ),
                  /* @__PURE__ */ jsx(Badge, { w: 65, size: "lg", color: "cyan", radius: "sm", style: { padding: 0 }, children: result.score })
                ] })
              ] }) })
            ] }, `pl_${idx}`);
          })
        ] }),
        /* @__PURE__ */ jsxs(Stack, { style: { flex: 1, maxWidth: "unset" }, children: [
          isOnline && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("a", { href: game.replayLink, target: "_blank", children: "View replay" }) }),
          /* @__PURE__ */ jsxs(Group, { spacing: 2, style: { marginRight: largeScreen ? "200px" : 0 }, children: [
            /* @__PURE__ */ jsx(Badge, { h: 30, size: "md", color: "red", radius: "sm", variant: "outline", children: i18n2._t("Ron: %1", [outcomes.ron || "0"]) }),
            /* @__PURE__ */ jsx(Badge, { h: 30, size: "md", color: "grape", radius: "sm", variant: "outline", children: i18n2._t("Tsumo: %1", [outcomes.tsumo || "0"]) }),
            /* @__PURE__ */ jsx(Badge, { h: 30, size: "md", color: "cyan", radius: "sm", variant: "outline", children: i18n2._t("Draw: %1", [outcomes.draw || "0"]) }),
            outcomes.chombo > 0 && /* @__PURE__ */ jsx(Badge, { h: 30, size: "md", color: "dark", radius: "sm", variant: "outline", children: i18n2._t("Chombo: %1", [outcomes.chombo]) }),
            outcomes.nagashi > 0 && /* @__PURE__ */ jsx(Badge, { h: 30, size: "md", color: "indigo", radius: "sm", variant: "outline", children: i18n2._t("Nagashi: %1", [outcomes.nagashi]) })
          ] }),
          /* @__PURE__ */ jsx(List, { children: makeLog(game.rounds, players, i18n2).map((item, idxLog) => /* @__PURE__ */ jsx(
            "li",
            {
              style: {
                listStyleType: "none",
                textIndent: "-34px",
                marginLeft: "34px"
              },
              dangerouslySetInnerHTML: { __html: item }
            },
            `log_${idxLog}`
          )) })
        ] })
      ]
    }
  );
};
const PERPAGE = 10;
const RecentGames = ({ params: { eventId, page } }) => {
  var _a, _b;
  page = page ?? "1";
  const api2 = useApi();
  const i18n2 = useI18n();
  const largeScreen = useMediaQuery("(min-width: 768px)");
  const [, navigate] = useLocation();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === "dark";
  const events = useEvent(eventId);
  const [games, , gamesLoading] = useIsomorphicState(
    [],
    "RecentGames_games_" + eventId + "_" + page,
    () => api2.getRecentGames(parseInt(eventId, 10), PERPAGE, (parseInt(page ?? "1", 10) - 1) * PERPAGE),
    [eventId, page]
  );
  if (!games || !events) {
    return null;
  }
  const players = (_a = games == null ? void 0 : games.players) == null ? void 0 : _a.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
  return events && /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      (events == null ? void 0 : events.length) === 1 && /* @__PURE__ */ jsxs("title", { children: [
        i18n2._t("Last games"),
        " - ",
        events == null ? void 0 : events[0].title,
        " - Sigrun"
      ] }),
      ((events == null ? void 0 : events.length) ?? 0) > 1 && /* @__PURE__ */ jsxs("title", { children: [
        i18n2._t("Last games"),
        " - ",
        i18n2._t("Aggregated event"),
        " - Sigrun"
      ] })
    ] }),
    events == null ? void 0 : events.map((event, eid) => /* @__PURE__ */ jsxs("h2", { style: { display: "flex", gap: "20px" }, children: [
      events && /* @__PURE__ */ jsx(EventTypeIcon, { event }),
      event == null ? void 0 : event.title,
      " - ",
      i18n2._t("Last games")
    ] }, `ev_${eid}`)),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsxs(Box, { pos: "relative", children: [
      /* @__PURE__ */ jsx(LoadingOverlay, { visible: gamesLoading, overlayBlur: 2 }),
      /* @__PURE__ */ jsx(Stack, { spacing: 0, children: (_b = games == null ? void 0 : games.games) == null ? void 0 : _b.map((game, idx) => {
        var _a2;
        return /* @__PURE__ */ jsxs(Fragment$1, { children: [
          /* @__PURE__ */ jsx(
            GameListing,
            {
              showShareLink: true,
              isOnline: ((_a2 = events == null ? void 0 : events[0]) == null ? void 0 : _a2.type) === EventType.EVENT_TYPE_ONLINE,
              eventId,
              game,
              players,
              rowStyle: {
                padding: "16px",
                backgroundColor: idx % 2 ? isDark ? theme.colors.dark[7] : theme.colors.gray[1] : "transparent"
              }
            }
          ),
          /* @__PURE__ */ jsx(Divider, { size: "xs" })
        ] }, `gm_${idx}`);
      }) })
    ] }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Center, { children: /* @__PURE__ */ jsx(
      Pagination,
      {
        size: largeScreen ? "md" : "sm",
        value: parseInt(page, 10),
        onChange: (p) => {
          navigate(`/event/${eventId}/games/page/${p}`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        total: Math.ceil(((games == null ? void 0 : games.totalGames) ?? 0) / PERPAGE)
      }
    ) })
  ] });
};
const SeriesRating = ({
  params: { eventId }
}) => {
  var _a, _b;
  const api2 = useApi();
  const [, navigate] = useLocation();
  const i18n2 = useI18n();
  const events = useEvent(eventId);
  const [seriesData] = useIsomorphicState(
    null,
    "SeriesRating_games_" + eventId,
    () => events ? api2.getGameSeries(parseInt(eventId, 10)) : Promise.resolve(null),
    [eventId, events]
  );
  if (!events) {
    return null;
  }
  if ((events == null ? void 0 : events.length) > 1) {
    return /* @__PURE__ */ jsx(Container, { children: /* @__PURE__ */ jsx(Alert, { color: "red", children: i18n2._t("Series rating is not available for aggregated events") }) });
  }
  return /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsxs("title", { children: [
      i18n2._t("Series rating"),
      " - ",
      (_a = events[0]) == null ? void 0 : _a.title,
      " - Sigrun"
    ] }) }),
    /* @__PURE__ */ jsxs("h2", { style: { display: "flex", gap: "20px" }, children: [
      events[0] && /* @__PURE__ */ jsx(EventTypeIcon, { event: events[0] }),
      (_b = events[0]) == null ? void 0 : _b.title,
      " - ",
      i18n2._t("Series rating")
    ] }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    seriesData && seriesData.map((item, idx) => /* @__PURE__ */ jsxs(Group, { style: { flex: 1 }, children: [
      /* @__PURE__ */ jsx(Badge, { w: 50, size: "xl", color: "blue", radius: "sm", style: { padding: 0 }, children: idx + 1 }),
      /* @__PURE__ */ jsx(PlayerIcon, { p: item.player }),
      /* @__PURE__ */ jsx(Group, { spacing: 2, children: /* @__PURE__ */ jsx(
        Anchor,
        {
          href: `/event/${events[0].id}/player/${item.player.id}`,
          onClick: (e) => {
            navigate(`/event/${events[0].id}/player/${item.player.id}`);
            e.preventDefault();
          },
          children: item.player.title
        }
      ) }),
      /* @__PURE__ */ jsxs(Stack, { spacing: "xs", w: "100%", children: [
        /* @__PURE__ */ jsxs(Stack, { spacing: 0, children: [
          /* @__PURE__ */ jsxs(Box, { style: { display: "flex", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsx(Badge, { color: "blue", size: "sm", radius: 0, children: i18n2._t("Best series") }),
            /* @__PURE__ */ jsxs(Badge, { color: "green", size: "sm", radius: 0, children: [
              i18n2._t("Avg place:"),
              " ",
              item.bestSeriesAvgPlace,
              " (",
              item.bestSeriesPlaces,
              " /",
              " ",
              Math.round(item.bestSeriesPlaces / parseFloat(item.bestSeriesAvgPlace)),
              ")"
            ] }),
            /* @__PURE__ */ jsxs(Badge, { color: "grape", size: "sm", radius: 0, children: [
              i18n2._t("Score:"),
              " ",
              item.bestSeriesScores
            ] })
          ] }),
          /* @__PURE__ */ jsx(Box, { style: { display: "flex", flexWrap: "wrap" }, children: item.bestSeries.map((bs, bsidx) => /* @__PURE__ */ jsx(
            Anchor,
            {
              style: { textDecoration: "none", display: "flex" },
              href: `/event/${eventId}/game/${bs.sessionHash}`,
              onClick: (e) => {
                navigate(`/event/${eventId}/game/${bs.sessionHash}`);
                e.preventDefault();
              },
              children: /* @__PURE__ */ jsx(Badge, { size: "sm", variant: "filled", radius: 0, color: getColor(bs.place), children: bs.place })
            },
            `bs_${bsidx}`
          )) })
        ] }),
        /* @__PURE__ */ jsxs(Stack, { spacing: 0, children: [
          /* @__PURE__ */ jsxs(Box, { style: { display: "flex", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsx(Badge, { color: "blue", size: "sm", radius: 0, children: i18n2._t("Last series") }),
            /* @__PURE__ */ jsxs(Badge, { color: "green", size: "sm", radius: 0, children: [
              i18n2._t("Avg place:"),
              " ",
              item.currentSeriesAvgPlace,
              " (",
              item.currentSeriesPlaces,
              " ",
              "/",
              " ",
              Math.round(item.currentSeriesPlaces / parseFloat(item.currentSeriesAvgPlace)),
              ")"
            ] }),
            /* @__PURE__ */ jsxs(Badge, { color: "grape", size: "sm", radius: 0, children: [
              i18n2._t("Score:"),
              " ",
              item.currentSeriesScores
            ] })
          ] }),
          /* @__PURE__ */ jsx(Box, { style: { display: "flex", flexWrap: "wrap" }, children: item.currentSeries.map((ls, lsidx) => /* @__PURE__ */ jsx(
            Anchor,
            {
              style: { textDecoration: "none", display: "flex" },
              href: `/event/${eventId}/game/${ls.sessionHash}`,
              onClick: (e) => {
                navigate(`/event/${eventId}/game/${ls.sessionHash}`);
                e.preventDefault();
              },
              children: /* @__PURE__ */ jsx(Badge, { size: "sm", variant: "filled", radius: 0, color: getColor(ls.place), children: ls.place })
            },
            `bs_${lsidx}`
          )) })
        ] }),
        /* @__PURE__ */ jsx(Space, { h: "lg" })
      ] })
    ] }, `series_${idx}`))
  ] });
};
function getColor(place) {
  switch (place) {
    case 1:
      return "green";
    case 2:
      return "yellow";
    case 3:
      return "orange";
    case 4:
      return "red";
    default:
      return "dark";
  }
}
const Game = ({ params: { eventId, sessionHash } }) => {
  var _a, _b, _c, _d;
  const api2 = useApi();
  const i18n2 = useI18n();
  const events = useEvent(eventId);
  const [game] = useIsomorphicState(
    null,
    "Game_game_" + eventId + sessionHash,
    () => api2.getGame(sessionHash),
    [eventId, sessionHash]
  );
  if (game === void 0 || !events) {
    return null;
  }
  const players = (_a = game == null ? void 0 : game.players) == null ? void 0 : _a.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
  return (game == null ? void 0 : game.game) && events && /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsxs("title", { children: [
      i18n2._t("Game preview"),
      " - Sigrun"
    ] }) }),
    /* @__PURE__ */ jsxs("h2", { style: { display: "flex", gap: "20px" }, children: [
      (events == null ? void 0 : events[0]) && /* @__PURE__ */ jsx(EventTypeIcon, { event: events[0] }),
      (_b = events == null ? void 0 : events[0]) == null ? void 0 : _b.title,
      " - ",
      i18n2._t("View game")
    ] }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(
      GameListing,
      {
        showShareLink: false,
        isOnline: ((_c = events == null ? void 0 : events[0]) == null ? void 0 : _c.type) === EventType.EVENT_TYPE_ONLINE,
        eventId: (_d = events == null ? void 0 : events[0]) == null ? void 0 : _d.id.toString(),
        game: game.game,
        players,
        rowStyle: {
          padding: "16px"
        }
      }
    )
  ] });
};
const sound = "/assets/5min-220673cb.wav";
const Timer = ({ params: { eventId } }) => {
  var _a, _b;
  const events = useEvent(eventId);
  const i18n2 = useI18n();
  const [, setSoundPlayed] = useState(false);
  const [formatterTimer, setFormattedTimer] = useState(null);
  const [showSeating, setShowSeating] = useState(false);
  const [timerWaiting, setTimerWaiting] = useState(false);
  const api2 = useApi();
  const [seating] = useIsomorphicState(
    [],
    "TimerState_seating_" + eventId,
    () => api2.getSeating(parseInt(eventId, 10)),
    [eventId]
  );
  useEffect(() => {
    if (!window.__endingSound) {
      window.__endingSound = new Audio(sound);
    }
  });
  useEffect(() => {
    const timer = setInterval(() => {
      api2.getTimerState(parseInt(eventId, 10)).then((newState) => {
        setShowSeating(newState.showSeating);
        setTimerWaiting(newState.waitingForTimer);
        setSoundPlayed((old) => {
          if (newState.finished && !old) {
            window.__endingSound.play();
            return true;
          } else {
            return old;
          }
        });
        setFormattedTimer(
          formatTimer(newState.finished, newState.timeRemaining, newState.showSeating)
        );
      });
    }, 1e3);
    return () => clearInterval(timer);
  }, []);
  if (!events || !seating) {
    return null;
  }
  if ((events == null ? void 0 : events.length) > 1) {
    return /* @__PURE__ */ jsx(Container, { children: /* @__PURE__ */ jsx(Alert, { color: "red", children: i18n2._t("Timer is not available for aggregated events") }) });
  }
  const tables = /* @__PURE__ */ new Map();
  for (const t of seating ?? []) {
    if (!tables.has(t.tableIndex)) {
      tables.set(t.tableIndex, []);
    }
    const table = tables.get(t.tableIndex);
    if (table) {
      table.push(t);
    }
  }
  for (const v of tables.values()) {
    v.sort((a, b) => a.order - b.order);
  }
  const tablesIterable = [...tables.entries()].map(([index, table]) => ({ index, table })).sort((a, b) => a.index - b.index);
  return /* @__PURE__ */ jsxs(Container, { w: "100%", m: 10, maw: "100%", children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsxs("title", { children: [
      i18n2._t("Timer"),
      " - ",
      (_a = events[0]) == null ? void 0 : _a.title,
      " - Sigrun"
    ] }) }),
    !showSeating && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("h2", { style: { display: "flex", gap: "20px" }, children: [
        events[0] && /* @__PURE__ */ jsx(EventTypeIcon, { event: events[0] }),
        (_b = events[0]) == null ? void 0 : _b.title
      ] }),
      /* @__PURE__ */ jsx(Divider, { size: "xs" }),
      /* @__PURE__ */ jsx(Space, { h: "md" })
    ] }),
    !timerWaiting && /* @__PURE__ */ jsx(Center, { children: formatterTimer }),
    showSeating && /* @__PURE__ */ jsx(Group, { children: tablesIterable.map((table, tidx) => /* @__PURE__ */ jsx(Table, { table: table.table, index: table.index }, `tbl_${tidx}`)) })
  ] });
};
const winds = ["東", "南", "西", "北"];
const colors = ["red", "yellow", "green", "blue"];
function Table({ index, table }) {
  return /* @__PURE__ */ jsxs(
    Group,
    {
      align: "flex-start",
      style: {
        border: "1px solid #ccc",
        borderRadius: "7px",
        padding: "5px",
        backgroundColor: "#eee"
      },
      children: [
        /* @__PURE__ */ jsx(Badge, { variant: "filled", size: "xl", radius: "sm", pl: 8, pr: 8, children: index }),
        /* @__PURE__ */ jsx(Stack, { spacing: 0, children: table.map((seat, idx) => /* @__PURE__ */ jsxs(Group, { position: "apart", children: [
          /* @__PURE__ */ jsx(Badge, { size: "xl", radius: "sm", p: 5, color: colors[idx], children: winds[idx] }),
          seat.playerTitle,
          /* @__PURE__ */ jsx(
            Badge,
            {
              radius: "sm",
              pl: 5,
              pr: 5,
              color: seat.rating > 0 ? "green" : "red",
              variant: "filled",
              children: seat.rating
            }
          )
        ] }, `st_${idx}`)) })
      ]
    }
  );
}
function formatTimer(finished, timeRemaining, small) {
  if (finished) {
    return /* @__PURE__ */ jsx(IconAlarm, { size: small ? 120 : 240 });
  }
  const minutes = (Math.ceil(timeRemaining / 60) - (timeRemaining % 60 === 0 ? 0 : 1)).toString();
  const seconds = timeRemaining % 60 >= 10 ? (timeRemaining % 60).toString() : "0" + (timeRemaining % 60).toString();
  return /* @__PURE__ */ jsxs(Text, { size: small ? 120 : 240, children: [
    minutes,
    ":",
    seconds
  ] });
}
const bestHand = "/assets/bestHand-0fb051c2.png";
const bestFu = "/assets/bestFu-c74cef5a.png";
const bestTsumoist = "/assets/bestTsumoist-e92401b5.png";
const dieHard = "/assets/dieHard-a1973701.png";
const braveSapper = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAADAFBMVEXGxMf7AAD8AAD1AQDFw8b/BgD6AACFf3///v///QL/AQAAAQD9AAT/BQAAAwD2AAD/CAD/AAcAAAT+AQC/AAAGAAD3AAD6BAC9AAD/AQP6AQD/AAwHAAD/BwD/BRH8AAXEwsUABAcMAAADAAD7AAr3Awj5AwANAAX/AgKLgIH4BAAABgsFAAsACACQhIi6AQC9AAL0BQAAABAFAwT5AAAABQD4Bw06AADlAAD5AAXyCgjmAAAIBQDGBgCLeoC2Cgb///34ABD+Ag//ABAPAAe6ABH/CBbRAAAGBgA8AAkvBAF7f4D6AAz3BQCEf4U+AgD/Bw18iIb1AAWCgX8GAwAEAAQAAgd3e3qAhYg2BQh4h4S6AwUUAAN8hYROAAfCBBA9CASMeZeRhooAACTJd47/ExOJh5T+BQEACgACARH/BghBAABHAASPhofQfY+KhIT7ABj6Bg5TAADyCABKBAAABQh9gYD///qFg4YJAAL9//uUi5B7hIZKAAMAARGLfIF8fX9QAAB+f4TpAACIgoS6CAC3ABeLgIYKAAsBAA3/Bwn9AAIACgX1AArvBAHMeI/8AA2/gYz9CQhxgIcADQrIAQT7CASCgIP4AAPyBAAzBAD/BAr/AwX4AAj9AgtGCAk9AxH/+P0CAgj///MAABP//f9AAwD4AAUAAQv+BAAABgD7Agb4AA3JBQbyAAD9//8AAAL/BQMIABT//v3//P+Ii5R9eYf6//2Gg5D7/P+GhImBg4PEe5DNxsn7/Pn////IxssHAQrKhovDwsH3/PbCwcWIjI2JhIrPvs+GfICOhouPhIbIv9TBzMTDycY3CgB6f3w7AALIwMPDyL2DhoWAjIp3iYmLdIB9fnyLhYd+dHyEhIDHfoft///5/+qIe4XCfISPeoN3iICGiIPAx7f4/f8OCQCChnjPv8A3AA+CfID0/vYRAAD//QfQfJP2+/W7w8769fz99/fUu77z+PQRABJ+eX3//Q3JwMPGyMe4w8V5e3jZvNDPiJrNf5X7AAD7KfLvAAAJiElEQVR42u2dCVRU1xnHBxzKKBEUDUZApQjFKKTu1q3FXavgEiVJs7WJwX0XJiBt7ZK47wvuOor7QgOkLeDg2GFAIVIYbI8UW7WV2pq2Kq6o7en/zb3eYcblhCOevMf9fufIzJv7/nN5v3Pfe/e9mU90OoIgiBfB6dOnKysr/wdyHYwdO/a/IDU1tbi4+G9g4sSJiYmJaPkrOH78OGsprt2Sy1pyAN7ObDZraPv1bgISZROgKygouHbtWjI4ceJEVlZWpjEzD6Q7yAfR0dFoMRgMeBJtNBrTRZNoMThb7HY7HGhaQKaxek+11AIy86rz92Q/h4BYrY+APKlGwJ07d/DrY8uzsrOzsS3Y/7EtRizv3bs3mjUZHCjbJ1r21m4xsJYSgENkRUWFRgXkKQLyq6qkFfBoBCRLJWDRokU47n0JnvutvB+RqikBFbILkH0EXL16FQJ+A0gACSABMgooKipSpv/g6ev4+vr6+PjsBiNGjIiLi2t4AkyYBcoswGSUeATExsZiF1Dms09onACwzY3dUF4+efIkCWgQAlKlF5CaCgEm4N4SGhra+JmMHj264Qioll2AySirgNzcXAhQbnG4vBwVFdX4KxAREUECSAAJ0LSAs2fP8pui4qXvA7Z9fwd4wFTYuc3t27dXHpKSktgyniQ1NAFvyS5AthFw69Ytl6nwCJfZ7/z58933fH8gFnCd6EMCSIB2BVy5cgWnwL8Atlx72xwbxx6cr+EysLH7a5g1kwASQAI0e0vsxo0bzs8FXM75XxV2HNSogDdlFyD7CIiPj8cxYA+o02WgK7CmXQFFEJCZvydfWgFsBMCApALOnTsHAVXZVdls2eX09gzu3r3rXFi8eLHGBWQDEiCnAHZP0Hk1KG501CIhIQFeMN0LLSsrGzx48GMrTJ48mQSQABKgTQGlpaVGo9F5EAT/BM6N69Wrl/v2DgdiAUIGa/iOkH7hQrkF6EplFxD/23gIqALipd8DtnHB4AlzgH8D8eF5nPjWFAnQ5DHgc9lHQGVlpftXZU+BJ50Nn4C/v7/zrTQsILm2AL2EAjACvpR6BGRKPAJwOYyDYHJeXrLzwGjX6fGQkZHx7K3HsdLlrbQsIA8O3FukEuAyAuQSUFFRUV1d7fINEScRQHxdxOXTsZO3b99m61hAAxBgyjLJLUDeEVBYWGgwGFyuBh8DF39paWn/AmVlZUuWLHFttTx2DMiRS4COBGhawMiRI9PT0/8MnvuthICPSQAJIAGa4cGDB7gS/AfwrjdIAAnQEMXFxWfKz/wH1J+AVG0JqCg/I7cAyUeA2WwuLS09Dupt+19foDEB5+pZgPcCbW1/vY8A7wIaARpCrw+pqalRBoLdasVPK+PmzZv37t07A+7fv19eXv4Fw2Kx2O12JYfXHj58eP369cugpKTk1KlTyr0hmwMtCcCvqwjQmXVWu81sMVttVmu5tdxVwOVHAmpqmIASy2MC0GjRWaw2G95Brz0BZvM9m12MgHLXEXCZjwA9ttEhwKLT1bgJ+EIZATUWW4hiQFu7gEJISAj+2ZSH2oh2xzNno83xkuuqNXrnW2lPQD2jld/zhUECSIDkAl6AUoPkkAASQAJIAAmQWkCI5OgIgiAIgiAIgiAIgiAI2fCWHBJAAkgACSABJIAEkAASQAJIgKQCLly48DuQk5Nz6dKlP4KLFy8WFhYWFBT8CbCWP4CUlJTz58/jZxFgoRwRYhke4i0iw0Mq7Ug3ZMgQL9CqVauBAwe+Apo0adK3b9+hQ4d+DgYNGtSnT5/vgGHDhvXu3XvSpEnfACzUSoRYhodYpo/I8JBKOyIB0gsYPnx4O4DEqFGjvgc6dOiABT8/v1+DmJgYT0/PNqBly5ZBQUGNGjV6CbCQlwixDA+xjKfI8JBKOyIB0gvo16+f0lNgYCB+KntMeHh48+bNmzZt+hrw8PDAArJ+/fv379mz57hx45Q+WShQhFiGh1imucjwkEo7IgEkQHYBvr6+vUBwcPCYMWO+CXAmxbvg53cBjh+tW7f+FsB6AwYMiIyMVP7DZxYKFiGW4SGWaS0yPKTSjkiA9ALWr18/Gvg4eB+sXr0aZ81mzZq9ATZu3IiT60dgw4YNc+fOjYqKWgxYyEeEWIaHWKaRyPCQSjsiAdIL6Nq163wQERGRlJT0E9ClS5ft27d37959AQgICNi6desvAPalXbt2GY1G5a+HsVCECLEMD7HMVpHhIZV2RAKkF9CtWzflr+F26tQJe9DLAHsIdpelS5eOBGvXrp06dWoTgBWmTZtmMpmSAQt1EiGW4SGWmSoyPKTSjkgACSAB3X4GsF5oaOhksG/fvgkTJhw7dmwhwKyR/ymoHj167Ny509/f/1eAhV4WIZbhIZbxERkeUmlHJEB6AcuXL/8hmDJlCq6O2gNcNc2ZM2fZsmXvApw8582bp+x27H9D3717t9InC00RIZbhIZaZJzI8pNKOSID0ArDCe2D8+PFxcXHvAEwcg4KCVq5c+QOAVFhYmHL7ABPM6dOnY8daAlhovAixDA+xTJjI8JBKOyIBJEB2AThQ/BhERkYeOnTo28DLy6tdu3aHDx/+JQgMDGzRooUH6Ny585YtWzIyMpQ7lCwUKUIsw0Ms00JkeEilHZEA6QVgQvgWwCyyTZs2HwI04VLJ09PzTYDs7NmzlfuQCQkJAQEBaWlpyumZhfxFiGV4iGVmiwwPqbQjEiC9gAMHDuDMsAzN+/fv/wR4OGjbtu3PAdbw8/NTVjh69CimlOHh4Z8BFvIUIY/aIZbxExkeUmlHJEB6AdhVmjJWrFjxNsCzjh07oikWxMTEYN6kfACFkwZ2JFxEKQvuIZbhIZYJExkeUmlHJIAEyC4AU0XlELFjx46DBw9+CtC0adMmHDJ+Co4cObJt27aX2LeNNm/ejIsotLRloR0ixDI8xDLbRIaHVNoRCZBeQHx8/ETwqoMfgTVr1syYMSMxMfF1sGrVqlmzZo0F69atmzlzZkpKyiLAQq+KEMvwEMvMEhkeUmlHJEB6AU+vr/gA1LmQQ2TqUMjxtXZEAkiA7AKeXmDyMahzJYvI1KGS5WvtiARIL4BKZkgA1QxRyQwJoJohKpkhASSAiqaoZogEUNEUlcyQAKoZopIZEkA1Q1QyQwJIABVNUckMCaCaISqZIQFUM0QlMySABFDRFNUMkQAqmqKSGRJANUNUMkMCqGaISmZIAAmgoikqmSEBVDNEJTMkgGqGqGSGBJAAKpqimiES0DAE/B89mHl/iIp6zQAAAABJRU5ErkJggg==";
const dovakins = "/assets/dovakins-ee5dac57.png";
const bestDealer = "/assets/bestDealer-bfad3c29.png";
const shithander = "/assets/shithander-532526f2.png";
const yakumans = "/assets/yakumans-33baef33.png";
const impossibleWait = "/assets/impossibleWait-0711a597.png";
const honoredDonor = "/assets/honoredDonor-3ebde168.png";
const justAsPlanned = "/assets/justAsPlanned-7725b274.png";
const carefulPlanning = "/assets/carefulPlanning-4ab16481.png";
const doraLord = "/assets/doraLord-abfbd4e9.png";
const catchEmAll = "/assets/catchEmAll-936b5c76.png";
const favoriteAsapinApprentice = "/assets/favoriteAsapinApprentice-5c3c8546.png";
const andYourRiichiBet = "/assets/andYourRiichiBet-f5085517.png";
const covetousKnight = "/assets/covetousKnight-1f250519.png";
const ninja = "/assets/ninja-c74de89b.png";
const needMoreGold = "/assets/needMoreGold-108756d0.png";
const fullList = [
  "bestHand",
  "bestFu",
  "bestTsumoist",
  "dieHard",
  "braveSapper",
  "dovakins",
  "bestDealer",
  "shithander",
  "yakumans",
  "impossibleWait",
  "honoredDonor",
  "justAsPlanned",
  "carefulPlanning",
  "doraLord",
  "catchEmAll",
  "favoriteAsapinApprentice",
  "andYourRiichiBet",
  "covetousKnight",
  "ninja",
  "needMoreGold"
  /* NEED_MORE_GOLD */
];
const Achievements = ({
  params: { eventId }
}) => {
  var _a;
  const i18n2 = useI18n();
  const api2 = useApi();
  const events = useEvent(eventId);
  const [achievementsData] = useIsomorphicState(
    null,
    "Achievements_" + eventId,
    () => api2.getAchievements(parseInt(eventId, 10), fullList),
    [eventId, fullList]
  );
  if (!achievementsData || !events) {
    return null;
  }
  const achDataByKey = achievementsData.reduce((acc, val) => {
    try {
      acc[val.achievementId] = JSON.parse(val.achievementData);
    } catch (e) {
      acc[val.achievementId] = null;
    }
    return acc;
  }, {});
  const yMap = yakuNameMap(i18n2);
  const ach = [
    {
      id: "bestHand",
      image: bestHand,
      label: i18n2._t("Best hand"),
      description: i18n2._t(
        "Given for collecting the hand with biggest han count (independent of cost)."
      ),
      content: achDataByKey[
        "bestHand"
        /* BEST_HAND */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "bestHand"
          /* BEST_HAND */
        ].names.map((name, idx) => /* @__PURE__ */ jsx(List.Item, { children: name }, `li_${idx}`)) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 8,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl",
            children: i18n2._pt("Achievements badge", "%1 han", [achDataByKey[
              "bestHand"
              /* BEST_HAND */
            ].han])
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "bestFu",
      image: bestFu,
      label: i18n2._t("Over 9000 fu"),
      description: i18n2._t("Given for collecting the hand with biggest minipoints (fu) count."),
      content: achDataByKey[
        "bestFu"
        /* BEST_FU */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "bestFu"
          /* BEST_FU */
        ].names.map((name, idx) => /* @__PURE__ */ jsx(List.Item, { children: name }, `li_${idx}`)) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 8,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl",
            children: i18n2._pt("Achievements badge", "%1 fu", [achDataByKey[
              "bestFu"
              /* BEST_FU */
            ].fu])
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "bestTsumoist",
      image: bestTsumoist,
      label: i18n2._t("I saw them dancing"),
      description: i18n2._t("Given for collecting the most of tsumo hands during single game."),
      content: achDataByKey[
        "bestTsumoist"
        /* BEST_TSUMOIST */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "bestTsumoist"
          /* BEST_TSUMOIST */
        ].names.map((name, idx) => /* @__PURE__ */ jsx(List.Item, { children: name }, `li_${idx}`)) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 8,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl",
            children: i18n2._pt("Achievements badge", "%1 tsumo", [
              achDataByKey[
                "bestTsumoist"
                /* BEST_TSUMOIST */
              ].tsumo
            ])
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "dieHard",
      image: dieHard,
      label: i18n2._t("Die Hard"),
      description: i18n2._t("Given for smallest count of feeding into ron during the tournament."),
      content: achDataByKey[
        "dieHard"
        /* DIE_HARD */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "dieHard"
          /* DIE_HARD */
        ].names.map((name, idx) => /* @__PURE__ */ jsx(List.Item, { children: name }, `li_${idx}`)) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 8,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl",
            children: i18n2._npt(
              "Achievements badge",
              ["%1 feed", "%1 feeds"],
              achDataByKey[
                "dieHard"
                /* DIE_HARD */
              ].feed,
              [achDataByKey[
                "dieHard"
                /* DIE_HARD */
              ].feed || "0"]
            )
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "braveSapper",
      image: braveSapper,
      label: i18n2._t("Brave minesweeper"),
      description: i18n2._t("Given for largest count of feeding into ron during the tournament."),
      content: achDataByKey[
        "braveSapper"
        /* BRAVE_SAPPER */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "braveSapper"
          /* BRAVE_SAPPER */
        ].names.map((name, idx) => /* @__PURE__ */ jsx(List.Item, { children: name }, `li_${idx}`)) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 8,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl",
            children: i18n2._npt(
              "Achievements badge",
              ["%1 feed", "%1 feeds"],
              achDataByKey[
                "braveSapper"
                /* BRAVE_SAPPER */
              ].feed,
              [achDataByKey[
                "braveSapper"
                /* BRAVE_SAPPER */
              ].feed || "0"]
            )
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "dovakins",
      image: dovakins,
      label: i18n2._t("Guest of honors"),
      description: i18n2._t("Given for collecting the most of yakuhais during the tournament."),
      content: achDataByKey[
        "dovakins"
        /* DOVAKINS */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "dovakins"
          /* DOVAKINS */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            i18n2._npt("Achievements badge", ["%1 yakuhai", "%1 yakuhais"], item.count, [
              item.count || "0"
            ])
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "bestDealer",
      image: bestDealer,
      label: i18n2._t("The great dealer"),
      description: i18n2._t("Given for largest count of dealer wins during the tournament."),
      content: achDataByKey[
        "bestDealer"
        /* BEST_DEALER */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "bestDealer"
          /* BEST_DEALER */
        ].names.map((name, idx) => /* @__PURE__ */ jsx(List.Item, { children: name }, `li_${idx}`)) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 8,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl",
            children: i18n2._npt(
              "Achievements badge",
              ["%1 win", "%1 wins"],
              achDataByKey[
                "bestDealer"
                /* BEST_DEALER */
              ].bestWinCount,
              [achDataByKey[
                "bestDealer"
                /* BEST_DEALER */
              ].bestWinCount || "0"]
            )
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "shithander",
      image: shithander,
      label: i18n2._t("The 1k Flash"),
      description: i18n2._t("Given for the most of 1/30 wins during tournament."),
      content: achDataByKey[
        "shithander"
        /* SHITHANDER */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "shithander"
          /* SHITHANDER */
        ].names.map((name, idx) => /* @__PURE__ */ jsx(List.Item, { children: name }, `li_${idx}`)) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 8,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl",
            children: i18n2._npt(
              "Achievements badge",
              ["%1 quickest hand", "%1 quickest hands"],
              achDataByKey[
                "shithander"
                /* SHITHANDER */
              ].handsCount,
              [achDataByKey[
                "shithander"
                /* SHITHANDER */
              ].handsCount || "0"]
            )
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "yakumans",
      image: yakumans,
      label: i18n2._t("Jewelry included"),
      description: i18n2._t("Given for collecting a yakuman during tournament."),
      content: achDataByKey[
        "yakumans"
        /* YAKUMANS */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        achDataByKey[
          "yakumans"
          /* YAKUMANS */
        ].length > 0 ? /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "yakumans"
          /* YAKUMANS */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ", ",
            yMap.get(item.yaku)
          ] }, `li_${idx}`)
        ) }) : /* @__PURE__ */ jsx(Text, { children: i18n2._t("No yakumans have been collected") }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "impossibleWait",
      image: impossibleWait,
      label: i18n2._t("This can't be your wait"),
      description: i18n2._t(
        "Given for feeding into largest hand during tournament (but not while in riichi)."
      ),
      content: achDataByKey[
        "impossibleWait"
        /* IMPOSSIBLE_WAIT */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "impossibleWait"
          /* IMPOSSIBLE_WAIT */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            item.hand.fu ? i18n2._pt("Achievements badge", "%1 han, %2 fu", [
              item.hand.han || "0",
              item.hand.fu || "0"
            ]) : i18n2._pt("Achievements badge", "%1 han", [item.hand.han || "0"])
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "honoredDonor",
      image: honoredDonor,
      label: i18n2._t("Honored donor"),
      description: i18n2._t("Given for losing largest amount of points as riichi bets."),
      content: achDataByKey[
        "honoredDonor"
        /* HONORED_DONOR */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "honoredDonor"
          /* HONORED_DONOR */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            i18n2._npt("Achievements badge", ["%1 bet", "%1 bets"], item.count, [
              item.count || "0"
            ])
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "justAsPlanned",
      image: justAsPlanned,
      label: i18n2._t("Just as planned"),
      description: i18n2._t("Given for getting largest number of ippatsu during tournament."),
      content: achDataByKey[
        "justAsPlanned"
        /* JUST_AS_PLANNED */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "justAsPlanned"
          /* JUST_AS_PLANNED */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            i18n2._pt("Achievements badge", "%1 ippatsu", [item.count || "0"])
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "carefulPlanning",
      image: carefulPlanning,
      label: i18n2._t("Careful planning"),
      description: i18n2._t(
        "Given for the smallest average cost of opponents hand that player has dealt."
      ),
      content: achDataByKey[
        "carefulPlanning"
        /* CAREFUL_PLANNING */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "carefulPlanning"
          /* CAREFUL_PLANNING */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            i18n2._pt("Achievements badge", "%1 points", [item.score || "0"])
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "doraLord",
      image: doraLord,
      label: i18n2._t("Dora lord"),
      description: i18n2._t("Given for the largest average count of dora in player's hand."),
      content: achDataByKey[
        "doraLord"
        /* DORA_LORD */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "doraLord"
          /* DORA_LORD */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            i18n2._npt("Achievements badge", ["%1 dora", "%1 dora"], Math.floor(item.count), [
              item.count || "0"
            ])
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "catchEmAll",
      image: catchEmAll,
      label: i18n2._t("Gotta Catch'Em All"),
      description: i18n2._t(
        "Given for the largest amount of unique yaku collected during the tournament."
      ),
      content: achDataByKey[
        "catchEmAll"
        /* CATCH_EM_ALL */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "catchEmAll"
          /* CATCH_EM_ALL */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            i18n2._pt("Achievements badge", "%1 yaku", [item.count || "0"])
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "favoriteAsapinApprentice",
      image: favoriteAsapinApprentice,
      label: i18n2._t("The favorite apprentice of ASAPIN"),
      description: i18n2._t(
        "Given for the largest amount of points received as ryuukyoku (draw) payments."
      ),
      content: achDataByKey[
        "favoriteAsapinApprentice"
        /* FAVORITE_ASAPIN_APPRENTICE */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "favoriteAsapinApprentice"
          /* FAVORITE_ASAPIN_APPRENTICE */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            i18n2._pt("Achievements badge", "%1 points", [item.score || "0"])
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "andYourRiichiBet",
      image: andYourRiichiBet,
      label: i18n2._t("And your riichi bet, please"),
      description: i18n2._t(
        "Given for collecting the largest amount of other players' riichi bets during the tournament."
      ),
      content: achDataByKey[
        "andYourRiichiBet"
        /* AND_YOUR_RIICHI_BET */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "andYourRiichiBet"
          /* AND_YOUR_RIICHI_BET */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            i18n2._npt(
              "Achievements badge",
              ["%1 riichi bet", "%1 riichi bets"],
              item.count,
              [item.count || "0"]
            )
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "covetousKnight",
      image: covetousKnight,
      label: i18n2._t("The Covetous Knight"),
      description: i18n2._t("Given for losing the smallest number of riichi bets."),
      content: achDataByKey[
        "covetousKnight"
        /* COVETOUS_KNIGHT */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "covetousKnight"
          /* COVETOUS_KNIGHT */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            i18n2._npt(
              "Achievements badge",
              ["%1 riichi bet", "%1 riichi bets"],
              item.count,
              [item.count || "0"]
            )
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "ninja",
      image: ninja,
      label: i18n2._t("Ninja"),
      description: i18n2._t("Given for winning the largest number of hands with damaten."),
      content: achDataByKey[
        "ninja"
        /* NINJA */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "ninja"
          /* NINJA */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.name }),
            ":",
            " ",
            i18n2._npt("Achievements badge", ["%1 win", "%1 wins"], item.count, [
              item.count || "0"
            ])
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    },
    {
      id: "needMoreGold",
      image: needMoreGold,
      label: i18n2._t("We need more gold"),
      description: i18n2._t(
        "Given for having biggest score in the end of the session across the tournament."
      ),
      content: achDataByKey[
        "needMoreGold"
        /* NEED_MORE_GOLD */
      ] ? /* @__PURE__ */ jsxs(Group, { align: "flex-start", position: "apart", pl: 20, children: [
        /* @__PURE__ */ jsx(List, { children: achDataByKey[
          "needMoreGold"
          /* NEED_MORE_GOLD */
        ].map(
          (item, idx) => /* @__PURE__ */ jsxs(List.Item, { children: [
            /* @__PURE__ */ jsx("b", { children: item.title }),
            ":",
            " ",
            i18n2._pt("Achievements badge", "%1 points", [item.score || "0"])
          ] }, `li_${idx}`)
        ) }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            color: "teal",
            pl: 22,
            leftSection: /* @__PURE__ */ jsx(IconAward, { style: { marginTop: "10px" } }),
            variant: "filled",
            size: "xl"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Alert, { color: "yellow", children: i18n2._t("Couldn't get nomination details") })
    }
  ];
  if (((events == null ? void 0 : events.length) ?? 0) > 1) {
    return /* @__PURE__ */ jsx(Container, { children: /* @__PURE__ */ jsx(Alert, { color: "red", children: i18n2._t("Achievements are not available for aggregated events") }) });
  }
  return /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsxs("title", { children: [
      events == null ? void 0 : events[0].title,
      " - ",
      i18n2._t("Achievements"),
      " - Sigrun"
    ] }) }),
    /* @__PURE__ */ jsxs("h2", { style: { display: "flex", gap: "20px" }, children: [
      (events == null ? void 0 : events[0]) && /* @__PURE__ */ jsx(EventTypeIcon, { event: events[0] }),
      (_a = events == null ? void 0 : events[0]) == null ? void 0 : _a.title,
      " - ",
      i18n2._t("Achievements")
    ] }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsx(Accordion, { chevronPosition: "right", variant: "contained", multiple: true, children: ach.map((item, idx) => /* @__PURE__ */ jsxs(Accordion.Item, { value: item.id, children: [
      /* @__PURE__ */ jsx(Accordion.Control, { children: /* @__PURE__ */ jsx(AccordionLabel, { ...item }) }),
      /* @__PURE__ */ jsx(Accordion.Panel, { children: /* @__PURE__ */ jsx(Text, { size: "sm", children: item.content }) })
    ] }, `ach_${idx}`)) })
  ] });
};
function AccordionLabel({ label, image, description }) {
  return /* @__PURE__ */ jsxs(Group, { noWrap: true, children: [
    /* @__PURE__ */ jsx(Avatar, { src: image, radius: "xl", size: "lg" }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Text, { children: label }),
      /* @__PURE__ */ jsx(Text, { size: "sm", color: "dimmed", weight: 400, children: description })
    ] })
  ] });
}
const TabsList = ({ eventType, i18n: i18n2 }) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Tabs.Tab, { value: "ruleset_tuning", icon: /* @__PURE__ */ jsx(IconAdjustments, { size: "0.8rem" }), children: i18n2._t("Ruleset details") }),
    eventType === EventType.EVENT_TYPE_LOCAL && /* @__PURE__ */ jsx(Tabs.Tab, { value: EventType.EVENT_TYPE_LOCAL, icon: /* @__PURE__ */ jsx(IconFriends, { size: "0.8rem" }), children: i18n2._t("Local event settings") }),
    eventType === EventType.EVENT_TYPE_TOURNAMENT && /* @__PURE__ */ jsx(Tabs.Tab, { value: EventType.EVENT_TYPE_TOURNAMENT, icon: /* @__PURE__ */ jsx(IconTournament, { size: "0.8rem" }), children: i18n2._t("Tournament settings") }),
    eventType === EventType.EVENT_TYPE_ONLINE && /* @__PURE__ */ jsx(Tabs.Tab, { value: EventType.EVENT_TYPE_ONLINE, icon: /* @__PURE__ */ jsx(IconNetwork, { size: "0.8rem" }), children: i18n2._t("Online event settings") }),
    /* @__PURE__ */ jsx(Tabs.Tab, { value: "yaku_tuning", icon: /* @__PURE__ */ jsx(IconListCheck, { size: "0.8rem" }), children: i18n2._t("Yaku settings") })
  ] });
};
const OnlineSettings = ({ config, i18n: i18n2 }) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      TextInput,
      {
        icon: /* @__PURE__ */ jsx(IconUsers, { size: "1rem" }),
        label: i18n2._t(
          "Tenhou Lobby ID. Please contact event administrator for proper link to lobby."
        ),
        value: config.lobbyId,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconHourglass, { size: "1rem" }),
        label: i18n2._t("Game expiration time (in hours)"),
        description: i18n2._t(
          "Interval of time when played online game is still considered valid and can be added to the rating."
        ),
        value: config.rulesetConfig.gameExpirationTime,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconCoins, { size: "1rem" }),
        label: i18n2._t("Chips value"),
        description: i18n2._t(
          "Amount of points given for each chip. Chips should be set up in tournament settings in Tenhou.net."
        ),
        value: config.rulesetConfig.chipsValue,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconChartHistogram, { size: "1rem" }),
        label: i18n2._t("Series length"),
        description: i18n2._t("Count of session in game series."),
        value: config.seriesLength,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconNumbers, { size: "1rem" }),
        label: i18n2._t("Minimal games count"),
        description: i18n2._t(
          "Minimal count of games the player should play to get into the rating table."
        ),
        value: config.minGamesCount,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconUserX, { size: "1rem" }),
        label: i18n2._t("Fixed score applied to replacement player"),
        description: i18n2._t(
          "Fixed amount of result score applied for each replacement player regardless of session results."
        ),
        value: config.rulesetConfig.replacementPlayerFixedPoints,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconUserX, { size: "1rem" }),
        label: i18n2._t("Fixed uma for replacement player"),
        description: i18n2._t(
          "Fixed amount of rank penalty applied for each replacement player regardless of session results."
        ),
        value: config.rulesetConfig.replacementPlayerOverrideUma,
        onChange: () => {
        }
      }
    )
  ] });
};
const LocalSettings = ({ config, i18n: i18n2 }) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconChartHistogram, { size: "1rem" }),
        label: i18n2._t("Series length"),
        description: i18n2._t("Count of session in game series."),
        value: config.seriesLength,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconNumbers, { size: "1rem" }),
        label: i18n2._t("Minimal games count"),
        description: i18n2._t(
          "Minimal count of games the player should play to get into the rating table."
        ),
        value: config.minGamesCount,
        onChange: () => {
        }
      }
    )
  ] });
};
const TournamentSettings = ({ config, i18n: i18n2 }) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconClockPlay, { size: "1rem" }),
        label: i18n2._t("Session duration in minutes"),
        description: i18n2._t(
          "Timer starting value. After time runs out, session ending policy is applied (see below)."
        ),
        value: config.gameDuration,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsxs(
      Radio.Group,
      {
        label: i18n2._t("Session ending policy"),
        description: i18n2._t("How game sessions should end during the tournament"),
        value: config.rulesetConfig.endingPolicy,
        onChange: () => {
        },
        children: [
          /* @__PURE__ */ jsx(Space, { h: "md" }),
          /* @__PURE__ */ jsxs(Stack, { spacing: "xs", children: [
            /* @__PURE__ */ jsx(
              Radio,
              {
                value: EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED,
                label: i18n2._t("Do not interrupt session until it ends")
              }
            ),
            /* @__PURE__ */ jsx(
              Radio,
              {
                value: EndingPolicy.ENDING_POLICY_EP_END_AFTER_HAND,
                label: i18n2._t("When time is out, finish current hand and interrupt the session")
              }
            ),
            /* @__PURE__ */ jsx(
              Radio,
              {
                value: EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND,
                label: i18n2._t(
                  "When time is out, finish current hand, play one more, and then interrup the session"
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Space, { h: "md" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(Checkbox, { label: i18n2._t("Team tournament"), checked: config.isTeam, onChange: () => {
    } }),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Seating is defined in advance"),
        description: i18n2._t(
          "You should prepare the tournament script yourself. No automated seating functionality is available when this flag is set."
        ),
        checked: config.isPrescripted,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconUserX, { size: "1rem" }),
        label: i18n2._t("Fixed score applied to replacement player"),
        description: i18n2._t(
          "Fixed amount of result score applied for each replacement player regardless of session results."
        ),
        value: config.rulesetConfig.replacementPlayerFixedPoints,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconUserX, { size: "1rem" }),
        label: i18n2._t("Fixed uma for replacement player"),
        description: i18n2._t(
          "Fixed amount of rank penalty applied for each replacement player regardless of session results."
        ),
        value: config.rulesetConfig.replacementPlayerOverrideUma,
        onChange: () => {
        }
      }
    )
  ] });
};
const UmaSelect = ({ config, i18n: i18n2 }) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Radio.Group,
      {
        label: i18n2._t("Uma bonus type"),
        value: config.rulesetConfig.umaType,
        onChange: () => {
        },
        children: /* @__PURE__ */ jsxs(Group, { mt: "xs", children: [
          /* @__PURE__ */ jsx(Radio, { value: UmaType.UMA_TYPE_UMA_SIMPLE, label: i18n2._t("Simple rank-based") }),
          /* @__PURE__ */ jsx(Radio, { value: UmaType.UMA_TYPE_UMA_COMPLEX, label: i18n2._t("Complex position-based") })
        ] })
      }
    ),
    config.rulesetConfig.umaType === UmaType.UMA_TYPE_UMA_SIMPLE && /* @__PURE__ */ jsxs(SimpleGrid, { cols: 2, children: [
      /* @__PURE__ */ jsx(
        NumberInput,
        {
          hideControls: true,
          label: i18n2._t("Uma bonus for 1st place"),
          value: config.rulesetConfig.uma.place1,
          onChange: () => {
          }
        }
      ),
      /* @__PURE__ */ jsx(
        NumberInput,
        {
          hideControls: true,
          label: i18n2._t("Uma bonus for 2nd place"),
          value: config.rulesetConfig.uma.place2,
          onChange: () => {
          }
        }
      ),
      /* @__PURE__ */ jsx(
        NumberInput,
        {
          hideControls: true,
          label: i18n2._t("Uma penalty for 3rd place"),
          value: config.rulesetConfig.uma.place3,
          onChange: () => {
          }
        }
      ),
      /* @__PURE__ */ jsx(
        NumberInput,
        {
          hideControls: true,
          label: i18n2._t("Uma penalty for 4th place"),
          value: config.rulesetConfig.uma.place4,
          onChange: () => {
          }
        }
      )
    ] }),
    config.rulesetConfig.umaType === UmaType.UMA_TYPE_UMA_COMPLEX && /* @__PURE__ */ jsxs(Group, { align: "flex-end", children: [
      /* @__PURE__ */ jsxs(Stack, { w: "20%", children: [
        /* @__PURE__ */ jsx(Center, { children: i18n2._t("Place / Session result") }),
        /* @__PURE__ */ jsx(Text, { h: "34px", align: "right", children: i18n2._t("1st") }),
        /* @__PURE__ */ jsx(Text, { h: "34px", align: "right", children: i18n2._t("2nd") }),
        /* @__PURE__ */ jsx(Text, { h: "34px", align: "right", children: i18n2._t("3rd") }),
        /* @__PURE__ */ jsx(Text, { h: "34px", align: "right", children: i18n2._t("4th") })
      ] }),
      /* @__PURE__ */ jsxs(Stack, { w: "21%", children: [
        /* @__PURE__ */ jsx(Center, { children: /* @__PURE__ */ jsx(Text, { children: i18n2._t("3 players with score less than starting") }) }),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.neg3.place1,
            onChange: () => {
            }
          }
        ),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.neg3.place2,
            onChange: () => {
            }
          }
        ),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.neg3.place3,
            onChange: () => {
            }
          }
        ),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.neg3.place4,
            onChange: () => {
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Stack, { w: "21%", children: [
        /* @__PURE__ */ jsx(Center, { children: /* @__PURE__ */ jsx(Text, { children: i18n2._t("1 player with score less than starting") }) }),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.neg1.place1,
            onChange: () => {
            }
          }
        ),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.neg1.place2,
            onChange: () => {
            }
          }
        ),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.neg1.place3,
            onChange: () => {
            }
          }
        ),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.neg1.place4,
            onChange: () => {
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Stack, { w: "21%", children: [
        /* @__PURE__ */ jsx(Text, { children: i18n2._t("Otherwise") }),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.otherwise.place1,
            onChange: () => {
            }
          }
        ),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.otherwise.place2,
            onChange: () => {
            }
          }
        ),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.otherwise.place3,
            onChange: () => {
            }
          }
        ),
        /* @__PURE__ */ jsx(
          NumberInput,
          {
            hideControls: true,
            value: config.rulesetConfig.complexUma.otherwise.place4,
            onChange: () => {
            }
          }
        )
      ] })
    ] })
  ] });
};
const RulesetSettings = ({ config, i18n: i18n2 }) => {
  return /* @__PURE__ */ jsxs(Stack, { children: [
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconArrowBadgeDownFilled, { size: "1rem" }),
        label: i18n2._t("Initial rating"),
        description: i18n2._t("Score given to all players in the beginning of the rating"),
        value: config.rulesetConfig.startRating,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconCash, { size: "1rem" }),
        label: i18n2._t("Initial points"),
        description: i18n2._t(
          "Amount of points given to every player in the beginning of every session"
        ),
        value: config.rulesetConfig.startPoints,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(Title, { order: 4, children: i18n2._t("Game duration") }),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Tonpuusen"),
        description: i18n2._t("Play only east rounds"),
        checked: config.rulesetConfig.tonpuusen,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Agariyame"),
        description: i18n2._t(
          "If the dealer holds the 1st place after last hand in session, the game ends regardless of his winning hand or tempai."
        ),
        checked: config.rulesetConfig.withLeadingDealerGameOver,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Disable renchans"),
        description: i18n2._t(
          "When dealer wins, or stays tempai after draw, seat winds will be changed. Honba is added only after draw."
        ),
        checked: config.rulesetConfig.withWinningDealerHonbaSkipped,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Allow bankruptcy"),
        description: i18n2._t("When a player runs out of score points, the game immediately ends"),
        checked: config.rulesetConfig.withButtobi,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Play additional rounds"),
        description: i18n2._t(
          "If nobody reaches the goal score at the last hand, the game continues to west rounds (in hanchan) or to south rounds (in tonpuusen), until someone reaches the goal"
        ),
        checked: config.rulesetConfig.playAdditionalRounds,
        onChange: () => {
        }
      }
    ),
    config.rulesetConfig.playAdditionalRounds && /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconTargetArrow, { size: "1rem" }),
        label: i18n2._t("Goal score"),
        description: i18n2._t("Amount of score player should get to end the game."),
        value: config.rulesetConfig.goalPoints,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(Title, { order: 4, children: i18n2._t("Round outcomes") }),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Atamahane"),
        description: i18n2._t(
          "Only first player by the order of the move from the loser would be considered a winner. If not checked, all players declaring Ron are considered winners."
        ),
        checked: config.rulesetConfig.withAtamahane,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Allow abortive draws"),
        description: i18n2._t(
          'There will be a separate "Abortive draw" outcome to record draws due to four riichi, four kans, suufon renda, kyuushu kyuuhai, etc.'
        ),
        checked: config.rulesetConfig.withAbortives,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Nagashi mangan"),
        description: i18n2._t('Enable "Nagashi" outcome to record this special draw'),
        checked: config.rulesetConfig.withNagashiMangan,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(Title, { order: 4, children: i18n2._t("Riichi and honba") }),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Riichi goes to winner"),
        description: i18n2._t(
          "Riichi left on table in case of draw in the end of the session will be given to session winner"
        ),
        checked: config.rulesetConfig.riichiGoesToWinner,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Pay for honba by atamahane"),
        description: i18n2._t(
          "Honba payments will be given only to the first winner. If not checked, payment will be given to all winners."
        ),
        checked: config.rulesetConfig.doubleronHonbaAtamahane,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Collect riichi bets by atamahane"),
        description: i18n2._t(
          "All riichi bets on the table will be given to the first winner. If not checked, winning riichi bets will always be given back, lost bets would be given to the first winner."
        ),
        checked: config.rulesetConfig.doubleronRiichiAtamahane,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(Title, { order: 4, children: i18n2._t("Payments and scores") }),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Kazoe yakuman"),
        description: i18n2._t("13+ han hands are considered yakuman, not sanbaiman."),
        checked: config.rulesetConfig.withKazoe,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Kiriage mangan"),
        description: i18n2._t("Hands valued as 4/30 and 3/60 are rounded to mangan."),
        checked: config.rulesetConfig.withKiriageMangan,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconMountain, { size: "1rem" }),
        label: i18n2._t("Oka bonus"),
        description: i18n2._t("Amount of points given to player at 1st place"),
        value: config.rulesetConfig.oka,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(UmaSelect, { config, i18n: i18n2 }),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Equalize uma"),
        description: i18n2._t(
          "If checked, players with equivalent score receive equivalent uma bonus. Otherwise, uma is assigned according to move order."
        ),
        checked: config.rulesetConfig.equalizeUma,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(Title, { order: 4, children: i18n2._t("Penalties") }),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Pay chombo as reverse mangan"),
        description: i18n2._t(
          "Pay chombo right on occasion. If not checked, chombo is subtracted from player score after uma is applied."
        ),
        checked: config.rulesetConfig.extraChomboPayments,
        onChange: () => {
        }
      }
    ),
    !config.rulesetConfig.extraChomboPayments && /* @__PURE__ */ jsx(
      NumberInput,
      {
        hideControls: true,
        icon: /* @__PURE__ */ jsx(IconHandStop, { size: "1rem" }),
        label: i18n2._t("Amount of chombo penalty"),
        description: i18n2._t(
          "Amount of penalty applied in the end of the session after uma bonus."
        ),
        value: config.rulesetConfig.chomboPenalty,
        onChange: () => {
        }
      }
    )
  ] });
};
const YakuSettings = ({ config, i18n: i18n2 }) => {
  return /* @__PURE__ */ jsxs(Stack, { children: [
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Kuitan"),
        description: i18n2._t(
          "Tanyao costs 1 han on open hand. If not checked, tanyao does not work on open hand."
        ),
        checked: config.rulesetConfig.withKuitan,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        label: i18n2._t("Multiple yakumans"),
        description: i18n2._t("Allow combination of yakumans, e.g. tsuuisou + daisangen"),
        checked: config.rulesetConfig.withMultiYakumans,
        onChange: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx(Title, { order: 4, children: i18n2._t("Yaku allowed") }),
    /* @__PURE__ */ jsx(
      SimpleGrid,
      {
        spacing: "lg",
        cols: 3,
        breakpoints: [
          { maxWidth: "48rem", cols: 2 },
          { maxWidth: "36rem", cols: 1 }
        ],
        children: yakuList.map((y, idx) => /* @__PURE__ */ jsx(
          Checkbox,
          {
            label: y.name(i18n2),
            checked: config.rulesetConfig.allowedYaku.includes(y.id),
            onChange: () => {
            }
          },
          `yaku_${idx}`
        ))
      }
    ),
    /* @__PURE__ */ jsx(Title, { order: 4, children: i18n2._t("Pao rule enabled for:") }),
    /* @__PURE__ */ jsx(
      SimpleGrid,
      {
        spacing: "lg",
        cols: 3,
        breakpoints: [
          { maxWidth: "48rem", cols: 2 },
          { maxWidth: "36rem", cols: 1 }
        ],
        children: yakuWithPao.map((y, idx) => /* @__PURE__ */ jsx(
          Checkbox,
          {
            label: y.name(i18n2),
            checked: config.rulesetConfig.yakuWithPao.includes(y.id),
            onChange: () => {
            }
          },
          `yaku_${idx}`
        ))
      }
    )
  ] });
};
const EventRulesOverview = ({
  params: { eventId }
}) => {
  var _a;
  const api2 = useApi();
  const i18n2 = useI18n();
  const events = useEvent(eventId);
  const [ruleset] = useIsomorphicState(
    null,
    "RulesOverview_" + eventId,
    () => api2.getGameConfig(parseInt(eventId, 10)),
    [eventId]
  );
  if (!events || !ruleset) {
    return null;
  }
  if (((events == null ? void 0 : events.length) ?? 0) > 1) {
    return /* @__PURE__ */ jsx(Container, { children: /* @__PURE__ */ jsx(Alert, { color: "red", children: i18n2._t("Ruleset details page is not available for aggregated events") }) });
  }
  const event = events[0];
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsxs("title", { children: [
      events == null ? void 0 : events[0].title,
      " - ",
      i18n2._t("Rules overview"),
      " - Sigrun"
    ] }) }),
    /* @__PURE__ */ jsxs("h2", { style: { display: "flex", gap: "20px" }, children: [
      (events == null ? void 0 : events[0]) && /* @__PURE__ */ jsx(EventTypeIcon, { event: events[0] }),
      (_a = events == null ? void 0 : events[0]) == null ? void 0 : _a.title,
      " - ",
      i18n2._t("Rules overview")
    ] }),
    /* @__PURE__ */ jsx(Divider, { size: "xs" }),
    /* @__PURE__ */ jsx(Space, { h: "md" }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "ruleset_tuning", children: [
      /* @__PURE__ */ jsx(Tabs.List, { position: "left", children: /* @__PURE__ */ jsx(TabsList, { i18n: i18n2, eventType: event.type }) }),
      /* @__PURE__ */ jsx(Tabs.Panel, { value: "ruleset_tuning", pt: "xs", children: /* @__PURE__ */ jsx(RulesetSettings, { config: ruleset, i18n: i18n2 }) }),
      /* @__PURE__ */ jsx(Tabs.Panel, { value: event.type ?? EventType.EVENT_TYPE_LOCAL, pt: "xs", children: /* @__PURE__ */ jsxs(Stack, { children: [
        event.type === EventType.EVENT_TYPE_ONLINE && /* @__PURE__ */ jsx(OnlineSettings, { config: ruleset, i18n: i18n2 }),
        event.type === EventType.EVENT_TYPE_LOCAL && /* @__PURE__ */ jsx(LocalSettings, { config: ruleset, i18n: i18n2 }),
        event.type === EventType.EVENT_TYPE_TOURNAMENT && /* @__PURE__ */ jsx(TournamentSettings, { config: ruleset, i18n: i18n2 })
      ] }) }),
      /* @__PURE__ */ jsx(Tabs.Panel, { value: "yaku_tuning", pt: "xs", children: /* @__PURE__ */ jsx(YakuSettings, { config: ruleset, i18n: i18n2 }) })
    ] })
  ] }) });
};
const App$1 = "";
function App() {
  return /* @__PURE__ */ jsxs(Switch, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/", component: EventList }),
    /* @__PURE__ */ jsx(Route, { path: "/page/:page", component: EventList }),
    /* @__PURE__ */ jsx(Route, { path: "/event/:eventId/info", component: EventInfo }),
    /* @__PURE__ */ jsx(Route, { path: "/event/:eventId/order/:orderBy", component: RatingTable }),
    /* @__PURE__ */ jsx(Route, { path: "/event/:eventId/player/:playerId", component: PlayerStats }),
    /* @__PURE__ */ jsx(Route, { path: "/event/:eventId/games", component: RecentGames }),
    /* @__PURE__ */ jsx(Route, { path: "/event/:eventId/games/page/:page", component: RecentGames }),
    /* @__PURE__ */ jsx(Route, { path: "/event/:eventId/game/:sessionHash", component: Game }),
    /* @__PURE__ */ jsx(Route, { path: "/event/:eventId/seriesRating", component: SeriesRating }),
    /* @__PURE__ */ jsx(Route, { path: "/event/:eventId/timer", component: Timer }),
    /* @__PURE__ */ jsx(Route, { path: "/event/:eventId/achievements", component: Achievements }),
    /* @__PURE__ */ jsx(Route, { path: "/event/:eventId/rules", component: EventRulesOverview })
  ] });
}
class StorageStrategyServer {
  constructor() {
    __publicField(this, "_cookies", {});
    __publicField(this, "_cookiesAdd", {});
    __publicField(this, "_cookiesRemove", []);
  }
  fill(cookies) {
    this._cookies = cookies;
  }
  getCookies() {
    return {
      add: this._cookiesAdd,
      remove: this._cookiesRemove
    };
  }
  get(key, type) {
    if (this._cookies[key] === void 0) {
      return null;
    }
    return type === "int" ? parseInt(this._cookies[key], 10) : this._cookies[key].toString();
  }
  set(key, type, value) {
    this._cookies[key] = value;
    this._cookiesAdd[key] = value;
  }
  delete(key) {
    this._cookiesRemove.push(key);
    delete this._cookies[key];
  }
  clear() {
    this._cookiesRemove = Object.keys(this._cookies);
    this._cookies = {};
  }
}
const MenuItemLink = ({
  href,
  icon,
  title,
  text
}) => {
  const [, navigate] = useLocation();
  return /* @__PURE__ */ jsx(
    Menu.Item,
    {
      component: "a",
      href,
      onClick: (e) => {
        navigate(href);
        e.preventDefault();
      },
      icon,
      title: title ?? text,
      children: text
    }
  );
};
const HEADER_HEIGHT = rem(60);
const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({
      variant: "filled",
      color: theme.primaryColor
    }).background,
    borderBottom: 0,
    zIndex: 1e4
  },
  inner: {
    height: rem(56),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  link: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color: theme.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    "&:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor }).background,
        0.1
      )
    }
  },
  linkLabel: {
    marginRight: rem(5)
  },
  dropdown: {
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: "hidden",
    [theme.fn.largerThan("sm")]: {
      display: "none"
    }
  }
}));
function AppHeader() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const { classes } = useStyles();
  const i18n2 = useI18n();
  const largeScreen = useMediaQuery("(min-width: 768px)");
  const [, navigate] = useLocation();
  const theme = useMantineTheme();
  const globals2 = useContext(globalsCtx);
  const [onlineModalOpened, { open: openOnlineModal, close: closeOnlineModal }] = useDisclosure(false);
  const [onlineLink, setOnlineLink] = useState("");
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState(null);
  const api2 = useApi();
  const tryAddOnline = () => {
    var _a2, _b2;
    if (!onlineLink.match(/^https?:\/\/[^\/]+\/0\/\?log=\d+gm-\d+-\d+-[0-9a-f]+$/i)) {
      setOnlineError(i18n2._t("Replay link is invalid. Please check if you copied it correctly"));
    } else {
      setOnlineError(null);
      setOnlineLoading(true);
      if ((_a2 = globals2.data.eventId) == null ? void 0 : _a2[0]) {
        api2.addOnlineGame((_b2 = globals2.data.eventId) == null ? void 0 : _b2[0], onlineLink).then(() => {
          setOnlineLoading(false);
          window.location.href = `/event/${globals2.data.eventId}/games`;
        }).catch((e) => {
          setOnlineLoading(false);
          setOnlineError(e.message);
        });
      }
    }
  };
  return /* @__PURE__ */ jsx(Header, { height: HEADER_HEIGHT, className: classes.header, mb: 120, children: /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsxs("div", { className: classes.inner, children: [
      /* @__PURE__ */ jsxs(Group, { children: [
        /* @__PURE__ */ jsx(
          Anchor,
          {
            href: `/`,
            onClick: (e) => {
              navigate(`/`);
              e.preventDefault();
            },
            children: largeScreen ? /* @__PURE__ */ jsx(
              Button,
              {
                className: classes.link,
                leftIcon: /* @__PURE__ */ jsx(IconList, { size: 20 }),
                title: i18n2._t("To events list"),
                children: i18n2._t("Events list")
              }
            ) : /* @__PURE__ */ jsx(
              ActionIcon,
              {
                title: i18n2._t("To events list"),
                variant: "filled",
                color: "green",
                size: "lg",
                children: /* @__PURE__ */ jsx(IconList, { size: "1.5rem" })
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(Anchor, { href: "https://manage.riichimahjong.org", target: "_blank", children: largeScreen ? /* @__PURE__ */ jsx(
          Button,
          {
            className: classes.link,
            leftIcon: /* @__PURE__ */ jsx(IconAdjustmentsAlt, { size: 20 }),
            title: i18n2._t("Profile & admin panel"),
            children: i18n2._t("Profile & admin panel")
          }
        ) : /* @__PURE__ */ jsx(
          ActionIcon,
          {
            title: i18n2._t("Profile & admin panel"),
            variant: "filled",
            color: "grape",
            size: "lg",
            children: /* @__PURE__ */ jsx(IconAdjustmentsAlt, { size: "1.5rem" })
          }
        ) }),
        ((_a = globals2.data.eventId) == null ? void 0 : _a.length) === 1 && /* @__PURE__ */ jsx(Anchor, { href: "https://assist.riichimahjong.org", target: "_blank", children: largeScreen ? /* @__PURE__ */ jsx(
          Button,
          {
            className: classes.link,
            leftIcon: /* @__PURE__ */ jsx(IconDeviceMobileShare, { size: 20 }),
            title: i18n2._t("Open assistant"),
            children: i18n2._t("Open assistant")
          }
        ) : /* @__PURE__ */ jsx(
          ActionIcon,
          {
            title: i18n2._t("Open assistant"),
            variant: "filled",
            color: "orange",
            size: "lg",
            children: /* @__PURE__ */ jsx(IconDeviceMobileShare, { size: "1.5rem" })
          }
        ) })
      ] }),
      globals2.data.eventId && /* @__PURE__ */ jsx(Group, { spacing: 5, children: /* @__PURE__ */ jsxs(Menu, { shadow: "md", children: [
        /* @__PURE__ */ jsx(Menu.Target, { children: /* @__PURE__ */ jsx(
          Button,
          {
            className: classes.link,
            leftIcon: /* @__PURE__ */ jsx(IconChevronDown, { size: 20 }),
            title: i18n2._t("Event contents"),
            children: i18n2._t("Event contents")
          }
        ) }),
        /* @__PURE__ */ jsxs(Menu.Dropdown, { children: [
          /* @__PURE__ */ jsx(
            MenuItemLink,
            {
              href: `/event/${(_b = globals2.data.eventId) == null ? void 0 : _b.join(".")}/info`,
              icon: /* @__PURE__ */ jsx(IconNotes, { size: 24 }),
              text: i18n2._pt("Event menu", "Description")
            }
          ),
          /* @__PURE__ */ jsx(
            MenuItemLink,
            {
              href: `/event/${(_c = globals2.data.eventId) == null ? void 0 : _c.join(".")}/rules`,
              icon: /* @__PURE__ */ jsx(IconListCheck, { size: 24 }),
              text: i18n2._pt("Event menu", "Rules overview")
            }
          ),
          /* @__PURE__ */ jsx(
            MenuItemLink,
            {
              href: `/event/${(_d = globals2.data.eventId) == null ? void 0 : _d.join(".")}/games`,
              icon: /* @__PURE__ */ jsx(IconOlympics, { size: 24 }),
              text: i18n2._pt("Event menu", "Recent games")
            }
          ),
          /* @__PURE__ */ jsx(
            MenuItemLink,
            {
              href: `/event/${(_e = globals2.data.eventId) == null ? void 0 : _e.join(".")}/order/rating`,
              icon: /* @__PURE__ */ jsx(IconChartBar, { size: 24 }),
              text: i18n2._pt("Event menu", "Rating table")
            }
          ),
          ((_f = globals2.data.eventId) == null ? void 0 : _f.length) === 1 && /* @__PURE__ */ jsx(
            MenuItemLink,
            {
              href: `/event/${(_g = globals2.data.eventId) == null ? void 0 : _g.join(".")}/achievements`,
              icon: /* @__PURE__ */ jsx(IconAward, { size: 24 }),
              text: i18n2._pt("Event menu", "Achievements")
            }
          ),
          globals2.data.hasSeries && ((_h = globals2.data.eventId) == null ? void 0 : _h.length) === 1 && /* @__PURE__ */ jsx(
            MenuItemLink,
            {
              href: `/event/${(_i = globals2.data.eventId) == null ? void 0 : _i.join(".")}/seriesRating`,
              icon: /* @__PURE__ */ jsx(IconChartLine, { size: 24 }),
              text: i18n2._pt("Event menu", "Series rating")
            }
          ),
          globals2.data.type === EventType.EVENT_TYPE_TOURNAMENT && ((_j = globals2.data.eventId) == null ? void 0 : _j.length) === 1 && /* @__PURE__ */ jsx(
            MenuItemLink,
            {
              href: `/event/${(_k = globals2.data.eventId) == null ? void 0 : _k.join(".")}/timer`,
              icon: /* @__PURE__ */ jsx(IconAlarm, { size: 24 }),
              text: i18n2._pt("Event menu", "Timer & seating")
            }
          ),
          globals2.data.type === EventType.EVENT_TYPE_ONLINE && ((_l = globals2.data.eventId) == null ? void 0 : _l.length) === 1 && /* @__PURE__ */ jsx(
            Menu.Item,
            {
              onClick: (e) => {
                openOnlineModal();
                e.preventDefault();
              },
              icon: /* @__PURE__ */ jsx(IconNetwork, { size: 24 }),
              children: i18n2._pt("Event menu", "Add online game")
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        opened: onlineModalOpened,
        onClose: closeOnlineModal,
        overlayProps: {
          color: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[2],
          opacity: 0.55,
          blur: 3
        },
        title: i18n2._t("Add online game"),
        centered: true,
        children: [
          /* @__PURE__ */ jsx(LoadingOverlay, { visible: onlineLoading }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              placeholder: "http://tenhou.net/0/?log=XXXXXXXXXXgm-XXXX-XXXXX-XXXXXXXX",
              label: "Enter replay URL",
              error: onlineError,
              value: onlineLink,
              onChange: (event) => setOnlineLink(event.currentTarget.value),
              withAsterisk: true
            }
          ),
          /* @__PURE__ */ jsx(Space, { h: "md" }),
          /* @__PURE__ */ jsx(Group, { position: "right", children: /* @__PURE__ */ jsx(Button, { onClick: tryAddOnline, children: i18n2._t("Add replay") }) })
        ]
      }
    )
  ] }) });
}
const FlagRu = ({ width }) => /* @__PURE__ */ jsxs(
  "svg",
  {
    style: { enableBackground: "new 0 0 512 512", width: `${width}px` },
    version: "1.1",
    viewBox: "0 0 512 512",
    children: [
      /* @__PURE__ */ jsx("rect", { height: "298.7", width: "512", y: "106.7", fill: "#FFF" }),
      /* @__PURE__ */ jsx("rect", { height: "199.1", width: "512", y: "206.2", fill: "#594BB4" }),
      /* @__PURE__ */ jsx("rect", { height: "99.5", width: "512", y: "305.8", fill: "#C42127" })
    ]
  }
);
const FlagEn = ({ width }) => /* @__PURE__ */ jsxs(
  "svg",
  {
    style: { enableBackground: "new 0 0 512 512", width: `${width}px` },
    version: "1.1",
    viewBox: "0 0 512 512",
    children: [
      /* @__PURE__ */ jsx("rect", { height: "298.7", width: "512", y: "106.7", fill: "#FFF" }),
      /* @__PURE__ */ jsx("polygon", { points: "342.8,214.7 512,119.9 512,106.7 500.3,106.7 307.4,214.7", fill: "#BD0034" }),
      /* @__PURE__ */ jsx("polygon", { points: "334.8,303.4 512,402.5 512,382.7 370.2,303.4", fill: "#BD0034" }),
      /* @__PURE__ */ jsx("polygon", { points: "0,129.4 151.5,214.7 187,214.7 0,109.5", fill: "#BD0034" }),
      /* @__PURE__ */ jsx("polygon", { points: "178.9,303.4 0,403.6 0,405.4 32.3,405.4 214.4,303.4", fill: "#BD0034" }),
      /* @__PURE__ */ jsx("polygon", { points: "477,106.7 297.7,106.7 297.7,207.1", fill: "#1A237B" }),
      /* @__PURE__ */ jsx("polygon", { points: "218.5,106.7 40,106.7 218.5,207.1", fill: "#1A237B" }),
      /* @__PURE__ */ jsx("polygon", { points: "512,214.7 512,146.1 390.4,214.7", fill: "#1A237B" }),
      /* @__PURE__ */ jsx("polygon", { points: "512,371.1 512,303.4 390.4,303.4", fill: "#1A237B" }),
      /* @__PURE__ */ jsx("polygon", { points: "50.1,405.4 218.5,405.4 218.5,310.9", fill: "#1A237B" }),
      /* @__PURE__ */ jsx("polygon", { points: "297.7,405.4 466.6,405.4 297.7,310.9", fill: "#1A237B" }),
      /* @__PURE__ */ jsx("polygon", { points: "0,303.4 0,374.2 125.8,303.4", fill: "#1A237B" }),
      /* @__PURE__ */ jsx("polygon", { points: "0,214.7 125.8,214.7 0,143.7", fill: "#1A237B" }),
      /* @__PURE__ */ jsx(
        "polygon",
        {
          points: "234.4,106.7 234.4,232.4 0,232.4 0,285.6 234.4,285.6 234.4,405.4 281.9,405.4 281.9,285.6 512,285.6 512,232.4 281.9,232.4 281.9,106.7",
          fill: "#BD0034"
        }
      )
    ]
  }
);
function AppFooter({ dark, toggleColorScheme, saveLang }) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const i18n2 = useI18n();
  const largeScreen = useMediaQuery("(min-width: 640px)");
  const globals2 = useContext(globalsCtx);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Container, { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(Group, { position: "apart", children: [
    /* @__PURE__ */ jsx(
      ActionIcon,
      {
        variant: "filled",
        color: "blue",
        onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        title: i18n2._t("Back to top"),
        mt: 0,
        children: /* @__PURE__ */ jsx(IconArrowBarToUp, { size: "1.1rem" })
      }
    ),
    /* @__PURE__ */ jsxs(Group, { style: { display: largeScreen ? "inherit" : "none" }, align: "flex-start", children: [
      globals2.data.eventId && /* @__PURE__ */ jsxs(Stack, { spacing: 0, children: [
        /* @__PURE__ */ jsx(
          Anchor,
          {
            color: "white",
            size: "xs",
            href: `/event/${(_a = globals2.data.eventId) == null ? void 0 : _a.join(".")}/info`,
            children: i18n2._t("Description")
          }
        ),
        ((_b = globals2.data.eventId) == null ? void 0 : _b.length) === 1 && /* @__PURE__ */ jsx(
          Anchor,
          {
            color: "white",
            size: "xs",
            href: `/event/${(_c = globals2.data.eventId) == null ? void 0 : _c.join(".")}/rules`,
            children: i18n2._t("Rules overview")
          }
        )
      ] }),
      globals2.data.eventId && /* @__PURE__ */ jsxs(Stack, { spacing: 0, children: [
        /* @__PURE__ */ jsx(
          Anchor,
          {
            color: "white",
            size: "xs",
            href: `/event/${(_d = globals2.data.eventId) == null ? void 0 : _d.join(".")}/games`,
            children: i18n2._t("Recent games")
          }
        ),
        /* @__PURE__ */ jsx(
          Anchor,
          {
            color: "white",
            size: "xs",
            href: `/event/${(_e = globals2.data.eventId) == null ? void 0 : _e.join(".")}/order/rating`,
            children: i18n2._t("Rating table")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Stack, { spacing: 0, children: [
        ((_f = globals2.data.eventId) == null ? void 0 : _f.length) === 1 && /* @__PURE__ */ jsx(
          Anchor,
          {
            color: "white",
            size: "xs",
            href: `/event/${globals2.data.eventId.join(".")}/achievements`,
            children: i18n2._t("Achievements")
          }
        ),
        globals2.data.hasSeries && ((_g = globals2.data.eventId) == null ? void 0 : _g.length) === 1 && /* @__PURE__ */ jsx(
          Anchor,
          {
            color: "white",
            size: "xs",
            href: `/event/${globals2.data.eventId.join(".")}/seriesRating`,
            children: i18n2._t("Series rating")
          }
        )
      ] }),
      /* @__PURE__ */ jsx(Stack, { spacing: 0, children: globals2.data.type === EventType.EVENT_TYPE_TOURNAMENT && ((_h = globals2.data.eventId) == null ? void 0 : _h.length) === 1 && /* @__PURE__ */ jsx(
        Anchor,
        {
          color: "white",
          size: "xs",
          href: `/event/${globals2.data.eventId.join(".")}/timer`,
          children: i18n2._t("Timer & seating")
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs(Group, { position: "right", mt: 0, children: [
      /* @__PURE__ */ jsx(
        ActionIcon,
        {
          variant: "filled",
          color: dark ? "grape" : "indigo",
          onClick: () => toggleColorScheme(),
          title: i18n2._t("Toggle color scheme"),
          children: dark ? /* @__PURE__ */ jsx(IconSun, { size: "1.1rem" }) : /* @__PURE__ */ jsx(IconMoonStars, { size: "1.1rem" })
        }
      ),
      /* @__PURE__ */ jsxs(Menu, { shadow: "md", width: 200, children: [
        /* @__PURE__ */ jsx(Menu.Target, { children: /* @__PURE__ */ jsx(ActionIcon, { color: "green", variant: "filled", title: i18n2._t("Language"), children: /* @__PURE__ */ jsx(IconLanguageHiragana, { size: "1.1rem" }) }) }),
        /* @__PURE__ */ jsxs(Menu.Dropdown, { children: [
          /* @__PURE__ */ jsx(Menu.Item, { onClick: () => saveLang("en"), icon: /* @__PURE__ */ jsx(FlagEn, { width: 24 }), children: "en" }),
          /* @__PURE__ */ jsx(Menu.Item, { onClick: () => saveLang("ru"), icon: /* @__PURE__ */ jsx(FlagRu, { width: 24 }), children: "ru" })
        ] })
      ] })
    ] })
  ] }) }) });
}
const favicon = "/assets/favicon-8834d590.png";
const themeToLocal = (theme) => {
  return {
    day: "light",
    night: "dark"
  }[theme ?? "day"] ?? "light";
};
const themeFromLocal = (theme) => {
  return {
    light: "day",
    dark: "night"
  }[theme ?? "light"] ?? "day";
};
function Layout({ children, cache: cache2 }) {
  const storage2 = useStorage();
  const i18n2 = useI18n();
  const [colorScheme, setColorScheme] = useState(themeToLocal(storage2.getTheme()));
  const analytics2 = useAnalytics();
  useEffect(() => {
    const track = (e) => {
      var _a, _b;
      analytics2.trackView((_b = (_a = e == null ? void 0 : e.currentTarget) == null ? void 0 : _a.location) == null ? void 0 : _b.pathname);
    };
    window.addEventListener("popstate", track);
    window.addEventListener("pushState", track);
    window.addEventListener("replaceState", track);
  }, []);
  const toggleColorScheme = (value) => {
    const newValue = value ?? (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(newValue);
    storage2.setTheme(themeFromLocal(newValue));
  };
  const theme = useMantineTheme();
  const dark = colorScheme === "dark";
  const [data, setDataInt] = useState({
    eventId: null,
    type: null,
    isTeam: false,
    isPrescripted: false,
    loading: false,
    ratingHidden: false,
    hasSeries: false,
    withChips: false
  });
  const setData = (newData) => {
    setDataInt((old) => ({ ...old, ...newData }));
  };
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);
  const saveLang = (lang) => {
    storage2.setLang(lang);
    i18n2.init(
      (locale) => {
        storage2.setLang(locale);
        forceUpdate();
      },
      (err) => console.error(err)
    );
  };
  return /* @__PURE__ */ jsx(
    MantineProvider,
    {
      withGlobalStyles: true,
      withNormalizeCSS: true,
      theme: {
        colorScheme,
        fontFamily: "IBM Plex Sans, Noto Sans Wind, Sans, serif"
      },
      emotionCache: cache2,
      children: /* @__PURE__ */ jsx(ColorSchemeProvider, { colorScheme, toggleColorScheme, children: /* @__PURE__ */ jsx(AnalyticsProvider, { children: /* @__PURE__ */ jsx(globalsCtx.Provider, { value: { data, setData }, children: /* @__PURE__ */ jsx(StorageProvider, { children: /* @__PURE__ */ jsx(I18nProvider, { children: /* @__PURE__ */ jsxs(ApiProvider, { children: [
        /* @__PURE__ */ jsxs(Helmet, { children: [
          /* @__PURE__ */ jsx("title", { children: "Sigrun" }),
          /* @__PURE__ */ jsx("meta", { charSet: "UTF-8" }),
          /* @__PURE__ */ jsx("link", { rel: "icon", type: "image/png", href: favicon }),
          /* @__PURE__ */ jsx(
            "meta",
            {
              name: "viewport",
              content: "width=device-width, initial-scale=1, maximum-scale=1"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(NavigationProgress, { color: "green", zIndex: 10100 }),
        /* @__PURE__ */ jsx(
          AppShell,
          {
            padding: "md",
            header: /* @__PURE__ */ jsx(AppHeader, {}),
            footer: /* @__PURE__ */ jsx(
              Footer,
              {
                height: 60,
                bg: theme.primaryColor,
                style: { position: "static", display: "flex", alignItems: "center" },
                children: /* @__PURE__ */ jsx(
                  AppFooter,
                  {
                    dark,
                    toggleColorScheme,
                    saveLang
                  }
                )
              }
            ),
            styles: {
              main: {
                minHeight: "calc(100vh - var(--mantine-footer-height, 0px))",
                background: dark ? theme.colors.dark[8] : theme.colors.gray[0]
              }
            },
            children
          }
        )
      ] }) }) }) }) }) })
    }
  );
}
const cache = createEmotionCache({ key: "cs", speedy: true, prepend: true });
const stylesServer = createStylesServer(cache);
async function SSRRender(url, cookies) {
  const storageStrategy = new StorageStrategyServer();
  storageStrategy.fill(cookies);
  storage.setStrategy(storageStrategy);
  i18n.init(
    (locale) => {
      storage.setLang(locale);
    },
    (err) => console.error(err)
  );
  const isomorphicCtxValue = { requests: [] };
  const locHook = staticLocationHook(url);
  global.JSDOM = JSDOM;
  ReactDOMServer.renderToString(
    /* @__PURE__ */ jsx(Isomorphic.Provider, { value: isomorphicCtxValue, children: /* @__PURE__ */ jsx(Router, { hook: locHook, children: /* @__PURE__ */ jsx(Layout, { cache, children: /* @__PURE__ */ jsx(App, {}) }) }) })
  );
  if (isomorphicCtxValue.requests) {
    await Promise.all(isomorphicCtxValue.requests);
    delete isomorphicCtxValue.requests;
  }
  const appHtml = ReactDOMServer.renderToString(
    /* @__PURE__ */ jsx(Isomorphic.Provider, { value: isomorphicCtxValue, children: /* @__PURE__ */ jsx(Router, { hook: locHook, children: /* @__PURE__ */ jsx(Layout, { cache, children: /* @__PURE__ */ jsx(App, {}) }) }) })
  );
  const helmet = Helmet.renderStatic();
  return {
    appHtml,
    helmet: [
      helmet.title.toString(),
      helmet.meta.toString(),
      helmet.link.toString(),
      `<style>${stylesServer.extractCritical(appHtml).css}</style>`
    ].join("\n"),
    cookies: storageStrategy.getCookies(),
    serverData: `<script>window.initialData = ${JSON.stringify(isomorphicCtxValue)};<\/script>`
  };
}
export {
  SSRRender,
  YakuId as Y,
  yakuList as a,
  useI18n as u,
  yakuNameMap as y
};
