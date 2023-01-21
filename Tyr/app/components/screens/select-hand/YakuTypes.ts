export enum ArrowState {
  UNAVAILABLE,
  AVAILABLE,
  DISABLED,
}

export enum SelectHandActiveTab {
  YAKU = 'Yaku',
  TOTAL = 'Total',
}

export type YakuItem = {
  name: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
};

export type YakuGroup = YakuItem[];
