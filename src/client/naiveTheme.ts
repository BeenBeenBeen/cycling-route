import type { GlobalThemeOverrides } from "naive-ui";

export const naiveThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#0f766e",
    primaryColorHover: "#0d9488",
    primaryColorPressed: "#115e59",
    primaryColorSuppl: "#14b8a6",
    infoColor: "#2563eb",
    successColor: "#16a34a",
    warningColor: "#d97706",
    errorColor: "#dc2626",
    bodyColor: "#f3f7f5",
    cardColor: "#ffffff",
    textColorBase: "#14213d",
    textColor1: "#172554",
    textColor2: "#334155",
    textColor3: "#64748b",
    borderColor: "#dbe7e1",
    dividerColor: "#e4ece7",
    borderRadius: "6px",
    fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  },
  Button: {
    fontWeight: "700",
    borderRadiusMedium: "6px",
  },
  Card: {
    borderRadius: "8px",
    paddingMedium: "16px",
    colorEmbedded: "#f8fbf9",
  },
  Menu: {
    itemTextColorActiveHorizontal: "#0f766e",
    itemTextColorHoverHorizontal: "#0d9488",
    itemIconColorActiveHorizontal: "#0f766e",
  },
  Statistic: {
    valueTextColor: "#0f172a",
  },
};
