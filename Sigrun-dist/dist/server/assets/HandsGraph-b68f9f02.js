import { jsx } from "react/jsx-runtime";
import * as React from "react";
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
import "react-helmet";
import "@mantine/hooks";
import "@foxglove/crc";
import "wouter/static-location";
import "jsdom";
import "@mantine/ssr";
const BarGraph = React.lazy(() => import("./BarGraph-32107d9c.js"));
const HandsGraph = ({ handValueStat }) => {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === "dark";
  if (!handValueStat) {
    return null;
  }
  const hands = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0
  };
  handValueStat.forEach((item) => hands[item.hanCount] = item.count);
  let yakumanCount = 0;
  const handValueStats = [];
  for (let i = 1; i < 13; i++) {
    if (hands[i] >= 0) {
      handValueStats.push({ x: i.toString(), y: hands[i] });
    } else {
      yakumanCount += hands[i];
    }
  }
  handValueStats.push({ x: "★", y: yakumanCount > 0 ? yakumanCount : 0 });
  return /* @__PURE__ */ jsx(
    BarGraph,
    {
      data: { datasets: [{ data: handValueStats }] },
      options: {
        backgroundColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
        borderColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
        color: isDark ? theme.colors.gray[2] : theme.colors.dark[7],
        font: { size: 16, family: '"PT Sans Narrow", Arial' },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          x: {
            grid: {
              color: isDark ? theme.colors.gray[8] : theme.colors.gray[3]
            },
            ticks: {
              autoSkip: false
            },
            position: "bottom",
            title: {
              display: true,
              text: i18n._t("Hands value")
            }
          },
          y: {
            grid: {
              color: isDark ? theme.colors.gray[8] : theme.colors.gray[3]
            }
          }
        }
      }
    }
  );
};
export {
  HandsGraph,
  HandsGraph as default
};
