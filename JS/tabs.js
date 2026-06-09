// Tabs Routing & Lazy Loading System

export function initTabs(callbacks = {}) {
  const pills = document.querySelectorAll(".nav-pill");
  const aiPill = document.querySelector(".nav-pill[data-tab='ai']");
  const logoText = document.querySelector(".logo-text");
  const premiumNav = document.querySelector(".premium-nav");
  const navSvg = document.querySelector(".concave-curve");
  const aiBody = document.querySelector(".hide-grid");

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const tabName = pill.getAttribute("data-tab");
      if (!tabName) return;

      // 1. Switch active pill style
      pills.forEach((p) => p.classList.remove("active-pill"));
      pill.classList.add("active-pill");

      //Change AI Tab Interface

      // if (aiPill.classList.contains("active-pill")) {
      //   aiBody.style.cssText = `
      //   background: radial-gradient(
      //   circle at 50% 30%,
      //   rgba(30, 41, 59, 0.97) 0%,
      //   rgba(15, 23, 42, 0.99) 100%
      //   );
      //   box-sizing: border-box;
      //   `;
      //   logoText.style.cssText = "color: var(--ai-color);";
      //   premiumNav.style.backgroundColor = "var(--ai-color)";
      //   navSvg.style.fill = "var(--ai-color)";
      //   pill.style.color = "var(--inactive-ai-color)";
      //   pill.style.backgroundColor = "transparent";
      //   aiPill.style.backgroundColor = "var(--active-tab-color)";
      //   pills.style.color = "var(--inactive-ai-color)";
      //   aiPill.style.color = "#fff";
      // } else {
      //   document.body.style.cssText = "";
      //   logoText.style.cssText = "";
      //   premiumNav.style.backgroundColor = "";
      //   navSvg.style.fill = "";
      //   pills.style.color = "#fff";
      //   aiPill.style.backgroundColor = "var(--ai-color)";
      // }

      //2. Handle Body classes / Grid Visibility
      const isGridTab = ["table", "trends", "simulators"].includes(tabName);
      if (isGridTab) {
        document.body.classList.remove("hide-grid");
      } else {
        document.body.classList.add("hide-grid");
      }

      // 3. Switch dashboard headers
      const dashboards = document.querySelectorAll(".dashboard-header");
      dashboards.forEach((d) => d.classList.remove("active-dashboard"));

      const targetDashboardId = `dashboard-${tabName}`;
      const targetDashboard = document.getElementById(targetDashboardId);
      if (targetDashboard) {
        targetDashboard.classList.add("active-dashboard");
      }

      // 4. Switch full-page views
      const pages = document.querySelectorAll(".tab-content-page");
      pages.forEach((p) => p.classList.remove("active-tab-page"));

      const targetPageId = `view-${tabName}`;
      const targetPage = document.getElementById(targetPageId);
      if (targetPage) {
        targetPage.classList.add("active-tab-page");
      }

      // 5. Trigger Lazy-loaded Initialization callbacks
      if (callbacks[tabName] && typeof callbacks[tabName] === "function") {
        callbacks[tabName]();
      }
    });
  });
}
