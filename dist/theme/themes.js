import { theme } from "antd";
const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#1ab394",
    colorLink: "#1c84c6",
    colorSuccess: "#1ab394",
    colorInfo: "#23c6c8",
    colorWarning: "#f8ac59",
    colorError: "#ed5565",
    colorBgLayout: "#f3f3f4",
    colorText: "#4a4d4f",
    colorTextHeading: "#2f4050",
    borderRadius: 4
  },
  components: {
    Layout: {
      siderBg: "#2f4050",
      headerBg: "#ffffff",
      headerHeight: 56,
      headerPadding: "0 16px"
    },
    Menu: {
      darkItemBg: "#2f4050",
      darkSubMenuItemBg: "#293846",
      darkPopupBg: "#2f4050",
      darkItemColor: "#a7b1c2",
      darkItemHoverColor: "#ffffff",
      darkItemHoverBg: "#293846",
      darkItemSelectedBg: "#1ab394",
      darkItemSelectedColor: "#ffffff"
    },
    Table: {
      headerBg: "#f5f5f6"
    }
  }
};
const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1CB2ED",
    colorLink: "#1CB2ED",
    colorInfo: "#1CB2ED",
    colorSuccess: "#49aa19",
    colorWarning: "#d89614",
    colorError: "#EB1D25",
    colorBgBase: "#131B2B",
    colorBgLayout: "#131B2B",
    colorBgContainer: "#1E293B",
    colorBgElevated: "#1E293B",
    colorBorder: "#475263",
    colorBorderSecondary: "#323D52",
    colorText: "#DEE5F1",
    colorTextHeading: "#DEE5F1",
    colorTextSecondary: "#A5B0C2",
    colorTextTertiary: "#8A97AC",
    colorTextQuaternary: "#667389",
    borderRadius: 4
  },
  components: {
    Layout: {
      siderBg: "#1E293B",
      headerBg: "#1E293B",
      bodyBg: "#131B2B",
      headerHeight: 56,
      headerPadding: "0 16px"
    },
    Menu: {
      darkItemBg: "#1E293B",
      darkSubMenuItemBg: "#172131",
      darkPopupBg: "#1E293B",
      darkItemHoverBg: "#FFFFFF1A",
      darkItemSelectedBg: "#1CB2ED26",
      darkItemSelectedColor: "#1CB2ED"
    },
    Button: {
      primaryColor: "#0E131B"
    },
    Table: {
      headerColor: "#B7B7C2"
    },
    Modal: { contentBg: "#1E293B", headerBg: "#1E293B" },
    Drawer: { colorBgElevated: "#1E293B" }
  }
};
export {
  darkTheme,
  lightTheme
};
//# sourceMappingURL=themes.js.map
