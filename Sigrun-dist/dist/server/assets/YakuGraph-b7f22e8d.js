import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { useMemo } from "react";
import { u as useI18n, y as yakuNameMap, a as yakuList, Y as YakuId } from "../server.js";
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
const BarGraph = React.lazy(() => import("./BarGraph-32107d9c.js"));
const YakuGraph = ({ yakuStat }) => {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === "dark";
  const yakuNameMap$1 = useMemo(() => yakuNameMap(i18n), []);
  const yaku = Object.values(yakuList).reduce((acc, y) => {
    acc.set(y.id, 0);
    return acc;
  }, /* @__PURE__ */ new Map());
  let totalYakuhai = 0;
  if (!yakuStat) {
    return null;
  }
  yakuStat.forEach((stat) => {
    yaku.set(stat.yakuId, stat.count);
    switch (stat.yakuId) {
      case YakuId.YAKUHAI1:
        totalYakuhai += stat.count;
        break;
      case YakuId.YAKUHAI2:
        totalYakuhai += 2 * stat.count;
        break;
      case YakuId.YAKUHAI3:
        totalYakuhai += 3 * stat.count;
        break;
      case YakuId.YAKUHAI4:
        totalYakuhai += 4 * stat.count;
        break;
    }
  });
  const yakuStats = [...yaku.entries()].map(([key, value]) => {
    return { x: value, y: yakuNameMap$1.get(key) };
  }).filter((v) => v.x > 0).sort((a, b) => b.x - a.x);
  if (totalYakuhai > 0) {
    yakuStats.push({ x: totalYakuhai, y: i18n._t("Yakuhai: total") });
  }
  const yakuStatsHeight = 40 + 24 * yakuStats.length;
  return /* @__PURE__ */ jsx("div", { style: { position: "relative", height: `${yakuStatsHeight}px` }, children: /* @__PURE__ */ jsx(
    BarGraph,
    {
      data: { datasets: [{ data: yakuStats }] },
      options: {
        maintainAspectRatio: false,
        backgroundColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
        borderColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
        color: isDark ? theme.colors.gray[2] : theme.colors.dark[7],
        font: { size: 16, family: '"PT Sans Narrow", Arial' },
        plugins: {
          legend: { display: false }
        },
        indexAxis: "y",
        // grouped: false,
        scales: {
          x: {
            grid: {
              color: isDark ? theme.colors.gray[8] : theme.colors.gray[3]
            },
            position: "bottom",
            title: {
              display: true,
              text: i18n._t("Yaku collected over all time")
            }
          },
          y: {
            ticks: {
              autoSkip: false
            },
            grid: {
              color: isDark ? theme.colors.gray[8] : theme.colors.gray[3]
            }
          }
        }
      }
    }
  ) });
};
export {
  YakuGraph,
  YakuGraph as default
};
