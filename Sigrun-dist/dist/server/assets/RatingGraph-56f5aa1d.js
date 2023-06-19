import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { useRef, useEffect } from "react";
import { u as useI18n } from "../server.js";
import { useMantineTheme, useMantineColorScheme } from "@mantine/core";
import "react-dom/server";
import "wouter";
import "i18n-dialect";
import "@tabler/icons-react";
import "protoscript";
import "react-remark";
import "strip-markdown";
import "@mantine/nprogress";
import "twirpscript";
import "lodash.debounce";
import "uuid";
import "@mantine/hooks";
import "react-helmet";
import "@foxglove/crc";
import "wouter/static-location";
import "jsdom";
import "@mantine/ssr";
const starSvg = "/assets/star-d428c403.svg";
const LineGraph = React.lazy(() => import("./LineGraph-24cbd5c6.js"));
const RatingGraph = ({
  playerId,
  playerStats,
  onSelectGame,
  lastSelectionX,
  setLastSelectionX,
  lastSelectionHash,
  setLastSelectionHash
}) => {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === "dark";
  const games = playerStats == null ? void 0 : playerStats.scoreHistory;
  const points = ((playerStats == null ? void 0 : playerStats.ratingHistory) ?? []).map((item, idx) => ({
    x: idx,
    y: Math.floor(item)
  }));
  const ticks = [];
  for (let idx = 0; idx < points.length; idx++) {
    ticks.push(idx);
  }
  const gamesIdx = [];
  games == null ? void 0 : games.forEach((g, idx) => gamesIdx.push(idx));
  const chartRef = useRef();
  useEffect(() => {
    var _a;
    const idx = ((_a = playerStats == null ? void 0 : playerStats.scoreHistory) == null ? void 0 : _a.findIndex((v) => v.tables[0].sessionHash === lastSelectionHash)) ?? null;
    if (idx !== null) {
      setLastSelectionX(1 + idx);
    } else {
      setLastSelectionX(null);
    }
  }, [playerId, playerStats]);
  useEffect(() => {
    if (!window.__ratingStarIcon) {
      const ico = new Image();
      ico.src = starSvg;
      ico.height = 20;
      ico.width = 20;
      window.__ratingStarIcon = ico;
      const icoBig = new Image();
      icoBig.src = starSvg;
      icoBig.height = 32;
      icoBig.width = 32;
      window.__ratingStarIconBig = icoBig;
    }
  });
  return /* @__PURE__ */ jsx(
    LineGraph,
    {
      ref: chartRef,
      data: { labels: ticks, datasets: [{ data: points }] },
      options: {
        interaction: {
          mode: "nearest"
        },
        backgroundColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
        borderColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
        color: isDark ? theme.colors.gray[2] : theme.colors.dark[7],
        font: { size: 16, family: '"PT Sans Narrow", Arial' },
        onClick: (e) => {
          const d = getElementAtEvent(chartRef.current, { nativeEvent: e });
          if (d.length) {
            const { index } = d[0];
            setLastSelectionX(index);
            setLastSelectionHash((games == null ? void 0 : games[gamesIdx[index - 1]].tables[0].sessionHash) ?? null);
            if (games == null ? void 0 : games[gamesIdx[index - 1]]) {
              onSelectGame(games == null ? void 0 : games[gamesIdx[index - 1]]);
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          zoom: {
            zoom: {
              wheel: {
                enabled: true
              },
              pinch: {
                enabled: true
              },
              mode: "x"
            }
          }
        },
        elements: {
          point: {
            radius: (context) => lastSelectionX && context.dataIndex === lastSelectionX ? 8 : 3,
            hoverRadius: 8,
            hoverBorderWidth: 1,
            pointStyle: (context) => {
              if (context.dataIndex === 0) {
                return void 0;
              }
              if (games == null ? void 0 : games[gamesIdx[context.dataIndex - 1]].tables.every(
                (v) => v.playerId === playerId || v.ratingDelta < 0
              )) {
                return context.dataIndex === lastSelectionX ? window.__ratingStarIconBig : window.__ratingStarIcon;
              }
              return void 0;
            }
          },
          line: { tension: 0.3 }
        },
        scales: {
          x: {
            grid: {
              color: isDark ? theme.colors.gray[8] : theme.colors.gray[3]
            },
            position: "bottom",
            title: {
              display: true,
              text: i18n._t("Games played")
            }
          },
          y: {
            grid: {
              color: isDark ? theme.colors.gray[8] : theme.colors.gray[3]
            },
            position: "left",
            title: {
              display: true,
              text: i18n._t("Rating")
            }
          }
        }
      }
    }
  );
};
function getElementAtEvent(chart, event) {
  return chart.getElementsAtEventForMode(event.nativeEvent, "nearest", { intersect: false }, false);
}
export {
  RatingGraph,
  RatingGraph as default
};
