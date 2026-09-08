
class Component extends DCLogic {
  state = { period: 't8' };

  D() {
    if (typeof window === 'undefined' || !window.FPT_MONTHS) return null;
    if (!this._data) {
      // Hai file nguồn dùng Unicode khác nhau (NFC/NFD) → chuẩn hoá trước khi ghép tháng
      const walk = v => Array.isArray(v) ? v.map(walk)
        : v && typeof v === 'object' ? Object.keys(v).reduce((o, k) => (o[k] = walk(v[k]), o), {})
        : typeof v === 'string' ? v.normalize('NFC') : v;
      this._data = walk(window.FPT_MONTHS);
    }
    return this._data;
  }
  n(v) { return Math.round(v || 0).toLocaleString('en-US'); }
  f1(v) { return (Math.round((v || 0) * 10) / 10).toFixed(1); }
  pcOf(a, b) { return b ? (100 * a / b) : 0; }
  cancel(m) { const r = m.orderStatus.find(o => o.name === 'Hủy'); return r ? r.count : 0; }
  done(m) { return m.orderStatus.filter(o => o.name === 'Đã hoàn tất' || o.name === 'Đặt hàng thành công').reduce((s, o) => s + o.count, 0); }
  ga4n(m, i) { return Number(String(m.ga4KPIs[i].val).replace(/,/g, '')); }

  delta(a, b, invert, suffix) {
    const d = b - a;
    const pct = a ? (100 * d / a) : 0;
    const good = invert ? d < 0 : d > 0;
    return {
      delta: (d > 0 ? '+' : d < 0 ? '−' : '') + this.n(Math.abs(d)) + (suffix || ''),
      pct: (d > 0 ? '+' : d < 0 ? '−' : '') + this.f1(Math.abs(pct)) + '%',
      color: d === 0 ? '#7C8AA0' : good ? '#047857' : '#DC2626'
    };
  }
  deltaPP(a, b, invert) {
    const d = b - a;
    const good = invert ? d < 0 : d > 0;
    return {
      delta: (d > 0 ? '+' : d < 0 ? '−' : '') + this.f1(Math.abs(d)) + ' pp',
      pct: (d > 0 ? '+' : d < 0 ? '−' : '') + this.f1(a ? Math.abs(100 * d / a) : 0) + '%',
      color: Math.abs(d) < 0.05 ? '#7C8AA0' : good ? '#047857' : '#DC2626'
    };
  }

  insColor(t) { return t === 'good' ? '#10b981' : t === 'bad' ? '#ef4444' : t === 'warn' ? '#f59e0b' : '#3b82f6'; }
  insText(m, block) { const r = m.insights.find(i => i.block === block); return r ? r.icon + '  ' + r.text : ''; }

  saveRef(key) {
    this._refs = this._refs || {};
    this._cbs = this._cbs || {};
    if (!this._cbs[key]) {
      this._cbs[key] = el => {
        this._refs[key] = el;
        if (el) this.scheduleDraw();
      };
    }
    return this._cbs[key];
  }
  scheduleDraw() {
    clearTimeout(this._t);
    this._t = setTimeout(() => this.draw(), 60);
  }
  componentDidMount() {
    this.scheduleDraw();
    if (!this.D()) {
      let tries = 0;
      this._poll = setInterval(() => {
        tries++;
        if (this.D()) { clearInterval(this._poll); this.forceUpdate(); this.scheduleDraw(); }
        else if (tries > 120) clearInterval(this._poll);
      }, 100);
    }
  }
  componentWillUnmount() { clearInterval(this._poll); clearTimeout(this._t); }
  componentDidUpdate() { this.scheduleDraw(); }

  draw() {
    const D = this.D();
    if (!D || typeof window.Chart === 'undefined') { setTimeout(() => this.draw(), 200); return; }
    const C = window.Chart;
    C.defaults.color = '#7C8AA0';
    C.defaults.font.family = "'Be Vietnam Pro', sans-serif";
    this._charts = this._charts || {};
    const kill = k => { if (this._charts[k]) { this._charts[k].destroy(); delete this._charts[k]; } };
    const grid = { color: 'rgba(221,228,238,0.9)' };
    const tip = { backgroundColor: '#101828', borderColor: '#101828', borderWidth: 1, titleColor: '#fff', bodyColor: '#E5E9F0' };
    const refs = this._refs || {};
    const P = this.state.period;

    ['trend', 'camp', 'dev', 'brow', 'cmpTrend'].forEach(k => { if (!refs[k] || !refs[k].isConnected) kill(k); });

    if (P === 'cmp') {
      const a = D.t7, b = D.t8;
      const labels = Array.from({ length: 31 }, (_, i) => String(i + 1));
      if (refs.cmpTrend && refs.cmpTrend.isConnected && !this._charts.cmpTrend) {
        this._charts.cmpTrend = new C(refs.cmpTrend, {
          type: 'line',
          data: { labels, datasets: [
            { label: 'Tháng 7', data: a.trendClicks, borderColor: '#5A6B85', backgroundColor: 'rgba(139,153,173,0.10)', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2, borderDash: [5, 4] },
            { label: 'Tháng 8', data: b.trendClicks, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.12)', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 }
          ] },
          options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 16, font: { size: 11 } } }, tooltip: tip },
            scales: { x: { grid, ticks: { font: { size: 10 } } }, y: { grid, beginAtZero: true, ticks: { font: { size: 10 } } } } }
        });
      }
      return;
    }

    const m = D[P];
    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#B45309', '#ef4444', '#22d3ee', '#f472b6'];
    if (refs.trend && refs.trend.isConnected && !this._charts.trend) {
      this._charts.trend = new C(refs.trend, {
        type: 'line',
        data: { labels: m.trendDates, datasets: [
          { label: 'Lượt Truy Cập', data: m.trendClicks, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.10)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#f97316', borderWidth: 2 },
          { label: 'Unique Users', data: m.trendUsers, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#3b82f6', borderWidth: 2 }
        ] },
        options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
          plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 16, font: { size: 11 } } }, tooltip: tip },
          scales: { x: { grid, ticks: { font: { size: 10 } } }, y: { grid, beginAtZero: true, ticks: { font: { size: 10 } } } } }
      });
    }
    const donut = (key, labels, data, colors) => {
      if (!refs[key] || !refs[key].isConnected || this._charts[key]) return;
      this._charts[key] = new C(refs[key], {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#FFFFFF', borderWidth: 3, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { display: false }, tooltip: tip } }
      });
    };
    donut('camp', m.campaigns, m.campClicks, COLORS);
    donut('dev', m.devices, m.devCount, ['#3b82f6', '#f97316']);
    donut('brow', m.browsers, m.browCount, COLORS);
  }

  evalSale(s) {
    const conv = s.clicks ? (100 * s.don / s.clicks) : 0;
    if (!s.clicks) return { evalText: 'Đơn về từ nguồn khác — chưa ghi nhận click qua link AM', evalBd: '#3b82f6' };
    if (conv >= 3) return { evalText: 'Chuyển đổi tốt (' + this.f1(conv) + '% đơn/click) — nên nhân rộng cách làm', evalBd: '#10b981' };
    if (conv >= 1) return { evalText: 'Chuyển đổi khá (' + this.f1(conv) + '%), còn dư địa tăng đơn', evalBd: '#f97316' };
    return { evalText: 'Traffic nhiều nhưng chuyển đổi thấp (' + this.f1(conv) + '%) — cần rà soát chất lượng lead', evalBd: '#ef4444' };
  }
  evalContract(c) {
    if (!c.don && !c.lead) return { evalText: 'Chưa sinh lead/đơn — kiểm tra chất lượng traffic', evalBd: '#ef4444' };
    if (!c.don) return { evalText: 'Có ' + this.n(c.lead) + ' lead nhưng chưa chốt đơn', evalBd: '#f97316' };
    const conv = c.unique ? (100 * c.don / c.unique) : 0;
    if (conv >= 1) return { evalText: 'Chốt tốt: ' + this.n(c.don) + ' đơn / ' + this.n(c.unique) + ' user (' + this.f1(conv) + '%)', evalBd: '#10b981' };
    return { evalText: this.n(c.don) + ' đơn / ' + this.n(c.unique) + ' user (' + this.f1(conv) + '%) — chốt chậm', evalBd: '#3b82f6' };
  }

  singleVals(m) {
    const orderTotal = m.orderStatus.reduce((s, o) => s + o.count, 0) || 1;
    const maxVung = Math.max.apply(null, m.vungData.map(v => v.clicks));
    const campTotal = m.campClicks.reduce((s, v) => s + v, 0) || 1;
    const devTotal = m.devCount.reduce((s, v) => s + v, 0) || 1;
    const browTotal = m.browCount.reduce((s, v) => s + v, 0) || 1;
    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#B45309', '#ef4444', '#22d3ee', '#f472b6'];
    const maxConv = Math.max.apply(null, m.topSale.map(s => s.clicks ? (100 * s.don / s.clicks) : 0)) || 1;
    const rankStyle = i => i === 0 ? { rankBg: 'rgba(251,191,36,0.2)', rankFg: '#B45309' }
      : i === 1 ? { rankBg: 'rgba(156,163,175,0.2)', rankFg: '#6B7280' }
      : i === 2 ? { rankBg: 'rgba(180,83,9,0.25)', rankFg: '#d97706' }
      : { rankBg: 'rgba(100,116,139,0.15)', rankFg: '#7C8AA0' };
    const ga4Colors = ['#D9600F', '#1D64D8', '#047857', '#7E22CE'];

    return {
      kClicks: this.n(m.clicksReal),
      kClicksSub: 'Tổng truy cập thô ' + this.n(m.rawClicks) + ', đã loại bỏ ' + this.n(m.bot) + ' click từ bot',
      kUsers: this.n(m.users),
      kDon: this.n(m.don),
      kLead: this.n(m.lead),
      orderRows: m.orderStatus.map(o => ({ name: o.name, val: this.n(o.count) + ' · ' + this.f1(this.pcOf(o.count, orderTotal)) + '%' })),
      summaryInsights: m.insights.filter(i => i.block === 'summary').map(i => ({ icon: i.icon, text: i.text, bd: this.insColor(i.type) })),
      insTrend: this.insText(m, 'trend'),
      insCampaign: this.insText(m, 'campaign'),
      insDevice: this.insText(m, 'device'),
      insRegion: this.insText(m, 'region'),
      insSale: this.insText(m, 'sale'),
      insGa4: this.insText(m, 'ga4'),
      campLegend: m.campaigns.map((c, i) => ({ name: c, color: COLORS[i % COLORS.length], val: this.n(m.campClicks[i]), pct: this.f1(this.pcOf(m.campClicks[i], campTotal)) + '%' })),
      devLegend: m.devices.map((c, i) => ({ name: c, color: ['#3b82f6', '#f97316'][i], val: this.n(m.devCount[i]), pct: this.f1(this.pcOf(m.devCount[i], devTotal)) + '%' })),
      browLegend: m.browsers.map((c, i) => ({ name: c, color: COLORS[i % COLORS.length], val: this.n(m.browCount[i]), pct: this.f1(this.pcOf(m.browCount[i], browTotal)) + '%' })),
      vungRows: m.vungData.map(v => ({ name: v.name, meta: this.n(v.clicks) + ' lượt · ' + this.n(v.lead) + ' lead · ' + this.n(v.don) + ' đơn', pct: Math.round(100 * v.clicks / maxVung) })),
      saleRows: m.topSale.map((s, i) => Object.assign({
        rank: i + 1, name: s.name, vung: s.vung, clicks: this.n(s.clicks), lead: this.n(s.lead), don: this.n(s.don),
        conv: s.clicks ? this.f1(100 * s.don / s.clicks) + '%' : '—',
        barW: Math.round(100 * (s.clicks ? (100 * s.don / s.clicks) : 0) / maxConv)
      }, rankStyle(i), this.evalSale(s))),
      contractRows: m.topContracts.map(c => Object.assign({
        sale: c.sale, camp: c.camp, clicks: this.n(c.clicks), unique: this.n(c.unique), lead: this.n(c.lead), don: this.n(c.don)
      }, this.evalContract(c))),
      ga4Rows: m.ga4KPIs.map((g, i) => ({ label: g.label, val: g.val, sub: g.sub, color: ga4Colors[i % 4] })),
      ga4Sub: m.ga4Sub,
      ga4Img: m.ga4Img,
      trendRef: this.saveRef('trend'),
      campRef: this.saveRef('camp'),
      devRef: this.saveRef('dev'),
      browRef: this.saveRef('brow'),
      footNote: 'Dữ liệu: click_logs mọi nguồn, đã loại bot/loadtest + đơn/KHTN từ AM · ' + this.n(m.contracts) + ' contracts · ' + this.n(m.clicksReal) + ' lượt truy cập thật / ' + this.n(m.rawClicks) + ' tổng truy cập thô'
    };
  }

  compareVals(a, b) {
    const kpiOf = (label, va, vb, color, grad, note) => {
      const d = this.delta(va, vb);
      return { label, t7: this.n(va), t8: this.n(vb), delta: d.pct, deltaColor: d.color, color, grad, note };
    };
    const crA = this.pcOf(a.don, a.users), crB = this.pcOf(b.don, b.users);
    const cancelA = this.cancel(a), cancelB = this.cancel(b);
    const doneA = this.done(a), doneB = this.done(b);
    const botA = this.pcOf(a.bot, a.rawClicks), botB = this.pcOf(b.bot, b.rawClicks);
    const mobA = this.pcOf(a.devCount[a.devices.indexOf('Mobile')], a.devCount.reduce((s, v) => s + v, 0));
    const mobB = this.pcOf(b.devCount[b.devices.indexOf('Mobile')], b.devCount.reduce((s, v) => s + v, 0));

    const row = (metric, va, vb, fmt, invert) => {
      if (fmt === 'pp') { const d = this.deltaPP(va, vb, invert); return { metric, a: this.f1(va) + '%', b: this.f1(vb) + '%', delta: d.delta, pct: d.pct, color: d.color }; }
      const d = this.delta(va, vb, invert);
      return { metric, a: this.n(va), b: this.n(vb), delta: d.delta, pct: d.pct, color: d.color };
    };

    const campNames = Array.from(new Set(a.campaigns.concat(b.campaigns)));
    const cGet = (m, name) => { const i = m.campaigns.indexOf(name); return i < 0 ? 0 : m.campClicks[i]; };
    const campMax = Math.max.apply(null, campNames.map(nm => Math.max(cGet(a, nm), cGet(b, nm)))) || 1;
    const campCmpRows = campNames.map(nm => {
      const v7 = cGet(a, nm), v8 = cGet(b, nm), d = this.delta(v7, v8);
      return { name: nm, v7: this.n(v7), v8: this.n(v8), w7: Math.round(100 * v7 / campMax), w8: Math.round(100 * v8 / campMax), pct: v7 ? d.pct : 'mới', color: v7 ? d.color : '#047857' };
    }).sort((x, y) => (cGet(b, y.name) + cGet(a, y.name)) - (cGet(b, x.name) + cGet(a, x.name)));

    const vGet = (m, name) => { const r = m.vungData.find(v => v.name === name); return r ? r.clicks : 0; };
    const vungNames = Array.from(new Set(a.vungData.map(v => v.name).concat(b.vungData.map(v => v.name))));
    const vungMax = Math.max.apply(null, vungNames.map(nm => Math.max(vGet(a, nm), vGet(b, nm)))) || 1;
    const vungCmpRows = vungNames.map(nm => {
      const v7 = vGet(a, nm), v8 = vGet(b, nm), d = this.delta(v7, v8);
      return { name: nm, v7: this.n(v7), v8: this.n(v8), w7: Math.round(100 * v7 / vungMax), w8: Math.round(100 * v8 / vungMax), pct: v7 ? d.pct : 'mới', color: v7 ? d.color : '#047857', _sum: v7 + v8 };
    }).sort((x, y) => y._sum - x._sum).slice(0, 10);

    const sGet = (m, name) => { const r = m.topSale.find(s => s.name === name); return r ? r : null; };
    const saleNames = Array.from(new Set(a.topSale.map(s => s.name).concat(b.topSale.map(s => s.name))));
    const saleCmpRows = saleNames.map(nm => {
      const r7 = sGet(a, nm), r8 = sGet(b, nm);
      const d7 = r7 ? r7.don : 0, d8 = r8 ? r8.don : 0, dd = d8 - d7;
      let note, color;
      if (!r7) { note = 'Mới vào top 10 ở Tháng 8'; color = '#047857'; }
      else if (!r8) { note = 'Rời top 10 ở Tháng 8'; color = '#DC2626'; }
      else if (dd > 0) { note = 'Tăng ' + dd + ' đơn so với Tháng 7'; color = '#047857'; }
      else if (dd < 0) { note = 'Giảm ' + Math.abs(dd) + ' đơn so với Tháng 7'; color = '#DC2626'; }
      else { note = 'Giữ nguyên số đơn'; color = '#7C8AA0'; }
      return { name: nm, vung: (r8 || r7).vung, t7: r7 ? this.n(d7) : '—', t8: r8 ? this.n(d8) : '—', delta: (dd > 0 ? '+' : dd < 0 ? '−' : '') + Math.abs(dd), color, note, _s: d8 };
    }).sort((x, y) => y._s - x._s);

    const stNames = Array.from(new Set(a.orderStatus.map(o => o.name).concat(b.orderStatus.map(o => o.name))));
    const stGet = (m, nm) => { const r = m.orderStatus.find(o => o.name === nm); return r ? r.count : 0; };
    const stMax = Math.max.apply(null, stNames.map(nm => Math.max(stGet(a, nm), stGet(b, nm)))) || 1;
    const statusCmpRows = stNames.map(nm => {
      const v7 = stGet(a, nm), v8 = stGet(b, nm);
      return { name: nm, meta: this.n(v7) + ' → ' + this.n(v8) + '  (' + this.f1(this.pcOf(v7, a.don)) + '% → ' + this.f1(this.pcOf(v8, b.don)) + '%)', w7: Math.round(100 * v7 / stMax), w8: Math.round(100 * v8 / stMax), _s: v7 + v8 };
    }).sort((x, y) => y._s - x._s);

    const ga4CmpRows = a.ga4KPIs.map((g, i) => {
      const va = this.ga4n(a, i), vb = this.ga4n(b, i), d = this.delta(va, vb);
      return { label: g.label, a: this.n(va), b: this.n(vb), pct: d.pct, color: d.color };
    });

    const cmpInsights = [
      { icon: '📈', type: crB > crA ? 'good' : 'warn', text: 'Tháng 8 đạt ' + this.n(b.clicksReal) + ' lượt truy cập thật (' + this.delta(a.clicksReal, b.clicksReal).pct + ' so với T7) và ' + this.n(b.don) + ' đơn (' + this.delta(a.don, b.don).pct + '); tỷ lệ chuyển đổi ' + this.f1(crA) + '% → ' + this.f1(crB) + '%.' },
      { icon: '🧾', type: this.pcOf(doneB, b.don) > this.pcOf(doneA, a.don) ? 'good' : 'bad', text: 'Chất lượng đơn cải thiện rõ: hoàn tất/thành công ' + this.f1(this.pcOf(doneA, a.don)) + '% → ' + this.f1(this.pcOf(doneB, b.don)) + '%, tỷ lệ hủy ' + this.f1(this.pcOf(cancelA, a.don)) + '% → ' + this.f1(this.pcOf(cancelB, b.don)) + '%.' },
      { icon: '🤖', type: botB < botA ? 'good' : 'warn', text: 'Bot chiếm ' + this.f1(botA) + '% traffic thô ở T7 và ' + this.f1(botB) + '% ở T8 — chất lượng nguồn traffic ' + (botB < botA ? 'tốt hơn' : 'xấu hơn') + '.' },
      { icon: '🎯', type: b.lead >= a.lead ? 'good' : 'bad', text: 'Lead (KHTN) ' + this.n(a.lead) + ' → ' + this.n(b.lead) + ' (' + this.delta(a.lead, b.lead).pct + '); tỷ lệ lead/user ' + this.f1(this.pcOf(a.lead, a.users)) + '% → ' + this.f1(this.pcOf(b.lead, b.users)) + '%.' },
      { icon: '📣', type: 'info', text: 'Campaign dịch chuyển: ' + campCmpRows.slice(0, 3).map(c => c.name + ' ' + c.pct).join(' · ') + '.' },
      { icon: '🗺️', type: 'warn', text: 'Nhóm "Khác" (sale chưa gắn mã chi nhánh) ' + this.f1(this.pcOf(vGet(a, 'Khác'), a.clicksReal)) + '% → ' + this.f1(this.pcOf(vGet(b, 'Khác'), b.clicksReal)) + '% lượt truy cập — cần chuẩn hoá mã chi nhánh.' },
      { icon: '📱', type: 'info', text: 'Tỷ trọng Mobile ' + this.f1(mobA) + '% → ' + this.f1(mobB) + '%; Desktop tăng tương ứng.' }
    ].map(i => ({ icon: i.icon, text: i.text, bd: this.insColor(i.type) }));

    return {
      cmpKpis: [
        kpiOf('Lượt Truy Cập Thật', a.clicksReal, b.clicksReal, '#D9600F', 'linear-gradient(90deg, #f97316, #D9600F)', 'Sau khi loại bot/loadtest'),
        kpiOf('Unique Users', a.users, b.users, '#1D64D8', 'linear-gradient(90deg, #3b82f6, #1D64D8)', 'Người dùng duy nhất'),
        kpiOf('Tổng Đơn', a.don, b.don, '#047857', 'linear-gradient(90deg, #10b981, #047857)', 'Chuyển đổi ' + this.f1(crA) + '% → ' + this.f1(crB) + '%'),
        kpiOf('Tổng Lead', a.lead, b.lead, '#7E22CE', 'linear-gradient(90deg, #a855f7, #7E22CE)', 'KHTN từ AM')
      ],
      cmpInsights,
      cmpRows: [
        row('Tổng truy cập thô', a.rawClicks, b.rawClicks),
        row('Click bot bị loại', a.bot, b.bot, null, true),
        row('Tỷ lệ bot / traffic thô', botA, botB, 'pp', true),
        row('Lượt truy cập thật', a.clicksReal, b.clicksReal),
        row('Unique users', a.users, b.users),
        row('Tổng đơn', a.don, b.don),
        row('Tỷ lệ chuyển đổi (đơn/user)', crA, crB, 'pp'),
        row('Tổng lead (KHTN)', a.lead, b.lead),
        row('Tỷ lệ lead/user', this.pcOf(a.lead, a.users), this.pcOf(b.lead, b.users), 'pp'),
        row('Đơn hủy', cancelA, cancelB, null, true),
        row('Tỷ lệ hủy / tổng đơn', this.pcOf(cancelA, a.don), this.pcOf(cancelB, b.don), 'pp', true),
        row('Đơn hoàn tất / thành công', doneA, doneB),
        row('Tỷ lệ hoàn tất / tổng đơn', this.pcOf(doneA, a.don), this.pcOf(doneB, b.don), 'pp'),
        row('Số contracts', a.contracts, b.contracts),
        row('Tỷ trọng Mobile', mobA, mobB, 'pp'),
        row('GA4 — Total views', this.ga4n(a, 0), this.ga4n(b, 0)),
        row('GA4 — Sessions', this.ga4n(a, 1), this.ga4n(b, 1)),
        row('GA4 — Active users', this.ga4n(a, 3), this.ga4n(b, 3))
      ],
      campCmpRows, vungCmpRows, saleCmpRows, statusCmpRows, ga4CmpRows,
      cmpTrendRef: this.saveRef('cmpTrend'),
      footNote: 'So sánh 01/07/2026 – 31/07/2026 với 01/08/2026 – 31/08/2026 · nguồn: click_logs (đã loại bot/loadtest), đơn & KHTN từ AM, GA4 session source amtracking'
    };
  }

  renderVals() {
    const D = this.D();
    const P = this.state.period;
    const tabs = [
      { key: 't7', label: 'Tháng 7' },
      { key: 't8', label: 'Tháng 8' },
      { key: 'cmp', label: 'So sánh T7 ↔ T8' }
    ].map(t => ({
      label: t.label,
      bg: P === t.key ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'transparent',
      fg: P === t.key ? '#ffffff' : '#5A6B85',
      onClick: () => this.setState({ period: t.key })
    }));

    const base = { tabs, isSingle: P !== 'cmp', isCompare: P === 'cmp', isT7: P === 't7', isT8: P === 't8' };
    if (!D) return Object.assign(base, { headTitle: 'đang tải dữ liệu…', headRange: '—' });

    if (P === 'cmp') {
      return Object.assign(base, {
        headTitle: 'So sánh Tháng 7 và Tháng 8/2026',
        headRange: '01/07 – 31/08/2026'
      }, this.compareVals(D.t7, D.t8));
    }
    const m = D[P];
    return Object.assign(base, { headTitle: m.label, headRange: m.range }, this.singleVals(m));
  }
}

