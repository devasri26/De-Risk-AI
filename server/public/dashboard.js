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
  // 1. Authenticated Router Guard
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    localStorage.clear();
    window.location.href = "login.html";
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
      historySidebarList.innerHTML = `<div class="history-empty-text">No reports logged.</div>`;
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
        window.location.href = "login.html";
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
            window.location.href = "login.html";
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
    const { risks, failureReasons, solutions } = data;
    const confidenceScore = typeof data.confidenceScore === "number" ? data.confidenceScore : 50;

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
    
    let md = `# De-Risk AI Feasibility Audit — Assessment Log\n\n`;
    md += `**Concept Description:**\n> ${activeProjectIdea}\n\n`;
    md += `**Overall Feasibility rating:** ${confidenceScore}% (${confidenceScore >= 75 ? "Highly Feasible" : (confidenceScore >= 50 ? "Moderate Risk" : "High Risk")})\n\n`;
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

    const { risks, failureReasons, solutions, confidenceScore, timestamp } = activeAuditData;
    const projectName = extractProjectName(activeProjectIdea);

    const doc = new jsPDFClass('p', 'mm', 'a4');
    
    const margin = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const maxLineWidth = pageWidth - (margin * 2); // 170 mm
    
    let y = 25;

    // Helper to draw the header decoration on each page
    function drawPageHeader() {
      doc.setDrawColor(99, 102, 241); // indigo
      doc.setLineWidth(0.5);
      doc.line(margin, 12, pageWidth - margin, 12);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // gray-400
      doc.text("De-Risk AI — Conceptual Feasibility Audit Report", margin, 10);
      
      const pageCount = doc.getNumberOfPages();
      doc.text(`Page ${pageCount}`, pageWidth - margin - 12, 10);
    }

    // Helper to add text and wrap pages
    function addText(text, size = 10, isBold = false, color = '#334155', lineSpacing = 5.5) {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(size);
      
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
        if (y + lineSpacing > 275) {
          doc.addPage();
          drawPageHeader();
          y = 25;
        }
        doc.text(line, margin, y);
        y += lineSpacing;
      });
    }

    // Draw first page header
    drawPageHeader();

    // 1. Report Header Brand & Title
    addText("DE-RISK AI CONSULTING GROUP", 9, true, '#6366f1');
    y += 1.5;
    addText("CONCEPT FEASIBILITY DIAGNOSTIC REPORT", 16, true, '#0f172a', 7);
    y += 4;

    // Metadata Block (Table-like details)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    
    // Draw background rectangle for metadata
    const metaY = y - 2;
    const metaHeight = 30;
    doc.rect(margin, metaY, maxLineWidth, metaHeight, 'FD');
    
    // Write metadata items inside the rounded rect
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text("Project Name:", margin + 5, metaY + 8);
    doc.text("Audit Time:", margin + 5, metaY + 15);
    doc.text("Confidence Score:", margin + 5, metaY + 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(projectName, margin + 40, metaY + 8);
    doc.text(timestamp || new Date().toLocaleString(), margin + 40, metaY + 15);

    // Color-coded rating output
    const ratingText = `${confidenceScore}%`;
    let ratingColor = '#d97706'; // amber
    let ratingLabel = "Moderate Risk";
    if (confidenceScore >= 75) {
      ratingColor = '#059669'; // emerald
      ratingLabel = "Highly Feasible";
    } else if (confidenceScore < 50) {
      ratingColor = '#e11d48'; // rose
      ratingLabel = "High Risk";
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${ratingText} (${ratingLabel})`, margin + 40, metaY + 22);
    
    // Restore text color to slate
    doc.setTextColor(51, 65, 85);
    y = metaY + metaHeight + 8;

    // 2. Section: Description
    addText("1. PROJECT CONCEPT & DESCRIPTION", 11, true, '#6366f1');
    y += 1.5;
    addText(activeProjectIdea, 9.5, false, '#334155');
    y += 6;

    // 3. Section: Triggers
    addText("2. CRITICAL FAILURE TRIGGERS", 11, true, '#6366f1');
    y += 2.5;
    
    if (failureReasons && failureReasons.length > 0) {
      failureReasons.forEach((reason, index) => {
        addText(`  ${index + 1}.  ${reason}`, 9.5, false, '#334155');
        y += 1.5;
      });
      y += 4;
    } else {
      addText("No failure triggers isolated by conceptual scanner.", 9.5, false, '#64748b');
      y += 6;
    }

    // 4. Section: Risks
    addText("3. SYSTEM RISK BREAKDOWN", 11, true, '#6366f1');
    y += 2.5;

    if (risks && risks.length > 0) {
      risks.forEach((riskObj, index) => {
        const sev = riskObj.severity || "Medium";
        let sevColor = '#d97706'; // amber
        if (sev.toLowerCase() === 'high') sevColor = '#e11d48';
        if (sev.toLowerCase() === 'low') sevColor = '#059669';

        addText(`Risk #${index + 1}: ${riskObj.risk}`, 10, true, '#0f172a');
        y += 1.2;
        addText(`Severity: ${sev}`, 9, true, sevColor);
        y += 1.2;
        addText(riskObj.description, 9.5, false, '#475569');
        y += 4.5;
      });
      y += 2.5;
    } else {
      addText("No architectural engineering risks detected in concept workspace.", 9.5, false, '#64748b');
      y += 6;
    }

    // 5. Section: Challenges & Mitigations
    addText("4. CHALLENGES & RECOMMENDED MITIGATIONS", 11, true, '#6366f1');
    y += 2.5;

    if (solutions && solutions.length > 0) {
      solutions.forEach((pair, index) => {
        addText(`Isolated Blocker #${index + 1}`, 10, true, '#0f172a');
        y += 1.2;
        addText(`Challenge: ${pair.challenge}`, 9.5, false, '#475569');
        y += 1.2;
        addText(`Recommended Solution: ${pair.solution}`, 9.5, true, '#059669');
        y += 4.5;
      });
      y += 3;
    } else {
      addText("No core blocker mitigation strategies mapped.", 9.5, false, '#64748b');
      y += 6;
    }

    // Final Footer Note
    addText("CONFIDENTIAL NOTICE", 8, true, '#94a3b8');
    y += 1;
    addText("This document contains conceptual system blueprints generated by artificial intelligence. Results represent speculative architectural modeling and are intended solely for validation testing under pilot environments.", 8, false, '#94a3b8', 4);

    // Save File
    doc.save("project-analysis-report.pdf");
    
    logActivity("Exported audit report as PDF file");
    showToast("PDF report downloaded successfully!", "success");
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
          <td colspan="5" style="text-align: center; color: var(--text-dim); padding: 3rem 0;">
            No reports match the active workspace filters.
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
          <td colspan="4" style="text-align: center; color: var(--text-dim); padding: 2.5rem 0;">
            No recent analyses found.
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
