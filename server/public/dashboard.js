// Toast helper function
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "🛡️";
  if (type === "error") icon = "⚠️";
  
  toast.innerHTML = `<span style="font-size: 1.1rem; display: flex; align-items: center;">${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.transition = "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-12px) scale(0.96)";
    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  // Track mouse coordinates for interactive grid spotlight glow
  document.addEventListener("mousemove", (e) => {
    const x = ((e.clientX / window.innerWidth) * 100).toFixed(2);
    const y = ((e.clientY / window.innerHeight) * 100).toFixed(2);
    document.documentElement.style.setProperty("--mouse-x", `${x}%`);
    document.documentElement.style.setProperty("--mouse-y", `${y}%`);
  });

  // 1. Authenticated Router Guard
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    localStorage.clear();
    window.location.href = "/login";
    return;
  }

  const user = JSON.parse(userStr);
  
  // Set User Profile Card and initials
  const userDisplayEmail = document.getElementById("user-display-email");
  const userAvatarInitials = document.getElementById("user-avatar-initials");
  const welcomeHeading = document.getElementById("welcome-message");
  
  if (userDisplayEmail) userDisplayEmail.innerText = user.email;
  if (userAvatarInitials && user.email) {
    userAvatarInitials.innerText = user.email.charAt(0).toUpperCase();
  }
  if (welcomeHeading && user.email) {
    const nameHandle = user.email.split("@")[0];
    const capitalized = nameHandle.charAt(0).toUpperCase() + nameHandle.slice(1);
    welcomeHeading.innerText = `Welcome back, ${capitalized}`;
  }

  // DOM elements
  const sidebar = document.getElementById("sidebar");
  const sidebarCollapseBtn = document.getElementById("sidebar-collapse-btn");
  const mobileToggleBtn = document.getElementById("mobile-sidebar-toggle");
  const mobileCloseBtn = document.getElementById("mobile-sidebar-close");

  const inputSection = document.getElementById("input-section");
  const loadingSection = document.getElementById("loading-section");
  const skeletonLoader = document.getElementById("skeleton-loader");
  const resultsSection = document.getElementById("results-section");
  const emptyState = document.getElementById("dashboard-empty-state");
  
  const analyzeForm = document.getElementById("analyze-form");
  const projectIdeaInput = document.getElementById("project-idea");
  const charCount = document.getElementById("char-count");
  const suggestionChips = document.querySelectorAll(".suggestion-chip");
  
  const logoutBtn = document.getElementById("logout-btn");
  const newAuditBtn = document.getElementById("new-audit-btn");
  const analyzeBtn = document.getElementById("analyze-btn");

  // Inline error banner elements
  const errorBanner = document.getElementById("error-banner");
  const errorMessage = document.getElementById("error-message");
  const errorCloseBtn = document.getElementById("error-close-btn");

  // SVG Gauge and Label Displays
  const gaugeFill = document.getElementById("gauge-fill");
  const scoreDisplay = document.getElementById("score-display");
  const scoreBadge = document.getElementById("score-badge");
  const progressBarFill = document.getElementById("progress-bar-fill");

  // Investor Readiness Displays
  const investorVerdictTitle = document.getElementById("investor-verdict-title");
  const investorScoreValue = document.getElementById("investor-score-value");
  const investorVerdictBadge = document.getElementById("investor-verdict-badge");
  const investorMetricsGrid = document.getElementById("investor-metrics-grid");

  // Project Risk Heatmap Displays
  const heatmapListContainer = document.getElementById("heatmap-list-container");
  let riskRadarChartInstance = null;

  // AI Roadmap Timeline Displays
  const roadmapTimelineContainer = document.getElementById("roadmap-timeline-container");

  // What-If Simulator Displays
  const simulatorControlsGrid = document.getElementById("simulator-controls-grid");
  const simulatorComparisonList = document.getElementById("simulator-comparison-list");
  let simulatorChartInstance = null;
  let activeSimulation = {
    budget: false,
    team: false,
    timeline: false,
    marketing: false,
    infra: false
  };
  let currentBaseMetrics = {
    success: 50,
    investor: 50,
    risk: 50
  };

  // Output Containers
  const reasonsList = document.getElementById("reasons-list");
  const risksGrid = document.getElementById("risks-grid");
  const solutionsList = document.getElementById("solutions-list");

  // Statistics Display Containers
  const statsTotalAudits = document.getElementById("stats-total-audits");
  const statsAvgScore = document.getElementById("stats-avg-score");
  const statsTotalRisks = document.getElementById("stats-total-risks");

  // History Actions & Container
  const clearHistoryBtn = document.getElementById("clear-history-btn");
  const historySidebarList = document.getElementById("history-sidebar-list");

  // Onboarding Shortcuts Panel Actions
  const shortcutLoadDemo = document.getElementById("shortcut-load-demo");
  const shortcutClearStorage = document.getElementById("shortcut-clear-storage");
  const shortcutDownloadBackup = document.getElementById("shortcut-download-backup");
  const activityLogFeed = document.getElementById("activity-log-feed");

  // Export & Action Buttons
  const actionCopyBtn = document.getElementById("action-copy-btn");
  const actionDownloadBtn = document.getElementById("action-download-btn");
  const actionPdfBtn = document.getElementById("action-pdf-btn");
  const actionPdfDownloadBtn = document.getElementById("action-pdf-download-btn");

  // Active loaded data store for export options
  let activeAuditData = null;
  let activeProjectIdea = "";

  // Loading timeline control variables
  let currentStep = 1;
  let loadingInterval = null;
  let typewriterTimeout = null;

  // ----------------------------------------------------
  // Collapsible Sidebar memory persistence
  // ----------------------------------------------------
  const SIDEBAR_COLLAPSED_KEY = "sidebar_collapsed_state";
  
  // Apply initial collapsed state if saved
  if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true") {
    if (sidebar) sidebar.classList.add("collapsed");
  }

  if (sidebarCollapseBtn && sidebar) {
    sidebarCollapseBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      // Persist user preference
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebar.classList.contains("collapsed"));
      logActivity("Sidebar collapsed state toggled");
    });
  }

  // ----------------------------------------------------
  // Sidebar navigation switches
  // ----------------------------------------------------
  const navItems = document.querySelectorAll(".nav-item");
  const tabContents = document.querySelectorAll(".tab-content");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      tabContents.forEach(t => t.classList.remove("active"));

      item.classList.add("active");
      const targetTabId = `tab-${item.getAttribute("data-tab")}`;
      const targetTab = document.getElementById(targetTabId);
      if (targetTab) {
        targetTab.classList.add("active");
      }
      
      // Close mobile drawer on item click
      if (sidebar.classList.contains("mobile-open")) {
        sidebar.classList.remove("mobile-open");
      }
      
      if (item.getAttribute("data-tab") === "analytics") {
        updateAnalytics();
      }
      
      logActivity(`Navigated to ${item.getAttribute("data-tab")} console`);
    });
  });

  // Mobile sidebar controls
  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener("click", () => {
      sidebar.classList.add("mobile-open");
    });
  }

  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
    });
  }

  // ----------------------------------------------------
  // Activity Feed Logger (Local timeline logger)
  // ----------------------------------------------------
  const ACTIVITY_LOG_KEY = "derisk_activity_log";

  function logActivity(message) {
    try {
      let logs = [];
      const savedLogs = localStorage.getItem(ACTIVITY_LOG_KEY);
      if (savedLogs) logs = JSON.parse(savedLogs);
      
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS
      
      const newLog = {
        time: timeString,
        msg: message
      };
      
      logs.unshift(newLog);
      
      // Keep only recent 8 entries
      if (logs.length > 8) logs = logs.slice(0, 8);
      
      localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
      renderActivityLogs();
    } catch (err) {
      console.error("Error saving activity logs:", err);
    }
  }

  function renderActivityLogs() {
    if (!activityLogFeed) return;
    
    try {
      const savedLogs = localStorage.getItem(ACTIVITY_LOG_KEY);
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      
      if (logs.length === 0) {
        activityLogFeed.innerHTML = `<div class="activity-feed-empty">Console initialized. Waiting for actions...</div>`;
        return;
      }
      
      activityLogFeed.innerHTML = "";
      logs.forEach(log => {
        const row = document.createElement("div");
        row.className = "activity-feed-item";
        row.innerHTML = `
          <span class="feed-dot"></span>
          <div class="feed-details">
            <span class="feed-title">${escapeHtml(log.msg)}</span>
            <span class="feed-time">${log.time}</span>
          </div>
        `;
        activityLogFeed.appendChild(row);
      });
    } catch (err) {
      console.error("Error rendering activity logs:", err);
    }
  }

  // Log initial session verification
  logActivity("Console workspace loaded successfully");

  // ----------------------------------------------------
  // Local Database / History management (localStorage)
  // ----------------------------------------------------
  const STORAGE_KEY = "derisk_audit_history";

  function getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error("Error reading localStorage DB:", err);
      return [];
    }
  }

  function saveToHistory(idea, reportData) {
    try {
      const history = getHistory();
      const newRecord = {
        id: "record_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        projectName: extractProjectName(idea),
        idea: idea,
        timestamp: new Date().toLocaleString(),
        timestampMs: Date.now(),
        data: reportData
      };
      
      history.unshift(newRecord); // Add to beginning
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      
      renderHistoryList();
      updateStatsPanel();
      updateAnalytics();
      renderDashboardRecentTable();
      logActivity(`Saved "${newRecord.projectName}" to history logs`);
    } catch (err) {
      console.error("Error writing to localStorage DB:", err);
    }
  }

  function deleteHistoryItem(id) {
    try {
      let history = getHistory();
      const targetItem = history.find(item => item.id === id);
      const projName = targetItem ? targetItem.projectName : "audit";
      
      history = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      
      // If the deleted audit was active, hide results
      if (activeAuditData && activeAuditData.id === id) {
        resetDashboardToEmpty();
      }

      renderHistoryList();
      updateStatsPanel();
      updateAnalytics();
      renderDashboardRecentTable();
      logActivity(`Deleted report "${projName}"`);
      showToast("Report deleted from logs.", "info");
    } catch (err) {
      console.error("Error updating history log:", err);
    }
  }

  function clearAllHistory() {
    if (confirm("Are you sure you want to clear all analysis history? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      resetDashboardToEmpty();
      renderHistoryList();
      updateStatsPanel();
      updateAnalytics();
      renderDashboardRecentTable();
      logActivity("Flushed all history databases");
      showToast("All logs cleared.", "info");
    }
  }

  function extractProjectName(idea) {
    if (!idea) return "Unnamed Audit";
    const cleanStr = idea.trim().replace(/[^\w\s]/g, "");
    const words = cleanStr.split(/\s+/);
    if (words.length <= 4) return words.join(" ");
    return words.slice(0, 4).join(" ") + "...";
  }

  function updateStatsPanel() {
    const history = getHistory();
    const totalAudits = history.length;
    
    let sumScore = 0;
    let sumRisks = 0;
    
    history.forEach(item => {
      sumScore += (item.data.confidenceScore || 50);
      sumRisks += (item.data.risks ? item.data.risks.length : 0);
    });

    const averageScore = totalAudits > 0 ? Math.round(sumScore / totalAudits) : 0;

    if (statsTotalAudits) statsTotalAudits.innerText = totalAudits;
    if (statsAvgScore) statsAvgScore.innerText = `${averageScore}%`;
    if (statsTotalRisks) statsTotalRisks.innerText = sumRisks;
  }

  function renderHistoryList() {
    const history = getHistory();
    if (!historySidebarList) return;

    historySidebarList.innerHTML = "";

    if (history.length === 0) {
      historySidebarList.innerHTML = `
        <div class="empty-state-container" style="padding: 2rem 1rem;">
          <div class="empty-state-icon" style="width: 40px; height: 40px; margin-bottom: 0.75rem; box-shadow: none; background: rgba(255, 255, 255, 0.02); border-color: rgba(255, 255, 255, 0.05); color: var(--text-dim);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h5 class="empty-state-title" style="font-size: 0.85rem; margin-bottom: 0.25rem;">No assessments logged</h5>
          <p class="empty-state-desc" style="font-size: 0.75rem; max-width: 200px;">Your local database workspace is empty.</p>
        </div>
      `;
      return;
    }

    history.forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.className = "history-item";
      
      // Determine rating color
      const score = item.data.confidenceScore || 50;
      let scoreColorClass = "text-amber";
      if (score >= 75) scoreColorClass = "text-emerald";
      if (score < 50) scoreColorClass = "text-rose";

      itemEl.innerHTML = `
        <div class="history-item-details">
          <span class="history-item-title">${escapeHtml(item.projectName)}</span>
          <span class="history-item-sub">${item.timestamp} • <span class="${scoreColorClass}">${score}%</span></span>
        </div>
        <button class="btn-delete-history-item" title="Delete run" data-id="${item.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      itemEl.addEventListener("click", (e) => {
        if (e.target.closest(".btn-delete-history-item")) return;
        loadAuditRecord(item);
      });

      const delBtn = itemEl.querySelector(".btn-delete-history-item");
      if (delBtn) {
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = delBtn.getAttribute("data-id");
          deleteHistoryItem(id);
        });
      }

      historySidebarList.appendChild(itemEl);
    });
  }

  function loadAuditRecord(record) {
    hideError();
    
    const dashboardTabBtn = document.querySelector('[data-tab="dashboard"]');
    if (dashboardTabBtn) dashboardTabBtn.click();

    activeAuditData = record.data;
    activeAuditData.id = record.id;
    activeAuditData.timestamp = record.timestamp;
    activeProjectIdea = record.idea;
    
    if (projectIdeaInput) {
      projectIdeaInput.value = record.idea;
      projectIdeaInput.dispatchEvent(new Event("input"));
    }

    renderDashboard(record.data);

    if (emptyState) emptyState.style.display = "none";
    const recentPanel = document.getElementById("dashboard-recent-analyses");
    if (recentPanel) recentPanel.style.display = "none";
    if (resultsSection) resultsSection.classList.add("active");
    
    logActivity(`Opened history audit "${record.projectName}"`);
    showToast(`Loaded "${record.projectName}" assessment.`, "info");
  }

  function resetDashboardToEmpty() {
    activeAuditData = null;
    activeProjectIdea = "";
    if (emptyState) emptyState.style.display = "grid"; // Show onboarding grid
    const recentPanel = document.getElementById("dashboard-recent-analyses");
    if (recentPanel) recentPanel.style.display = "block";
    if (resultsSection) resultsSection.classList.remove("active");
    if (projectIdeaInput) {
      projectIdeaInput.value = "";
      projectIdeaInput.dispatchEvent(new Event("input"));
    }
    // Hide download PDF button
    if (actionPdfDownloadBtn) {
      actionPdfDownloadBtn.style.display = "none";
    }
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", clearAllHistory);
  }

  // ----------------------------------------------------
  // Onboarding Quick Shortcuts callbacks
  // ----------------------------------------------------
  if (shortcutLoadDemo) {
    shortcutLoadDemo.addEventListener("click", () => {
      if (projectIdeaInput) {
        projectIdeaInput.value = "An AI-powered B2B customer support routing engine that automatically handles high-volume ticketing using specialized agentic layers.";
        projectIdeaInput.dispatchEvent(new Event("input"));
        projectIdeaInput.focus();
        logActivity("Demo preset loaded into textarea");
        showToast("Demo project concept loaded.", "info");
      }
    });
  }

  if (shortcutClearStorage) {
    shortcutClearStorage.addEventListener("click", clearAllHistory);
  }

  if (shortcutDownloadBackup) {
    shortcutDownloadBackup.addEventListener("click", () => {
      const history = getHistory();
      if (history.length === 0) {
        showToast("No histories found to back up.", "error");
        return;
      }
      
      const jsonContent = JSON.stringify(history, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `derisk-backup-${Date.now()}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      logActivity("Downloaded JSON backup profile");
      showToast("JSON history backup downloaded.", "success");
    });
  }

  // ----------------------------------------------------
  // Initial page setup callbacks
  // ----------------------------------------------------
  updateStatsPanel();
  renderHistoryList();
  renderActivityLogs();

  // Character counter
  if (projectIdeaInput && charCount) {
    projectIdeaInput.addEventListener("input", () => {
      charCount.innerText = `${projectIdeaInput.value.length} characters`;
    });
    charCount.innerText = `${projectIdeaInput.value.length} characters`;
  }

  // Click suggestions presets
  suggestionChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const idea = chip.getAttribute("data-idea");
      if (idea && projectIdeaInput) {
        projectIdeaInput.value = idea;
        projectIdeaInput.dispatchEvent(new Event("input"));
        projectIdeaInput.focus();
        logActivity("Preset template loaded into editor");
        showToast("Prompt template loaded.", "info");
      }
    });
  });

  // Error banners
  function showError(msg) {
    if (errorBanner && errorMessage) {
      errorMessage.innerText = msg;
      errorBanner.style.display = "flex";
      errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    showToast(msg, "error");
  }

  function hideError() {
    if (errorBanner) {
      errorBanner.style.display = "none";
    }
  }

  if (errorCloseBtn) {
    errorCloseBtn.addEventListener("click", hideError);
  }

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      showToast("Signed out successfully.", "info");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    });
  }

  // Reset Audit
  if (newAuditBtn) {
    newAuditBtn.addEventListener("click", () => {
      resetDashboardToEmpty();
      hideError();
      logActivity("Audit workspace cleared for new concept");
    });
  }

  // ----------------------------------------------------
  // Loading pipeline handlers
  // ----------------------------------------------------
  function startLoadingTimeline() {
    for (let i = 1; i <= 4; i++) {
      const stepEl = document.getElementById(`step-${i}`);
      if (stepEl) stepEl.className = "loader-step";
    }
    currentStep = 1;
    setActiveStep(1);

    loadingInterval = setInterval(() => {
      if (currentStep < 4) {
        setCompletedStep(currentStep);
        currentStep++;
        setActiveStep(currentStep);
      } else {
        clearInterval(loadingInterval);
      }
    }, 1500);
  }

  function stopLoadingTimeline(success = true) {
    if (loadingInterval) clearInterval(loadingInterval);
    if (success) {
      for (let i = 1; i <= 4; i++) {
        setCompletedStep(i);
      }
    } else {
      for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        if (stepEl) stepEl.className = "loader-step";
      }
    }
  }

  function setActiveStep(stepNum) {
    const stepEl = document.getElementById(`step-${stepNum}`);
    if (stepEl) stepEl.className = "loader-step active";
  }

  function setCompletedStep(stepNum) {
    const stepEl = document.getElementById(`step-${stepNum}`);
    if (stepEl) stepEl.className = "loader-step completed";
  }

  // Form Submissions
  if (analyzeForm) {
    analyzeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideError();

      const idea = projectIdeaInput.value.trim();
      if (!idea) {
        showError("Please provide a project description.");
        return;
      }

      // Hide onboarding elements, display loading timeline & loading skeletons in results tab
      if (emptyState) emptyState.style.display = "none";
      const recentPanel = document.getElementById("dashboard-recent-analyses");
      if (recentPanel) recentPanel.style.display = "none";
      if (resultsSection) resultsSection.classList.remove("active");
      
      analyzeBtn.classList.add("loading");
      analyzeBtn.disabled = true;
      
      loadingSection.classList.add("active");
      if (skeletonLoader) skeletonLoader.style.display = "flex";
      
      logActivity("Diagnostic audit scan initialized");
      startLoadingTimeline();

      try {
        const response = await fetch("/api/project/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ idea })
        });

        if (response.status === 401) {
          stopLoadingTimeline(false);
          if (skeletonLoader) skeletonLoader.style.display = "none";
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          showToast("Session expired. Please sign in again.", "error");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Analysis failed. Please try again.");
        }

        stopLoadingTimeline(true);

        setTimeout(() => {
          // Save result to offline localStorage history
          saveToHistory(idea, data);

          // Get record details
          activeAuditData = data;
          activeAuditData.timestamp = new Date().toLocaleString();
          activeProjectIdea = idea;

          renderDashboard(data);
          
          loadingSection.classList.remove("active");
          if (skeletonLoader) skeletonLoader.style.display = "none";
          resultsSection.classList.add("active");
          
          analyzeBtn.classList.remove("loading");
          analyzeBtn.disabled = false;
          
          logActivity(`Diagnostic calculation successful [Feasibility: ${data.confidenceScore}%]`);
          showToast("Feasibility report compiled successfully!", "success");
        }, 800);

      } catch (err) {
        stopLoadingTimeline(false);
        loadingSection.classList.remove("active");
        if (skeletonLoader) skeletonLoader.style.display = "none";
        
        // Show empty state placeholder or restore results if we had an active one
        if (activeAuditData) {
          resultsSection.classList.add("active");
        } else {
          emptyState.style.display = "grid";
          const recentPanel = document.getElementById("dashboard-recent-analyses");
          if (recentPanel) recentPanel.style.display = "block";
        }

        analyzeBtn.classList.remove("loading");
        analyzeBtn.disabled = false;
        
        logActivity("Diagnostic calculation execution failed");
        showError(err.message || "Failed to contact diagnostic endpoint.");
      }
    });
  }

  // ----------------------------------------------------
  // Render report details
  // ----------------------------------------------------
  function renderDashboard(data) {
    // Show download PDF button
    if (actionPdfDownloadBtn) {
      actionPdfDownloadBtn.style.display = "flex";
    }

    const { risks, failureReasons, solutions } = data;
    const confidenceScore = typeof data.confidenceScore === "number" ? data.confidenceScore : 50;

    // Investor Readiness Score rendering
    const investorReadinessScore = typeof data.investorReadinessScore === "number" ? data.investorReadinessScore : 50;
    const marketPotentialScore = typeof data.marketPotentialScore === "number" ? data.marketPotentialScore : 50;
    const scalabilityScore = typeof data.scalabilityScore === "number" ? data.scalabilityScore : 50;
    const revenueModelScore = typeof data.revenueModelScore === "number" ? data.revenueModelScore : 50;
    const executionFeasibilityScore = typeof data.executionFeasibilityScore === "number" ? data.executionFeasibilityScore : 50;

    if (investorScoreValue) {
      investorScoreValue.innerText = `${investorReadinessScore}/100`;
      investorScoreValue.className = investorReadinessScore >= 80 ? "text-emerald" : (investorReadinessScore >= 60 ? "text-amber" : "text-rose");
    }

    if (investorVerdictBadge) {
      investorVerdictBadge.className = "badge-pill";
      if (investorReadinessScore >= 80) {
        investorVerdictBadge.classList.add("badge-emerald");
        investorVerdictBadge.innerText = "Investor Ready";
      } else if (investorReadinessScore >= 60) {
        investorVerdictBadge.classList.add("badge-amber");
        investorVerdictBadge.innerText = "Needs Improvement";
      } else {
        investorVerdictBadge.classList.add("badge-rose");
        investorVerdictBadge.innerText = "High Risk Investment";
      }
    }

    if (investorVerdictTitle) {
      if (investorReadinessScore >= 80) {
        investorVerdictTitle.innerText = "Investor Ready";
      } else if (investorReadinessScore >= 60) {
        investorVerdictTitle.innerText = "Needs Improvement";
      } else {
        investorVerdictTitle.innerText = "High Risk Investment";
      }
    }

    if (investorMetricsGrid) {
      investorMetricsGrid.innerHTML = "";
      const metrics = [
        { label: "Market Potential", score: marketPotentialScore },
        { label: "Scalability", score: scalabilityScore },
        { label: "Revenue Model", score: revenueModelScore },
        { label: "Execution Feasibility", score: executionFeasibilityScore }
      ];

      metrics.forEach((item) => {
        let colorClass = "text-rose";
        let barColor = "var(--rose-color)";
        if (item.score >= 80) {
          colorClass = "text-emerald";
          barColor = "var(--emerald-color)";
        } else if (item.score >= 60) {
          colorClass = "text-amber";
          barColor = "var(--amber-color)";
        }

        const card = document.createElement("div");
        card.className = "glass-card animate-fade-in";
        card.style.padding = "1.25rem";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.gap = "0.75rem";
        card.style.background = "rgba(255, 255, 255, 0.02)";
        card.style.margin = "0";

        card.innerHTML = `
          <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">${item.label}</span>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 1.6rem; font-weight: 800;" class="${colorClass}">${item.score}%</span>
          </div>
          <div style="height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; overflow: hidden;">
            <div style="width: ${item.score}%; height: 100%; background: ${barColor}; border-radius: 3px; transition: width 1s ease;"></div>
          </div>
        `;
        investorMetricsGrid.appendChild(card);
      });
    }

    // Project Risk Heatmap rendering
    const technicalRisk = typeof data.technicalRisk === "number" ? data.technicalRisk : 50;
    const budgetRisk = typeof data.budgetRisk === "number" ? data.budgetRisk : 50;
    const marketRisk = typeof data.marketRisk === "number" ? data.marketRisk : 50;
    const scalabilityRisk = typeof data.scalabilityRisk === "number" ? data.scalabilityRisk : 50;
    const operationalRisk = typeof data.operationalRisk === "number" ? data.operationalRisk : 50;

    if (heatmapListContainer) {
      heatmapListContainer.innerHTML = "";
      const riskVectors = [
        { name: "Technical Risk", score: technicalRisk },
        { name: "Budget Risk", score: budgetRisk },
        { name: "Market Risk", score: marketRisk },
        { name: "Scalability Risk", score: scalabilityRisk },
        { name: "Operational Risk", score: operationalRisk }
      ];

      riskVectors.forEach((item) => {
        let level = "Low";
        let bg = "rgba(16, 185, 129, 0.05)";
        let border = "rgba(16, 185, 129, 0.2)";
        let textClass = "text-emerald";
        let barColor = "var(--emerald-color)";
        
        if (item.score >= 70) {
          level = "High";
          bg = "rgba(244, 63, 94, 0.07)";
          border = "rgba(244, 63, 94, 0.25)";
          textClass = "text-rose";
          barColor = "var(--rose-color)";
        } else if (item.score >= 40) {
          level = "Medium";
          bg = "rgba(217, 119, 6, 0.07)";
          border = "rgba(217, 119, 6, 0.25)";
          textClass = "text-amber";
          barColor = "var(--amber-color)";
        }

        const card = document.createElement("div");
        card.className = "glass-card animate-fade-in";
        card.style.background = bg;
        card.style.borderColor = border;
        card.style.padding = "0.75rem 1.25rem";
        card.style.margin = "0";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.gap = "0.5rem";
        card.style.boxShadow = "inset 0 1px 1px rgba(255, 255, 255, 0.01)";

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span style="font-weight: 700; font-size: 0.88rem; color: var(--text-bright);">${item.name}</span>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span class="badge-pill ${level === 'High' ? 'badge-rose' : (level === 'Medium' ? 'badge-amber' : 'badge-emerald')}" style="padding: 2px 8px; font-size: 0.65rem; border-radius: 4px;">${level}</span>
              <span class="${textClass}" style="font-weight: 800; font-size: 0.95rem;">${item.score}%</span>
            </div>
          </div>
          <div style="height: 5px; background: rgba(255, 255, 255, 0.04); border-radius: 3px; overflow: hidden; width: 100%;">
            <div style="width: ${item.score}%; height: 100%; background: ${barColor}; border-radius: 3px; transition: width 1.2s ease;"></div>
          </div>
        `;
        heatmapListContainer.appendChild(card);
      });
    }

    const radarCtx = document.getElementById("riskRadarChart");
    if (radarCtx) {
      if (riskRadarChartInstance) {
        riskRadarChartInstance.destroy();
        riskRadarChartInstance = null;
      }
      
      riskRadarChartInstance = new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: ['Technical', 'Budget', 'Market', 'Scalability', 'Operational'],
          datasets: [{
            label: 'Risk Level %',
            data: [technicalRisk, budgetRisk, marketRisk, scalabilityRisk, operationalRisk],
            backgroundColor: 'rgba(244, 63, 94, 0.2)',
            borderColor: 'hsl(346, 87%, 57%)',
            pointBackgroundColor: 'hsl(346, 87%, 57%)',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: 'hsl(346, 87%, 57%)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            r: {
              angleLines: {
                color: 'rgba(255, 255, 255, 0.08)'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.08)'
              },
              pointLabels: {
                color: 'var(--text-muted)',
                font: {
                  family: "'Outfit', sans-serif",
                  size: 10,
                  weight: '600'
                }
              },
              ticks: {
                backdropColor: 'transparent',
                color: 'rgba(255, 255, 255, 0.3)',
                showLabelBackdrop: false,
                font: {
                  size: 8
                },
                stepSize: 20
              },
              min: 0,
              max: 100
            }
          }
        }
      });
    }

    // Render AI Implementation Roadmap
    if (roadmapTimelineContainer) {
      roadmapTimelineContainer.innerHTML = "";
      const roadmap = Array.isArray(data.roadmap) ? data.roadmap : [];
      
      if (roadmap.length === 0) {
        roadmapTimelineContainer.innerHTML = `<p class="card-text">No implementation roadmap generated for this concept.</p>`;
      } else {
        roadmap.forEach((phaseData, index) => {
          const stepIndex = index + 1;
          const stepEl = document.createElement("div");
          stepEl.className = "timeline-item animate-fade-in";
          stepEl.style.position = "relative";
          stepEl.style.animationDelay = `${index * 150}ms`;

          const nodeColor = `hsl(${(index * 55) % 360}, 75%, 55%)`;
          const nodeGlow = `hsla(${(index * 55) % 360}, 75%, 55%, 0.15)`;

          let taskHtml = "";
          if (Array.isArray(phaseData.tasks)) {
            phaseData.tasks.forEach(task => {
              taskHtml += `
                <li style="display: flex; gap: 0.75rem; align-items: flex-start; color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 0.5rem;">
                  <span style="color: ${nodeColor}; font-weight: bold; font-size: 1.1rem; line-height: 1;">•</span>
                  <span>${escapeHtml(task)}</span>
                </li>
              `;
            });
          }

          stepEl.innerHTML = `
            <div style="position: absolute; left: -3.05rem; top: 0; width: 1.6rem; height: 1.6rem; background: #0f172a; border: 2.5px solid ${nodeColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; color: #ffffff; box-shadow: 0 0 10px ${nodeGlow}; z-index: 2;">
              ${stepIndex}
            </div>
            <div class="glass-card" style="padding: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; background: rgba(255, 255, 255, 0.01);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; width: 100%;">
                <h5 style="margin: 0; font-size: 1rem; font-weight: 800; color: var(--text-bright);">${escapeHtml(phaseData.phase)}</h5>
                <span class="badge-pill" style="background: rgba(255, 255, 255, 0.03); border-color: rgba(255, 255, 255, 0.08); color: var(--text-muted); padding: 2px 10px; font-size: 0.7rem; border-radius: 4px;">Duration: ${escapeHtml(phaseData.duration)}</span>
              </div>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${taskHtml}
              </ul>
            </div>
          `;
          roadmapTimelineContainer.appendChild(stepEl);
        });
      }
    }

    // Setup and Update What-If Simulator
    currentBaseMetrics = {
      success: confidenceScore,
      investor: investorReadinessScore,
      risk: 100 - confidenceScore
    };

    // Reset active simulation toggles for new diagnostic reports
    activeSimulation = {
      budget: false,
      team: false,
      timeline: false,
      marketing: false,
      infra: false
    };

    function updateSimulation() {
      let successSim = currentBaseMetrics.success;
      let investorSim = currentBaseMetrics.investor;
      let riskSim = currentBaseMetrics.risk;

      if (activeSimulation.budget) { successSim += 6; investorSim += 5; riskSim -= 6; }
      if (activeSimulation.team) { successSim += 4; investorSim += 3; riskSim -= 4; }
      if (activeSimulation.timeline) { successSim -= 8; investorSim -= 5; riskSim += 8; }
      if (activeSimulation.marketing) { successSim += 2; investorSim += 8; riskSim -= 2; }
      if (activeSimulation.infra) { successSim += 8; investorSim += 4; riskSim -= 8; }

      successSim = Math.min(100, Math.max(0, successSim));
      investorSim = Math.min(100, Math.max(0, investorSim));
      riskSim = Math.min(100, Math.max(0, riskSim));

      const getRiskLevelName = (score) => {
        if (score >= 50) return "High";
        if (score >= 25) return "Medium";
        return "Low";
      };

      const getInvestorVerdictName = (score) => {
        if (score >= 80) return "Investor Ready";
        if (score >= 60) return "Needs Improvement";
        return "High Risk Investment";
      };

      const baseRiskLevel = getRiskLevelName(currentBaseMetrics.risk);
      const simRiskLevel = getRiskLevelName(riskSim);

      const baseInvVerdict = getInvestorVerdictName(currentBaseMetrics.investor);
      const simInvVerdict = getInvestorVerdictName(investorSim);

      if (simulatorComparisonList) {
        simulatorComparisonList.innerHTML = `
          <!-- Success Probability -->
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
              <span>Success Probability</span>
              <span style="color: ${successSim >= currentBaseMetrics.success ? 'var(--emerald-color)' : 'var(--rose-color)'}; font-weight: bold;">
                ${successSim >= currentBaseMetrics.success ? '+' : ''}${successSim - currentBaseMetrics.success}%
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.25rem;">
              <span style="font-size: 1.2rem; font-weight: 800; color: var(--text-muted);">${currentBaseMetrics.success}%</span>
              <span style="color: var(--text-muted); font-weight: bold;">→</span>
              <span style="font-size: 1.5rem; font-weight: 800; color: ${successSim >= 75 ? 'var(--emerald-color)' : (successSim >= 50 ? 'var(--amber-color)' : 'var(--rose-color)')};">${successSim}%</span>
            </div>
          </div>

          <!-- Risk Score & Level -->
          <div style="display: flex; flex-direction: column; gap: 0.25rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 0.75rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
              <span>Risk Score & Level</span>
              <span style="color: ${riskSim <= currentBaseMetrics.risk ? 'var(--emerald-color)' : 'var(--rose-color)'}; font-weight: bold;">
                ${riskSim >= currentBaseMetrics.risk ? '+' : ''}${riskSim - currentBaseMetrics.risk}%
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.25rem;">
              <span style="font-size: 1.2rem; font-weight: 800; color: var(--text-muted);">${currentBaseMetrics.risk}% (${baseRiskLevel})</span>
              <span style="color: var(--text-muted); font-weight: bold;">→</span>
              <span style="font-size: 1.5rem; font-weight: 800; color: ${riskSim >= 50 ? 'var(--rose-color)' : (riskSim >= 25 ? 'var(--amber-color)' : 'var(--emerald-color)')};">${riskSim}% (${simRiskLevel})</span>
            </div>
          </div>

          <!-- Investor Readiness Score -->
          <div style="display: flex; flex-direction: column; gap: 0.25rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 0.75rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
              <span>Investor Readiness</span>
              <span style="color: ${investorSim >= currentBaseMetrics.investor ? 'var(--emerald-color)' : 'var(--rose-color)'}; font-weight: bold;">
                ${investorSim >= currentBaseMetrics.investor ? '+' : ''}${investorSim - currentBaseMetrics.investor}%
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.25rem;">
              <span style="font-size: 1.2rem; font-weight: 800; color: var(--text-muted);">${currentBaseMetrics.investor}/100 (${baseInvVerdict})</span>
              <span style="color: var(--text-muted); font-weight: bold;">→</span>
              <span style="font-size: 1.5rem; font-weight: 800; color: ${investorSim >= 80 ? 'var(--emerald-color)' : (investorSim >= 60 ? 'var(--amber-color)' : 'var(--rose-color)')};">${investorSim}/100 (${simInvVerdict})</span>
            </div>
          </div>
        `;
      }

      const canvasCtx = document.getElementById("simulatorChart");
      if (canvasCtx) {
        if (simulatorChartInstance) {
          simulatorChartInstance.destroy();
          simulatorChartInstance = null;
        }

        simulatorChartInstance = new Chart(canvasCtx, {
          type: 'bar',
          data: {
            labels: ['Success Prob.', 'Risk Score', 'Investor Ready'],
            datasets: [
              {
                label: 'Before',
                data: [currentBaseMetrics.success, currentBaseMetrics.risk, currentBaseMetrics.investor],
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
              },
              {
                label: 'After',
                data: [successSim, riskSim, investorSim],
                backgroundColor: 'rgba(99, 102, 241, 0.65)',
                borderColor: 'hsl(250, 84%, 63%)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
              legend: {
                labels: {
                  color: 'var(--text-muted)',
                  font: {
                    family: "'Outfit', sans-serif"
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.4)',
                  font: {
                    size: 10
                  }
                },
                min: 0,
                max: 100
              },
              y: {
                grid: {
                  display: false
                },
                ticks: {
                  color: 'var(--text-muted)',
                  font: {
                    family: "'Outfit', sans-serif",
                    size: 10,
                    weight: '600'
                  }
                }
              }
            }
          }
        });
      }
    }

    if (simulatorControlsGrid) {
      simulatorControlsGrid.innerHTML = "";
      const controls = [
        { key: "budget", label: "Increase Budget by 20%", icon: "💰" },
        { key: "team", label: "Increase Team Size", icon: "👥" },
        { key: "timeline", label: "Reduce Timeline", icon: "⏱️" },
        { key: "marketing", label: "Increase Marketing", icon: "📈" },
        { key: "infra", label: "Improve Infrastructure", icon: "☁️" }
      ];

      controls.forEach(item => {
        const card = document.createElement("div");
        card.className = "glass-card";
        card.style.padding = "1rem";
        card.style.margin = "0";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.alignItems = "center";
        card.style.justifyContent = "center";
        card.style.gap = "0.5rem";
        card.style.cursor = "pointer";
        card.style.textAlign = "center";
        card.style.transition = "all 0.25s ease";
        card.style.background = "rgba(255, 255, 255, 0.01)";
        card.style.borderColor = "var(--border-dim)";

        card.innerHTML = `
          <span style="font-size: 1.5rem;">${item.icon}</span>
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-bright);">${item.label}</span>
        `;

        card.addEventListener("click", () => {
          activeSimulation[item.key] = !activeSimulation[item.key];
          card.style.background = activeSimulation[item.key] ? "rgba(99, 102, 241, 0.1)" : "rgba(255, 255, 255, 0.01)";
          card.style.borderColor = activeSimulation[item.key] ? "var(--primary-color)" : "var(--border-dim)";
          updateSimulation();
        });

        simulatorControlsGrid.appendChild(card);
      });
    }

    // Call update simulation once to draw the base graphs
    updateSimulation();

    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (circumference * confidenceScore) / 100;
    
    if (gaugeFill) {
      gaugeFill.style.strokeDashoffset = offset;
    }

    scoreDisplay.className = "score-number";
    scoreBadge.className = "badge-pill";
    if (progressBarFill) {
      progressBarFill.className = "linear-progress-fill";
      progressBarFill.style.width = "0%";
    }
    
    if (confidenceScore >= 75) {
      if (gaugeFill) gaugeFill.setAttribute("stroke", "var(--emerald-color)");
      if (progressBarFill) progressBarFill.style.backgroundColor = "var(--emerald-color)";
      scoreDisplay.classList.add("text-emerald");
      scoreBadge.classList.add("badge-emerald");
      scoreBadge.innerText = "Highly Feasible";
    } else if (confidenceScore >= 50) {
      if (gaugeFill) gaugeFill.setAttribute("stroke", "var(--amber-color)");
      if (progressBarFill) progressBarFill.style.backgroundColor = "var(--amber-color)";
      scoreDisplay.classList.add("text-amber");
      scoreBadge.classList.add("badge-amber");
      scoreBadge.innerText = "Moderate Risk";
    } else {
      if (gaugeFill) gaugeFill.setAttribute("stroke", "var(--rose-color)");
      if (progressBarFill) progressBarFill.style.backgroundColor = "var(--rose-color)";
      scoreDisplay.classList.add("text-rose");
      scoreBadge.classList.add("badge-rose");
      scoreBadge.innerText = "High Risk";
    }

    animateScoreDisplay(confidenceScore);

    // Triggers
    reasonsList.innerHTML = "";
    if (failureReasons && failureReasons.length > 0) {
      failureReasons.forEach((reason, index) => {
        const item = document.createElement("div");
        item.className = "info-list-item animate-fade-in";
        item.style.animationDelay = `${index * 100}ms`;
        item.innerHTML = `
          <span class="info-list-bullet">${index + 1}</span>
          <span>${escapeHtml(reason)}</span>
        `;
        reasonsList.appendChild(item);
      });
    } else {
      reasonsList.innerHTML = `<p class="card-text">No critical triggers identified by AI assessment.</p>`;
    }

    // Risks Grid
    risksGrid.innerHTML = "";
    if (risks && risks.length > 0) {
      risks.forEach((riskObj, index) => {
        const card = document.createElement("div");
        const severity = (riskObj.severity || "Medium").toLowerCase();
        card.className = `glass-card risk-card severity-${severity} animate-fade-in`;
        card.style.animationDelay = `${index * 100}ms`;

        let badgeClass = "badge-amber";
        if (severity === "high") badgeClass = "badge-rose";
        if (severity === "low") badgeClass = "badge-emerald";

        card.innerHTML = `
          <div class="card-header-flex">
            <h4 class="card-subtitle">${escapeHtml(riskObj.risk)}</h4>
            <span class="badge-pill ${badgeClass}" style="padding: 3px 10px; font-size: 0.7rem;">
              ${escapeHtml(riskObj.severity)}
            </span>
          </div>
          <p class="card-text" style="margin-top: 0.5rem;">${escapeHtml(riskObj.description)}</p>
        `;
        risksGrid.appendChild(card);
      });
    } else {
      risksGrid.innerHTML = `<p class="card-text">No system architecture risks detected.</p>`;
    }

    // Mitigations
    solutionsList.innerHTML = "";
    if (solutions && solutions.length > 0) {
      solutions.forEach((pair, index) => {
        const card = document.createElement("div");
        card.className = "mitigation-card animate-fade-in";
        card.style.animationDelay = `${index * 100}ms`;
        card.innerHTML = `
          <div class="mitigation-column challenge-side">
            <div class="mitigation-icon-box">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <h4 class="mitigation-title" style="color: var(--amber-color);">Isolated Challenge</h4>
              <p class="mitigation-desc">${escapeHtml(pair.challenge)}</p>
            </div>
          </div>
          <div class="mitigation-column solution-side">
            <div class="mitigation-icon-box">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h4 class="mitigation-title" style="color: var(--emerald-color);">Recommended Mitigation</h4>
              <p class="mitigation-desc">${escapeHtml(pair.solution)}</p>
            </div>
          </div>
        `;
        solutionsList.appendChild(card);
      });
    } else {
      solutionsList.innerHTML = `<p class="card-text">No actionable mitigation matrices found.</p>`;
    }

    // Render SWOT Analysis
    const swotGrid = document.getElementById("swot-grid");
    if (swotGrid) {
      swotGrid.innerHTML = "";
      const swot = data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
      
      const categories = [
        {
          key: "strengths",
          label: "Strengths",
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
          class: "swot-strengths"
        },
        {
          key: "weaknesses",
          label: "Weaknesses",
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
          class: "swot-weaknesses"
        },
        {
          key: "opportunities",
          label: "Opportunities",
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>`,
          class: "swot-opportunities"
        },
        {
          key: "threats",
          label: "Threats",
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
          class: "swot-threats"
        }
      ];

      categories.forEach((cat, index) => {
        const card = document.createElement("div");
        card.className = `swot-card ${cat.class} animate-fade-in`;
        card.style.animationDelay = `${index * 150}ms`;
        
        let listHtml = "";
        const items = Array.isArray(swot[cat.key]) ? swot[cat.key] : [];
        if (items.length > 0) {
          items.forEach(item => {
            listHtml += `
              <li class="swot-item">
                <span class="swot-bullet">•</span>
                <span>${escapeHtml(item)}</span>
              </li>
            `;
          });
        } else {
          listHtml += `<li class="swot-item" style="color: var(--text-dim);">No strategic insights generated.</li>`;
        }

        card.innerHTML = `
          <div class="swot-card-header">
            <div class="swot-icon-wrapper">
              ${cat.icon}
            </div>
            <h4 class="swot-card-title">${cat.label}</h4>
          </div>
          <ul class="swot-list">
            ${listHtml}
          </ul>
        `;
        swotGrid.appendChild(card);
      });
    }

    // Render AI Budget & Timeline Estimator
    const estimatesGrid = document.getElementById("estimates-grid");
    if (estimatesGrid) {
      estimatesGrid.innerHTML = "";
      const estObj = data.estimates || {
        estimatedBudget: "₹4–6 Lakhs",
        estimatedDuration: "4–6 Months",
        recommendedTeamSize: "5 Developers",
        complexityLevel: "Medium",
        estimatedMaintenanceCost: "₹40K / Month"
      };

      const estimationCards = [
        {
          label: "Estimated Budget",
          value: estObj.estimatedBudget,
          icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
        },
        {
          label: "Development Time",
          value: estObj.estimatedDuration,
          icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
        },
        {
          label: "Recommended Team",
          value: estObj.recommendedTeamSize,
          icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
        },
        {
          label: "Complexity",
          value: estObj.complexityLevel,
          icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>`
        },
        {
          label: "Maintenance",
          value: estObj.estimatedMaintenanceCost,
          icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
        }
      ];

      estimationCards.forEach((cardData, idx) => {
        const card = document.createElement("div");
        card.className = "estimate-card animate-fade-in";
        card.style.animationDelay = `${idx * 100}ms`;

        card.innerHTML = `
          <div class="estimate-header">
            <div class="estimate-icon-wrapper">
              ${cardData.icon}
            </div>
            <span class="estimate-label">${cardData.label}</span>
          </div>
          <div class="estimate-value">${escapeHtml(cardData.value)}</div>
        `;
        estimatesGrid.appendChild(card);
      });
    }

    // Typewriter Title execution
    const reportTitle = document.getElementById("report-title");
    if (reportTitle) {
      const projName = extractProjectName(activeProjectIdea);
      runTypewriter(reportTitle, `Feasibility: ${projName}`);
    }
  }

  function animateScoreDisplay(targetScore) {
    if (progressBarFill) {
      setTimeout(() => {
        progressBarFill.style.width = `${targetScore}%`;
      }, 80);
    }

    let currentVal = 0;
    if (scoreDisplay) {
      scoreDisplay.innerText = "0%";
      const duration = 1200;
      const steps = 24;
      const stepTime = duration / steps;
      const stepVal = targetScore / steps;
      
      let tick = 0;
      const countInterval = setInterval(() => {
        tick++;
        currentVal = Math.min(Math.round(stepVal * tick), targetScore);
        scoreDisplay.innerText = `${currentVal}%`;
        
        if (currentVal >= targetScore || tick >= steps) {
          clearInterval(countInterval);
          scoreDisplay.innerText = `${targetScore}%`;
        }
      }, stepTime);
    }
  }

  // Typewriter text animation helper
  function runTypewriter(element, text) {
    if (typewriterTimeout) clearTimeout(typewriterTimeout);
    element.innerText = "";
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerText += text.charAt(i);
        i++;
        typewriterTimeout = setTimeout(type, 35);
      }
    }
    type();
  }

  // ----------------------------------------------------
  // Export Action utility hooks
  // ----------------------------------------------------
  function compileMarkdownReport() {
    if (!activeAuditData) return "";
    const { risks, failureReasons, solutions, confidenceScore } = activeAuditData;

    const investorReadinessScore = typeof activeAuditData.investorReadinessScore === "number" ? activeAuditData.investorReadinessScore : 50;
    const marketPotentialScore = typeof activeAuditData.marketPotentialScore === "number" ? activeAuditData.marketPotentialScore : 50;
    const scalabilityScore = typeof activeAuditData.scalabilityScore === "number" ? activeAuditData.scalabilityScore : 50;
    const revenueModelScore = typeof activeAuditData.revenueModelScore === "number" ? activeAuditData.revenueModelScore : 50;
    const executionFeasibilityScore = typeof activeAuditData.executionFeasibilityScore === "number" ? activeAuditData.executionFeasibilityScore : 50;

    let invVerdict = "High Risk Investment";
    if (investorReadinessScore >= 80) invVerdict = "Investor Ready";
    else if (investorReadinessScore >= 60) invVerdict = "Needs Improvement";
    
    let md = `# De-Risk AI Feasibility Audit — Assessment Log\n\n`;
    md += `**Concept Description:**\n> ${activeProjectIdea}\n\n`;
    md += `**Overall Feasibility rating:** ${confidenceScore}% (${confidenceScore >= 75 ? "Highly Feasible" : (confidenceScore >= 50 ? "Moderate Risk" : "High Risk")})\n\n`;
    md += `**Investor Readiness Score:** ${investorReadinessScore}/100 (${invVerdict})\n`;
    md += `- Market Potential: ${marketPotentialScore}%\n`;
    md += `- Scalability: ${scalabilityScore}%\n`;
    md += `- Revenue Model: ${revenueModelScore}%\n`;
    md += `- Execution Feasibility: ${executionFeasibilityScore}%\n\n`;

    const technicalRisk = typeof activeAuditData.technicalRisk === "number" ? activeAuditData.technicalRisk : 50;
    const budgetRisk = typeof activeAuditData.budgetRisk === "number" ? activeAuditData.budgetRisk : 50;
    const marketRisk = typeof activeAuditData.marketRisk === "number" ? activeAuditData.marketRisk : 50;
    const scalabilityRisk = typeof activeAuditData.scalabilityRisk === "number" ? activeAuditData.scalabilityRisk : 50;
    const operationalRisk = typeof activeAuditData.operationalRisk === "number" ? activeAuditData.operationalRisk : 50;

    const getRiskLevel = (score) => {
      if (score >= 70) return "High";
      if (score >= 40) return "Medium";
      return "Low";
    };

    md += `**Project Risk Heatmap:**\n`;
    md += `- Technical Risk: ${technicalRisk}% (${getRiskLevel(technicalRisk)})\n`;
    md += `- Budget Risk: ${budgetRisk}% (${getRiskLevel(budgetRisk)})\n`;
    md += `- Market Risk: ${marketRisk}% (${getRiskLevel(marketRisk)})\n`;
    md += `- Scalability Risk: ${scalabilityRisk}% (${getRiskLevel(scalabilityRisk)})\n`;
    md += `- Operational Risk: ${operationalRisk}% (${getRiskLevel(operationalRisk)})\n\n`;

    md += `## ⚠️ Critical Failure Triggers\n`;
    
    if (failureReasons && failureReasons.length > 0) {
      failureReasons.forEach((r, idx) => {
        md += `- **[Trigger ${idx + 1}]** ${r}\n`;
      });
    } else {
      md += `No critical vulnerability factors cataloged.\n`;
    }
    
    md += `\n## 🛠️ System Risks Breakdown\n`;
    if (risks && risks.length > 0) {
      risks.forEach((r, idx) => {
        md += `### Risk #${idx + 1}: ${r.risk} (${r.severity} Severity)\n`;
        md += `> ${r.description}\n\n`;
      });
    } else {
      md += `No architectural system failures found.\n`;
    }

    md += `## 🎯 Challenges & mitigations Map\n`;
    if (solutions && solutions.length > 0) {
      solutions.forEach((pair, idx) => {
        md += `### Blocker #${idx + 1}\n`;
        md += `- **Challenge**: ${pair.challenge}\n`;
        md += `- **Recommended Mitigation**: ${pair.solution}\n\n`;
      });
    } else {
      md += `No actionable blocker mitigation schedules suggested.\n`;
    }

    md += `\n## 🚀 AI Implementation Roadmap\n`;
    const roadmap = Array.isArray(activeAuditData.roadmap) ? activeAuditData.roadmap : [];
    if (roadmap.length > 0) {
      roadmap.forEach((phaseData, index) => {
        md += `### ${phaseData.phase} (Duration: ${phaseData.duration})\n`;
        if (Array.isArray(phaseData.tasks)) {
          phaseData.tasks.forEach(t => {
            md += `- ${t}\n`;
          });
        }
        md += `\n`;
      });
    } else {
      md += `No roadmap milestones generated.\n\n`;
    }

    md += `---\n*Generated by De-Risk AI - Startup Feasibility Audit Console*`;
    return md;
  }

  // Copy report to Clipboard
  if (actionCopyBtn) {
    actionCopyBtn.addEventListener("click", () => {
      const mdContent = compileMarkdownReport();
      if (!mdContent) {
        showToast("No active audit report found to copy.", "error");
        return;
      }
      
      navigator.clipboard.writeText(mdContent)
        .then(() => {
          logActivity("Report summary copied to clipboard");
          showToast("Assessment report copied as Markdown!", "success");
        })
        .catch(err => {
          showToast("Failed to write report to clipboard.", "error");
        });
    });
  }

  // Download Report
  if (actionDownloadBtn) {
    actionDownloadBtn.addEventListener("click", () => {
      const mdContent = compileMarkdownReport();
      if (!mdContent) {
        showToast("No active audit report found to download.", "error");
        return;
      }

      const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const projectName = extractProjectName(activeProjectIdea).toLowerCase().replace(/\s+/g, "-");
      link.download = `derisk-audit-${projectName || "report"}.md`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      logActivity("Downloaded markdown diagnostics file");
      showToast("Report download initiated.", "success");
    });
  }

  // Print PDF Dialog
  if (actionPdfBtn) {
    actionPdfBtn.addEventListener("click", () => {
      if (!activeAuditData) {
        showToast("No active audit report found to print.", "error");
        return;
      }
      logActivity("Printer review dialogue triggered");
      window.print();
    });
  }

  // Download jsPDF Report
  if (actionPdfDownloadBtn) {
    actionPdfDownloadBtn.addEventListener("click", () => {
      exportPDFReport();
    });
  }

  function exportPDFReport() {
    if (!activeAuditData) {
      showToast("No active audit report found to export.", "error");
      return;
    }

    let jsPDFClass = null;
    if (window.jspdf && window.jspdf.jsPDF) {
      jsPDFClass = window.jspdf.jsPDF;
    } else if (window.jsPDF) {
      jsPDFClass = window.jsPDF;
    }

    if (!jsPDFClass) {
      showToast("PDF generation library is loading or failed to load. Please check your internet connection.", "error");
      return;
    }

    const { risks, failureReasons, solutions, confidenceScore } = activeAuditData;
    const timestamp = activeAuditData.timestamp || new Date().toLocaleString();
    const projectName = extractProjectName(activeProjectIdea);

    const doc = new jsPDFClass('p', 'mm', 'a4');
    
    const margin = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const maxLineWidth = pageWidth - (margin * 2); // 170 mm
    const bottomMargin = 25;
    
    let y = 25;

    function checkPageSpace(heightNeeded) {
      if (y + heightNeeded > pageHeight - bottomMargin) {
        doc.addPage();
        y = 25;
      }
    }

    function addBodyText(text, fontSize = 9.5, isBold = false, color = '#334155', spacing = 5) {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      if (color.startsWith('#')) {
        const r = parseInt(color.substring(1, 3), 16);
        const g = parseInt(color.substring(3, 5), 16);
        const b = parseInt(color.substring(5, 7), 16);
        doc.setTextColor(r, g, b);
      } else {
        doc.setTextColor(51, 65, 85);
      }
      
      const lines = doc.splitTextToSize(text, maxLineWidth);
      lines.forEach(line => {
        checkPageSpace(spacing);
        doc.text(line, margin, y);
        y += spacing;
      });
    }

    function addSectionHeading(title) {
      checkPageSpace(18);
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text(title, margin, y);
      
      // Underline
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(margin, y + 2.5, pageWidth - margin, y + 2.5);
      
      y += 8;
    }

    function drawSummaryCard(projectName, timestamp, confidenceScore, riskLevel, successProbability) {
      checkPageSpace(45);
      
      const cardY = y;
      const cardHeight = 35;
      
      // Background fill
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, cardY, maxLineWidth, cardHeight, 'F');
      
      // Border
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.rect(margin, cardY, maxLineWidth, cardHeight, 'S');
      
      // Draw content inside card
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105); // slate-600
      
      doc.text("Project Name:", margin + 6, cardY + 8);
      doc.text("Analysis Date:", margin + 6, cardY + 15);
      doc.text("Risk Level:", margin + 6, cardY + 22);
      
      doc.text("Confidence Score:", margin + 90, cardY + 8);
      doc.text("Success Probability:", margin + 90, cardY + 15);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42); // slate-900
      
      // Project Name wrapping if too long
      const truncatedProjName = projectName.length > 35 ? projectName.substring(0, 32) + "..." : projectName;
      doc.text(truncatedProjName, margin + 32, cardY + 8);
      doc.text(timestamp, margin + 32, cardY + 15);
      
      // Color-coded Risk Level
      let riskColor = '#d97706'; // amber
      if (riskLevel === "Low Risk" || riskLevel === "Low") {
        riskColor = '#059669'; // emerald
      } else if (riskLevel === "High Risk" || riskLevel === "High") {
        riskColor = '#e11d48'; // rose
      }
      doc.setFont('helvetica', 'bold');
      const r = parseInt(riskColor.substring(1, 3), 16);
      const g = parseInt(riskColor.substring(3, 5), 16);
      const b = parseInt(riskColor.substring(5, 7), 16);
      doc.setTextColor(r, g, b);
      doc.text(riskLevel, margin + 32, cardY + 22);
      
      // Confidence Score and Success Probability
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(`${confidenceScore}%`, margin + 125, cardY + 8);
      doc.text(`${successProbability}%`, margin + 128, cardY + 15);
      
      y += cardHeight + 5;
    }

    function addRiskBlock(riskName, severity, description) {
      checkPageSpace(25);
      
      let badgeColor = '#d97706'; // amber
      if (severity.toLowerCase() === 'high') badgeColor = '#e11d48';
      if (severity.toLowerCase() === 'low') badgeColor = '#059669';
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(riskName, margin, y);
      
      const titleWidth = doc.getTextWidth(riskName);
      
      doc.setFontSize(8);
      const r = parseInt(badgeColor.substring(1, 3), 16);
      const g = parseInt(badgeColor.substring(3, 5), 16);
      const b = parseInt(badgeColor.substring(5, 7), 16);
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${severity}]`, margin + titleWidth + 3, y - 0.5);
      
      y += 5;
      
      addBodyText(description, 9.2, false, '#475569', 4.5);
      y += 2.5;
    }

    function addChallengeSolutionBlock(idx, challenge, solution) {
      checkPageSpace(25);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Blocker Challenge #${idx}`, margin, y);
      y += 5;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text("Challenge:", margin + 3, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const cLines = doc.splitTextToSize(challenge, maxLineWidth - 25);
      cLines.forEach(line => {
        checkPageSpace(4.5);
        doc.text(line, margin + 23, y);
        y += 4.5;
      });
      
      y += 1;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text("Recommendation:", margin + 3, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const sLines = doc.splitTextToSize(solution, maxLineWidth - 32);
      sLines.forEach(line => {
        checkPageSpace(4.5);
        doc.text(line, margin + 30, y);
        y += 4.5;
      });
      
      y += 3;
    }

    // Draw top branding band
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, pageWidth, 5, 'F');
    
    y = 20;
    
    // Header Title
    addBodyText("DE-RISK AI CONSULTING GROUP", 8.5, true, '#4f46e5', 5);
    addBodyText("FEASIBILITY ASSESSMENT & DIAGNOSTIC REPORT", 16, true, '#0f172a', 8);
    y += 4;

    // Determine Risk Level string
    let riskLevelStr = "Moderate Risk";
    if (confidenceScore >= 75) {
      riskLevelStr = "Low Risk";
    } else if (confidenceScore < 50) {
      riskLevelStr = "High Risk";
    }

    // Draw Summary Grid Block
    drawSummaryCard(projectName, timestamp, confidenceScore, riskLevelStr, confidenceScore);

    // Section 1: Project Concept Description
    addSectionHeading("1. PROJECT CONCEPT DESCRIPTION");
    addBodyText(activeProjectIdea, 9.5, false, '#334155', 5);
    y += 5;

    // Section 2: Risks
    addSectionHeading("2. CRITICAL CONCEPTUAL RISKS");
    if (risks && risks.length > 0) {
      risks.forEach(riskObj => {
        addRiskBlock(riskObj.risk, riskObj.severity || "Medium", riskObj.description);
      });
    } else {
      addBodyText("No significant technical or conceptual risks detected for this layout.", 9.5, false, '#64748b', 5);
      y += 4;
    }
    y += 3;

    // Section 3: Challenges & Recommendations
    addSectionHeading("3. BLOCKER CHALLENGES & RECOMMENDED MITIGATIONS");
    if (solutions && solutions.length > 0) {
      solutions.forEach((pair, index) => {
        addChallengeSolutionBlock(index + 1, pair.challenge, pair.solution);
      });
    } else {
      addBodyText("No critical blocker challenges or mitigation actions isolated.", 9.5, false, '#64748b', 5);
      y += 4;
    }
    y += 6;

    // Section 4: Confidential Disclaimer Note
    checkPageSpace(20);
    addBodyText("CONFIDENTIAL NOTICE", 8, true, '#94a3b8', 4);
    addBodyText("This document contains automated conceptual diagnostics compiled by artificial intelligence engines based on startup heuristics. Findings represent speculative software modeling and structural validation checklists.", 7.8, false, '#94a3b8', 3.8);

    // Post-process pages to add page headers and footers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Page Header Line & text
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(margin, 12, pageWidth - margin, 12);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("De-Risk AI — Enterprise Feasibility Report", margin, 9);
      
      // Page Footer Line & text
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      
      doc.text("Generated by De-Risk AI", margin, pageHeight - 8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 8);
    }

    doc.save("De-Risk-AI-Report.pdf");
    
    logActivity("Exported audit report as PDF file");
    showToast("PDF Report Downloaded Successfully", "success");
  }

  // ----------------------------------------------------
  // Analytics Dashboard Core Logic
  // ----------------------------------------------------
  let trendChartInstance = null;
  let distChartInstance = null;

  const searchInput = document.getElementById("analytics-search-input");
  const sortSelect = document.getElementById("analytics-sort-select");
  const tableBody = document.getElementById("analytics-table-body");

  function getTimestampMs(item) {
    if (item.timestampMs) return item.timestampMs;
    if (item.id && item.id.startsWith("record_")) {
      const parts = item.id.split("_");
      if (parts[1]) {
        const ms = parseInt(parts[1], 10);
        if (!isNaN(ms)) return ms;
      }
    }
    const parsed = Date.parse(item.timestamp);
    return isNaN(parsed) ? 0 : parsed;
  }

  function renderDistributionChart(high, medium, low) {
    const ctx = document.getElementById("distributionChart");
    if (!ctx) return;

    if (distChartInstance) {
      distChartInstance.destroy();
      distChartInstance = null;
    }

    const hasData = high > 0 || medium > 0 || low > 0;
    const displayData = hasData ? [high, medium, low] : [1, 1, 1];
    const displayColors = hasData
      ? [
          'hsl(346, 87%, 57%)', // Rose
          'hsl(38, 95%, 48%)',  // Amber
          'hsl(142, 76%, 45%)'   // Emerald
        ]
      : [
          'rgba(255, 255, 255, 0.05)',
          'rgba(255, 255, 255, 0.05)',
          'rgba(255, 255, 255, 0.05)'
        ];

    distChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['High Risk', 'Medium Risk', 'Low Risk'],
        datasets: [{
          data: displayData,
          backgroundColor: displayColors,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
          hoverOffset: hasData ? 4 : 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#9ca3af',
              font: {
                family: "'Inter', sans-serif",
                size: 11,
                weight: '500'
              },
              padding: 15
            }
          },
          tooltip: {
            enabled: hasData,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#9ca3af',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            titleFont: { family: "'Outfit', sans-serif", weight: 'bold' },
            bodyFont: { family: "'Inter', sans-serif" }
          }
        },
        cutout: '65%'
      }
    });
  }

  function renderTrendChart(history) {
    const ctx = document.getElementById("trendChart");
    if (!ctx) return;

    if (trendChartInstance) {
      trendChartInstance.destroy();
      trendChartInstance = null;
    }

    const reversedHistory = history.slice().reverse();
    const hasData = reversedHistory.length > 0;
    
    const labels = hasData 
      ? reversedHistory.map(item => item.projectName) 
      : ['No Analyses Run', 'No Analyses Run', 'No Analyses Run'];
    const dataPoints = hasData 
      ? reversedHistory.map(item => item.data.confidenceScore || 50) 
      : [0, 0, 0];

    const canvasContext = ctx.getContext('2d');
    let gradient = null;
    if (canvasContext) {
      gradient = canvasContext.createLinearGradient(0, 0, 0, 250);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
    }

    trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Confidence Score',
          data: dataPoints,
          borderColor: hasData ? 'hsl(250, 84%, 63%)' : 'rgba(255, 255, 255, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: hasData ? 'hsl(250, 84%, 63%)' : 'transparent',
          pointBorderColor: '#ffffff',
          pointBorderWidth: hasData ? 1 : 0,
          pointRadius: hasData ? 4 : 0,
          pointHoverRadius: hasData ? 6 : 0,
          fill: true,
          backgroundColor: hasData ? (gradient || 'rgba(99, 102, 241, 0.1)') : 'transparent',
          tension: 0.35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: hasData,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#9ca3af',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            titleFont: { family: "'Outfit', sans-serif", weight: 'bold' },
            bodyFont: { family: "'Inter', sans-serif" },
            callbacks: {
              label: function(context) {
                return ` Feasibility Rating: ${context.parsed.y}%`;
              }
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.03)',
              drawBorder: false
            },
            ticks: {
              color: '#9ca3af',
              font: { family: "'Inter', sans-serif", size: 10 },
              callback: function(value) {
                return value + '%';
              }
            }
          },
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              color: '#9ca3af',
              font: { family: "'Inter', sans-serif", size: 10 },
              maxRotation: 15,
              autoSkip: true,
              maxTicksLimit: 8
            }
          }
        }
      }
    });
  }

  function renderAnalyticsTable() {
    if (!tableBody) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const sortVal = sortSelect ? sortSelect.value : "date-desc";
    
    let history = getHistory();

    if (query) {
      history = history.filter(item => {
        return item.projectName.toLowerCase().includes(query) || 
               item.idea.toLowerCase().includes(query);
      });
    }

    history.sort((a, b) => {
      const scoreA = a.data.confidenceScore || 50;
      const scoreB = b.data.confidenceScore || 50;
      const timeA = getTimestampMs(a);
      const timeB = getTimestampMs(b);

      if (sortVal === "date-desc") {
        return timeB - timeA;
      } else if (sortVal === "date-asc") {
        return timeA - timeB;
      } else if (sortVal === "score-desc") {
        return scoreB - scoreA;
      } else if (sortVal === "score-asc") {
        return scoreA - scoreB;
      }
      return 0;
    });

    tableBody.innerHTML = "";

    if (history.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 4rem 1rem;">
            <div class="empty-state-container">
              <div class="empty-state-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h4 class="empty-state-title">No search matches</h4>
              <p class="empty-state-desc">No assessment files matched your active database keywords.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    history.forEach(item => {
      const score = item.data.confidenceScore || 50;
      let riskLevel = "Medium";
      let riskClass = "medium";
      if (score >= 75) {
        riskLevel = "Low";
        riskClass = "low";
      } else if (score < 50) {
        riskLevel = "High";
        riskClass = "high";
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div class="project-cell-name" title="${escapeHtml(item.projectName)}">
            ${escapeHtml(item.projectName)}
          </div>
        </td>
        <td>${escapeHtml(item.timestamp)}</td>
        <td>
          <span class="score-value-bold ${score >= 75 ? 'text-emerald' : (score < 50 ? 'text-rose' : 'text-amber')}">
            ${score}%
          </span>
        </td>
        <td>
          <span class="badge-risk ${riskClass}">
            ${riskLevel}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn-table-action" data-id="${item.id}">View Details</button>
        </td>
      `;

      const viewBtn = row.querySelector(".btn-table-action");
      if (viewBtn) {
        viewBtn.addEventListener("click", () => {
          loadAuditRecord(item);
        });
      }

      tableBody.appendChild(row);
    });
  }

  function updateAnalytics() {
    const history = getHistory();
    const totalAnalyses = history.length;
    
    let sumConfidence = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let lastAnalysisDate = "No audits run";
    
    history.forEach(item => {
      const score = item.data.confidenceScore || 50;
      sumConfidence += score;
      if (score < 50) {
        highRiskCount++;
      } else if (score < 75) {
        mediumRiskCount++;
      } else {
        lowRiskCount++;
      }
    });

    const avgConfidence = totalAnalyses > 0 ? Math.round(sumConfidence / totalAnalyses) : 0;
    const avgRiskScore = totalAnalyses > 0 ? 100 - avgConfidence : 0;
    
    if (totalAnalyses > 0) {
      lastAnalysisDate = history[0].timestamp;
    }

    const analyticsTotalAudits = document.getElementById("analytics-total-audits");
    const analyticsAvgScore = document.getElementById("analytics-avg-score");
    const analyticsHighRisks = document.getElementById("analytics-high-risks");
    const analyticsLowRisks = document.getElementById("analytics-low-risks");

    if (analyticsTotalAudits) analyticsTotalAudits.innerText = totalAnalyses;
    if (analyticsAvgScore) analyticsAvgScore.innerText = `${avgConfidence}%`;
    if (analyticsHighRisks) analyticsHighRisks.innerText = highRiskCount;
    if (analyticsLowRisks) analyticsLowRisks.innerText = lowRiskCount;

    const telemetryTotalReports = document.getElementById("telemetry-total-reports");
    const telemetryLastDate = document.getElementById("telemetry-last-date");
    const telemetryAvgRiskScore = document.getElementById("telemetry-avg-risk-score");

    if (telemetryTotalReports) telemetryTotalReports.innerText = totalAnalyses;
    if (telemetryLastDate) telemetryLastDate.innerText = lastAnalysisDate;
    if (telemetryAvgRiskScore) telemetryAvgRiskScore.innerText = `${avgRiskScore}%`;

    renderAnalyticsTable();
    renderDistributionChart(highRiskCount, mediumRiskCount, lowRiskCount);
    renderTrendChart(history);
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderAnalyticsTable);
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", renderAnalyticsTable);
  }

  // ----------------------------------------------------
  // Dashboard Recent Analyses Panel Logic
  // ----------------------------------------------------
  const dbSearchInput = document.getElementById("dashboard-search-input");
  const dbTableBody = document.getElementById("dashboard-recent-table-body");
  const dbClearAllBtn = document.getElementById("dashboard-clear-all-btn");

  function renderDashboardRecentTable() {
    if (!dbTableBody) return;

    const query = dbSearchInput ? dbSearchInput.value.toLowerCase().trim() : "";
    let history = getHistory();

    if (query) {
      history = history.filter(item => {
        return item.projectName.toLowerCase().includes(query) || 
               item.idea.toLowerCase().includes(query);
      });
    }

    dbTableBody.innerHTML = "";

    if (history.length === 0) {
      dbTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 4rem 1rem;">
            <div class="empty-state-container">
              <div class="empty-state-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
              </div>
              <h4 class="empty-state-title">No assessment history</h4>
              <p class="empty-state-desc">Your recent project feasibility assessments will be cataloged here.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    history.forEach(item => {
      const score = item.data.confidenceScore || 50;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div class="project-cell-name" style="cursor: pointer;" title="${escapeHtml(item.projectName)}">
            ${escapeHtml(item.projectName)}
          </div>
        </td>
        <td>${escapeHtml(item.timestamp)}</td>
        <td>
          <span class="score-value-bold ${score >= 75 ? 'text-emerald' : (score < 50 ? 'text-rose' : 'text-amber')}">
            ${score}%
          </span>
        </td>
        <td style="text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end; align-items: center;">
          <button class="btn-table-action" data-id="${item.id}" style="padding: 0.35rem 0.65rem;">View</button>
          <button class="btn-delete-history-item" data-id="${item.id}" title="Delete record" style="padding: 0.35rem; display: flex; align-items: center; justify-content: center; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 4px; color: var(--rose-color); cursor: pointer;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </td>
      `;

      row.querySelector(".project-cell-name").addEventListener("click", () => {
        loadAuditRecord(item);
      });

      row.querySelector(".btn-table-action").addEventListener("click", () => {
        loadAuditRecord(item);
      });

      row.querySelector(".btn-delete-history-item").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteHistoryItem(item.id);
      });

      dbTableBody.appendChild(row);
    });
  }

  if (dbSearchInput) {
    dbSearchInput.addEventListener("input", renderDashboardRecentTable);
  }
  if (dbClearAllBtn) {
    dbClearAllBtn.addEventListener("click", clearAllHistory);
  }

  // Initial call to draw dashboards
  updateAnalytics();
  renderDashboardRecentTable();

  // HTML escaping helper
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
