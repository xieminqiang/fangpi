/**
 * 小组件布局尺寸（真机安全区 + fixed 底栏）
 */
const TABBAR_HEIGHT = 50;

const HEADER_CONTENT = 44;

function getLayoutMetrics() {
  const fallback = {
    statusBarHeight: 20,
    headerHeight: 64,
    safeAreaBottom: 0,
    tabbarHeight: TABBAR_HEIGHT,
    submitBottom: TABBAR_HEIGHT
  };

  try {
    const info = xhs.getSystemInfoSync();
    const statusBarHeight = info.statusBarHeight || 20;
    const headerHeight = statusBarHeight + HEADER_CONTENT;
    const windowHeight = info.windowHeight || info.screenHeight || 0;
    const screenHeight = info.screenHeight || windowHeight;
    let safeAreaBottom = 0;

    // 小组件窗口远小于全屏时，宿主已处理底栏，不再叠加安全区
    const isWidgetViewport = windowHeight > 0 && windowHeight < screenHeight * 0.85;

    if (!isWidgetViewport) {
      if (info.safeAreaInsets && info.safeAreaInsets.bottom != null) {
        safeAreaBottom = info.safeAreaInsets.bottom;
      } else if (info.safeArea && info.safeArea.bottom != null && windowHeight) {
        // 必须用 windowHeight，screenHeight 在小组件里会算出过大的 padding
        safeAreaBottom = Math.max(0, windowHeight - info.safeArea.bottom);
      }
      safeAreaBottom = Math.min(safeAreaBottom, 50);
    }

    return {
      statusBarHeight,
      headerHeight,
      safeAreaBottom,
      tabbarHeight: TABBAR_HEIGHT,
      submitBottom: TABBAR_HEIGHT + safeAreaBottom
    };
  } catch (e) {
    return fallback;
  }
}

module.exports = {
  TABBAR_HEIGHT,
  getLayoutMetrics
};
