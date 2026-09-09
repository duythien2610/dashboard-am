/**
 * FPT TELECOM — SALES OPERATIONS PORTAL (SOP)
 * AFFILIATE MARKETING DASHBOARD APP LOGIC
 * Clean, Corporate, High Performance, Zero Emojis
 */

(function () {
  'use strict';

  // State
  const state = {
    period: 't8', // 't8', 't7', 'cmp', 'year2026'
    segment: 'day', // 'day', 'week', 'month', 'year'
    region: 'all',
    branch: 'all',
    fromDate: '2026-08-01',
    toDate: '2026-08-31',
    salesTab: 'all', // 'all', 'active', 'inactive'
    salesRegionFilter: 'all',
    salesSearch: '',
    salesSortCol: 'clicks', // 'clicks', 'lead', 'don', 'name'
    salesSortAsc: false,
    salesSortCol: 'clicks', // 'clicks', 'lead', 'don', 'name'
    salesSortAsc: false,
    charts: {}
  };

  // Helper Formatters
  function n(val) {
    return Math.round(Number(val) || 0).toLocaleString('en-US');
  }

  function f1(val) {
    return (Math.round((Number(val) || 0) * 10) / 10).toFixed(1);
  }

  function formatMoney(amount) {
    if (!amount || isNaN(amount) || amount === 0) return '0 đ';
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(2) + ' Tỷ';
    }
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + ' Tr';
    }
    return n(amount) + ' đ';
  }


  function getData(key) {
    return window.FPT_MONTHS ? window.FPT_MONTHS[key] : null;
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    initRegionDropdown();
    bindEvents();
    renderDashboard();
  });

  function bindEvents() {
    // Period tab buttons
    document.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.period = this.dataset.period;
        updateDateInputsForPeriod(state.period);
        renderDashboard();
      });
    });

    // Segment buttons: Ngày, Tuần, Tháng, Năm
    document.querySelectorAll('[data-segment]').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-segment]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.segment = this.dataset.segment;
        updateCharts();
      });
    });

    // Quick range buttons
    document.querySelectorAll('[data-quick]').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-quick]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        handleQuickFilter(this.dataset.quick);
      });
    });

    // Region & Branch cascade
    const regionSelect = document.getElementById('regionSelect');
    if (regionSelect) {
      regionSelect.addEventListener('change', function () {
        state.region = this.value;
        updateBranchDropdown(this.value);
      });
    }

    const branchSelect = document.getElementById('branchSelect');
    if (branchSelect) {
      branchSelect.addEventListener('change', function () {
        state.branch = this.value;
      });
    }

    // Filter Buttons
    const btnApply = document.getElementById('btnApplyFilter');
    if (btnApply) {
      btnApply.addEventListener('click', function () {
        const fromVal = document.getElementById('inputFromDate').value;
        const toVal = document.getElementById('inputToDate').value;
        const errEl = document.getElementById('dateFilterError');
        const wrapper = document.querySelector('.filter-input-wrapper');

        if (errEl) {
          errEl.style.display = 'none';
          errEl.textContent = '';
        }
        if (wrapper) wrapper.style.borderColor = '';

        if (fromVal && toVal) {
          const dFrom = new Date(fromVal);
          const dTo = new Date(toVal);
          const dToday = new Date('2026-08-31');

          if (dFrom > dTo) {
            showDateError('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
            return;
          }
          if (dTo > dToday) {
            showDateError('Ngày kết thúc không được vượt quá ngày hiện tại.');
            return;
          }
          const diffDays = Math.round((dTo - dFrom) / (1000 * 60 * 60 * 24));
          if (diffDays > 365) {
            showDateError('Khoảng thời gian tra cứu tối đa là 365 ngày (hiện tại: ' + diffDays + ' ngày).');
            return;
          }

          state.fromDate = fromVal;
          state.toDate = toVal;
        }
        renderDashboard();
      });
    }

    function showDateError(msg) {
      const errEl = document.getElementById('dateFilterError');
      const wrapper = document.querySelector('.filter-input-wrapper');
      if (errEl) {
        errEl.textContent = '• ' + msg;
        errEl.style.display = 'block';
      }
      if (wrapper) {
        wrapper.style.borderColor = '#dc2626';
      }
    }

    const btnReset = document.getElementById('btnResetFilter');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        const errEl = document.getElementById('dateFilterError');
        const wrapper = document.querySelector('.filter-input-wrapper');
        if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
        if (wrapper) wrapper.style.borderColor = '';

        state.period = 't8';
        state.segment = 'day';
        state.region = 'all';
        state.branch = 'all';
        state.fromDate = '2026-08-01';
        state.toDate = '2026-08-31';
        
        // Reset UI controls
        document.querySelectorAll('[data-period]').forEach(b => b.classList.toggle('active', b.dataset.period === 't8'));
        document.querySelectorAll('[data-segment]').forEach(b => b.classList.toggle('active', b.dataset.segment === 'day'));
        document.getElementById('regionSelect').value = 'all';
        updateBranchDropdown('all');
        updateDateInputsForPeriod('t8');
        renderDashboard();
      });
    }

    // Sales Tabs
    document.querySelectorAll('[data-sales-tab]').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-sales-tab]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.salesTab = this.dataset.salesTab;
        renderSalesTable();
      });
    });

    // Sales Search
    const salesSearchInput = document.getElementById('salesSearchInput');
    if (salesSearchInput) {
      salesSearchInput.addEventListener('input', function () {
        state.salesSearch = this.value.trim().toLowerCase();
        renderSalesTable();
      });
    }

    const salesRegionSelect = document.getElementById('salesRegionSelect');
    if (salesRegionSelect) {
      salesRegionSelect.addEventListener('change', function () {
        state.salesRegionFilter = this.value;
        renderSalesTable();
      });
    }

    // Export Excel / CSV button
    
  }

  // =========================================================================
  // REGION & BRANCH CASCADE
  // =========================================================================
  function initRegionDropdown() {
    const regionSelect = document.getElementById('regionSelect');
    if (!regionSelect || !window.FPT_REGIONS_BRANCHES) return;
    
    regionSelect.innerHTML = '';
    for (const [key, obj] of Object.entries(window.FPT_REGIONS_BRANCHES)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = obj.name;
      regionSelect.appendChild(opt);
    }
    updateBranchDropdown('all');
  }

  function updateBranchDropdown(regionKey) {
    const branchSelect = document.getElementById('branchSelect');
    if (!branchSelect || !window.FPT_REGIONS_BRANCHES) return;
    
    branchSelect.innerHTML = '';
    const branches = (window.FPT_REGIONS_BRANCHES[regionKey] || window.FPT_REGIONS_BRANCHES.all).branches;
    branches.forEach((b, idx) => {
      const opt = document.createElement('option');
      opt.value = idx === 0 ? 'all' : b;
      opt.textContent = b;
      branchSelect.appendChild(opt);
    });
    state.branch = 'all';
  }

  function updateDateInputsForPeriod(periodKey) {
    const fromInput = document.getElementById('inputFromDate');
    const toInput = document.getElementById('inputToDate');
    if (!fromInput || !toInput) return;

    if (periodKey === 't8') {
      fromInput.value = '2026-08-01';
      toInput.value = '2026-08-31';
    } else if (periodKey === 't7') {
      fromInput.value = '2026-07-01';
      toInput.value = '2026-07-31';
    } else if (periodKey === 'cmp') {
      fromInput.value = '2026-07-01';
      toInput.value = '2026-08-31';
    } else if (periodKey === 'year2026') {
      fromInput.value = '2026-01-01';
      toInput.value = '2026-12-31';
    }
    state.fromDate = fromInput.value;
    state.toDate = toInput.value;
  }

  function handleQuickFilter(quickType) {
    const fromInput = document.getElementById('inputFromDate');
    const toInput = document.getElementById('inputToDate');
    if (quickType === 'today') {
      fromInput.value = '2026-08-31';
      toInput.value = '2026-08-31';
    } else if (quickType === '7d') {
      fromInput.value = '2026-08-25';
      toInput.value = '2026-08-31';
    } else if (quickType === '30d') {
      fromInput.value = '2026-08-01';
      toInput.value = '2026-08-31';
    } else if (quickType === 'month') {
      fromInput.value = '2026-08-01';
      toInput.value = '2026-08-31';
      state.period = 't8';
    } else if (quickType === 'prev_month') {
      fromInput.value = '2026-07-01';
      toInput.value = '2026-07-31';
      state.period = 't7';
    } else if (quickType === 'year') {
      fromInput.value = '2026-01-01';
      toInput.value = '2026-12-31';
      state.period = 'year2026';
    }
    state.fromDate = fromInput.value;
    state.toDate = toInput.value;
    renderDashboard();
  }

  // =========================================================================
  // MAIN DASHBOARD RENDERER
  // =========================================================================
  function renderDashboard() {
    const curData = getData(state.period === 'cmp' ? 't8' : state.period) || getData('t8');
    const prevData = getData('t7');

    renderHeaderInfo(curData);
    renderKPICards(curData, prevData);
    updateCharts();
    renderGA4Section(curData);
    renderSalesTable();
    renderLeaderboards(curData);
  }

  function renderHeaderInfo(d) {
    const elTitle = document.getElementById('headerTitleRange');
    if (elTitle) {
      elTitle.textContent = state.period === 'cmp' ? 'So Sánh T7 vs T8/2026 (Like-for-like)' : (d.label + ' (' + d.range + ')');
    }
    const elBadge = document.getElementById('headerStatusBadge');
    if (elBadge) {
      elBadge.textContent = state.period === 'year2026' ? 'Toàn Hệ Thống 2026' : (state.period === 'cmp' ? 'Đối Soát Hai Kỳ' : 'Kỳ Báo Cáo Chuẩn');
    }
  }

  // =========================================================================
  // 5 CORE KPI CARDS RENDERER (UC 1)
  // =========================================================================
  
  // =========================================================================
  // EXECUTIVE FUNNEL & FINANCIAL OVERVIEW (NHÓM 1 - BAN GIÁM ĐỐC)
  // =========================================================================
  function renderKPICards(cur, prev) {
    const isCmp = state.period === 'cmp';
    const isYear = state.period === 'year2026';

    // 1. Clicks Thật
    const clicksVal = cur.clicksReal;
    const clicksPrev = prev.clicksReal;
    const clicksDeltaPct = clicksPrev ? ((clicksVal - clicksPrev) / clicksPrev) * 100 : 0;
    
    document.getElementById('kpiClicksVal').textContent = n(clicksVal);
    const badgeClicks = document.getElementById('kpiClicksBadge');
    if (badgeClicks) {
      if (isYear) {
        badgeClicks.className = 'kpi-growth-badge growth-up';
        badgeClicks.textContent = '+18.4% YoY';
      } else {
        badgeClicks.className = clicksDeltaPct >= 0 ? 'kpi-growth-badge growth-up' : 'kpi-growth-badge growth-down';
        badgeClicks.textContent = (clicksDeltaPct >= 0 ? '+' : '') + f1(clicksDeltaPct) + '% [upto]';
      }
    }
    document.getElementById('kpiClicksBot').textContent = 'Loại trừ ' + n(cur.bot) + ' bot tự động';

    // 2. Khách Hàng Tiềm Năng (Leads)
    const leadVal = cur.lead;
    const leadPrev = prev.lead;
    const leadDeltaPct = leadPrev ? ((leadVal - leadPrev) / leadPrev) * 100 : 0;
    
    document.getElementById('kpiLeadVal').textContent = n(leadVal);
    const badgeLead = document.getElementById('kpiLeadBadge');
    if (badgeLead) {
      if (isYear) {
        badgeLead.className = 'kpi-growth-badge growth-up';
        badgeLead.textContent = '+12.5% YoY';
      } else {
        badgeLead.className = leadDeltaPct >= 0 ? 'kpi-growth-badge growth-up' : 'kpi-growth-badge growth-down';
        badgeLead.textContent = (leadDeltaPct >= 0 ? '+' : '') + f1(leadDeltaPct) + '% [upto]';
      }
    }

    // 3. Tổng Đơn Hàng Online
    const donVal = cur.don;
    const donPrev = prev.don;
    const donDeltaPct = donPrev ? ((donVal - donPrev) / donPrev) * 100 : 0;

    document.getElementById('kpiDonVal').textContent = n(donVal);
    const badgeDon = document.getElementById('kpiDonBadge');
    if (badgeDon) {
      if (isYear) {
        badgeDon.className = 'kpi-growth-badge growth-up';
        badgeDon.textContent = '+24.1% YoY';
      } else {
        badgeDon.className = donDeltaPct >= 0 ? 'kpi-growth-badge growth-up' : 'kpi-growth-badge growth-down';
        badgeDon.textContent = (donDeltaPct >= 0 ? '+' : '') + f1(donDeltaPct) + '% [upto]';
      }
    }

    // Mini Breakdown đơn
    const elBreakdown = document.getElementById('kpiDonBreakdown');
    if (elBreakdown && cur.orderStatus) {
      elBreakdown.innerHTML = cur.orderStatus.slice(0, 3).map(st => `
        <div class="kpi-breakdown-row">
          <span>${st.name}</span>
          <span class="val">${n(st.count)}</span>
        </div>
      `).join('');
    }

    // 4. Tỷ Lệ Chuyển Đổi (CR %) = (Đơn Online / Clicks thật) * 100% (BR-AM-19)
    const crVal = cur.clicks ? (cur.don / cur.clicks) * 100 : 0;
    const crPrev = prev.clicks ? (prev.don / prev.clicks) * 100 : 0;
    const crDeltaPP = crVal - crPrev;

    document.getElementById('kpiCRVal').textContent = f1(crVal) + '%';
    const badgeCR = document.getElementById('kpiCRBadge');
    if (badgeCR) {
      badgeCR.className = crDeltaPP >= 0 ? 'kpi-growth-badge growth-up' : 'kpi-growth-badge growth-down';
      badgeCR.textContent = (crDeltaPP >= 0 ? '+' : '') + f1(crDeltaPP) + ' pp';
    }

    // 5. Tỷ Lệ Sales Phủ AM (Active Sales Rate)
    const roster = window.FPT_SALES_ROSTER || [];
    const totalRoster = roster.length;
    const activeCount = roster.filter(s => s.status === 'active').length;
    const coveragePct = totalRoster ? (activeCount / totalRoster) * 100 : 0;

    document.getElementById('kpiSalesCoverageVal').textContent = f1(coveragePct) + '%';
    document.getElementById('kpiSalesCountNote').textContent = activeCount + ' / ' + totalRoster + ' Sales đã dùng AM';
  }

  // =========================================================================
  // CHARTS RENDERER (UC 2)
  // =========================================================================
  function updateCharts() {
    if (typeof window.Chart === 'undefined') return;

    renderTrendChart();
    renderCampaignChart();
    renderDeviceChart();
    renderBrowserChart();
    renderRegionChart();
  }

  function renderTrendChart() {
    const ctx = document.getElementById('trendChartCanvas');
    if (!ctx) return;

    if (state.charts.trend) {
      state.charts.trend.destroy();
    }

    const cur = getData(state.period === 'cmp' ? 't8' : state.period) || getData('t8');
    const prev = getData('t7');
    let labels = [...cur.trendDates];
    let datasets = [];

    // Aggregations based on state.segment
    if (state.segment === 'week' && state.period !== 'year2026') {
      labels = ['Tuần 1 (01-07)', 'Tuần 2 (08-14)', 'Tuần 3 (15-21)', 'Tuần 4 (22-28)', 'Tuần 5 (29-31)'];
      const aggregate = arr => [
        arr.slice(0, 7).reduce((a, b) => a + b, 0),
        arr.slice(7, 14).reduce((a, b) => a + b, 0),
        arr.slice(14, 21).reduce((a, b) => a + b, 0),
        arr.slice(21, 28).reduce((a, b) => a + b, 0),
        arr.slice(28, 31).reduce((a, b) => a + b, 0)
      ];

      if (state.period === 'cmp') {
        datasets = [
          { label: 'Tháng 7 (Tuần)', data: aggregate(prev.trendClicks), borderColor: '#64748b', borderDash: [5, 5], backgroundColor: 'rgba(100,116,139,0.06)', fill: true, tension: 0.3 },
          { label: 'Tháng 8 (Tuần)', data: aggregate(cur.trendClicks), borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.1)', fill: true, tension: 0.3 }
        ];
      } else {
        datasets = [
          { label: 'Clicks Thật', data: aggregate(cur.trendClicks), borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.1)', fill: true, tension: 0.3 },
          { label: 'Unique Users', data: aggregate(cur.trendUsers), borderColor: '#1d64d8', backgroundColor: 'rgba(29,100,216,0.08)', fill: true, tension: 0.3 }
        ];
      }
    } else if (state.segment === 'month' || state.period === 'year2026') {
      const yr = getData('year2026');
      labels = yr.trendDates;
      datasets = [
        { label: 'Clicks Thật 2026', data: yr.trendClicks, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.1)', fill: true, tension: 0.3 },
        { label: 'Unique Users 2026', data: yr.trendUsers, borderColor: '#1d64d8', backgroundColor: 'rgba(29,100,216,0.08)', fill: true, tension: 0.3 }
      ];
    } else if (state.segment === 'year') {
      labels = ['Năm 2024', 'Năm 2025', 'Năm 2026 (Lũy kế + Forecast)'];
      datasets = [
        { label: 'Tổng Clicks Thật', data: [450000, 680000, 850420], backgroundColor: '#f97316', borderRadius: 6, type: 'bar' },
        { label: 'Unique Users', data: [240000, 360000, 462310], backgroundColor: '#1d64d8', borderRadius: 6, type: 'bar' }
      ];
    } else {
      // Default: Daily (Theo Ngày)
      if (state.period === 'cmp') {
        datasets = [
          { label: 'Tháng 7', data: prev.trendClicks, borderColor: '#64748b', borderDash: [4, 4], backgroundColor: 'rgba(100,116,139,0.05)', fill: true, tension: 0.25, pointRadius: 2 },
          { label: 'Tháng 8', data: cur.trendClicks, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.1)', fill: true, tension: 0.25, pointRadius: 2 }
        ];
      } else {
        datasets = [
          { label: 'Clicks Thật', data: cur.trendClicks, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', fill: true, tension: 0.25, pointRadius: 2 },
          { label: 'Unique Users', data: cur.trendUsers, borderColor: '#1d64d8', backgroundColor: 'rgba(29,100,216,0.05)', fill: true, tension: 0.25, pointRadius: 2 }
        ];
      }
    }

    state.charts.trend = new window.Chart(ctx, {
      type: state.segment === 'year' ? 'bar' : 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 6
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#64748b' } },
          y: { grid: { color: '#e2e8f0' }, ticks: { font: { size: 11 }, color: '#64748b' } }
        }
      }
    });
  }

  function renderCampaignChart() {
    const ctx = document.getElementById('campaignChartCanvas');
    if (!ctx) return;

    if (state.charts.camp) {
      state.charts.camp.destroy();
    }

    const cur = getData(state.period === 'cmp' ? 't8' : state.period) || getData('t8');
    const labels = cur.campaigns.slice(0, 5);
    const data = cur.campClicks.slice(0, 5);

    state.charts.camp = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#f97316', '#1d64d8', '#059669', '#8b5cf6', '#0ea5e9'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } }
        },
        cutout: '65%'
      }
    });
  }

  function renderDeviceChart() {
    const ctx = document.getElementById('deviceChartCanvas');
    if (!ctx) return;

    if (state.charts.dev) {
      state.charts.dev.destroy();
    }

    const cur = getData(state.period === 'cmp' ? 't8' : state.period) || getData('t8');
    state.charts.dev = new window.Chart(ctx, {
      type: 'pie',
      data: {
        labels: cur.devices,
        datasets: [{
          data: cur.devCount,
          backgroundColor: ['#1d64d8', '#f97316'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } }
        }
      }
    });
  }

  function renderBrowserChart() {
    const ctx = document.getElementById('browserChartCanvas');
    if (!ctx) return;

    if (state.charts.brow) {
      state.charts.brow.destroy();
    }

    const cur = getData(state.period === 'cmp' ? 't8' : state.period) || getData('t8');
    state.charts.brow = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: cur.browsers,
        datasets: [{
          data: cur.browCount,
          backgroundColor: ['#1d64d8', '#0ea5e9', '#8b5cf6', '#059669', '#f97316'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } }
        },
        cutout: '60%'
      }
    });
  }

  function renderRegionChart() {
    const ctx = document.getElementById('regionChartCanvas');
    if (!ctx) return;

    if (state.charts.region) {
      state.charts.region.destroy();
    }

    const cur = getData(state.period === 'cmp' ? 't8' : state.period) || getData('t8');
    const topVung = cur.vungData.slice(0, 6);

    state.charts.region = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: topVung.map(v => v.name),
        datasets: [
          { label: 'Clicks Thật', data: topVung.map(v => v.clicks), backgroundColor: '#f97316', borderRadius: 4 },
          { label: 'Đơn Hàng', data: topVung.map(v => v.don), backgroundColor: '#059669', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, font: { size: 11 } } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: '#e2e8f0' }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }

  // =========================================================================
  // GA4 SECTION RENDERER (UC 2)
  // =========================================================================
  function renderGA4Section(d) {
    const kpiContainer = document.getElementById('ga4KpiGrid');
    if (kpiContainer && d.ga4KPIs) {
      kpiContainer.innerHTML = d.ga4KPIs.map(k => `
        <div class="ga4-kpi-box">
          <div class="ga4-kpi-label">${k.label}</div>
          <div class="ga4-kpi-value">${k.val}</div>
          <div class="ga4-kpi-sub">${k.sub}</div>
        </div>
      `).join('');
    }

    const tableBody = document.getElementById('ga4PagesTableBody');
    if (tableBody && window.FPT_GA4_PAGES) {
      tableBody.innerHTML = window.FPT_GA4_PAGES.map(p => `
        <tr>
          <td class="td-mono">${p.rank}</td>
          <td>
            <div style="font-weight: 600; color: #1d64d8;">${p.page}</div>
            <div style="font-size: 11.5px; color: #64748b;">${p.title}</div>
          </td>
          <td class="td-right td-mono">${n(p.views)}</td>
          <td class="td-right td-mono">${n(p.sessions)}</td>
          <td class="td-right td-mono">${n(p.users)}</td>
          <td class="td-right">${p.bounce}</td>
          <td class="td-right">
            <a href="${p.url}" target="_blank" class="btn-secondary" style="height: 28px; padding: 0 10px; font-size: 11.5px; text-decoration: none;">
              Mở link
            </a>
          </td>
        </tr>
      `).join('');
    }
  }

  // =========================================================================
  // SALES MANAGEMENT (UC 3) — QUẢN LÝ & THEO DÕI SALES SỬ DỤNG AM
  // =========================================================================
  function renderSalesTable() {
    const tbody = document.getElementById('salesTableBody');
    if (!tbody || !window.FPT_SALES_ROSTER) return;

    let list = [...window.FPT_SALES_ROSTER];

    // Filter by Region dropdown
    if (state.salesRegionFilter && state.salesRegionFilter !== 'all') {
      list = list.filter(s => s.region === state.salesRegionFilter);
    }

    // Filter by tab
    if (state.salesTab === 'active') {
      list = list.filter(s => s.status === 'active');
    } else if (state.salesTab === 'inactive') {
      list = list.filter(s => s.status === 'inactive');
    }

    // Filter by search query
    if (state.salesSearch) {
      const q = state.salesSearch;
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.code.toLowerCase().includes(q) || 
        s.branch.toLowerCase().includes(q) ||
        (s.region && s.region.toLowerCase().includes(q))
      );
    }

    // Update Counts in Summary Cards (Preserving AM Coverage Rate)
    const baseRoster = (state.salesRegionFilter && state.salesRegionFilter !== 'all')
      ? window.FPT_SALES_ROSTER.filter(s => s.region === state.salesRegionFilter)
      : window.FPT_SALES_ROSTER;

    const totalCount = baseRoster.length;
    const activeCount = baseRoster.filter(s => s.status === 'active').length;
    const inactiveCount = totalCount - activeCount;

    document.getElementById('salesStatTotal').textContent = totalCount;
    document.getElementById('salesStatActive').textContent = activeCount;
    document.getElementById('salesStatInactive').textContent = inactiveCount;
    document.getElementById('salesStatRate').textContent = totalCount ? f1((activeCount / totalCount) * 100) + '%' : '0.0%';

    document.getElementById('tabBadgeAll').textContent = totalCount;
    document.getElementById('tabBadgeActive').textContent = activeCount;
    document.getElementById('tabBadgeInactive').textContent = inactiveCount;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 24px; color: #64748b;">Không tìm thấy nhân viên nào phù hợp với điều kiện tìm kiếm.</td></tr>`;
      return;
    }

    // Compute exact revenue on the fly: 650,000 VNĐ / đơn
    list.forEach(s => { s.revenue = (s.don || 0) * 650000; });

    // Sort list according to state.salesSortCol
    list.sort((a, b) => {
      let vA = a[state.salesSortCol];
      let vB = b[state.salesSortCol];
      if (typeof vA === 'string') {
        return state.salesSortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      return state.salesSortAsc ? (vA - vB) : (vB - vA);
    });

    // 10 columns: STT, Mã Sales, Họ và Tên, Đơn Vị, Vùng, Trạng Thái, Clicks, Leads, Đơn Online, Doanh Thu Cụ Thể
    tbody.innerHTML = list.map((s, idx) => {
      const isActive = s.status === 'active';
      const statusBadge = isActive 
        ? `<span class="status-badge status-active">Đã dùng AM</span>` 
        : `<span class="status-badge status-inactive">Chưa dùng (Clicks = 0)</span>`;
      
      return `
        <tr>
          <td class="td-mono">${idx + 1}</td>
          <td class="td-mono" style="color: #475569;">${s.code}</td>
          <td style="font-weight: 600;">${s.name}</td>
          <td>${s.branch}</td>
          <td><span class="region-pill">${s.region}</span></td>
          <td>${statusBadge}</td>
          <td class="td-right td-mono">${n(s.clicks)}</td>
          <td class="td-right td-mono">${n(s.lead)}</td>
          <td class="td-right td-mono" style="font-weight: 600;">${n(s.don)}</td>
          <td class="td-right td-mono" style="color: #059669; font-weight: 700;">${n(s.revenue)} đ</td>
        </tr>
      `;
    }).join('');
  }

  // =========================================================================
  // LEADERBOARDS RENDERER (UC 4)
  // =========================================================================
  function renderLeaderboards(d) {
    const topSalesBody = document.getElementById('topSalesTableBody');
    if (topSalesBody && d.topSale) {
      // Sort priority: Đơn Online hoàn tất giảm dần, tiêu chí phụ nếu trùng đơn: clicks -> lead (BR-AM-18)
      const sortedSales = [...d.topSale].sort((a, b) => b.don - a.don || b.clicks - a.clicks || b.lead - a.lead);

      topSalesBody.innerHTML = sortedSales.map((s, idx) => {
        let rankCls = 'rank-n';
        if (idx === 0) rankCls = 'rank-1';
        else if (idx === 1) rankCls = 'rank-2';
        else if (idx === 2) rankCls = 'rank-3';

        const cr = s.clicks ? f1((s.don / s.clicks) * 100) + '%' : '—';
        const salesCode = s.code || ('sales' + (idx + 1));
        const affiliateUrl = s.link || ('fpt.vn/am/u/' + salesCode);

        return `
          <tr>
            <td><span class="rank-badge ${rankCls}">${idx + 1}</span></td>
            <td style="font-weight: 600;">${s.name}</td>
            <td>${s.vung}</td>
            <td class="td-right td-mono" style="font-weight: 600;">${n(s.don)}</td>
            <td class="td-right td-mono" style="color: #059669; font-weight: 700;">${n(s.don * 650000)} đ</td>
            <td class="td-right td-mono">${n(s.lead)}</td>
            <td class="td-right td-mono">${n(s.clicks)}</td>
            <td class="td-right td-mono">${cr}</td>
            <td class="td-center">
              <a href="https://${affiliateUrl}" target="_blank" class="btn-secondary" style="height: 26px; padding: 0 8px; font-size: 11px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" title="Mở trang affiliate của Sales">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                Link
              </a>
            </td>
          </tr>
        `;
      }).join('');
    }

    const topContractsBody = document.getElementById('topContractsTableBody');
    if (topContractsBody && d.topContracts) {
      topContractsBody.innerHTML = d.topContracts.map((c, idx) => `
        <tr>
          <td><span class="rank-badge rank-n">${idx + 1}</span></td>
          <td style="font-weight: 600;">
            <a href="https://fpt.vn" target="_blank" style="color: #1d64d8; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" title="Mở kiểm tra Landing page thực tế">
              ${c.camp}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </td>
          <td>${c.sale}</td>
          <td class="td-right td-mono">${n(c.clicks)}</td>
          <td class="td-right td-mono">${n(c.unique)}</td>
          <td class="td-right td-mono">${n(c.lead)}</td>
          <td class="td-right td-mono" style="font-weight: 600;">${n(c.don)}</td>
          <td class="td-right td-mono" style="color: #059669; font-weight: 700;">${n(c.don * 650000)} đ</td>
        </tr>
      `).join('');
    }
  }

  // =========================================================================
  // EXPORT EXCEL / CSV LOGIC (UC 3)
  // =========================================================================
  function exportSalesCSV() {
    const roster = window.FPT_SALES_ROSTER || [];
    if (roster.length === 0) return;

    let csvContent = '\uFEFF'; // UTF-8 BOM so Excel opens Vietnamese characters correctly
    csvContent += 'STT,Mã Nhân Viên,Họ và Tên,Chi Nhánh,Vùng,Trạng Thái AM,Lượt Clicks,Leads (Không Thu Hồi),Đơn Online Thành Công,Tỷ Lệ CR,Hoạt Động Gần Nhất,Link Tiếp Thị\n';

    roster.forEach((s, idx) => {
      const row = [
        idx + 1,
        `"${s.code}"`,
        `"${s.name}"`,
        `"${s.branch}"`,
        `"${s.region}"`,
        `"${s.status === 'active' ? 'Đã sử dụng' : 'Chưa sử dụng (Clicks = 0)'}"`,
        s.clicks,
        s.lead,
        s.don,
        `"${s.cr}"`,
        `"${s.last_active}"`,
        `"${s.link}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `FPT_SOP_Danh_Sach_Sales_AM_Don_Doc_${state.period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Global helper for copy link
  window.copyLink = function (url, btn) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://' + url).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Đã chép!';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      });
    } else {
      alert('Đã sao chép link: https://' + url);
    }
  };

})();

  window.sortSalesBy = function (column) {
    state.salesSortAsc = state.salesSortCol === column ? !state.salesSortAsc : false;
    state.salesSortCol = column;
    renderSalesTable();
  };
