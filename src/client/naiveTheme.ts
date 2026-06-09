import type { GlobalThemeOverrides } from "naive-ui";

export const naiveThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#e8590c",
    primaryColorHover: "#f76707",
    primaryColorPressed: "#d9480f",
    primaryColorSuppl: "#f76707",
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
  },
};
