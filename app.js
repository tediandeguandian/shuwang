"use strict";
/* ==================================================================
   竹林修行录 · 中考学习工作台
   代码分三层： CONFIG 配置 → Store 数据层 → Render 渲染层 → Events 事件层
   ================================================================== */

/* ================================================================
   一、CONFIG —— 出厂默认值（想改「默认」才需要动这里）

   ★ 日常修改完全不用碰代码：点页面右上角「设置」，里面能改
     标题 / 姓名 / 考试日期 / 学科与满分 / 难度 / 错因 / 掌握状态 /
     复习节奏 / 励志语 / 页面名称 / 主题配色，改完点保存立即生效，
     并且跟着「导出 JSON 备份」一起走。

   这一份 CONFIG 只负责两件事：
     1) 第一次打开时的默认样子
     2) 你在「设置」里点「恢复默认」时回到的样子
   ================================================================ */
const CONFIG = {
  // ---- 基础文案 ----
  appTitle: '竹林修行录',            // 页面大标题（左上角 + 浏览器标签）
  gradeLabel: '九年级',             // 副标题前缀
  studentName: '鼠王',
  examDate: '2027-06-13',          // 中考开考日
  // ---- 四个页面的名字 ----
  pageNames: { home:'总览', study:'习文', furnace:'炼丹炉', record:'战绩' },
  // ---- 学科与满分（中考各地分值不同，按本地实际改）----
  subjects: ['语文','数学','英语','物理','化学','道法','历史','体育'],
  fullMarks: { 语文:120, 数学:120, 英语:120, 物理:70, 化学:50, 道法:50, 历史:50, 体育:50 },
  // ---- 每个学科配的图标（图标名见下面的 SUBJ_ICON_LIB）----
  subjIcons: {
    语文:'book', 数学:'math', 英语:'globe', 物理:'atom',
    化学:'flask', 道法:'scale', 历史:'scroll', 体育:'run'
  },
  // ---- 难度分级及配色 ----
  difficulties: { '必做':'#7FB069', '选做':'#C9A961', '挑战':'#9B8CD8' },
  // ---- 错因分类及配色 ----
  causes: {
    '概念不清':'#6FA8DC', '计算失误':'#C9A961',
    '审题偏差':'#B48CC8', '时间不够':'#D98E5A', '完全不会':'#C1442E'
  },
  // ---- 掌握状态及配色（有顺序：第一个 = 刚记下，最后一个 = 已毕业）----
  mastery: { '未掌握':'#C1442E', '复习中':'#C9A961', '已掌握':'#7FB069' },
  // ---- 艾宾浩斯复习节奏（天）----
  reviewIntervals: [1, 3, 7, 15],
  // ---- 三阶段备考（日期区间在「设置」里改）----
  stages: [
    { name:'基础巩固', start:'2026-09-01', end:'2027-01-31' },
    { name:'强化提升', start:'2027-02-01', end:'2027-04-30' },
    { name:'最后冲刺', start:'2027-05-01', end:'2027-06-13' }
  ],
  // ---- 配色（会覆盖页面顶部的 CSS 变量）----
  theme: {
    bg1:'#0E2419', bg2:'#16342A', bg3:'#0B1E15',
    bamboo:'#7FB069', jade:'#E8F0E3', gold:'#C9A961',
    cinnabar:'#C1442E', muted:'#8FA596'
  },
  // ---- 成套的主题风格（设置里点一下就能整套换，比逐个调色省事）----
  // 每套都要给全 8 个色位：bg1/bg2/bg3 背景上中下、bamboo 主强调、jade 正文、
  // gold 标题描金、cinnabar 警示、muted 次要文字。
  // 浅色主题里 jade / muted 要写深色（它们是正文字色），深色主题里写浅色。
  // bg 是背景照片，放在 site/bg/ 下（长边 1600、每张 100–300KB，见 bg/来源.md）。
  // 不想用照片就把 bg 删掉，那一套会退回纯色渐变。
  themes: [
    { name:'竹林夜色', bg:'bg/zhulin-night.jpg', theme:{ bg1:'#0E2419', bg2:'#16342A', bg3:'#0B1E15', bamboo:'#7FB069', jade:'#E8F0E3', gold:'#C9A961', cinnabar:'#C1442E', muted:'#8FA596' } },
    { name:'宣纸日览', bg:'bg/paper-day.jpg', theme:{ bg1:'#F6F1E5', bg2:'#EFE8D8', bg3:'#FBF8F0', bamboo:'#4A7C59', jade:'#2C332D', gold:'#9C7A28', cinnabar:'#B03A24', muted:'#7B7566' } },
    { name:'松风晨光', bg:'bg/pine-morning.jpg', theme:{ bg1:'#EAF2EC', bg2:'#DCE9E0', bg3:'#F5FAF6', bamboo:'#3E7D5A', jade:'#26302A', gold:'#94782C', cinnabar:'#B4472F', muted:'#6E7C74' } },
    { name:'靛蓝夜读', bg:'bg/indigo-night.jpg', theme:{ bg1:'#101C2E', bg2:'#17293F', bg3:'#0A1422', bamboo:'#6FA8DC', jade:'#E3ECF5', gold:'#D9B26A', cinnabar:'#D9603B', muted:'#8496AC' } },
    { name:'暖棕书房', bg:'bg/warm-study.jpg', theme:{ bg1:'#2A1E16', bg2:'#382A1E', bg3:'#1E150F', bamboo:'#C98A3C', jade:'#F0E4D2', gold:'#E0B25E', cinnabar:'#C0563A', muted:'#A08C74' } },
    { name:'紫霞夜话', bg:'bg/purple-dusk.jpg', theme:{ bg1:'#1D1730', bg2:'#282041', bg3:'#150F26', bamboo:'#9B8CD8', jade:'#E9E4F5', gold:'#C9A961', cinnabar:'#D2607A', muted:'#8E86A8' } },
    { name:'樱霞初晴', bg:'bg/sakura-dawn.jpg', theme:{ bg1:'#F8EEF3', bg2:'#F2E3EB', bg3:'#FCF6F9', bamboo:'#C4628C', jade:'#3A2A33', gold:'#A87B2C', cinnabar:'#BF4140', muted:'#8C7480' } },
    { name:'墨黑简约', bg:'bg/ink-minimal.jpg', theme:{ bg1:'#16181A', bg2:'#1F2225', bg3:'#101214', bamboo:'#DCDCDC', jade:'#F2F2F2', gold:'#C0C0C0', cinnabar:'#E2603F', muted:'#8A8F94' } },
    // 液态玻璃：颜色之外还带 glass:true，会打开一层实时模糊的玻璃质感（见 app.css 的 body.glass 段）
    { name:'液态玻璃', glass:true, bg:'bg/glass-liquid.jpg', theme:{ bg1:'#E7F0FA', bg2:'#D6E5F5', bg3:'#F3F8FD', bamboo:'#0A84FF', jade:'#12233B', gold:'#FF9F0A', cinnabar:'#FF453A', muted:'#5E7897' } }
  ],
  // 液态玻璃的浓度（0–100）：越大越白越不透明，越小越通透。只在开了玻璃效果时有用
  glassOpacity: 55,
  // 当前选中的是哪一套（改名 / 换背景图都按这个下标存）
  themeIdx: 0,
  // 用户改过的名字与背景图：{ '0':'我的夜色' } / { '0':'data:image/jpeg;base64,…' }
  themeNames: {},
  themeBgs: {},
  // ---- 每日轮换的武侠风励志语 ----
  mottos: [
    '仗剑不问出处，落笔自有山河。',
    '今日多背一个词，考场少慌一分钟。',
    '十年磨一剑，霜刃未曾试。',
    '慢也好，步子小也好，往前走就好。',
    '真正的高手，都把招式练成了本能。',
    '错题不是耻辱，是还没挖完的矿。',
    '心静则笔稳，笔稳则分高。',
    '山高路远，看世界，也找自己。',
    '别人三分天分，我有七分笨功夫。',
    '每道红叉背后，都藏着一次升级。',
    '不怕万人阻挡，只怕自己投降。',
    '今日之汗水，化作明日之锋芒。',
    '把简单题做对，就是不简单。',
    '草稿写得越工整，脑子越清醒。',
    '与其焦虑明天，不如守住此刻这一页。',
    '行百里者半九十，最后一段路最要紧。',
    '练的是题，修的是心。',
    '把每一道题当作对手，认真过招。',
    '风起竹林，笔落惊鸿。',
    '每日三省：做完了吗？复盘了吗？睡够了吗？'
  ],
  // ---- 存储键名前缀（改这里会导致读不到旧数据，一般不要动）----
  storagePrefix: 'wuxia_study_',
  // ---- 云同步后端地址 ----
  // 留空 = 纯离线模式，数据只存在本机浏览器。手机上也可以在「同步」弹窗里现填。
  //
  // 【千万不要用 xxx.workers.dev】—— 这个域名在国内被 DNS 污染，
  // 五个 DNS 会返回五个互不相同的假 IP（Facebook / Twitter / Dropbox 的段），
  // 浏览器只会报「连不上」。必须给 Worker 绑一个自己域名下的地址。
  // 绑法见《部署说明-云同步.md》第九节。
  cloudApi: 'https://study.shuwang.dpdns.org',
};

/* ================================================================
   一之二、CFG —— 运行时真正生效的配置

   生效值 = CONFIG 出厂默认 ⊕ 你在「设置」里保存的修改（存在浏览器里）。
   代码里所有地方都读 CFG，所以你一改设置，全站立刻跟着变。
   顺序：Store.load() → normalizeState() → rebuildCFG() → 渲染
   ================================================================ */
let CFG = null;

/** 把「设置」里存下的自定义配置，和出厂默认合并成 CFG */
function rebuildCFG(){
  const d = CONFIG;
  const c = (Store.state && Store.state.config) || {};
  const st = (Store.state && Store.state.settings) || {};

  const pickArr = (v, fb) => (Array.isArray(v) && v.length ? v.slice() : fb.slice());
  const pickMap = (v, fb) => (v && typeof v === 'object' && Object.keys(v).length)
    ? Object.assign({}, v) : JSON.parse(JSON.stringify(fb));
  // 复习间隔必须是「正整数、升序、不重复」
  const cleanIv = v => {
    const arr = (Array.isArray(v) ? v : [])
      .map(x => Math.round(Number(x)))
      .filter(x => isFinite(x) && x > 0)
      .sort((a, b) => a - b);
    return arr.length ? arr.filter((x, i) => arr.indexOf(x) === i) : d.reviewIntervals.slice();
  };

  CFG = {
    appTitle:     (c.appTitle || d.appTitle).trim() || d.appTitle,
    gradeLabel:   (c.gradeLabel || d.gradeLabel).trim(),
    studentName:  (st.studentName || d.studentName).trim() || d.studentName,
    examDate:     st.examDate || d.examDate,
    pageNames:    Object.assign({}, d.pageNames, c.pageNames || {}),
    subjects:     pickArr(c.subjects, d.subjects),
    fullMarks:    Object.assign({}, d.fullMarks, c.fullMarks || {}),
    subjIcons:    Object.assign({}, d.subjIcons, c.subjIcons || {}),
    difficulties: pickMap(c.difficulties, d.difficulties),
    causes:       pickMap(c.causes, d.causes),
    mastery:      pickMap(c.mastery, d.mastery),
    reviewIntervals: cleanIv(c.reviewIntervals),
    stages:       (Array.isArray(st.stages) && st.stages.length) ? st.stages : d.stages,
    theme:        Object.assign({}, d.theme, c.theme || {}),
    themes:       (Array.isArray(c.themes) && c.themes.length) ? c.themes : d.themes,
    // 用户改过的风格名与背景图（按预设下标存，只存改过的那些）
    themeNames:   Object.assign({}, d.themeNames, c.themeNames || {}),
    themeBgs:     Object.assign({}, d.themeBgs, c.themeBgs || {}),
    glassOpacity: (c.glassOpacity === undefined || isNaN(Number(c.glassOpacity)))
                    ? d.glassOpacity : clamp(Number(c.glassOpacity), 0, 100),
    mottos:       pickArr(c.mottos, d.mottos),
    storagePrefix: d.storagePrefix
  };

  // 当前选中的是第几套：优先用存过的，其次按配色反查，兜底 0
  const idxSaved = Number(c.themeIdx);
  const idxMatch = CFG.themes.findIndex(p => sameTheme(p.theme, CFG.theme));
  CFG.themeIdx = (idxSaved >= 0 && idxSaved < CFG.themes.length) ? idxSaved
               : (idxMatch >= 0 ? idxMatch : 0);

  // 液态玻璃：用户在设置里显式开/关优先；没设过就跟随当前匹配到的那套预设
  const matched = CFG.themes.find(p => sameTheme(p.theme, CFG.theme));
  CFG.glass = (c.glass === undefined) ? !!(matched && matched.glass) : !!c.glass;

  // 掌握状态按「位置」使用：第一档 = 未掌握，最后一档 = 已掌握
  const mk = Object.keys(CFG.mastery);
  CFG.masteryStart = mk[0];
  CFG.masteryDone  = mk[mk.length - 1];

  // 学科没写满分时兜底 100
  CFG.subjects.forEach(s => { if(!(Number(CFG.fullMarks[s]) > 0)) CFG.fullMarks[s] = 100; });

  migrateLabels();   // 标签被改名后，把旧数据按位置对新名字
  applyTheme();      // 把配色注入 CSS 变量
  applyStaticText(); // 标题、页签名字
  return CFG;
}

/** 用户可能在「设置」里改了 难度/错因/掌握状态 的名字。
    旧数据还写着老名字，这里按「出厂顺序」的第几个来对齐，避免数据变成孤儿。 */
function migrateLabels(){
  const align = (val, curList, defList) => {
    if(curList.indexOf(val) >= 0) return val;          // 已经对得上
    const i = defList.indexOf(val);
    if(i >= 0 && i < curList.length) return curList[i]; // 按位置对齐
    return val;                                        // 对不上就原样留着，渲染时用兜底色
  };
  const keys = o => Object.keys(o);
  (Store.state.mistakes || []).forEach(m => {
    m.mastery = align(m.mastery, keys(CFG.mastery), keys(CONFIG.mastery));
    m.cause   = align(m.cause,   keys(CFG.causes),   keys(CONFIG.causes));
  });
  (Store.state.tasks || []).forEach(t => {
    t.difficulty = align(t.difficulty, keys(CFG.difficulties), keys(CONFIG.difficulties));
  });
}

/** 把主题色注入 CSS 变量。
    除了 8 个基础色，还算出两套东西：
      1) 每个色的各档不透明度（--bamboo-18 这种）。样式里到处都在用「主题色 + 透明」，
         写死成 rgba() 的话换主题时这些地方不会跟着变，所以统一由这里算。
      2) 明暗自适应变量（--on-accent / --panel / --veil …）。浅色主题下
         「半透明黑」会发灰发脏、白高光也看不见，这些必须跟着明暗走，不能写死。 */
function applyTheme(theme, bgUrl, glassOp){
  const root = document.documentElement;
  const t = theme || CFG.theme || {};
  Object.keys(t).forEach(k => root.style.setProperty('--' + k, t[k]));

  // 背景照片：不传就取「当前选中那套」的图。没有图就设 none，退回纯色渐变
  const img = (bgUrl === undefined) ? themeBgOf(CFG.themeIdx) : bgUrl;

  const rgb = hex => {
    const h = String(hex || '').replace('#', '');
    const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const rgba = (hex, a) => { const c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
  // 相对亮度，用来判断「这算深色主题还是浅色主题」
  const luma = hex => rgb(hex).map(v => v / 255)
    .map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4))
    .reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);

  const ALPHAS = [5, 8, 10, 12, 13, 16, 18, 20, 22, 25, 28, 30, 34, 35, 45, 50, 55, 60, 68, 70, 80, 94, 95];
  Object.keys(t).forEach(k => {
    ALPHAS.forEach(p => root.style.setProperty('--' + k + '-' + p, rgba(t[k], p / 100)));
  });

  const light = luma(t.bg1) > 0.45;
  root.style.setProperty('--light', light ? '1' : '0');
  // 浏览器自带的那套 UI —— 滚动条、下拉箭头、复选框勾、日期选择器 —— 也跟着明暗走。
  // index.html 里那个 <meta name="color-scheme"> 只兜首屏，真正的依据是这里；
  // 不设的话，浅色主题下滚动条会按「深色」画成一条黑底。
  root.style.setProperty('color-scheme', light ? 'light' : 'dark');
  // 液态玻璃：整段效果靠 body.glass 这个类开关，CSS 里只在这一类下用 backdrop-filter
  if (document.body) document.body.classList.toggle('glass', !!CFG.glass);

  // 背景照片。没图时设 none —— CSS 那边 .bg-photo 就整层不画。
  root.style.setProperty('--bg-img', img ? 'url("' + img + '")' : 'none');
  // 照片上压的那层纱：让正文在任意一张图上都读得清，深浅各一套。
  // 开了玻璃就把**中间那段**减薄 —— 顶栏和页脚的字直接压在照片上，那两段不能动；
  // 中间是卡片区，卡片自己有底色，减薄不会影响卡内文字的对比度，反而让折射有细节可弯。
  const vf = CFG.glass ? 0.70 : 1;
  root.style.setProperty('--photo-veil', light
    ? 'linear-gradient(180deg, ' + rgba(t.bg1, .78) + ' 0%, ' + rgba(t.bg1, .58 * vf) + ' 38%, ' + rgba(t.bg1, .86) + ' 100%)'
    : 'linear-gradient(180deg, ' + rgba(t.bg1, .72) + ' 0%, ' + rgba(t.bg1, .46 * vf) + ' 38%, ' + rgba(t.bg1, .84) + ' 100%)');
  // 压在主强调色上的文字：强调色本身亮就用深字，暗就用白字
  root.style.setProperty('--on-accent', luma(t.bamboo) > 0.42 ? '#16201A' : '#FFFFFF');
  // 内嵌面板（输入框、下拉、小结框）的底与边
  root.style.setProperty('--panel',       light ? 'rgba(255,255,255,.62)' : 'rgba(0,0,0,.25)');
  root.style.setProperty('--panel-br',    light ? 'rgba(0,0,0,.16)'      : 'rgba(255,255,255,.12)');
  root.style.setProperty('--panel-focus', light ? 'rgba(255,255,255,.92)' : 'rgba(0,0,0,.35)');
  // 弹窗背后的遮罩
  root.style.setProperty('--veil', light ? 'rgba(250,247,240,.78)' : 'rgba(0,0,0,.68)');
  // 卡片：浅色主题用白一点的半透明，深色主题保持原来的微亮。
  // 铺了背景照片时再压深一点 —— 否则正文直接压在照片的高光上，读起来费劲。
  root.style.setProperty('--card-bg', img
    ? rgba(t.bg1, light ? .70 : .58)
    : (light ? 'rgba(255,255,255,.58)' : 'rgba(255,255,255,.05)'));
  root.style.setProperty('--card-br', light ? 'rgba(0,0,0,.12)' : rgba(t.gold, .25));
  // 卡片那道内高光：浅色底下白色高光等于没有，换成极淡的暗边
  root.style.setProperty('--card-hl', light ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.045)');
  root.style.setProperty('--shadow', light ? '0 6px 20px rgba(0,0,0,.12)' : '0 6px 20px rgba(0,0,0,.30)');
  // 纸纹颗粒：深底撒白点，浅底撒黑点
  root.style.setProperty('--grain',  light ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.9)');
  root.style.setProperty('--grain2', light ? 'rgba(0,0,0,.13)' : 'rgba(255,255,255,.55)');

  // 液态玻璃专用的三层底色/描边/高光/投影。深浅主题必须各一套 ——
  // 深色主题下用白玻璃会让浅色正文看不见，所以深色下玻璃更暗、描边更亮。
  // 液态玻璃的浓度：滑块 0–100 换算成底色的透明度。
  // 浅色主题用白玻璃；深色主题必须用「主题背景色的深玻璃」——
  // 否则白玻璃配浅色正文（深色主题的 jade 是浅色）根本看不清。
  const gop = clamp((glassOp === undefined ? CFG.glassOpacity : glassOp), 0, 100) / 100;
  const gTint = light ? '255,255,255' : rgb(t.bg2).join(',');
  const a1 = light ? (0.30 + 0.55 * gop) : (0.28 + 0.47 * gop);   // 卡片底
  const a2 = Math.min(a1 + (light ? 0.16 : 0.10), 0.96);          // 导航 / 弹窗，再浓一点
  const br = light ? (0.50 + 0.40 * gop) : (0.22 + 0.20 * gop);   // 边
  const hl = Math.min(light ? (0.70 + 0.36 * gop) : (0.20 + 0.18 * gop), 1); // 顶边高光
  const wa = a => Math.round(a * 1000) / 1000;
  root.style.setProperty('--glass-bg',  'rgba(' + gTint + ',' + wa(a1) + ')');
  root.style.setProperty('--glass-bg2', 'rgba(' + gTint + ',' + wa(a2) + ')');
  root.style.setProperty('--glass-br',  'rgba(255,255,255,' + wa(br) + ')');
  root.style.setProperty('--glass-hl',  'rgba(255,255,255,' + wa(hl) + ')');
  root.style.setProperty('--glass-sh',  light ? '0 10px 34px rgba(30,60,100,.16)' : '0 10px 34px rgba(0,0,0,.45)');

  // ---- 玻璃的几何参数：全部挂在同一个「浓度」上 ----
  // 浓度越高 = 玻璃越厚 = 更不透明、更糊、边缘更亮。
  // 唯独**折射强度不跟滑块走** —— 否则每拖一格都要重算位移贴图。
  const gblur  = 6 + 12 * gop;
  const gblur2 = 10 + 16 * gop;
  const gsat   = 140 + 40 * gop;
  const gedge  = Math.round((1 + 0.5 * gop) * 100) / 100;
  const ain    = light ? (0.04 + 0.06 * gop) : (0.06 + 0.06 * gop);
  root.style.setProperty('--glass-blur',  wa(gblur) + 'px');
  root.style.setProperty('--glass-blur2', wa(gblur2) + 'px');
  root.style.setProperty('--glass-sat',   wa(gsat) + '%');
  root.style.setProperty('--glass-edge',  gedge + 'px');
  root.style.setProperty('--glass-in',    'rgba(' + gTint + ',' + wa(ain) + ')');
  root.style.setProperty('--glass-in-br', light ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.14)');
  root.style.setProperty('--glass-rim',   'rgba(255,255,255,' + wa(light ? (0.45 + 0.45 * gop) : (0.14 + 0.16 * gop)) + ')');
  root.style.setProperty('--glass-hl2',   light ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.06)');
  root.style.setProperty('--glass-sheen', light ? 'rgba(255,255,255,.34)' : 'rgba(255,255,255,.05)');
  // 边缘内侧的柔光：模拟光线从玻璃侧面透进来，是「厚度感」的主要来源
  root.style.setProperty('--glass-glow',  light ? 'rgba(255,255,255,.30)' : 'rgba(255,255,255,.09)');

  // 尺寸要等这一帧布局完才准，交给 rAF
  if(typeof requestAnimationFrame === 'function') requestAnimationFrame(applyGlassLayers);
}

/** 第 i 套风格的显示名：用户改过就用改过的，没改过用预设名 */
function themeNameOf(i){
  const names = (CFG && CFG.themeNames) || {};
  const ov = names[String(i)] !== undefined ? names[String(i)] : names[i];
  if(ov) return String(ov);
  const p = ((CFG && CFG.themes) || [])[i];
  return (p && p.name) || ('风格 ' + (i + 1));
}

/** 第 i 套风格的背景图地址：用户换过就用换过的（可能是 data: URL），否则用预设自带的 */
function themeBgOf(i){
  const bgs = (CFG && CFG.themeBgs) || {};
  const ov = bgs[String(i)] !== undefined ? bgs[String(i)] : bgs[i];
  if(ov) return String(ov);
  const p = ((CFG && CFG.themes) || [])[i];
  return (p && p.bg) || '';
}

/** 预览一套主题：只改 CSS 变量，不写进配置。关掉设置窗口时会还原。
    图表颜色是直接画进 SVG 属性里的（不读 CSS 变量），所以要把 CFG.theme
    临时换过去重画一遍、画完立刻换回来 —— 否则点主题卡片时，除了图表全都变色了。
    bgOp 是这三样（背景图 / 玻璃浓度）的可选覆盖值，预览时传。 */
function previewTheme(t, bgUrl, glassOp){
  const old = CFG.theme;
  CFG.theme = t;
  applyTheme(t, bgUrl, glassOp);
  try{ drawCharts(); }catch(e){ /* 页面还没渲染时没有图表，忽略 */ }
  CFG.theme = old;
}

/** 还原成当前配置里的主题 */
function clearThemePreview(){
  applyTheme();
  try{ drawCharts(); }catch(e){ /* 同上 */ }
}

/** 标题、页签文字等静态文案 */
function applyStaticText(){
  document.title = CFG.appTitle + ' · ' + CFG.studentName;
  const set = (sel, txt) => { const el = $(sel); if(el) el.textContent = txt; };
  set('#brandTitle', CFG.appTitle);
  set('#brandSeal', CFG.appTitle.slice(0, 1) || '修');
  set('#tabHome', CFG.pageNames.home);
  set('#tabStudy', CFG.pageNames.study);
  set('#tabFurnace', CFG.pageNames.furnace);
  set('#tabRecord', CFG.pageNames.record);
}

/** 标签取色（配置里找不到就给个中性灰，不让画面破掉） */
const TAG_FALLBACK = '#8FA596';
function tagColor(map, key){ return (map && map[key]) || TAG_FALLBACK; }

/** 取当前生效配置。极少数早期调用（生成示例数据）时 CFG 还没建好，退回出厂默认 */
function conf(){ return CFG || CONFIG; }

/* ================================================================
   二、工具函数
   ================================================================ */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const pad2 = n => String(n).padStart(2, '0');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** Date → 'YYYY-MM-DD'（按本地时区，避免 UTC 偏移导致的日期错乱） */
function fmtDate(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function parseDate(s){ const [y,m,d] = String(s).split('-').map(Number); return new Date(y, m-1, d); }
function todayStr(){ return fmtDate(new Date()); }
function addDays(d, n){ const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate()+n); return x; }
function diffDays(aStr, bStr){ return Math.round((parseDate(bStr) - parseDate(aStr)) / 86400000); }
/** 周一为一周之始 */
function startOfWeek(d){ const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay()+6)%7)); return x; }
function weekKeyOf(d){ return fmtDate(startOfWeek(d)); }
function addDaysStr(s, n){ return fmtDate(addDays(parseDate(s), n)); }
function weekLabel(key){
  const s = parseDate(key), e = addDays(s, 6);
  return (s.getMonth()+1)+'月'+s.getDate()+'日 — '+(e.getMonth()+1)+'月'+e.getDate()+'日';
}
function debounce(fn, ms){ let t; return function(){ clearTimeout(t); const a = arguments, c = this; t = setTimeout(() => fn.apply(c, a), ms); }; }

/** 轻量提示条 */
function toast(msg, warn){
  const box = $('#toast');
  if(!box) return;                     // 容器缺失时静默跳过，不影响主流程
  const el = document.createElement('div');
  el.className = 'toast-item' + (warn ? ' warn' : '');
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .4s,transform .4s'; el.style.opacity = 0; el.style.transform = 'translateY(8px)'; setTimeout(() => el.remove(), 420); }, 2200);
}

/** 探测浏览器是否真的能写入 localStorage。
    部分浏览器在 file:// 下会禁用本地存储，此时页面仍可用，但数据无法留存，需要明确告知。 */
function storageAvailable(){
  try{
    const k = CONFIG.storagePrefix + '__probe';
    localStorage.setItem(k, '1');
    const ok = localStorage.getItem(k) === '1';
    localStorage.removeItem(k);
    return ok;
  }catch(e){ return false; }
}

/** 线性图标库（统一 SVG，不用 emoji） */
const ICON = {
  check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  plus:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  edit:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  trash:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
  chev:'<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  left:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  right:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  copy:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  fire:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s1 1 1.5 2C10 8 12 5 12 2z"/></svg>',
  down:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>',
  up:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg>',
  history:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4.5V9H8"/><path d="M12 8v4.5l3 1.8"/></svg>',
  help:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M9.4 9.2a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.1-2.6 3.7"/><path d="M12 17.4h.01"/></svg>',
  cloud:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6 9.3 4.2 4.2 0 0 0 7 18z"/></svg>',
  warn:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 22 20H2z"/><path d="M12 10v4M12 17h.01"/></svg>',
  link:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7L12.5 19.5"/></svg>',
  unlink:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7"/><path d="M4 4l16 16"/></svg>'
};
/** 学科图标库 —— 在「设置 → 学科」里给每个学科挑一个，写图标名即可 */
const SUBJ_ICON_LIB = {
  book:   '<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  math:   '<circle cx="8" cy="8" r="4.2"/><rect x="13" y="12" width="7" height="7" rx="1"/><path d="M5.5 19.5 18.5 6.5"/>',
  globe:  '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.6 3 14.4 0 18M12 3c-3 3.6-3 14.4 0 18"/>',
  atom:   '<path d="M6 20V8a6 6 0 0 1 12 0v12"/><path d="M6 14h3.5M14.5 14H18"/>',
  flask:  '<path d="M9 3h6v5l5 10.5A2.5 2.5 0 0 1 17.8 22H6.2A2.5 2.5 0 0 1 4 18.5L9 8z"/><path d="M7 15h10"/>',
  scale:  '<path d="M12 3v18M8 21h8M3 8h18"/><path d="M3 8l-2.5 6h5zM21 8l-2.5 6h5z"/>',
  scroll: '<path d="M6 3h12M6 21h12"/><path d="M8 3v3l4 6 4-6V3M8 21v-3l4-6 4 6v3"/>',
  run:    '<path d="M4 9v6M20 9v6M7 6v12M17 6v12M7 12h10"/>',
  pen:    '<path d="M4 19.5 6 15.5l11-11a2.1 2.1 0 0 1 3 3l-11 11z"/><path d="M14.5 6.5l3 3"/><path d="M4 19.5c1.5-.5 2.5-1.5 3-3"/>',
  music:  '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  star:   '<path d="M12 3l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.1 6.1 21.2l1.2-6.6L2.5 10l6.6-.9z"/>',
  leaf:   '<path d="M4 20c0-9 6-15 16-15 0 9-5 15-13 15H4z"/><path d="M5 19c3-4 6-6 10-7"/>',
  flag:   '<path d="M5 21V4"/><path d="M5 5h13l-2 3 2 3H5"/><path d="M4 21h17"/>',
  clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v4.8l3.4 2"/>',
  chat:   '<path d="M4 5h16v11H9l-5 4z"/>',
  gear:   '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>'
};
const ICON_NAMES = Object.keys(SUBJ_ICON_LIB);

/** 学科图标：配置里指定了就用指定的，没配的按名字算一个固定图标（刷新不会变） */
function subjIcon(name, size){
  size = size || 20;
  const map = conf().subjIcons;
  let id = map[name];
  if(!SUBJ_ICON_LIB[id]){
    let h = 0;
    const nm = String(name || '');
    for(let i = 0; i < nm.length; i++) h = (h * 31 + nm.charCodeAt(i)) % 997;
    id = ICON_NAMES[h % ICON_NAMES.length];
  }
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+SUBJ_ICON_LIB[id]+'</svg>';
}

/* ================================================================
   三、数据层 Store —— 全部落在 localStorage，键名前缀 wuxia_study_
   ================================================================ */
const Store = {
  key: k => CONFIG.storagePrefix + k,
  state: null,
  canPersist: true,      // 启动时探测；若浏览器禁用本地存储则为 false（页面仍可用，但关掉就没了）

  /** 读取；首次使用（无数据）时写入示例数据 */
  load(){
    try{
      const raw = localStorage.getItem(this.key('state'));
      if(raw){ this.state = JSON.parse(raw); return this.state; }
    }catch(e){ console.warn('本地数据损坏，将重建示例数据', e); }
    this.state = seedData();
    this.save();
    return this.state;
  },
  save(){
    if(!this.canPersist) return;       // 存不了就只留在内存里，不反复报错
    try{
      localStorage.setItem(this.key('state'), JSON.stringify(this.state));
    }catch(e){ toast('保存失败：浏览器存储空间可能已满', true); console.error(e); }
  },
  /** 触发保存 + 全量重渲染 + （家长端）自动上传 */
  commit(opts){
    this.save();
    renderAll();
    if(!(opts && opts.noSync) && typeof CLOUD !== 'undefined') CLOUD.afterChange();
  },
  clearAll(){
    try{
      Object.keys(localStorage).filter(k => k.indexOf(CONFIG.storagePrefix) === 0)
        .forEach(k => localStorage.removeItem(k));
    }catch(e){ /* 存储被禁用时忽略，下面照样重置内存中的数据 */ }
    this.state = seedData();
    this.save();
  },
  importJSON(json){
    try{
      const obj = JSON.parse(json);
      if(!obj || typeof obj !== 'object' || !Array.isArray(obj.tasks)) throw new Error('格式不符');
      this.state = Object.assign(seedData(), obj);
      normalizeState();        // 导入旧备份时补齐缺失字段
      this.save();
      return true;
    }catch(e){ toast('导入失败：不是本工具导出的备份文件', true); return false; }
  }
};

/* ================================================================
   四、示例数据（首次打开时填充，人名统一「罗小川」，用占位符替代敏感信息）
   ================================================================ */
function seedData(){
  const wk = weekKeyOf(new Date());
  const todayIdx = (new Date().getDay() + 6) % 7; // 0=周一 … 6=周日
  const today = todayStr();

  // ---- 本周学科任务（贴近初三节奏：套题 + 错题 + 背诵三类循环）----
  const raw = [
    ['语文','古诗文默写 10 首过关',        25,'必做',0],
    ['语文','现代文阅读理解 2 篇',         35,'必做',2],
    ['语文','作文素材摘抄 3 则',            20,'选做',4],
    ['语文','文言实词+虚词 15 个',          25,'必做',5],
    ['数学','二次函数专题套卷',             45,'必做',0],
    ['数学','圆与相似综合题 3 道',          40,'必做',1],
    ['数学','错题本重做：上周 5 题',        30,'必做',3],
    ['数学','压轴题最后一问专项',           40,'挑战',5],
    ['英语','中考词汇 List 12—14',          25,'必做',0],
    ['英语','完形+阅读各 2 篇',             35,'必做',2],
    ['英语','听力真题一套',                 20,'必做',4],
    ['英语','英语范文背诵 1 篇',            20,'选做',6],
    ['物理','电学实验专题练习',             35,'必做',1],
    ['物理','力学作图 + 计算 10 题',        30,'必做',3],
    ['物理','错题重做：浮力压强',           25,'必做',6],
    ['化学','化学方程式默写 30 条',         20,'必做',1],
    ['化学','酸碱盐推断题 5 道',            30,'必做',4],
    ['化学','实验探究题专项',               35,'挑战',6],
    ['道法','时政热点梳理 · 第 3 期',       20,'选做',2],
    ['道法','主观题答题模板背诵',           20,'必做',5],
    ['历史','时间轴梳理：近代史下册',       25,'必做',3],
    ['历史','材料题专项 2 道',              30,'必做',6],
    ['体育','跳绳 3 组 + 跑步 800m',        30,'必做',1],
    ['体育','立定跳远 / 实心球练习',        25,'必做',4],
    ['体育','周末长跑拉练',                 40,'选做',6]
  ];
  const tasks = raw.map((r, i) => {
    // 过去的日子默认已完成，今天部分完成，未来全部待开始 —— 更接近真实状态
    let status = '待开始';
    if(r[4] < todayIdx) status = (i % 7 === 0) ? '进行中' : '已完成';
    else if(r[4] === todayIdx) status = (i % 3 === 0) ? '已完成' : (i % 3 === 1 ? '进行中' : '待开始');
    return {
      id: uid(), subject: r[0], title: r[1], minutes: r[2],
      difficulty: r[3], day: r[4], weekKey: wk, status: status,
      actualMin: status === '已完成' ? r[2] : null
    };
  });

  // ---- 错题（按今日倒推生成，保证有几条正好落在今日复习队列）----
  const MK = Object.keys(CONFIG.mastery);   // 掌握状态三档：未掌握 / 复习中 / 已掌握
  const rawMis = [
    ['数学','二次函数压轴第 3 问：动点求最值','概念不清','配方法→顶点式，再看自变量区间端点；开口向下取最大别漏端点比较', 1, 0],
    ['数学','圆的切线证明漏写垂直符号','计算失误','连半径证垂直，必须写出“⊥”依据再写结论', 3, 1],
    ['物理','浮力题选错参考对象','审题偏差','先圈关键词（漂浮/悬浮/沉底），判定 V排 再套阿基米德', 7, 2],
    ['英语','完形填空：however / therefore 选错','概念不清','读空格所在整句，判断转折还是因果', 15, 3],
    ['化学','推断题突破口没抓住颜色','完全不会','背熟“有色沉淀/气体”清单：Cu(OH)₂ 蓝、Fe(OH)₃ 红褐、BaSO₄ 不溶于酸', 1, 0],
    ['语文','《岳阳楼记》默写：把“衔远山”写成“含远山”','审题偏差','易错字单独列一张默写卡，每天抄 3 遍', 3, 1],
    ['数学','分式方程忘检验增根','计算失误','分式方程 step2：代入最简公分母检验，写在旁边', 7, 2],
    ['历史','材料题答成了背诵知识点','概念不适','材料题先概括材料主旨，再联系课本，不可直接默写', 2, 0]
  ];
  const mistakes = rawMis.map(m => {
    const created = addDaysStr(today, -m[4]);
    const cnt = m[5];
    const itv = CONFIG.reviewIntervals[Math.min(cnt, CONFIG.reviewIntervals.length - 1)];
    return {
      id: uid(), subject: m[0], title: m[1], cause: cfgCause(m[2]), solution: m[3],
      createdAt: created, reviewCount: cnt,
      nextReview: cnt >= CONFIG.reviewIntervals.length ? null : addDaysStr(created, itv),
      mastery: cnt >= 4 ? MK[2] : (cnt > 0 ? MK[1] : MK[0])
    };
  });
  // 上面第 8 条故意写了个不在字典里的错因，这里统一兜底到第一个错因
  mistakes.forEach(m => { if(!CONFIG.causes[m.cause]) m.cause = Object.keys(CONFIG.causes)[0]; });

  // ---- 考试成绩（示例校名/班级一律用占位符）----
  const examSeed = [
    ['七年级下期末','2026-03-20',{语文:88,数学:75,英语:92,物理:44,化学:33,道法:36,历史:35,体育:38}],
    ['期初摸底考','2026-04-25',{语文:90,数学:79,英语:93,物理:48,化学:35,道法:38,历史:37,体育:40}],
    ['期中小测','2026-05-28',{语文:92,数学:84,英语:95,物理:51,化学:39,道法:40,历史:39,体育:42}],
    ['期末统考模拟','2026-07-02',{语文:94,数学:88,英语:96,物理:55,化学:41,道法:42,历史:41,体育:44}],
    ['开学检测','2026-09-05',{语文:96,数学:92,英语:99,物理:58,化学:43,道法:44,历史:43,体育:46}],
    ['十月月考','2026-10-09',{语文:99,数学:96,英语:104,物理:60,化学:45,道法:45,历史:45,体育:47}]
  ];
  const exams = examSeed.map(e => ({
    id: uid(), name: e[0], date: e[1], scores: e[2],
    full: Object.assign({}, CONFIG.fullMarks), note: '【示例学校】·【示例班级】'
  }));

  // ---- 复盘小结归档 ----
  const prev1 = addDaysStr(wk, -7), prev2 = addDaysStr(wk, -14);
  const reviews = [
    { weekKey: prev2, text: '这周状态一般，数学套卷总做不完，本质是前面的小题卡太久。下周给自己定个死规矩：选择填空不超过 25 分钟。', updatedAt: prev2 },
    { weekKey: prev1, text: '英语听力提了 6 分，因为每天坚持一套真题。物理浮力还是最怕，这周专门回头啃了错题本，感觉稳了一点。', updatedAt: prev1 }
  ];

  return {
    version: 1,
    settings: {
      studentName: CONFIG.studentName,
      examDate: CONFIG.examDate,
      stages: JSON.parse(JSON.stringify(CONFIG.stages))
    },
    tasks, mistakes, exams, reviews,
    ui: { openSubjects: [] }
  };
}
  /** 错因兜底：不在字典里的归到第一个错因，避免出现没有颜色的孤儿标签 */
function cfgCause(c){
  const dict = conf().causes;
  return dict[c] ? c : Object.keys(dict)[0];
}

/** 归一化：补齐缺失字段，保证导入旧备份 / 手工改坏的数据也不会让页面崩溃 */
function normalizeState(){
  const st = Store.state || (Store.state = {});
  ['tasks','mistakes','exams','reviews'].forEach(k => { if(!Array.isArray(st[k])) st[k] = []; });
  if(!st.ui || typeof st.ui !== 'object') st.ui = {};
  if(!Array.isArray(st.ui.openSubjects)) st.ui.openSubjects = [];
  if(!st.settings || typeof st.settings !== 'object') st.settings = {};
  if(!Array.isArray(st.settings.stages) || !st.settings.stages.length){
    st.settings.stages = JSON.parse(JSON.stringify(CONFIG.stages));
  }else{
    st.settings.stages = st.settings.stages.map((s, i) => ({
      name: (s && s.name) || (CONFIG.stages[i] ? CONFIG.stages[i].name : '阶段' + (i+1)),
      start: (s && s.start) || (CONFIG.stages[i] ? CONFIG.stages[i].start : todayStr()),
      end: (s && s.end) || (CONFIG.stages[i] ? CONFIG.stages[i].end : todayStr())
    }));
  }
  if(!st.settings.examDate) st.settings.examDate = CONFIG.examDate;
  if(!st.settings.studentName) st.settings.studentName = CONFIG.studentName;
  if(!st.config || typeof st.config !== 'object') st.config = {};   // 自定义配置（旧备份没有，补空对象）
  return st;
}

/* ================================================================
   五、派生计算（业务规则的唯一出处，渲染层只读不算）
   ================================================================ */
const Calc = {
  weekKey(){ return weekKeyOf(new Date()); },
  todayIdx(){ return (new Date().getDay() + 6) % 7; },
  weekTasks(wk){ return (Store.state.tasks || []).filter(t => t.weekKey === (wk || this.weekKey())); },

  /* ---- 下面三个「全集」很关键：你在设置里改过学科/错因/难度之后，
          历史数据里用的老名字仍然会出现在列表里，不会被藏起来 ---- */
  /** 学科全集 = 当前配置的学科 + 数据里出现过的旧学科 */
  allSubjects(){
    const out = conf().subjects.slice();
    const push = s => { if(s && out.indexOf(s) < 0) out.push(s); };
    (Store.state.tasks || []).forEach(t => push(t.subject));
    (Store.state.mistakes || []).forEach(m => push(m.subject));
    (Store.state.exams || []).forEach(e => Object.keys(e.scores || {}).forEach(push));
    return out;
  },
  /** 错因全集 = 当前配置 + 数据里出现过的旧错因 */
  allCauses(){
    const out = Object.keys(conf().causes);
    (Store.state.mistakes || []).forEach(m => { if(m.cause && out.indexOf(m.cause) < 0) out.push(m.cause); });
    return out;
  },
  /** 难度全集 = 当前配置 + 数据里出现过的旧难度 */
  allDifficulties(){
    const out = Object.keys(conf().difficulties);
    (Store.state.tasks || []).forEach(t => { if(t.difficulty && out.indexOf(t.difficulty) < 0) out.push(t.difficulty); });
    return out;
  },
  /** 本周完成情况 */
  weekStats(wk){
    const list = this.weekTasks(wk);
    const done = list.filter(t => t.status === '已完成');
    return { total: list.length, done: done.length, percent: list.length ? Math.round(done.length / list.length * 100) : 0, list, doneList: done };
  },
  /** 周一到周日，每天是否「全部完成」 */
  dayStatus(wk){
    const list = this.weekTasks(wk);
    return [0,1,2,3,4,5,6].map(i => {
      const dl = list.filter(t => t.day === i);
      return { day: i, total: dl.length, done: dl.filter(t => t.status === '已完成').length, lit: dl.length > 0 && dl.every(t => t.status === '已完成') };
    });
  },
  /** 今日待办 */
  todayTasks(){ return this.weekTasks().filter(t => t.day === this.todayIdx()); },
  /** 各学科本周进度（含数据里出现过的旧学科） */
  subjectStats(wk){
    return this.allSubjects().map(s => {
      const dl = this.weekTasks(wk).filter(t => t.subject === s);
      const done = dl.filter(t => t.status === '已完成').length;
      return { subject: s, total: dl.length, done, percent: dl.length ? Math.round(done/dl.length*100) : 0 };
    });
  },
  /** 倒计时天数 */
  daysLeft(){ return diffDays(todayStr(), Store.state.settings.examDate); },
  /** 当前备考阶段 */
  currentStage(){
    const t = todayStr();
    const st = (Store.state.settings && Array.isArray(Store.state.settings.stages) && Store.state.settings.stages.length)
      ? Store.state.settings.stages : conf().stages;
    let idx = st.findIndex(s => t >= s.start && t <= s.end);
    if(idx < 0) idx = t < st[0].start ? 0 : st.length - 1;
    const cur = st[idx];
    const span = Math.max(diffDays(cur.start, cur.end), 1);
    const passed = clamp(diffDays(cur.start, t), 0, span);
    return { index: idx, stage: cur, percent: Math.round(passed / span * 100) };
  },
  /** 艾宾浩斯：今日待复习错题队列 */
  dueReviews(){
    const t = todayStr();
    return (Store.state.mistakes || []).filter(m => m.mastery !== CFG.masteryDone && m.nextReview && m.nextReview <= t)
      .sort((a,b) => (a.nextReview < b.nextReview ? -1 : 1));
  },
  /** 复习一次：推进到下一个间隔 */
  reviewOnce(m){
    m.reviewCount = (m.reviewCount || 0) + 1;
    const iv = CFG.reviewIntervals;
    const MK = Object.keys(CFG.mastery);
    if(m.reviewCount >= iv.length){ m.nextReview = null; m.mastery = CFG.masteryDone; }
    else{
      m.nextReview = addDaysStr(todayStr(), iv[m.reviewCount]);
      m.mastery = m.reviewCount === 0 ? CFG.masteryStart : MK[1];
    }
  },
  examTotal(e){ return CFG.subjects.reduce((s, k) => s + (Number(e.scores[k]) || 0), 0); },
  examFull(e){ return CFG.subjects.reduce((s, k) => s + (Number(e.full[k]) || Number(CFG.fullMarks[k]) || 0), 0); },
  sortedExams(){ return (Store.state.exams || []).slice().sort((a,b) => (a.date < b.date ? -1 : 1)); },
  /** 本周每日学习时长（按已完成任务的实际用时） */
  weeklyMinutes(wk){
    const list = this.weekTasks(wk).filter(t => t.status === '已完成');
    return [0,1,2,3,4,5,6].map(i => list.filter(t => t.day === i).reduce((s,t) => s + (t.actualMin || t.minutes || 0), 0));
  },
  /** 各科学分率（近几次平均） */
  subjectRate(){
    const exams = this.sortedExams().slice(-8);
    if(!exams.length) return [];
    return CFG.subjects.map(s => {
      let got = 0, full = 0;
      exams.forEach(e => { got += Number(e.scores[s]) || 0; full += Number(e.full[s]) || Number(CFG.fullMarks[s]) || 0; });
      return { subject: s, rate: full ? Math.round(got / full * 100) : 0 };
    }).sort((a,b) => a.rate - b.rate);
  },
  mottoOfDay(){
    const n = diffDays('2026-01-01', todayStr());
    const list = conf().mottos;      // 合并后一定非空（空的话会自动退回出厂励志语）
    return list[Math.abs(n) % list.length];
  }
};

/* ================================================================
   六、图表层 —— 全部手写 SVG（不用 CDN 图表库）
   理由：中考期间可能在没网的教室里打开，CDN 一断图表就没了；
        手写 SVG 零依赖、离线可用，且配色能与水墨主题完全统一。
   ================================================================ */
const chartDefs = {};   // 图表定义表，drawCharts 时按 key 取用

/** 多线图配色：先取主题里的几个主色，再补几个协调色，学科加到十几个也够用 */
function seriesColors(){
  const t = CFG.theme;
  return [t.bamboo, t.gold, '#6FA8DC', '#B48CC8', '#D98E5A', t.cinnabar, t.muted, '#9B8CD8', '#5FBF9F', '#D9A0C0'];
}

/** 折线图 */
function drawLine(el, cfg){
  const all = cfg.series.reduce((a, s) => a.concat(s.values), []);
  if(!all.length){ el.innerHTML = '<div class="empty">暂无数据，先在「战绩」里录一次成绩吧</div>'; return; }
  const W = Math.max(Math.round(el.getBoundingClientRect().width) || 640, 320);
  const H = cfg.height || 220;
  const pL = 46, pR = 16, pT = 16, pB = 30;
  const iw = W - pL - pR, ih = H - pT - pB;
  let min = Math.min.apply(null, all), max = Math.max.apply(null, all);
  if(cfg.minZero !== false) min = Math.min(min, 0);
  if(max === min){ max = min + 10; min = Math.max(0, min - 5); }
  const range = max - min;
  const stepPad = range * 0.12;
  min = Math.max(0, Math.floor(min - stepPad)); max = Math.ceil(max + stepPad);
  const y = v => pT + ih - (v - min) / (max - min) * ih;
  const nLabels = cfg.labels || [];
  const n = Math.max(nLabels.length, 1);
  const x = i => pL + (n === 1 ? iw/2 : i * iw / (n - 1));

  let s = '<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img">';
  // 网格与 Y 轴刻度
  for(let i = 0; i <= 4; i++){
    const v = min + (max - min) * i / 4, yy = y(v);
    s += '<line x1="'+pL+'" y1="'+yy.toFixed(1)+'" x2="'+(W-pR)+'" y2="'+yy.toFixed(1)+'" stroke="'+CFG.theme.jade+'" stroke-opacity=".12" stroke-width="1"/>';
    s += '<text x="'+(pL-8)+'" y="'+(yy+4).toFixed(1)+'" text-anchor="end" font-size="10.5" fill="'+CFG.theme.muted+'" font-family="monospace">'+Math.round(v)+'</text>';
  }
  // 每条序列
  cfg.series.forEach(se => {
    if(!se.values.length) return;
    const pts = se.values.map((v, i) => x(i) + ',' + y(v).toFixed(1)).join(' ');
    s += '<polyline points="'+pts+'" fill="none" stroke="'+se.color+'" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>';
    if(se.area !== false){
      const base = y(min);
      s += '<polygon points="'+x(0)+','+base.toFixed(1)+' '+pts+' '+x(se.values.length-1)+','+base.toFixed(1)+'" fill="'+se.color+'" opacity=".10"/>';
    }
    se.values.forEach((v, i) => {
      const cx = x(i), cy = y(v);
      s += '<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="3.6" fill="'+CFG.theme.bg1+'" stroke="'+se.color+'" stroke-width="2"/>';
      if(n <= 8 || i === se.values.length - 1){
        s += '<text x="'+cx.toFixed(1)+'" y="'+(cy-9).toFixed(1)+'" text-anchor="middle" font-size="10.5" fill="'+se.color+'" font-family="monospace">'+v+'</text>';
      }
    });
  });
  // X 轴标签（按可用宽度抽稀，窄屏不会挤成一团）
  const maxLabels = Math.max(2, Math.floor(iw / 56));
  const everyN = Math.max(Math.ceil(n / maxLabels), 1);
  nLabels.forEach((lb, i) => {
    if(i % everyN !== 0 && i !== n - 1) return;
    const isFirst = i === 0, isLast = i === n - 1;
    // 首尾标签贴边时改用左/右对齐，免得一半被裁掉
    let anchor = 'middle', tx = x(i);
    if(isFirst && !isLast){ anchor = 'start'; tx = Math.max(x(i) - 26, 2); }
    else if(isLast && !isFirst){ anchor = 'end'; tx = Math.min(x(i) + 26, W - 2); }
    s += '<text x="'+tx.toFixed(1)+'" y="'+(H-10)+'" text-anchor="'+anchor+'" font-size="10.5" fill="'+CFG.theme.muted+'">'+esc(lb)+'</text>';
  });
  s += '</svg>';
  el.innerHTML = s;
}

/** 竖向柱状图（用于每周学习时长） */
function drawBars(el, cfg){
  const W = Math.max(Math.round(el.getBoundingClientRect().width) || 640, 320);
  const H = cfg.height || 200;
  const pL = 40, pR = 14, pT = 18, pB = 30;
  const iw = W - pL - pR, ih = H - pT - pB;
  const vals = cfg.values, labels = cfg.labels;
  const max = Math.max.apply(null, vals.concat([1]));
  const nice = Math.ceil(max / 30) * 30 || 60;
  const bw = iw / vals.length * 0.52;
  let s = '<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">';
  for(let i = 0; i <= 3; i++){
    const v = nice * i / 3, yy = pT + ih - ih * i / 3;
    s += '<line x1="'+pL+'" y1="'+yy.toFixed(1)+'" x2="'+(W-pR)+'" y2="'+yy.toFixed(1)+'" stroke="'+CFG.theme.jade+'" stroke-opacity=".12" stroke-width="1"/>';
    s += '<text x="'+(pL-7)+'" y="'+(yy+4).toFixed(1)+'" text-anchor="end" font-size="10.5" fill="'+CFG.theme.muted+'" font-family="monospace">'+Math.round(v)+'</text>';
  }
  vals.forEach((v, i) => {
    const cx = pL + iw * (i + 0.5) / vals.length;
    const h = ih * v / nice;
    const yy = pT + ih - h;
    s += '<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+yy.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(h, v>0?2:0).toFixed(1)+'" rx="4" fill="'+(cfg.color||CFG.theme.bamboo)+'" opacity="'+(v>0?'0.85':'0.15')+'"/>';
    if(v > 0) s += '<text x="'+cx.toFixed(1)+'" y="'+(yy-6).toFixed(1)+'" text-anchor="middle" font-size="10.5" fill="'+CFG.theme.jade+'" font-family="monospace">'+v+'</text>';
    s += '<text x="'+cx.toFixed(1)+'" y="'+(H-10)+'" text-anchor="middle" font-size="11" fill="'+CFG.theme.muted+'">'+esc(labels[i])+'</text>';
  });
  s += '</svg>';
  el.innerHTML = s;
}

/** 环形进度图 */
function ringSVG(percent, size){
  size = size || 150;
  const r = 50, c = 2 * Math.PI * r, off = c * (1 - clamp(percent, 0, 100) / 100);
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 120 120">' +
    '<circle cx="60" cy="60" r="'+r+'" fill="none" stroke="'+CFG.theme.jade+'" stroke-opacity=".14" stroke-width="10"/>' +
    '<circle cx="60" cy="60" r="'+r+'" fill="none" stroke="'+CFG.theme.bamboo+'" stroke-width="10" stroke-linecap="round" ' +
      'stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 60 60)"/>' +
    '<text x="60" y="66" text-anchor="middle" font-size="26" fill="'+CFG.theme.bamboo+'" font-family="monospace" font-weight="700">'+percent+'%</text>' +
    '</svg>';
}

/** 统一的图表绘制入口，页面渲染完成后调用，支持窗口缩放重绘 */
function drawCharts(){
  Object.keys(chartDefs).forEach(key => {
    const el = $('[data-chart="'+key+'"]');
    if(!el) return;
    let def;
    try{ def = chartDefs[key](); }catch(e){ def = null; }
    if(!def) return;
    if(def.type === 'line') drawLine(el, def.cfg);
    else if(def.type === 'bars') drawBars(el, def.cfg);
  });
}

/* ================================================================
   七、渲染层 —— 每个页面一个函数，只负责拼 HTML
   ================================================================ */
const WEEKDAY = ['周一','周二','周三','周四','周五','周六','周日'];

function tagStyle(color, text){
  return '<span class="tag" style="color:'+color+'">'+esc(text)+'</span>';
}

/** 单条任务 */
function taskRow(t, opts){
  opts = opts || {};
  const done = t.status === '已完成';
  return '<div class="task'+(done?' done':'')+'">' +
    '<div class="check" data-action="toggle-task" data-id="'+t.id+'" title="点一下完成 / 取消">'+ICON.check+'</div>' +
    '<div class="body">' +
      '<div class="ttl">'+esc(t.title)+'</div>' +
      '<div class="meta">' +
        tagStyle(tagColor(CFG.difficulties, t.difficulty), t.difficulty) +
        '<span class="muted">'+t.minutes+' 分</span>' +
        (t.actualMin && t.actualMin !== t.minutes ? '<span class="muted">实际 '+t.actualMin+' 分</span>' : '') +
        (opts.hideDay ? '' : '<span class="muted">'+WEEKDAY[t.day]+'</span>') +
      '</div>' +
    '</div>' +
    '<div class="acts">' +
      (opts.hideDay ? '' : '<button class="btn btn-sm" data-action="move-day" data-id="'+t.id+'" data-dir="-1" title="往前挪一天">'+ICON.left+'</button>' +
                           '<button class="btn btn-sm" data-action="move-day" data-id="'+t.id+'" data-dir="1" title="往后挪一天">'+ICON.right+'</button>') +
      '<button class="btn btn-sm" data-action="edit-task" data-id="'+t.id+'" title="编辑">'+ICON.edit+'</button>' +
      '<button class="btn btn-sm btn-danger" data-action="del-task" data-id="'+t.id+'" title="删除">'+ICON.trash+'</button>' +
    '</div>' +
  '</div>';
}

/* ---------------- 页面 1：修行总览 ---------------- */
function renderHome(){
  const st = Calc.weekStats();
  const days = Calc.dayStatus();
  const dueList = Calc.dueReviews();
  const exams = Calc.sortedExams().slice(-8);
  const tIdx = Calc.todayIdx();
  const cs = Calc.currentStage();
  const left = Calc.daysLeft();
  const tot = Calc.todayTasks();

  chartDefs['home-trend'] = () => ({
    type: 'line',
    cfg: { height: 230, series: [{ name:'总分', color: CFG.theme.bamboo, values: exams.map(e => Calc.examTotal(e)) }],
           labels: exams.map(e => e.name.length > 6 ? e.name.slice(0,6) : e.name) }
  });

  return '\
  <div class="hero-grid">\
    <div class="card">\
      <div class="card-title"><span>本周修行进度</span><span class="t-line"></span><span class="t-side">'+weekLabel(Calc.weekKey())+'</span></div>\
      <div class="bigwrap">\
        <div>'+ringSVG(st.percent, 150)+'</div>\
        <div>\
          <div class="n" style="font-size:22px;color:var(--jade)">'+st.done+' <small>/ '+st.total+' 项</small></div>\
          <div class="desc">'+ (st.percent >= 80 ? '本周势头很稳，继续保持。' : st.percent >= 50 ? '过半了，后半程别松劲。' : '刚开头，先把必做的拿下。') +'</div>\
          <div class="weekbox">' + days.map(d => '<div class="d'+(d.lit?' lit':'')+(d.day===tIdx?' today':'')+'"><b>'+WEEKDAY[d.day].slice(1)+'</b>'+(d.total? (d.done+'/'+d.total) : '—')+'</div>').join('') + '</div>\
        </div>\
      </div>\
    </div>\
    <div class="card">\
      <div class="card-title"><span>今日修行 · '+WEEKDAY[tIdx]+'</span><span class="t-line"></span></div>\
      <div class="muted" style="margin:-6px 0 10px">'+esc(Calc.mottoOfDay())+'</div>\
      '+(tot.length ? tot.map(t => taskRow(t, {hideDay:true})).join('') : '<div class="empty">今天没排任务，去「习文」安排一下，或给自己放个假。</div>')+'\
    </div>\
  </div>\
  <div class="card">\
    <div class="card-title"><span>中考倒计时</span><span class="t-line"></span><span class="t-side">'+(left>=0? '还有 '+left+' 天' : '已过 '+Math.abs(left)+' 天')+'</span></div>\
    <div class="stagewrap">' + Store.state.settings.stages.map((s, i) => '\
      <div class="seg'+(i===cs.index?' on':'')+'">\
        <div class="nm">'+esc(s.name)+'</div>\
        <div class="bar"><i style="width:'+(i<cs.index?100:(i===cs.index?cs.percent:0))+'%"></i></div>\
      </div>').join('') + '</div>\
    <div class="muted" style="margin-top:10px">当前阶段：<b style="color:var(--gold)">'+esc(cs.stage.name)+'</b>　已走完 '+cs.percent+'%（'+esc(cs.stage.start)+' → '+esc(cs.stage.end)+'）</div>\
  </div>\
  <div class="grid2">\
    <div class="card">\
      <div class="card-title"><span>成绩趋势</span><span class="t-line"></span><span class="t-side">近 8 次总分</span></div>\
      <div class="chart" data-chart="home-trend"></div>\
    </div>\
    <div class="card">\
      <div class="card-title"><span>炼丹炉 · 今日待复习</span><span class="t-line"></span><span class="t-side">'+dueList.length+' 题</span></div>\
      '+(dueList.length ? '<div class="empty" style="padding:8px 0 12px">趁热打铁，把这些错题再过一遍。</div>' + dueList.slice(0,5).map(m => '\
        <div class="task"><div class="body">\
          <div class="ttl">'+esc(m.title)+'</div>\
          <div class="meta">'+tagStyle(tagColor(CFG.mastery, m.mastery), m.mastery)+tagStyle(tagColor(CFG.causes, m.cause), m.cause)+'<span class="muted">'+esc(m.subject)+'</span><span class="muted">已复习 '+(m.reviewCount||0)+' 次</span></div>\
        </div><div class="acts"><button class="btn btn-sm btn-primary" data-action="review-once" data-id="'+m.id+'">复习一次</button></div></div>').join('')
        + '<button class="btn" style="width:100%;justify-content:center;margin-top:6px" data-action="go" data-page="furnace">进入炼丹炉</button>'
        : '<div class="empty">今天没有到期的错题。<br>新录的错题会自动在第 1 / 3 / 7 / 15 天提醒你。</div>')+'\
    </div>\
  </div>';
}

/* ---------------- 页面 2：习文 · 本周学科任务 ---------------- */
function renderStudy(){
  const wk = Calc.weekKey();
  const subs = Calc.subjectStats(wk);
  const openSet = new Set(Store.state.ui.openSubjects || []);
  const allOpen = (Store.state.ui.openSubjects || []).indexOf('__ALL__') >= 0;

  return '\
  <div class="card">\
    <div class="card-title"><span>各科本周战况</span><span class="t-line"></span><span class="t-side">'+weekLabel(wk)+'</span></div>\
    ' + subs.filter(s => s.total > 0).map(s => '\
      <div class="sumrow">\
        <span class="ico">'+subjIcon(s.subject,18)+'</span>\
        <span class="nm">'+esc(s.subject)+'</span>\
        <span class="bar thin"><i style="width:'+s.percent+'%"></i></span>\
        <span class="val">'+s.done+'/'+s.total+' · '+s.percent+'%</span>\
      </div>').join('') + '\
    <div class="row" style="margin-top:14px">\
      <button class="btn btn-primary" data-action="add-task">'+ICON.plus+' 新增任务</button>\
      <button class="btn" data-action="copy-last-week">'+ICON.copy+' 复制上周计划到本周</button>\
      <button class="btn" data-action="toggle-all-subjects">'+(allOpen?'全部收起':'全部展开')+'</button>\
    </div>\
  </div>\
  <div class="grid-subjects">' + Calc.allSubjects().map(s => {
    const list = Calc.weekTasks(wk).filter(t => t.subject === s);
    const st = subs.find(x => x.subject === s);
    const open = allOpen || openSet.has(s);
    return '\
    <div class="sub-card'+(open?' open':'')+'">\
      <div class="sub-head" data-action="toggle-subject" data-subject="'+esc(s)+'">\
        <span class="ico">'+subjIcon(s)+'</span>\
        <span class="nm">'+esc(s)+'</span>\
        <span class="cnt">'+st.done+'/'+st.total+'</span>\
        '+ICON.chev+'\
      </div>\
      '+(open ? '<div class="sub-body">' + (list.length ? list.map(t => taskRow(t)).join('') : '<div class="empty">本周暂无「'+esc(s)+'」任务</div>') + '\
        <button class="btn btn-sm" style="margin-top:6px" data-action="add-task" data-subject="'+esc(s)+'">'+ICON.plus+' 加一项</button></div>' : '')+'\
    </div>';
  }).join('') + '</div>';
}

/* ---------------- 页面 3：炼丹炉 · 错题复盘 ---------------- */
function renderFurnace(){
  const f = furnaceFilter;
  let list = Store.state.mistakes.slice().sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1));
  if(f.subject !== '__all__') list = list.filter(m => m.subject === f.subject);
  if(f.cause !== '__all__') list = list.filter(m => m.cause === f.cause);
  if(f.mastery !== '__all__') list = list.filter(m => m.mastery === f.mastery);
  if(f.q) list = list.filter(m => (m.title + ' ' + m.solution + ' ' + m.subject).indexOf(f.q) >= 0);

  const opts = (arr, cur) => arr.map(o => '<option value="'+esc(o)+'"'+(o===cur?' selected':'')+'>'+esc(o)+'</option>').join('');
  const due = Calc.dueReviews();

  return '\
  <div class="card">\
    <div class="card-title"><span>今日待复习 '+due.length+' 题</span><span class="t-line"></span><span class="t-side">第 1 / 3 / 7 / 15 天提醒</span></div>\
    ' + (due.length ? due.map(m => '\
      <div class="task"><div class="body">\
        <div class="ttl">'+esc(m.title)+'</div>\
        <div class="meta">'+tagStyle(tagColor(CFG.mastery, m.mastery), m.mastery)+tagStyle(tagColor(CFG.causes, m.cause), m.cause)+'<span class="muted">'+esc(m.subject)+'</span><span class="muted">第 '+((m.reviewCount||0)+1)+' 次复习</span></div>\
      </div><div class="acts">\
        <button class="btn btn-sm btn-primary" data-action="review-once" data-id="'+m.id+'">'+ICON.fire+' 复习一次</button>\
        <button class="btn btn-sm" data-action="mark-mastered" data-id="'+m.id+'">'+esc(CFG.masteryDone)+'</button>\
      </div></div>').join('') : '<div class="empty">今天没有到期的错题，这片江湖暂时太平。</div>') + '\
  </div>\
  <div class="card">\
    <div class="card-title"><span>错题名录</span><span class="t-line"></span><span class="t-side">共 '+Store.state.mistakes.length+' 条</span></div>\
    <div class="filters">\
      <select data-filter="subject"><option value="__all__">全部学科</option>'+opts(Calc.allSubjects(), f.subject)+'</select>\
      <select data-filter="cause"><option value="__all__">全部错因</option>'+opts(Calc.allCauses(), f.cause)+'</select>\
      <select data-filter="mastery"><option value="__all__">全部状态</option>'+opts(Object.keys(CFG.mastery), f.mastery)+'</select>\
      <input data-filter="q" placeholder="搜索题目或思路…" value="'+esc(f.q)+'">\
      <button class="btn btn-sm" data-action="reset-filter">重置</button>\
    </div>\
    <div class="row" style="margin-bottom:12px">\
      <button class="btn btn-primary" data-action="add-mistake">'+ICON.plus+' 记一道错题</button>\
    </div>\
    ' + (list.length ? list.map(m => '\
      <div class="task"><div class="body">\
        <div class="ttl">'+esc(m.title)+'</div>\
        <div class="muted" style="margin-top:4px">'+esc(m.solution)+'</div>\
        <div class="meta">'+tagStyle(tagColor(CFG.mastery, m.mastery), m.mastery)+tagStyle(tagColor(CFG.causes, m.cause), m.cause)+'<span class="muted">'+esc(m.subject)+'</span><span class="muted">'+esc(m.createdAt)+'</span><span class="muted">已复习 '+(m.reviewCount||0)+' 次</span>'+(m.nextReview?'<span class="muted">下次 '+esc(m.nextReview)+'</span>':'<span class="muted" style="color:var(--bamboo)">已毕业</span>')+'</div>\
      </div><div class="acts">\
        <button class="btn btn-sm" data-action="edit-mistake" data-id="'+m.id+'" title="编辑">'+ICON.edit+'</button>\
        <button class="btn btn-sm btn-danger" data-action="del-mistake" data-id="'+m.id+'" title="删除">'+ICON.trash+'</button>\
      </div></div>').join('') : '<div class="empty">没有符合条件的错题</div>') + '\
  </div>';
}

/* ---------------- 页面 4：战绩 · 数据看板 ---------------- */
function renderRecord(){
  const exams = Calc.sortedExams();
  const last8 = exams.slice(-8);
  const rates = Calc.subjectRate();
  const mins = Calc.weeklyMinutes();
  const wk = Calc.weekKey();
  const curWeekReview = (Store.state.reviews.find(r => r.weekKey === wk) || {});

  chartDefs['rec-total'] = () => ({
    type:'line',
    cfg:{ height:230, series:[{name:'总分',color:CFG.theme.gold,values:last8.map(e => Calc.examTotal(e))}],
          labels:last8.map(e => e.name.length>5 ? e.name.slice(0,5) : e.name) }
  });
  const SC = seriesColors();
  chartDefs['rec-subjects'] = () => ({
    type:'line',
    cfg:{ height:250, area:false,
          series:CFG.subjects.map((s, i) => ({
            name:s, color:SC[i % SC.length],
            values:last8.map(e => Number(e.scores[s]) || 0)
          })), labels:last8.map(e => e.date.slice(5)) }
  });
  chartDefs['rec-minutes'] = () => ({
    type:'bars',
    cfg:{ height:210, values:mins, labels:WEEKDAY.map(d => d.slice(1)), color:CFG.theme.bamboo }
  });

  const legendHTML = '<div class="legend">' + CFG.subjects.map((s, i) =>
    '<span><i style="background:'+SC[i % SC.length]+'"></i>'+esc(s)+'</span>').join('') + '</div>';

  return '\
  <div class="grid2">\
    <div class="card">\
      <div class="card-title"><span>总分走势</span><span class="t-line"></span><span class="t-side">近 8 次</span></div>\
      <div class="chart" data-chart="rec-total"></div>\
    </div>\
    <div class="card">\
      <div class="card-title"><span>本周每日学习时长</span><span class="t-line"></span><span class="t-side">'+weekLabel(wk)+'</span></div>\
      <div class="chart" data-chart="rec-minutes"></div>\
    </div>\
  </div>\
  <div class="card">\
    <div class="card-title"><span>各科分数趋势</span><span class="t-line"></span></div>\
    '+legendHTML+'\
    <div class="chart" data-chart="rec-subjects"></div>\
  </div>\
  <div class="card">\
    <div class="card-title"><span>短板科目 · 近 8 次平均得分率</span><span class="t-line"></span><span class="t-side">越靠前越要补</span></div>\
    ' + (rates.length ? rates.map(r => '\
      <div class="sumrow">\
        <span class="ico">'+subjIcon(r.subject,18)+'</span>\
        <span class="nm">'+esc(r.subject)+'</span>\
        <span class="bar thin"><i style="width:'+r.rate+'%;background:linear-gradient(90deg,var(--'+(r.rate<60?'cinnabar-70':'bamboo-70')+'),var(--'+(r.rate<60?'cinnabar':'bamboo')+'))"></i></span>\
        <span class="val">'+r.rate+'%</span>\
      </div>').join('') : '<div class="empty">先在下面录一次考试成绩</div>') + '\
  </div>\
  <div class="card">\
    <div class="card-title"><span>考试记录</span><span class="t-line"></span><span class="t-side">'+exams.length+' 次</span></div>\
    <div class="row" style="margin-bottom:12px"><button class="btn btn-primary" data-action="add-exam">'+ICON.plus+' 录入考试成绩</button></div>\
    ' + (exams.length ? exams.slice().reverse().map(e => '\
      <div class="task"><div class="body">\
        <div class="ttl">'+esc(e.name)+'　<span class="muted" style="font-family:var(--font-mono)">总分 '+Calc.examTotal(e)+' / '+Calc.examFull(e)+'</span></div>\
        <div class="meta">'+CFG.subjects.map(s => '<span class="muted">'+esc(s)+' '+(e.scores[s]==null?'-':e.scores[s])+'</span>').join('')+'</div>\
        <div class="meta"><span class="muted">'+esc(e.date)+'</span>'+(e.note?'<span class="muted">'+esc(e.note)+'</span>':'')+'</div>\
      </div><div class="acts">\
        <button class="btn btn-sm" data-action="edit-exam" data-id="'+e.id+'">'+ICON.edit+'</button>\
        <button class="btn btn-sm btn-danger" data-action="del-exam" data-id="'+e.id+'">'+ICON.trash+'</button>\
      </div></div>').join('') : '<div class="empty">还没有考试记录</div>') + '\
  </div>\
  <div class="card">\
    <div class="card-title"><span>本周复盘小结</span><span class="t-line"></span><span class="t-side">'+weekLabel(wk)+'</span></div>\
    <textarea id="reviewText" data-review-week="'+wk+'" placeholder="这周哪里做得好？哪里要调整？下周先改哪一件事？">'+esc(curWeekReview.text || '')+'</textarea>\
    <div class="row" style="margin-top:10px">\
      <button class="btn btn-primary" data-action="save-review">保存本周小结</button>\
      <span class="muted">建议每周日晚写一次，10 分钟就够</span>\
    </div>\
    <div style="margin-top:16px">\
      <div class="card-title" style="font-size:15px;margin-bottom:8px"><span>往期小结</span><span class="t-line"></span></div>\
      ' + (Store.state.reviews.filter(r => r.weekKey !== wk).length ? Store.state.reviews.filter(r => r.weekKey !== wk).sort((a,b)=>a.weekKey<b.weekKey?1:-1).map(r => '\
        <div class="task" style="flex-direction:column;align-items:stretch">\
          <div class="muted" style="font-family:var(--font-mono);margin-bottom:4px">'+esc(weekLabel(r.weekKey))+'</div>\
          <div style="white-space:pre-wrap;font-size:14px">'+esc(r.text)+'</div>\
        </div>').join('') : '<div class="empty">还没有往期小结</div>') + '\
    </div>\
  </div>';
}

/* ---------------- 总渲染 ---------------- */
function renderAll(){
  $('#page-home').innerHTML   = renderHome();
  $('#page-study').innerHTML  = renderStudy();
  $('#page-furnace').innerHTML = renderFurnace();
  $('#page-record').innerHTML = renderRecord();
  renderTop();
  drawCharts();
  // 卡片是 innerHTML 重建的，折射滤镜的内联变量每次都会丢，重贴一遍
  if(typeof requestAnimationFrame === 'function') requestAnimationFrame(applyGlassLayers);
}
function renderTop(){
  const left = Calc.daysLeft();
  $('#brandSub').textContent = CFG.gradeLabel + ' · ' + CFG.studentName + '的中考备战';
  $('#cdDays').textContent = left >= 0 ? left : '0';
  applyStaticText();
}

/** 浏览器禁用本地存储时给出明确提示（数据不会丢在暗处，而是明确告知存不了） */
function showStorageWarning(){
  if($('.syswarn') || !document.body) return;
  const d = document.createElement('div');
  d.className = 'syswarn';
  const span = document.createElement('span');
  span.textContent = '这个浏览器不允许本页保存数据，刷新后改动会丢失。建议改用 Chrome / Edge 打开；手机上可用「文件」类 App 打开。';
  const b = document.createElement('button');
  b.textContent = '×';
  b.setAttribute('aria-label', '关闭提示');
  b.addEventListener('click', () => d.remove());
  d.appendChild(span); d.appendChild(b);
  document.body.appendChild(d);
}

/* ================================================================
   八、弹窗层
   ================================================================ */
let modalSubmit = null;
function openModal(title, bodyHTML, submitLabel, handler, extraFootHTML){
  modalSubmit = handler;
  $('#modal-root').innerHTML = '\
    <div class="backdrop" data-action="close-modal-bg">\
      <div class="modal" data-stop="1">\
        <h3>'+esc(title)+'</h3>\
        <form id="modalForm">'+bodyHTML+'</form>\
        <div class="modal-foot">\
          '+(extraFootHTML||'')+'\
          <button type="button" class="btn" data-action="close-modal">取消</button>\
          '+(submitLabel ? '<button type="submit" form="modalForm" class="btn btn-primary">'+esc(submitLabel)+'</button>' : '')+'\
        </div>\
      </div>\
    </div>';
  const first = $('#modalForm input, #modalForm select, #modalForm textarea');
  if(first) setTimeout(() => first.focus(), 60);
  // 弹窗本身也可能是玻璃（.modal 参与折射），量完尺寸再贴
  if(typeof requestAnimationFrame === 'function') requestAnimationFrame(applyGlassLayers);
}
function closeModal(){
  $('#modal-root').innerHTML = ''; modalSubmit = null;
  pendingThemeBg = undefined; pendingPickIdx = null;   // 没保存的换图 / 改名一并作废
  if(glassDraft !== undefined){                       // 玻璃开关也只是预览，没保存就还原
    CFG.glass = glassDraft;
    if(document.body) document.body.classList.toggle('glass', !!CFG.glass);
    glassDraft = undefined;
  }
  clearThemePreview();      // 主题只是预览，没保存就还原
}

const fields = {
  select(name, label, options, cur, attrs){
    return '<div class="field"><label>'+esc(label)+'</label><select name="'+name+'" '+(attrs||'')+'>' +
      options.map(o => { const v = typeof o === 'object' ? o.v : o, t = typeof o === 'object' ? o.t : o;
        return '<option value="'+esc(v)+'"'+(String(v)===String(cur)?' selected':'')+'>'+esc(t)+'</option>'; }).join('') + '</select></div>';
  },
  input(name, label, val, type, attrs){
    return '<div class="field"><label>'+esc(label)+'</label><input name="'+name+'" type="'+(type||'text')+'" value="'+esc(val==null?'':val)+'" '+(attrs||'')+'></div>';
  },
  textarea(name, label, val, attrs){
    return '<div class="field"><label>'+esc(label)+'</label><textarea name="'+name+'" '+(attrs||'')+'>'+esc(val==null?'':val)+'</textarea></div>';
  },
  color(name, label, val){
    return '<div class="field"><label>'+esc(label)+'</label><input type="color" name="'+name+'" value="'+esc(val)+'"></div>';
  }
};

/* ---------------- 任务表单 ---------------- */
function openTaskModal(task, presetSubject){
  const t = task || { id:'', subject: presetSubject || CFG.subjects[0], title:'', minutes:30, difficulty:Object.keys(CFG.difficulties)[0], day:Calc.todayIdx(), status:'待开始', actualMin:'' };
  const body =
    fields.input('title','任务名称', t.title, 'text', 'required placeholder="例：数学二次函数专题套卷"') +
    '<div class="f-row">' +
      fields.select('subject','学科', Calc.allSubjects(), t.subject) +
      fields.select('difficulty','难度', Calc.allDifficulties(), t.difficulty) +
    '</div>' +
    '<div class="f-row">' +
      fields.input('minutes','预计用时（分钟）', t.minutes, 'number', 'min="1" required') +
      fields.input('actualMin','实际用时（分钟，可不填）', t.actualMin, 'number', 'min="0"') +
    '</div>' +
    '<div class="f-row">' +
      fields.select('day','安排到周几', WEEKDAY.map((d, i) => ({v:i, t:d})), t.day) +
      fields.select('status','状态', ['待开始','进行中','已完成'], t.status) +
    '</div>';
  openModal(task ? '修改任务' : '新增本周任务', body, '保存', fd => {
    const obj = {
      subject: fd.get('subject'), title: fd.get('title').trim(),
      minutes: Number(fd.get('minutes')) || 30, difficulty: fd.get('difficulty'),
      day: Number(fd.get('day')), status: fd.get('status'),
      actualMin: fd.get('actualMin') === '' ? null : Number(fd.get('actualMin'))
    };
    if(obj.status !== '已完成') obj.actualMin = null;
    if(!obj.title){ toast('任务名称不能为空', true); return false; }
    if(task){ Object.assign(task, obj); }
    else{ obj.id = uid(); obj.weekKey = Calc.weekKey(); Store.state.tasks.push(obj); }
    Store.commit(); toast(task ? '任务已更新' : '任务已加入本周计划');
  }, task ? '<button type="button" class="btn btn-danger" data-action="del-task" data-id="'+task.id+'">删除</button>' : '');
}

/* ---------------- 错题表单 ---------------- */
function openMistakeModal(m){
  const t = m || { id:'', subject:CFG.subjects[0], title:'', cause:Object.keys(CFG.causes)[0], solution:'', createdAt:todayStr(), mastery:CFG.masteryStart };
  const body =
    fields.textarea('title','题目简述（哪儿错了）', t.title) +
    '<div class="f-row">' +
      fields.select('subject','学科', Calc.allSubjects(), t.subject) +
      fields.select('cause','错因分类', Calc.allCauses(), t.cause) +
    '</div>' +
    fields.textarea('solution','正确思路 / 对应知识点', t.solution) +
    fields.input('createdAt','录入日期', t.createdAt, 'date');
  openModal(m ? '修改错题' : '记一道错题', body, '投入丹炉', fd => {
    const obj = {
      subject: fd.get('subject'), title: fd.get('title').trim(), cause: fd.get('cause'),
      solution: fd.get('solution').trim(), createdAt: fd.get('createdAt') || todayStr()
    };
    if(!obj.title){ toast('写清楚错在哪儿，日后才记得起来', true); return false; }
    if(m){ Object.assign(m, obj); }
    else{
      obj.id = uid(); obj.reviewCount = 0;
      obj.nextReview = addDaysStr(obj.createdAt, CFG.reviewIntervals[0]);
      obj.mastery = CFG.masteryStart;
      Store.state.mistakes.push(obj);
      toast('已记录，明天会提醒你复习它');
    }
    Store.commit();
  }, m ? '<button type="button" class="btn btn-danger" data-action="del-mistake" data-id="'+m.id+'">删除</button>' : '');
}

/* ---------------- 考试成绩表单 ---------------- */
function openExamModal(e){
  const exam = e || { id:'', name:'', date:todayStr(), scores:{}, full:Object.assign({}, CFG.fullMarks), note:'【示例学校】·【示例班级】' };
  const body =
    fields.input('name','考试名称', exam.name, 'text', 'required placeholder="例：十月月考"') +
    fields.input('date','考试日期', exam.date, 'date') +
    '<div class="field"><label>各科分数（满分按各科默认值预填，最后一排可改满分）</label>\
      <div class="f-row">' + CFG.subjects.map(s =>
        '<div class="field" style="margin-bottom:0"><label>'+esc(s)+'</label>' +
        '<input name="score_'+esc(s)+'" type="number" step="0.5" min="0" value="'+(exam.scores[s]==null?'':exam.scores[s])+'" placeholder="分数"></div>'
      ).join('') + '</div></div>' +
    '<div class="field"><label>各科满分（各地中考分值不同，按本地实际改）</label>\
      <div class="f-row">' + CFG.subjects.map(s =>
        '<div class="field" style="margin-bottom:0"><label>'+esc(s)+' 满分</label>' +
        '<input name="full_'+esc(s)+'" type="number" step="1" min="1" value="'+(Number(exam.full[s]) || Number(CFG.fullMarks[s]))+'"></div>'
      ).join('') + '</div></div>' +
    fields.input('note','备注（学校 / 班级，选填）', exam.note);
  openModal(e ? '修改考试记录' : '录入考试成绩', body, '记入战绩', fd => {
    const obj = { name: fd.get('name').trim(), date: fd.get('date') || todayStr(), scores:{}, full:{}, note: fd.get('note').trim() };
    CFG.subjects.forEach(s => {
      const v = fd.get('score_' + s);
      if(v !== '' && v !== null) obj.scores[s] = Number(v);
      obj.full[s] = Number(fd.get('full_' + s)) || Number(CFG.fullMarks[s]);
    });
    if(!obj.name){ toast('考试名称不能为空', true); return false; }
    if(e){ Object.assign(e, obj); }
    else{ obj.id = uid(); Store.state.exams.push(obj); }
    Store.commit(); toast('战绩已记录');
  }, e ? '<button type="button" class="btn btn-danger" data-action="del-exam" data-id="'+e.id+'">删除</button>' : '');
}

/* ---------------- 设置 / 数据管理 ---------------- */

/* 下面三个是「把多行文本还原成配置」的解析器。
   设置里所有列表都用「一行一条」的写法，改起来比点按钮方便，也不容易点错。 */
/** 按行拆开；行内用 | 分隔字段（全角 ｜ 也认）；以 // 开头的行当注释忽略。
    两头的空字段会被丢掉，所以「语文|120|」和「语文|120」等价。 */
function parseLines(text){
  return String(text == null ? '' : text)
    .replace(/｜/g, '|')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l.slice(0, 2) !== '//')
    .map(l => {
      const parts = l.split('|').map(x => x.trim());
      while(parts.length && !parts[0]) parts.shift();
      while(parts.length && !parts[parts.length - 1]) parts.pop();
      return parts;
    })
    .filter(parts => parts.length);
}
const isHex = c => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(c || ''));

/** 学科：名称|满分|图标名（满分、图标都可省） */
function parseSubjects(text){
  const list = [], marks = {}, icons = {};
  parseLines(text).forEach(r => {
    const name = (r[0] || '').trim();
    if(!name || list.indexOf(name) >= 0) return;
    list.push(name);
    const n = Number(r[1]);
    marks[name] = (isFinite(n) && n > 0) ? n : 100;
    const ic = (r[2] || '').trim();
    if(SUBJ_ICON_LIB[ic]) icons[name] = ic;
  });
  return list.length ? { list, marks, icons } : null;
}
/** 标签表：名称|颜色（颜色可省，省了就随机分配一个协调色） */
const TAG_POOL = ['#7FB069','#C9A961','#6FA8DC','#B48CC8','#D98E5A','#C1442E','#9B8CD8','#5FBF9F'];
function parseTagMap(text, minCount){
  const out = {};
  parseLines(text).forEach((r, i) => {
    const name = (r[0] || '').trim();
    if(!name || out[name]) return;
    out[name] = isHex(r[1]) ? r[1] : TAG_POOL[i % TAG_POOL.length];
  });
  return Object.keys(out).length >= (minCount || 1) ? out : null;
}
/** 复习间隔：一行里用逗号/空格分开，去重升序 */
function parseIntervals(text){
  const arr = String(text || '').split(/[^0-9]+/).map(Number)
    .filter(n => isFinite(n) && n > 0).sort((a, b) => a - b);
  const uniq = arr.filter((n, i) => arr.indexOf(n) === i);
  return uniq.length ? uniq : null;
}

/* ================================================================
   液态玻璃 · 折射层

   原理：backdrop-filter 里挂一个 SVG 滤镜，用 feDisplacementMap 按一张
   「位移贴图」把背景像素推开/吸进来，边缘就会像真玻璃一样弯折。
   贴图必须和元素尺寸匹配（R=x 位移、G=y 位移、128=不动），所以按元素的
   真实宽高现场生成一张很小的 PNG，缓存起来复用。

   ⚠️ 只有 Chromium 渲染得出来。Safari 会把 url() 当合法值解析但不画，
      还会把整条 backdrop-filter 判为无效（连 blur 一起丢）；Firefox 画的是
      未滤镜的帧。所以能不能用**只能认引擎**，不能问 CSS，拿不准一律当不支持。
   ================================================================ */
const LG = {
  cache: new Map(),   // '宽x高x圆角' -> { id, map }
  maxEdge: 512,       // 贴图长边上限：位移场是平滑的，再大纯浪费
  band: 26,           // 折射带宽 px（玻璃「边」的厚度）—— 只影响背景，不碰文字
  disp: 56            // 最大位移 px。Chromium 的 feDisplacementMap 是最近邻采样，
                      // 所以靠 CSS 的 blur() 先把背景磨平，再位移，块状感就看不出来了
};

/** 本机能不能吃 backdrop-filter 里的 SVG 滤镜 —— 只有 Blink 可以。 */
let _lgEngine;
function lgEngine(){
  if(_lgEngine !== undefined) return _lgEngine;
  _lgEngine = false;
  try{
    const nav = (typeof navigator !== 'undefined') ? navigator : {};
    const ua  = String(nav.userAgent || '');
    // userAgentData 是 Blink 独有；老 WebView 没有，退回 UA。
    // CriOS/FxiOS/EdgiOS/OPiOS = iOS 上的套壳，内核全是 WebKit，必须排除。
    const blink = !!nav.userAgentData ||
      (/Chrome\/|Chromium\/|Edg\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua));
    if(!blink) return _lgEngine;
    if(/iPhone|iPad|iPod/.test(ua) || /Firefox\//.test(ua)) return _lgEngine;
    // 版本下限 111：再早的 Chromium 对引用式滤镜不稳
    const m = ua.match(/(?:Chrome|Chromium)\/(\d+)/);
    if(m && Number(m[1]) < 111) return _lgEngine;
    // 低端机停在毛玻璃档，别硬撑折射
    if((nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4) return _lgEngine;
    // 它不能证明支持，但 false 一定不支持
    _lgEngine = !!(typeof CSS !== 'undefined' && CSS.supports &&
                   CSS.supports('backdrop-filter', 'blur(1px)'));
  }catch(e){ _lgEngine = false; }
  return _lgEngine;
}

/** 圆角矩形的有符号距离场：>0 在内部（值=到边的距离），<0 在外部 */
function lgSdf(px, py, w, h, r){
  const qx = Math.min(Math.max(px, r), w - r);
  const qy = Math.min(Math.max(py, r), h - r);
  return r - Math.hypot(px - qx, py - qy);
}

/** 生成一张位移贴图（data URL）。按元素真实宽高比生成，所以宽卡片和方弹窗
    的折射带宽是一致的 —— 这正是「一张方图拉满」做不到的事。 */
function lgMakeUrl(W, H, R, band){
  try{
    const cv = document.createElement('canvas');
    if(!cv || typeof cv.getContext !== 'function') return null;
    const s  = Math.min(1, LG.maxEdge / Math.max(W, H));
    const mw = Math.max(8, Math.round(W * s));
    const mh = Math.max(8, Math.round(H * s));
    cv.width = mw; cv.height = mh;
    const ctx = cv.getContext('2d');
    if(!ctx || typeof ctx.createImageData !== 'function') return null;

    const img = ctx.createImageData(mw, mh), px = img.data;
    const rr = Math.max(1, R * s), bb = Math.max(3, band * s);
    for(let y = 0; y < mh; y++){
      for(let x = 0; x < mw; x++){
        const i = (y * mw + x) * 4;
        let nx = 0, ny = 0, m = 0;
        const d = lgSdf(x + .5, y + .5, mw, mh, rr);   // 到边的距离
        if(d >= 0 && d < bb){
          // 外法线（角上是 45° 方向）
          const qx = Math.min(Math.max(x + .5, rr), mw - rr);
          const qy = Math.min(Math.max(y + .5, rr), mh - rr);
          const vx = x + .5 - qx, vy = y + .5 - qy, L = Math.hypot(vx, vy) || 1;
          nx = vx / L; ny = vy / L;
          // 唇缘剖面：两端都是 0，最外 1px 不位移，避免采样到元素外面留一圈白线
          m = Math.sin(Math.PI * (d / bb));
        }
        px[i]     = 127.5 - 127 * m * nx;   // 负号 = 朝内采样，把背景「吸」进边缘
        px[i + 1] = 127.5 - 127 * m * ny;
        px[i + 2] = 128;
        px[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv.toDataURL('image/png');
  }catch(e){ return null; }
}

/** 建一个 <filter> 节点。特意用 createElementNS 而不是 innerHTML ——
    SVG 的命名空间用 HTML 解析器拼字符串容易踩坑。 */
function lgBuildFilter(id, href){
  const NS = 'http://www.w3.org/2000/svg';
  const f = document.createElementNS(NS, 'filter');
  f.setAttribute('id', id);
  f.setAttribute('x', '0');
  f.setAttribute('y', '0');
  f.setAttribute('width', '100%');
  f.setAttribute('height', '100%');
  f.setAttribute('filterUnits', 'objectBoundingBox');
  f.setAttribute('primitiveUnits', 'userSpaceOnUse');
  f.setAttribute('color-interpolation-filters', 'sRGB');

  const img = document.createElementNS(NS, 'feImage');
  img.setAttribute('href', href);
  img.setAttribute('x', '0');
  img.setAttribute('y', '0');
  img.setAttribute('width', '100%');
  img.setAttribute('height', '100%');
  img.setAttribute('preserveAspectRatio', 'none');
  img.setAttribute('result', 'map');

  const disp = document.createElementNS(NS, 'feDisplacementMap');
  disp.setAttribute('in', 'SourceGraphic');
  disp.setAttribute('in2', 'map');
  disp.setAttribute('scale', String(LG.disp * 2));
  disp.setAttribute('xChannelSelector', 'R');
  disp.setAttribute('yChannelSelector', 'G');

  f.appendChild(img);
  f.appendChild(disp);
  return f;
}

/** 给页面上所有「大面」贴折射滤镜。渲染完 / 切页 / 改窗口尺寸后都要跑一次 ——
    元素是 innerHTML 重建的，内联的 --glass-filter 每次都会丢。 */
function applyGlassLayers(){
  try{
    const body = document.body;
    if(!body) return;
    if(!CFG || !CFG.glass || !lgEngine()){
      if(body.removeAttribute) body.removeAttribute('data-lg');
      return;
    }
    const host = $('#lg-gen');
    if(!host || !host.appendChild) return;

    const want = [];          // 这一轮需要的 { key, el }
    $$('.card, .modal').forEach(el => {
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if(w < 40 || h < 30) return;            // 隐藏页 / 还没布局
      let rad = 22;
      try{
        const cs = window.getComputedStyle(el);
        rad = Math.round(parseFloat(cs && cs.borderTopLeftRadius) || 22);
      }catch(e){ /* 拿不到就用 22 */ }
      want.push({ el: el, key: w + 'x' + h + 'x' + rad, w: w, h: h, rad: rad });
    });

    if(!want.length){ if(body.removeAttribute) body.removeAttribute('data-lg'); return; }

    // 尺寸没变就别重建滤镜节点 —— 每帧重建会让玻璃闪一下
    const sig = want.map(x => x.key).join('|');
    if(host.getAttribute('data-sig') !== sig){
      if(body.removeAttribute) body.removeAttribute('data-lg');   // 先关闸
      while(host.firstChild) host.removeChild(host.firstChild);
      // 恒等兜底的 #lg-default 在 index.html 里，不在这个 defs 里，清掉不影响
      want.forEach(x => {
        let f = LG.cache.get(x.key);
        if(!f && LG.cache.size < 48){
          const url = lgMakeUrl(x.w, x.h, x.rad, LG.band);
          if(url){ f = { id: 'lg-' + x.key, node: lgBuildFilter('lg-' + x.key, url) }; LG.cache.set(x.key, f); }
        }
        if(f && f.node) host.appendChild(f.node);
      });
      host.setAttribute('data-sig', sig);
    }
    want.forEach(x => { if(LG.cache.get(x.key)) x.el.style.setProperty('--glass-filter', 'url(#lg-' + x.key + ')'); });

    if(body.setAttribute) body.setAttribute('data-lg', 'on');     // 滤镜就绪了才开闸
  }catch(e){
    // 任何异常都退回毛玻璃，绝不能让页面变成透明的洞
    try{ if(document.body && document.body.removeAttribute) document.body.removeAttribute('data-lg'); }catch(_){}
  }
}

/** 预览玻璃开关：只改内存和勾选状态，不写进配置。
    注意要同步改 CFG.glass —— applyTheme 每次都会按 CFG.glass 重置 body 类，
    不改的话「勾上开关 → 拖一下浓度滑块」就会把玻璃又打回去。 */
let glassDraft;            // 打开设置那一刻的值，用来在没保存时还原
function previewGlass(on){
  CFG.glass = !!on;
  const cb = $('[name="glass"]');
  if(cb) cb.checked = !!on;
  if(document.body) document.body.classList.toggle('glass', !!on);
  if(!on && document.body && document.body.removeAttribute) document.body.removeAttribute('data-lg');
  // 让 applyTheme 重算一遍变量 —— 背景那层纱的浓薄也跟着开关变
  if(typeof applyGlassPreview === 'function' && $('[name="glassOpacity"]')) applyGlassPreview();
  else if(on && typeof requestAnimationFrame === 'function') requestAnimationFrame(applyGlassLayers);
}

/* 设置面板里「还没保存的改动」，关窗口时清掉 */
let pendingThemeBg;        // undefined=没动过；''=恢复自带；'data:image/jpeg;…'=换成这张
let pendingPickIdx = null; // 预览中的是哪一套（改名 / 换图按它存）

/** 预览成一套主题：只改 CSS 变量和取色器，不写进配置。
    关掉设置窗口时 clearThemePreview() 会还原，所以「不保存直接关」是安全的。
    idx 是这套预设的下标 —— 用来取它自己的背景图，并把「改名 / 换图」那块切过去。 */
function pickTheme(t, idx){
  if(!t || !t.bg1) return;          // 传错成整个预设对象时直接忽略，别把页面搞花
  const i = (idx === undefined || idx === null) ? CFG.themeIdx : Number(idx);
  pendingPickIdx = i;
  pendingThemeBg = undefined;       // 换了风格，之前那次没保存的换图作废
  previewTheme(t, themeBgOf(i), currentGlassOp());
  applyGlassPreview();
  // 把下面的取色器也换成这套的值，保存时就按这套存
  Object.keys(CONFIG.theme).forEach(k => {
    const el = $('[name="theme_' + k + '"]');
    if(el && t[k]) el.value = t[k];
  });
  // 改名输入框与背景图缩略图跟着切
  const nm = $('[name="themeName"]');
  if(nm) nm.value = themeNameOf(i);
  paintStyleThumb(themeBgOf(i));
  // 高亮当前选中的那张卡片
  $$('.themecard').forEach(b => b.classList.toggle('on', Number(b.dataset.idx) === i));
}

/** 把缩略图的背景换成某张图（空串 = 没有图，露出纯色底） */
function paintStyleThumb(url){
  const el = $('#themeBgThumb');
  if(!el) return;
  el.style.backgroundImage = url ? 'url("' + url + '")' : '';
}

/** 把用户选的图缩到最长边 maxW、JPEG 质量 q，返回 data URL。
    直接存原图会把 localStorage 和云同步撑爆，所以统一压一道。 */
function shrinkImage(img, maxW, q){
  const scale = Math.min(1, maxW / (img.width || maxW));
  const w = Math.max(1, Math.round((img.width || maxW) * scale));
  const h = Math.max(1, Math.round((img.height || maxW) * scale));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return cv.toDataURL('image/jpeg', q);
}

/** 选了本地图片之后：压缩 → 立刻预览 → 等「保存设置」才落盘 */
function onThemeBgFile(input){
  const f = input && input.files && input.files[0];
  if(!f) return;
  if(!/^image\//.test(f.type || '')){ toast('请选一张图片'); input.value = ''; return; }
  const fr = new FileReader();
  fr.onerror = () => toast('这个文件读不出来，换一张试试');
  fr.onload = () => {
    const im = new Image();
    im.onerror = () => toast('这张图打不开，换一张试试');
    im.onload = () => {
      let url;
      try{ url = shrinkImage(im, 1600, 0.72); }
      catch(e){ toast('压缩失败：' + e.message); return; }
      pendingThemeBg = url;
      paintStyleThumb(url);
      const c = previewedTheme();
      previewTheme(c.theme, url, currentGlassOp());
      toast('背景图已换好，点「保存设置」生效');
    };
    im.src = fr.result;
  };
  fr.readAsDataURL(f);
  input.value = '';   // 允许再选同一张
}

/** 恢复成这套风格自带的背景图 */
function resetThemeBg(){
  pendingThemeBg = '';
  paintStyleThumb('');
  const c = previewedTheme();
  previewTheme(c.theme, '', currentGlassOp());
  toast('已切回自带背景，点「保存设置」生效');
}

/** 设置面板里当前「正在看」的那一套：可能是刚点过但还没保存的卡片 */
function previewedTheme(){
  const i = (pendingPickIdx === null || pendingPickIdx === undefined) ? CFG.themeIdx : pendingPickIdx;
  const p = (CFG.themes || [])[i];
  return { idx:i, theme:(p && p.theme) || CFG.theme, bg: themeBgOf(i) };
}

/** 滑块上的浓度；没打开设置面板时退回配置里的值 */
function currentGlassOp(){
  const el = $('[name="glassOpacity"]');
  const v = el ? Number(el.value) : NaN;
  return isFinite(v) ? v : CFG.glassOpacity;
}

/** 玻璃浓度滑块的实时预览 */
function applyGlassPreview(){
  const op = currentGlassOp();
  const out = $('#glassOpVal');
  if(out) out.textContent = op + '%';
  const c = previewedTheme();
  previewTheme(c.theme, c.bg, op);
}

/** 当前主题和某一套预设是否一致（用来给选中的卡片加高亮） */
function sameTheme(a, b){
  if(!a || !b) return false;
  return Object.keys(CONFIG.theme).every(k => String(a[k] || '').toLowerCase() === String(b[k] || '').toLowerCase());
}

/* 设置面板分五类。字段全在同一个 form 里，切分类只是显示/隐藏，
   所以「保存设置」那条 FormData 逻辑完全不受影响。 */
const SET_PANES = [
  { k:'basic', t:'基本' },
  { k:'learn', t:'学习' },
  { k:'look',  t:'外观' },
  { k:'sync',  t:'同步' },
  { k:'data',  t:'数据' }
];
let settingsPane = 'basic';   // 记住上次看的是哪一类，下次打开接着看

/** 切换设置里的分类 */
function setSettingsPane(k){
  if(!k) return;
  settingsPane = k;
  $$('.set-tab').forEach(b => b.classList.toggle('on', b.dataset.pane === k));
  $$('.cfg-pane').forEach(p => p.classList.toggle('on', p.dataset.pane === k));
  const m = $('.modal');
  if(m) m.scrollTop = 0;      // 换类之后从头看
}

function openSettings(){
  const s = Store.state.settings;
  const th = CFG.theme;
  const cur = settingsPane;
  glassDraft = CFG.glass;      // 记下开关的原始值，没保存就还原
  const body =
    /* ---- 分类标签 ---- */
    '<div class="set-tabs">' +
      SET_PANES.map(p =>
        '<button type="button" class="set-tab' + (p.k === cur ? ' on' : '') +
        '" data-action="set-pane" data-pane="' + p.k + '">' + p.t + '</button>').join('') +
    '</div>' +

    /* ---- ① 基本：文案 + 三阶段 ---- */
    '<div class="cfg-pane' + (cur === 'basic' ? ' on' : '') + '" data-pane="basic">' +
    '<div class="cfg-sec"><b>基础文案</b><span class="t-line"></span></div>' +
    '<div class="f-row">' +
      fields.input('appTitle','工作台标题', CFG.appTitle) +
      fields.input('gradeLabel','副标题前缀', CFG.gradeLabel) +
    '</div>' +
    '<div class="f-row">' +
      fields.input('studentName','使用者姓名', CFG.studentName) +
      fields.input('examDate','中考开考日期', CFG.examDate, 'date') +
    '</div>' +
    '<div class="f-row">' +
      fields.input('page_home','第 1 个页面名', CFG.pageNames.home) +
      fields.input('page_study','第 2 个页面名', CFG.pageNames.study) +
      fields.input('page_furnace','第 3 个页面名', CFG.pageNames.furnace) +
      fields.input('page_record','第 4 个页面名', CFG.pageNames.record) +
    '</div>' +
    '<div class="hint">标题会出现在左上角和浏览器标签上；页面名如果改了，「习文」「战绩」这些叫法全站一起变。</div>' +

    /* ---- 三阶段 ---- */
    '<div class="cfg-sec"><b>三阶段备考区间</b><span class="t-line"></span></div>' +
    s.stages.map((st, i) =>
      '<div class="f-row">' +
        fields.input('stage_name_'+i,'阶段 '+(i+1)+' 名称', st.name) +
        fields.input('stage_start_'+i,'开始', st.start, 'date') +
        fields.input('stage_end_'+i,'结束', st.end, 'date') +
      '</div>').join('') +

    /* ---- ② 学习：学科 / 标签 / 复习节奏 / 励志语 ---- */
    '</div><div class="cfg-pane' + (cur === 'learn' ? ' on' : '') + '" data-pane="learn">' +
    '<div class="cfg-sec"><b>学科与满分</b><span class="t-line"></span></div>' +
    fields.textarea('subjects','一行一个学科，格式：学科|满分|图标',
      CFG.subjects.map(x => x + '|' + (CFG.fullMarks[x] || 100) + '|' + (CFG.subjIcons[x] || '')).join('\n'),
      'rows="8"') +
    '<div class="hint">满分不写就按 <code>100</code> 算；图标名可以留空（会自动分配）。可选图标名：' +
      ICON_NAMES.map(n => '<code>'+n+'</code>').join(' ') + '</div>' +

    /* ---- 标签 ---- */
    '<div class="cfg-sec"><b>难度 / 错因 / 状态</b><span class="t-line"></span></div>' +
    fields.textarea('difficulties','难度分级：名称|颜色',
      Object.keys(CFG.difficulties).map(k => k + '|' + CFG.difficulties[k]).join('\n'), 'rows="3"') +
    fields.textarea('causes','错因分类：名称|颜色',
      Object.keys(CFG.causes).map(k => k + '|' + CFG.causes[k]).join('\n'), 'rows="6"') +
    fields.textarea('mastery','掌握状态：名称|颜色（有顺序，最后一个代表已掌握）',
      Object.keys(CFG.mastery).map(k => k + '|' + CFG.mastery[k]).join('\n'), 'rows="3"') +
    '<div class="hint">颜色写 <code>#RRGGBB</code> 这种色号，留空会自动配色；<b>掌握状态至少留两行</b>。</div>' +

    /* ---- 复习节奏 ---- */
    '<div class="cfg-sec"><b>复习节奏</b><span class="t-line"></span></div>' +
    fields.input('reviewIntervals','记住错题后第几天复习（逗号分隔）', CFG.reviewIntervals.join(',')) +
    '<div class="hint">默认 <code>1,3,7,15</code>，是按艾宾浩斯曲线排的；改成 <code>1,2,4,7,15,30</code> 就会多复习两轮。</div>' +

    /* ---- 励志语 ---- */
    '<div class="cfg-sec"><b>每日励志语</b><span class="t-line"></span></div>' +
    fields.textarea('mottos','一行一句，每天自动换一句', CFG.mottos.join('\n'), 'rows="6"') +

    /* ---- ③ 外观：主题风格 + 配色 ---- */
    '</div><div class="cfg-pane' + (cur === 'look' ? ' on' : '') + '" data-pane="look">' +
    '<div class="cfg-sec"><b>主题风格</b><span class="t-line"></span></div>' +
    '<div class="themes">' +
      (CFG.themes || []).map((p, i) => {
        const bg = themeBgOf(i);
        return '<button type="button" class="themecard' + (sameTheme(p.theme, th) ? ' on' : '') +
          '" data-action="pick-theme" data-idx="' + i + '" title="' + esc(themeNameOf(i)) + '">' +
          '<span class="thumb" style="' + (bg ? "background-image:url('" + bg + "')" : '') + '"></span>' +
          '<span class="swatches">' +
            ['bg1','bg2','bamboo','gold','cinnabar','jade']
              .map(k => '<i style="background:' + esc(p.theme[k]) + '"></i>').join('') +
          '</span>' +
          '<span class="nm">' + esc(themeNameOf(i)) + '</span>' +
        '</button>';
      }).join('') +
    '</div>' +
    '<div class="hint">点一下立刻换色，可以先看看喜不喜欢 —— <b>不保存直接关掉这个窗口就还原</b>。' +
    '选中之后下面那些取色器也会跟着变成这套的值，还能再单个微调。</div>' +

    /* ---- 当前这套：改名 + 换背景图 ---- */
    '<div class="styleedit">' +
      '<div class="row">' +
        '<span class="bgthumb" id="themeBgThumb" style="background-image:url(\'' + themeBgOf(CFG.themeIdx) + '\')"></span>' +
        '<div class="grow">' +
          '<div class="row">' +
            '<button type="button" class="btn btn-sm" data-action="pick-theme-bg">换一张背景图</button>' +
            '<button type="button" class="btn btn-sm" data-action="reset-theme-bg">用自带的</button>' +
          '</div>' +
          '<div class="hint" style="margin:5px 0 0">换图会先按最长边 1600 压一遍再存（约 100–300KB），' +
          '太大的原图会拖慢同步。</div>' +
        '</div>' +
      '</div>' +
      fields.input('themeName', '这一套的名字（可以改成你喜欢的）', themeNameOf(CFG.themeIdx)) +
      '<input type="file" accept="image/*" id="themeBgFile" class="hidden-file">' +
    '</div>' +

    '<label class="glassswitch"><input type="checkbox" name="glass"' + (CFG.glass ? ' checked' : '') + '>' +
      '<span><b>液态玻璃效果</b> —— 卡片变成真的玻璃：背景在边缘被折射、弯折，再叠一圈镜面高光。<br>' +
      '<span style="color:var(--muted)">当前浏览器：' +
      (lgEngine() ? '真折射' : '仅毛玻璃（真折射只在 Chromium 111+ 生效）') +
      '</span></span></label>' +
    '<div class="opacityrow">' +
      '<span class="hint" style="margin:0">玻璃浓度</span>' +
      '<input type="range" name="glassOpacity" min="0" max="100" step="5" value="' + CFG.glassOpacity + '">' +
      '<span class="val" id="glassOpVal">' + CFG.glassOpacity + '%</span>' +
    '</div>' +
    '<div class="hint" style="margin-top:-2px">好看但费性能：真折射要把背景逐帧重算。' +
    '手机或旧电脑上觉得卡，就把上面那个勾去掉（颜色不受影响）。</div>' +

    /* ---- 配色 ---- */
    '<div class="cfg-sec"><b>主题配色</b><span class="t-line"></span></div>' +
    '<div class="colors">' +
      fields.color('theme_bamboo','主强调（竹青）', th.bamboo) +
      fields.color('theme_gold','标题描金', th.gold) +
      fields.color('theme_jade','正文玉白', th.jade) +
      fields.color('theme_cinnabar','警示朱砂', th.cinnabar) +
      fields.color('theme_muted','次要文字', th.muted) +
      fields.color('theme_bg1','背景 上', th.bg1) +
      fields.color('theme_bg2','背景 中', th.bg2) +
      fields.color('theme_bg3','背景 下', th.bg3) +
    '</div>' +

    /* ---- ④ 同步 ---- */
    '</div><div class="cfg-pane' + (cur === 'sync' ? ' on' : '') + '" data-pane="sync">' +
    cloudSectionHTML() +

    /* ---- ⑤ 数据 ---- */
    '</div><div class="cfg-pane' + (cur === 'data' ? ' on' : '') + '" data-pane="data">' +
    '<div class="cfg-sec"><b>数据管理</b><span class="t-line"></span></div>' +
    '<div class="row">' +
      '<button type="button" class="btn" data-action="export-json">'+ICON.down+' 导出 JSON 备份</button>' +
      '<button type="button" class="btn" data-action="import-json">'+ICON.up+' 导入备份</button>' +
      '<button type="button" class="btn" data-action="reset-config">恢复默认设置</button>' +
      '<button type="button" class="btn btn-danger" data-action="ask-clear">清空全部数据</button>' +
    '</div>' +
    '<div class="hint" style="margin-top:10px">「恢复默认设置」只重置上面这些设置项，不动你的任务、错题和成绩。<br>' +
      '数据存在浏览器里，也同步到你自己的 Cloudflare 云端；换设备或清缓存前建议顺手导出一份备份。</div>' +
    '</div>';   // 关掉「数据」这类

  openModal('设置', body, '保存设置', fd => {
    const st = Store.state.settings;
    const cfg = Store.state.config = Store.state.config || {};

    // 基础文案
    cfg.appTitle = String(fd.get('appTitle') || '').trim() || CONFIG.appTitle;
    cfg.gradeLabel = String(fd.get('gradeLabel') || '').trim();
    st.studentName = String(fd.get('studentName') || '').trim() || CONFIG.studentName;
    st.examDate = fd.get('examDate') || st.examDate;
    cfg.pageNames = {
      home:    String(fd.get('page_home') || '').trim() || CONFIG.pageNames.home,
      study:   String(fd.get('page_study') || '').trim() || CONFIG.pageNames.study,
      furnace: String(fd.get('page_furnace') || '').trim() || CONFIG.pageNames.furnace,
      record:  String(fd.get('page_record') || '').trim() || CONFIG.pageNames.record
    };

    // 三阶段
    st.stages = st.stages.map((old, i) => ({
      name: fd.get('stage_name_'+i) || old.name,
      start: fd.get('stage_start_'+i) || old.start,
      end: fd.get('stage_end_'+i) || old.end
    }));

    // 学科
    const su = parseSubjects(fd.get('subjects'));
    if(su){ cfg.subjects = su.list; cfg.fullMarks = su.marks; cfg.subjIcons = su.icons; }
    else toast('学科至少留一个，学科列表这次没改动', true);

    // 标签
    const dif = parseTagMap(fd.get('difficulties'), 1);
    if(dif) cfg.difficulties = dif;
    const cau = parseTagMap(fd.get('causes'), 1);
    if(cau) cfg.causes = cau;
    const mas = parseTagMap(fd.get('mastery'), 2);
    if(mas) cfg.mastery = mas;
    else toast('掌握状态至少要两行，这次没改动', true);

    // 复习节奏
    const iv = parseIntervals(fd.get('reviewIntervals'));
    if(iv) cfg.reviewIntervals = iv;
    else toast('复习节奏没填对，这次没改动', true);

    // 励志语
    const mo = String(fd.get('mottos') || '').split('\n').map(x => x.trim()).filter(Boolean);
    if(mo.length) cfg.mottos = mo;

    // 配色
    const theme = Object.assign({}, cfg.theme || {});
    Object.keys(CONFIG.theme).forEach(k => {
      const v = fd.get('theme_' + k);
      if(isHex(v)) theme[k] = v;
    });
    cfg.theme = theme;
    // 液态玻璃：显式存布尔值，别用 delete（不然关掉后会跌回预设的默认值）
    cfg.glass = !!fd.get('glass');
    // 玻璃浓度
    const op = Number(fd.get('glassOpacity'));
    if(isFinite(op)) cfg.glassOpacity = clamp(op, 0, 100);

    // 当前这套：改名 / 换背景图（按预览时的下标存，可能不是原来选中的那套）
    const pickIdx = (pendingPickIdx === null || pendingPickIdx === undefined) ? CFG.themeIdx : pendingPickIdx;
    if(pickIdx >= 0 && pickIdx < (CFG.themes || []).length){
      cfg.themeIdx = pickIdx;
      cfg.themeNames = Object.assign({}, cfg.themeNames || {});
      cfg.themeBgs   = Object.assign({}, cfg.themeBgs || {});
      const nm = String(fd.get('themeName') || '').trim();
      const preset = (CFG.themes[pickIdx] || {}).name || '';
      if(nm && nm !== preset) cfg.themeNames[pickIdx] = nm;
      else delete cfg.themeNames[pickIdx];
      if(pendingThemeBg !== undefined){
        if(pendingThemeBg === '') delete cfg.themeBgs[pickIdx];
        else cfg.themeBgs[pickIdx] = pendingThemeBg;
      }
    }
    pendingThemeBg = undefined;
    pendingPickIdx = null;
    glassDraft = undefined;   // 已经落盘了，关窗口时不要再还原

    rebuildCFG();      // 合并进 CFG，并刷新配色 / 标题
    Store.commit();    // 存盘 + 重渲染
    toast('设置已保存，全站已按新配置刷新');
  });
}

/** 只把「设置项」恢复成出厂默认，不动任务 / 错题 / 成绩数据 */
function resetConfig(){
  openModal('恢复默认设置', '\
    <div class="sealed">'+ICON.history+' <span>标题、学科、满分、难度、错因、掌握状态、复习节奏、励志语、配色，全部回到出厂默认。<b>你的任务、错题、成绩、复盘小结不会被删除。</b></span></div>',
    '恢复默认', () => {
      Store.state.config = {};
      Store.state.settings.studentName = CONFIG.studentName;
      Store.state.settings.examDate = CONFIG.examDate;
      Store.state.settings.stages = JSON.parse(JSON.stringify(CONFIG.stages));
      rebuildCFG();
      closeModal(); Store.commit();
      toast('已恢复出厂默认设置');
    });
}

/** 使用说明：把「怎么用」和「怎么改」都写在页面里，不用回头翻聊天记录 */
function openHelp(){
  const body = '\
  <div class="help">\
    <h4>四个页面在干什么</h4>\
    <ul>\
      <li><b>'+esc(CFG.pageNames.home)+'</b>：中考倒计时、本周完成率、今日待办、三阶段进度、成绩走势。今天该干什么，看这一页就够。</li>\
      <li><b>'+esc(CFG.pageNames.study)+'</b>：按学科排本周任务。点学科卡片标题展开；点左边的方框就算完成（再点一次取消）。带 ‹ › 的按钮把任务挪到前一天 / 后一天。</li>\
      <li><b>'+esc(CFG.pageNames.furnace)+'</b>：记错题。记下之后，第 '+esc(CFG.reviewIntervals.join(' / '))+' 天会自动跳出来提醒你复习，复习完点「复习一次」往后推进。</li>\
      <li><b>'+esc(CFG.pageNames.record)+'</b>：录考试成绩，看总分走势、各科趋势、短板科目，周末写一段复盘小结。</li>\
    </ul>\
    <h4>每天怎么打卡（不到 2 秒）</h4>\
    <ul>\
      <li>打开页面 → 在「今日待办」里点一下方框，就算完成。</li>\
      <li>做完的题错了？到'+esc(CFG.pageNames.furnace)+'里记一条，写清错因和正确思路。</li>\
    </ul>\
    <h4>这个页面你可以随便改</h4>\
    <p>任务、错题、成绩、复盘、设置，全部都能在这里直接增删改。改完<b>不用点保存</b>，1 秒后会自动传到云端。</p>\
    <p>右上角「设置」里还能改：标题、姓名、中考日期、四个页面的名字、学科与满分、难度分级、错因分类、掌握状态、复习节奏、每日励志语、<b>主题风格</b>、主题配色。列表类都用「一行一条」的写法：</p>\
    <ul>\
      <li>学科：<code>物理|100|atom</code> —— 名称|满分|图标（后两项可省）</li>\
      <li>错因：<code>审题偏差|#B48CC8</code> —— 名称|颜色（颜色可省，会自动配色）</li>\
      <li>复习节奏：<code>1,3,7,15</code> —— 逗号分开</li>\
    </ul>\
    <p>改坏了点「设置 → 恢复默认设置」，回到出厂状态，任务和成绩不会丢。</p>\
    <h4>数据在哪儿</h4>\
    <p>每次改动都会先存在这台设备上，然后自动传到云端，所以<b>没网也能照常编辑</b>，等有网了会自动补传。右上角圆点就是同步状态：绿=已同步，橙=有东西还没传上去，红=出错了，点它能看到详情。</p>\
    <p>手机、电脑打开的是同一份数据。手滑删错了，去「同步」里点「撤销上一次云端保存」能退回去。</p>\
    <p>换设备或清缓存之前，建议顺手点「设置 → 导出 JSON 备份」留一份文件在手边。</p>\
    <h4>想自己改代码</h4>\
    <p>页面拆成三个文件：<code>index.html</code>（结构）、<code>app.css</code>（样式）、<code>app.js</code>（全部逻辑），后端是 <code>worker.js</code>。用记事本 / VS Code 都能打开，每段开头都有中文注释。</p>\
    <p class="hint" style="margin-top:14px">提示：改文件之前先复制一份留底；改完保存，浏览器里按 F5 刷新就能看到效果。</p>\
    <h4>主题风格怎么玩</h4>\
    <p>「设置 → 主题风格」里有九套现成的：点一下整套换，<b>不保存直接关掉窗口就还原</b>。每套都配了一张真实照片当背景。</p>\
    <p>选中一套之后，下面还能：<b>改它的名字</b>（输入框里随便写）、<b>换一张背景图</b>（选本地图片，会自动压到最长边 1600 再存）、<b>用自带的</b>（换回原来那张）。这些改动要点「保存设置」才生效。</p>\
    <p><b>液态玻璃</b>是个独立开关：开了以后卡片变成半透明、带实时模糊。下面那根「玻璃浓度」滑块控制它有多透 —— 觉得字看不清就往右调浓一点，觉得闷就往左调透一点。手机上嫌滑起来发涩，直接把勾去掉。</p>\
    <h4>想自己加一套主题</h4>\
    <p>打开 <code>app.js</code>，搜 <code>CONFIG.themes</code>，照着现成的抄一行就行，8 个色位都要给，<code>bg</code> 可以不给（那就是纯色渐变）：</p>\
    <p><code>{ name:「我的主题」, bg:「bg/xxx.jpg」, theme:{ bg1:「#…」, bg2:「#…」, bg3:「#…」, bamboo:「#…」, jade:「#…」, gold:「#…」, cinnabar:「#…」, muted:「#…」 } }</code></p>\
    <p>浅色主题里 <code>jade</code>（正文）和 <code>muted</code>（次要文字）要写<b>深色</b>，深色主题里写浅色 —— 这两个是文字色，不是背景色。保存后刷新，「设置 → 主题风格」里就多出一张卡片。</p>\
  </div>';
  openModal('使用说明', body, null);
}

function exportJSON(){
  const data = JSON.stringify(Store.state, null, 2);
  const fileName = '竹林修行录备份_' + todayStr() + '.json';
  // 在安卓 App（WebView）里 <a download> 不会真的落盘，交给原生写进「下载」目录；
  // 浏览器里 window.AndroidBridge 不存在，照旧走原来的下载方式。
  if(window.AndroidBridge && typeof window.AndroidBridge.saveFile === 'function'){
    window.AndroidBridge.saveFile(fileName, data);
    return;
  }
  const blob = new Blob([data], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('备份已导出到下载文件夹');
}
function importJSON(){
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = () => {
    const file = inp.files && inp.files[0];
    if(!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      if(Store.importJSON(fr.result)){
        rebuildCFG();          // 备份里带着自定义配置，导入后要重新合并
        closeModal(); renderAll(); toast('备份已还原');
        CLOUD.afterChange();   // 家长端顺便把还原后的数据推上云
      }
    };
    fr.readAsText(file);
  };
  inp.click();
}
function askClear(){
  openModal('清空全部数据', '\
    <div class="sealed">'+ICON.trash+' <span>这会删除全部任务、错题、成绩和复盘小结，并恢复示例数据。<b>此操作不可恢复</b>。</span></div>\
    <div class="field"><label>请再点一次下方按钮确认</label></div>', '确认清空', () => {
      Store.clearAll(); rebuildCFG(); closeModal(); renderAll();
      CLOUD.afterChange();   // 家长端顺便把清空后的状态推上云
      toast('数据已清空并重置为示例数据', true);
    });
}

/* ================================================================
   九、事件层 —— 全部用事件委托，不在 HTML 里写内联 onclick
   ================================================================ */
const furnaceFilter = { subject:'__all__', cause:'__all__', mastery:'__all__', q:'' };

function switchPage(page){
  $$('.page').forEach(p => p.classList.toggle('on', p.id === 'page-' + page));
  $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.page === page));
  // 切页后图表容器才有宽度，需要重新测量绘制
  requestAnimationFrame(drawCharts);
  requestAnimationFrame(applyGlassLayers);   // 新页面的卡片要重新贴折射滤镜
  window.scrollTo({ top:0, behavior:'smooth' });
}

/* 玻璃开关的勾选：立刻预览，不用等保存 */
document.addEventListener('change', function(e){
  const el = e.target;
  if(!el) return;
  if(el.name === 'glass') previewGlass(!!el.checked);
  if(el.id === 'themeBgFile') onThemeBgFile(el);   // 换背景图
});

/* 玻璃浓度滑块：拖动时实时预览（不等到松手），并同步右侧百分比 */
document.addEventListener('input', function(e){
  const el = e.target;
  if(el && el.name === 'glassOpacity') applyGlassPreview();
});

document.addEventListener('click', function(e){
  const el = e.target.closest('[data-action]');
  if(!el) return;
  // 弹窗内的删除类操作需要同时关闭弹窗
  const inModal = !!el.closest('.modal');
  const act = el.dataset.action;

  switch(act){
    /* ---- 导航 ---- */
    case 'go': switchPage(el.dataset.page); break;
    case 'open-settings': openSettings(); break;
    case 'set-pane': setSettingsPane(el.dataset.pane); break;
    case 'pick-theme': {
      // 注意传的是预设里的 .theme，不是整个预设对象；
      // 第二个参数是下标 —— 这套自己的背景图 / 名字要靠它取
      const i = Number(el.dataset.idx);
      const p = (CFG.themes || [])[i];
      if(p) pickTheme(p.theme || p, i);
      // 玻璃效果也跟着预设走：点哪套就显示哪套本来的样子，勾选状态同步更新。
      // （想要「这套颜色 + 玻璃」，点完再把下面的勾打上就行。）
      if(p) previewGlass(!!p.glass);
      break;
    }
    case 'pick-theme-bg': {
      const f = $('#themeBgFile');
      if(f) f.click(); else toast('这个浏览器不支持选文件');
      break;
    }
    case 'reset-theme-bg': resetThemeBg(); break;
    case 'open-help': openHelp(); break;
    case 'open-cloud': openCloudPanel(); break;
    case 'reset-config': resetConfig(); break;
    case 'close-modal': closeModal(); break;
    case 'close-modal-bg': if(e.target === el) closeModal(); break;

    /* ---- 云同步 ---- */
    case 'cloud-pull': cloudPull(); break;
    case 'cloud-push': cloudPush(); break;
    case 'cloud-logout': cloudLogout(); break;
    case 'cloud-undo': cloudUndo(); break;
    case 'cloud-diag': cloudDiagnose(); break;
    case 'cloud-change-api': cloudChangeApi(); break;
    case 'cloud-take-mine': CLOUD.takeMine(); break;
    case 'cloud-take-cloud': CLOUD.takeCloud(); break;
    case 'cloud-adopt-cloud': CLOUD.adoptCloud(); break;
    case 'cloud-adopt-local': closeModal(); cloudPush(); break;

    /* ---- 任务 ---- */
    case 'add-task': openTaskModal(null, el.dataset.subject); break;
    case 'edit-task': openTaskModal(Store.state.tasks.find(t => t.id === el.dataset.id)); break;
    case 'toggle-task': {
      const t = Store.state.tasks.find(x => x.id === el.dataset.id);
      if(!t) break;
      if(t.status === '已完成'){ t.status = '待开始'; t.actualMin = null; }
      else{ t.status = '已完成'; t.actualMin = t.actualMin || t.minutes; }
      Store.commit();
      break;
    }
    case 'del-task': {
      const id = el.dataset.id;
      Store.state.tasks = Store.state.tasks.filter(t => t.id !== id);
      if(inModal) closeModal();
      Store.commit(); toast('任务已删除');
      break;
    }
    case 'move-day': {
      const t = Store.state.tasks.find(x => x.id === el.dataset.id);
      if(t){ t.day = clamp(t.day + Number(el.dataset.dir), 0, 6); Store.commit(); }
      break;
    }
    case 'copy-last-week': {
      const wk = Calc.weekKey();
      const prev = addDaysStr(wk, -7);
      const src = Store.state.tasks.filter(t => t.weekKey === prev);
      if(!src.length){ toast('上周没有任何任务可以复制', true); break; }
      let n = 0;
      src.forEach(t => {
        Store.state.tasks.push({ id:uid(), subject:t.subject, title:t.title, minutes:t.minutes,
          difficulty:t.difficulty, day:t.day, weekKey:wk, status:'待开始', actualMin:null });
        n++;
      });
      Store.commit(); toast('已把上周 '+n+' 项计划复制到本周');
      break;
    }
    case 'toggle-subject': {
      const s = el.dataset.subject, arr = Store.state.ui.openSubjects;
      const i = arr.indexOf(s);
      if(i >= 0) arr.splice(i, 1); else arr.push(s);
      Store.commit();
      break;
    }
    case 'toggle-all-subjects': {
      const arr = Store.state.ui.openSubjects;
      const allOpen = arr.indexOf('__ALL__') >= 0;
      Store.state.ui.openSubjects = allOpen ? [] : ['__ALL__'];
      Store.commit();
      break;
    }

    /* ---- 错题 ---- */
    case 'add-mistake': openMistakeModal(null); break;
    case 'edit-mistake': openMistakeModal(Store.state.mistakes.find(m => m.id === el.dataset.id)); break;
    case 'del-mistake': {
      Store.state.mistakes = Store.state.mistakes.filter(m => m.id !== el.dataset.id);
      if(inModal) closeModal();
      Store.commit(); toast('错题已删除');
      break;
    }
    case 'review-once': {
      const m = Store.state.mistakes.find(x => x.id === el.dataset.id);
      if(!m) break;
      Calc.reviewOnce(m);
      Store.commit();
      toast('复习 +1，下次 '+ (m.nextReview || '（已毕业）'));
      break;
    }
    case 'mark-mastered': {
      const m = Store.state.mistakes.find(x => x.id === el.dataset.id);
      if(!m) break;
      m.mastery = CFG.masteryDone; m.nextReview = null;
      Store.commit();
      toast('这道题可以毕业了');
      break;
    }
    case 'reset-filter':
      furnaceFilter.subject = furnaceFilter.cause = furnaceFilter.mastery = '__all__'; furnaceFilter.q = '';
      renderAll(); break;

    /* ---- 成绩 ---- */
    case 'add-exam': openExamModal(null); break;
    case 'edit-exam': openExamModal(Store.state.exams.find(x => x.id === el.dataset.id)); break;
    case 'del-exam': {
      Store.state.exams = Store.state.exams.filter(x => x.id !== el.dataset.id);
      if(inModal) closeModal();
      Store.commit(); toast('考试记录已删除');
      break;
    }
    case 'save-review': {
      const ta = $('#reviewText');
      if(!ta) break;
      const wk = ta.dataset.reviewWeek, txt = ta.value.trim();
      let r = Store.state.reviews.find(x => x.weekKey === wk);
      if(!r){ r = { weekKey:wk, text:'', updatedAt:wk }; Store.state.reviews.push(r); }
      r.text = txt; r.updatedAt = todayStr();
      Store.commit();
      toast('本周小结已保存');
      break;
    }

    /* ---- 数据管理 ---- */
    case 'export-json': exportJSON(); break;
    case 'import-json': importJSON(); break;
    case 'ask-clear': askClear(); break;
  }
});

/* 表单提交（万能入口，交给 openModal 时注册的 handler） */
document.addEventListener('submit', function(e){
  if(e.target.id !== 'modalForm') return;
  e.preventDefault();
  if(!modalSubmit) return;
  const fd = new FormData(e.target);
  // 校验不通过时 handler 会 return false，此时保留弹窗内容，方便直接改
  const ok = modalSubmit(fd, e.target);
  if(ok !== false) closeModal();
});

/* 筛选器 */
document.addEventListener('input', debounce(function(e){
  const t = e.target;
  if(t.dataset.filter){ furnaceFilter[t.dataset.filter] = t.value; renderFurnacePage(); }
}, 260));
document.addEventListener('change', function(e){
  const t = e.target;
  if(t.dataset.filter){ furnaceFilter[t.dataset.filter] = t.value; renderFurnacePage(); }
});
function renderFurnacePage(){
  // 只重渲染炼丹炉。重绘后把焦点和光标还给搜索框，避免打字时被打断
  const ae = document.activeElement;
  const refocus = ae && ae.dataset && ae.dataset.filter ? ae.dataset.filter : null;
  const pos = refocus ? ae.selectionStart : 0;
  $('#page-furnace').innerHTML = renderFurnace();
  if(refocus){
    const back = $('[data-filter="'+refocus+'"]', $('#page-furnace'));
    if(back){
      if(refocus === 'q'){ back.focus(); try{ back.setSelectionRange(pos, pos); }catch(e){} }
      else back.focus();
    }
  }
}

/* Esc 关弹窗 */
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') closeModal();
});

/* 窗口大小变化时重绘图表 */
window.addEventListener('resize', debounce(drawCharts, 160));

/* ================================================================
   十、云同步 —— 让手机和电脑共用同一份数据

   后端是自家的 Cloudflare Worker + KV（见仓库里的 worker.js）。
   把地址填进 CONFIG.cloudApi 就自动同步；留空 = 纯离线模式，一切照旧。

   同步策略（三句话）：
   1) 本机永远是「先落盘、再上传」，所以没网也能照常编辑；
   2) 任何改动都会在 1 秒后自动整份推上云（多次改动合并成一次，不会敲一个字发一次）；
   3) 上传前先拉一次云端，只把「本机没动过」的条目的打卡结果吸收进来 ——
      这样两台设备各改各的，也不会把对方的改动冲掉。
   ================================================================ */

const CLOUD = {
  api: '',
  session: '',
  exp: 0,
  rev: -1,
  updatedAt: '',
  status: 'off',        // off 未连 / saved 已同步 / syncing 同步中 / dirty 有改动待上传 / error 出错
  msg: '',
  dirty: false,         // 本机有改动还没推上去（会持久化，关掉浏览器也不丢）
  busy: false,
  pushTimer: null,
  lastSynced: null,     // 上一次同步成功时的状态快照，用来判断「本机动过没有」
  conflictInfo: null,
  cloudSide: null,
  cloudSideRev: 0,
  blockedApi: '',       // 被识别为「连不上」的地址（*.workers.dev），用来提示用户改
  diag: null,           // 「测试连通性」的结果

  /* ---- 本机存储的小工具 ---- */
  k: n => CONFIG.storagePrefix + 'cloud_' + n,
  read(k, dflt){
    try{ const v = localStorage.getItem(this.k(k)); return v == null ? (dflt === undefined ? null : dflt) : JSON.parse(v); }
    catch(e){ return dflt === undefined ? null : dflt; }
  },
  write(k, v){ try{ localStorage.setItem(this.k(k), JSON.stringify(v)); }catch(e){} },
  drop(k){ try{ localStorage.removeItem(this.k(k)); }catch(e){} },

  get connected(){ return !!this.session; },

  init(){
    const fallback = String(CONFIG.cloudApi || '').replace(/\/+$/, '');
    let stored = String(this.read('api', '') || '').replace(/\/+$/, '');
    // 本机如果存着 *.workers.dev 这种地址，直接丢掉换回出厂值。
    // 这个域名在国内被 DNS 污染（各 DNS 返回随机假 IP），前端只会报「连不上」，
    // 用户对着一个"看起来没错"的地址能卡很久。
    this.blockedApi = '';
    if(isBlockedApi(stored)){
      this.blockedApi = stored;
      this.drop('api'); this.drop('session');
      stored = '';
    }
    this.api = stored || fallback;
    if(isBlockedApi(this.api)) this.blockedApi = this.api;
    this.dirty = !!this.read('dirty', false);
    const c = this.read('session', null);
    if(c && c.session && c.api === this.api && (!c.exp || Date.now() < c.exp)){
      this.session = c.session; this.exp = c.exp || 0;
      this.status = 'saved'; this.msg = '已连接';
    }else{
      this.status = 'off'; this.msg = this.api ? '还没连接' : '未配置云同步';
    }
  },

  /* ---- 所有请求的统一出口 ---- */
  async req(path, opts){
    if(!this.api) throw new Error('还没填云同步地址');
    opts = opts || {};
    const headers = Object.assign({}, opts.headers || {});
    if(this.session) headers.Authorization = 'Bearer ' + this.session;
    if(opts.body !== undefined) headers['Content-Type'] = 'application/json';
    let res;
    try{
      res = await fetch(this.api + path, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        cache: 'no-store'
      });
    }catch(netErr){
      // 连响应都拿不到：网络不通 / 域名被挡 / 地址写错。
      // 单独抛一个带标记的错误，好让上层说人话，而不是甩一句 "Failed to fetch"。
      const e = new Error(isBlockedApi(this.api)
        ? '连不上：xxx.workers.dev 在国内被 DNS 污染，得换成自己域名下的地址'
        : ('连不上后端：' + this.api + '（网络不通，或这个域名在你的网络里被挡了）'));
      e.network = true;
      throw e;
    }
    let data = null;
    try{ data = await res.json(); }catch(e){ /* 有些错误响应没有 body */ }
    if(!res.ok){
      const err = new Error((data && data.error) || ('请求失败 HTTP ' + res.status));
      err.status = res.status; err.data = data;
      throw err;
    }
    return data;
  },

  /* ---- 连接 / 断开 ---- */
  async login(token, api){
    if(api) this.api = String(api).trim().replace(/\/+$/, '');
    const data = await this.req('/api/login', { method:'POST', body:{ token: token } });
    this.session = data.session; this.exp = data.exp;
    this.write('api', this.api);
    this.write('session', { session:this.session, exp:this.exp, api:this.api });
    this.setStatus('saved', '已连接');
    return data;
  },
  logout(){
    this.session = ''; this.exp = 0; this.rev = -1; this.lastSynced = null;
    this.drop('session');
    this.setStatus('off', this.api ? '已断开云同步' : '未配置云同步');
    renderAll();
  },

  /* ---- 状态显示 ---- */
  setStatus(s, msg){ this.status = s; this.msg = msg || ''; paintCloudStatus(); },
  shortText(){
    if(!this.api) return '本地';
    if(!this.connected) return '未连接';
    if(this.status === 'error') return '同步出错';
    if(this.busy || this.status === 'syncing') return '同步中';
    if(this.dirty) return '待上传';
    return '已同步';
  },

  /* ---- 拉取（整份覆盖本机） ---- */
  async pull(){
    const data = await this.req('/api/state');
    this.rev = Number(data.rev) || 0;
    this.updatedAt = data.updatedAt || '';
    if(!data.state) return { empty: true };
    applyCloudState(data.state);
    this.dirty = false; this.write('dirty', false);
    this.lastSynced = deepCopy(Store.state);
    this.setStatus('saved', '已拉取云端数据');
    return { ok: true };
  },
  /** 切回页面时悄悄对一下：本机没有未上传的改动才拉 */
  async autoPull(){
    if(!this.connected || this.busy || this.dirty) return;
    try{
      const data = await this.req('/api/state');
      if(!data.state) return;
      if(Number(data.rev) === Number(this.rev)) return;
      applyCloudState(data.state);
      this.rev = Number(data.rev); this.updatedAt = data.updatedAt || '';
      this.lastSynced = deepCopy(Store.state);
      this.setStatus('saved', '已同步');
    }catch(e){ /* 静默失败，别打扰正在用的人 */ }
  },

  /* ---- 上传（整份推送，推之前先合并） ---- */
  async push(){
    // 没连上就直接说清楚，不要留着「同步中」让那个小圆点一直闪
    if(!this.connected){ this.setStatus('off', this.api ? '还没连接' : '未配置云同步'); return; }
    if(this.busy){ this.schedulePush(); return; }
    this.busy = true;
    this.setStatus('syncing', '正在同步…');

    let lastErr = null;
    for(let attempt = 0; attempt < 3; attempt++){
      try{
        // 先拉一次最新的：把别的设备在这期间打的卡合并进来
        const cur = await this.req('/api/state');
        this.rev = Number(cur && cur.rev) || 0;
        if(cur && cur.state){
          const merged = mergeFromCloud(cur.state);
          if(merged && !isTypingNow()){
            Store.save();
            renderAll();
          }
        }
        const data = await this.req('/api/state', {
          method:'PUT', body:{ baseRev: this.rev, state: Store.state }
        });
        this.rev = Number(data.rev) || 0;
        this.updatedAt = data.updatedAt || '';
        this.dirty = false; this.write('dirty', false);
        this.lastSynced = deepCopy(Store.state);
        this.busy = false;                       // 先落 busy，再刷状态文字，否则标签会卡在「同步中」
        this.setStatus('saved', '已同步到云端');
        return;
      }catch(e){
        lastErr = e;
        if(e.status === 409) continue;   // 版本号被人抢先了，重来一次（重来时会重新合并）
        break;
      }
    }
    this.busy = false;
    if(lastErr && lastErr.status === 409 && lastErr.data && lastErr.data.state){
      this.showConflict(lastErr.data);
    }else{
      this.setStatus('error', (lastErr && lastErr.message) || '同步失败');
    }
  },

  /* ---- 本机一有改动就排队上传 ---- */
  afterChange(){
    if(!this.api) return;                    // 没配云端：纯本地，啥都不用做
    this.dirty = true; this.write('dirty', true);
    if(!this.connected){ this.setStatus('off', '还没连接'); return; }
    this.schedulePush();
  },
  schedulePush(){
    if(!this.api || !this.connected) return;   // 没连上就别摆出「同步中」的样子
    clearTimeout(this.pushTimer);
    this.setStatus('syncing', '等待上传…');
    this.pushTimer = setTimeout(() => this.push(), 1000);
  },

  /* ---- 切回页面 / 网络恢复 / 每分钟：把没传的补上，或者对一下最新 ---- */
  onForeground(){
    if(!this.connected) return;
    if(this.dirty) this.push();
    else this.autoPull();
  },

  /* ---- 极少数情况才会用到：正好卡在两台设备同时写的那一刻 ---- */
  showConflict(info){
    this.conflictInfo = info;
    this.setStatus('error', '云端有更新');
    openModal('云端有更新',
      '<div class="sealed">' + ICON.warn + ' <span>刚刚有两台设备几乎同时保存了。' +
      '<b>想两边都不丢，选第一项。</b></span></div>' +
      '<div class="hint">云端最新版本：' + esc(info.updatedAt || '时间未知') + '（版本号 ' + esc(String(info.rev)) + '）<br>' +
      '用我的版本覆盖 = 保留你刚改的；加载云端最新 = 放弃你这次的改动（会先在本机存一份备份）。</div>',
      null, null,
      '<button type="button" class="btn btn-primary" data-action="cloud-take-mine">用我的版本覆盖</button>' +
      '<button type="button" class="btn" data-action="cloud-take-cloud">加载云端最新</button>');
  },
  async takeMine(){
    const info = this.conflictInfo;
    if(!info) return;
    this.write('backup_cloud_' + Date.now(), info.state);
    try{
      const data = await this.req('/api/state', { method:'PUT', body:{ baseRev: info.rev, state: Store.state } });
      this.rev = Number(data.rev) || 0;
      this.dirty = false; this.write('dirty', false);
      this.lastSynced = deepCopy(Store.state);
      this.conflictInfo = null;
      closeModal(); this.setStatus('saved', '已用你的版本覆盖云端');
    }catch(e){
      if(e.status === 409 && e.data && e.data.state) this.showConflict(e.data);
      else this.setStatus('error', e.message || '覆盖失败');
    }
  },
  takeCloud(){
    const info = this.conflictInfo;
    if(!info) return;
    this.write('backup_local_' + Date.now(), Store.state);
    this.rev = Number(info.rev) || 0;
    applyCloudState(info.state);
    this.dirty = false; this.write('dirty', false);
    this.lastSynced = deepCopy(Store.state);
    this.conflictInfo = null;
    closeModal(); this.setStatus('saved', '已加载云端最新');
  },

  /* ---- 连上之后云端已有数据：让用户自己决定以哪边为准 ---- */
  askSidePicker(cloudState, cloudRev){
    this.cloudSide = cloudState;
    this.cloudSideRev = cloudRev;
    openModal('云端已经有数据了',
      '<div class="sealed">' + ICON.warn + ' <span>两边都有数据，选错会覆盖掉一边。' +
      '<b>先选「用云端的」最安全</b>——本机的旧数据会自动留一份备份。</span></div>' +
      '<div class="hint">云端现在有：<b>' + (cloudState.tasks || []).length + '</b> 个任务、' +
      (cloudState.mistakes || []).length + ' 条错题、' + (cloudState.exams || []).length + ' 次成绩记录。</div>',
      null, null,
      '<button type="button" class="btn btn-primary" data-action="cloud-adopt-cloud">用云端的（推荐）</button>' +
      '<button type="button" class="btn" data-action="cloud-adopt-local">用本机的覆盖云端</button>');
  },
  adoptCloud(){
    const s = this.cloudSide;
    if(!s) return;
    this.write('backup_local_' + Date.now(), Store.state);
    this.rev = Number(this.cloudSideRev) || 0;
    applyCloudState(s);
    this.dirty = false; this.write('dirty', false);
    this.lastSynced = deepCopy(Store.state);
    this.cloudSide = null;
    closeModal();
    this.setStatus('saved', '已用云端数据');
    toast('已用云端数据覆盖本机（本机旧数据已备份）');
  }
};

/* ---------------- 下面几个是纯粹的小工具 ---------------- */

function deepCopy(x){ return JSON.parse(JSON.stringify(x)); }

/** *.workers.dev 在国内被 DNS 污染：问五个 DNS 会得到五个互不相同的假 IP
    （Facebook / Twitter / Dropbox 的段），浏览器只会报「连不上」。
    踩过一次，所以这里做静态识别，见到就直接提示换地址，不让用户干耗。 */
function isBlockedApi(u){
  return /^(https?:\/\/)?[^/\s]*\.workers\.dev([/:]|$)/i.test(String(u || '').trim());
}

/** 正在输入框里打字？那就先别重渲染，免得把人家写了一半的字冲掉 */
function isTypingNow(){
  const ae = document.activeElement;
  return !!(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName));
}

/** 上传前的合并：把云端有、而本机「没动过」的条目的打卡结果吸收进来。
    判断"本机动过没有"的办法，是跟上一次同步成功的快照逐条比对 ——
    比给每条数据加时间戳简单得多，也不会漏。判断不出来时（比如刚打开页面）
    一律以本机为准，宁可少合一点，也不能把用户刚改的东西冲掉。 */
function mergeFromCloud(cloud){
  if(!cloud) return 0;
  const base = CLOUD.lastSynced;
  let n = 0;

  const indexBy = (arr, key) => {
    const m = {};
    (arr || []).forEach(x => { if(x && x[key] != null) m[x[key]] = x; });
    return m;
  };
  const untouched = (baseMap, id, local) => {
    const b = baseMap[id];
    return !!b && JSON.stringify(b) === JSON.stringify(local);
  };

  const baseTasks = indexBy(base && base.tasks, 'id');
  const localTasks = indexBy(Store.state.tasks, 'id');
  (cloud.tasks || []).forEach(c => {
    const t = localTasks[c.id];
    if(!t) return;                                       // 本机没有这条 → 不动（可能本机删了）
    if(!untouched(baseTasks, c.id, t)) return;            // 本机动过 → 保留本机
    if(c.status !== undefined && c.status !== t.status){ t.status = c.status; n++; }
    if(c.actualMin !== t.actualMin){ t.actualMin = c.actualMin; n++; }
  });

  const baseMis = indexBy(base && base.mistakes, 'id');
  const localMis = indexBy(Store.state.mistakes, 'id');
  (cloud.mistakes || []).forEach(c => {
    const m = localMis[c.id];
    if(!m) return;
    if(!untouched(baseMis, c.id, m)) return;
    ['reviewCount', 'nextReview', 'mastery'].forEach(k => {
      if(c[k] !== undefined && c[k] !== m[k]){ m[k] = c[k]; n++; }
    });
  });

  // 复盘小结按周对齐：本机这一周还空着，就把云端的拿过来
  Store.state.reviews = Store.state.reviews || [];
  (cloud.reviews || []).forEach(c => {
    if(!c || !c.weekKey) return;
    const r = Store.state.reviews.filter(x => x.weekKey === c.weekKey)[0];
    if(!r){ Store.state.reviews.push(c); n++; }
    else if(!String(r.text || '').trim() && String(c.text || '').trim()){
      r.text = c.text; r.updatedAt = c.updatedAt; n++;
    }
  });

  return n;
}

/** 用云端数据整份覆盖本机（保留本机的展开状态这类界面偏好） */
function applyCloudState(cloud){
  const ui = (Store.state && Store.state.ui) || { openSubjects: [] };
  Store.state = Object.assign({}, cloud);
  normalizeState();
  Store.state.ui = ui;
  rebuildCFG();
  Store.save();
  renderAll();
  paintCloudStatus();
}

/** 顶栏那个小圆点 */
function paintCloudStatus(){
  const dot = $('#cloudDot'), lbl = $('#cloudLbl');
  if(!dot) return;
  const map = { off:'off', saved:'ok', syncing:'busy', dirty:'warn', error:'bad' };
  dot.className = 'dot ' + (map[CLOUD.status] || 'off');
  if(lbl) lbl.textContent = CLOUD.shortText();
  const btn = dot.parentElement;
  if(btn) btn.title = '云同步：' + (CLOUD.msg || CLOUD.shortText()) + '（点开查看）';
}

/* ---------------- 云同步面板 ---------------- */

function openCloudPanel(){
  const c = CLOUD;
  let body = '';
  const dotCls = { off:'off', saved:'ok', syncing:'busy', dirty:'warn', error:'bad' }[c.status] || 'off';

  body += '<div class="cloud-state"><span class="dot ' + dotCls + '"></span>' +
    '<b>' + esc(c.msg || c.shortText()) + '</b></div>';

  // 地址是被污染的那种：先把话说透，不然用户会一直重试下去
  if(isBlockedApi(c.api) || c.blockedApi){
    const bad = c.api && isBlockedApi(c.api) ? c.api : c.blockedApi;
    body += '<div class="sealed">' + ICON.warn + ' <span>后端地址是 <code>' + esc(bad) +
      '</code> —— <b>xxx.workers.dev 在国内被 DNS 污染，浏览器永远连不上。</b></span></div>' +
      '<div class="hint">这跟口令、跟代码都没关系，是网络层就断了。' +
      '解法是给这个 Worker 绑一个自己域名下的地址：' +
      'Cloudflare 后台 → 该 Worker → Settings → Domains &amp; Routes → Add → Custom Domain，' +
      '填一个像 <code>study.你的域名</code> 的地址，然后把新地址填到下面。</div>';
  }

  body += '<div class="hint">' +
    (c.connected ? '已连接你的云端' : '还没连接') +
    (c.connected && c.updatedAt ? '<br>云端最后更新：' + esc(c.updatedAt) + '（版本号 ' + esc(String(c.rev)) + '）' : '') +
    (c.dirty ? '<br><b style="color:var(--gold)">本机有改动还没传上去，联网后会自动补。</b>' : '') +
    (c.api ? '<br>后端：<code>' + esc(c.api) + '</code>' : '') +
    '</div>';

  // 「测试连通性」的结果
  if(c.diag){
    body += '<div class="diag ' + (c.diag.ok ? 'ok' : 'bad') + '">' +
      '<div class="diag-h">' + (c.diag.ok ? '连通性测试：通过' : '连通性测试：没通') + '</div>' +
      c.diag.lines.map(x => '<div>' + esc(x) + '</div>').join('') + '</div>';
  }

  if(!c.connected){
    body +=
      '<div class="cfg-sec"><b>连接云端</b><span class="t-line"></span></div>' +
      fields.input('cloudApi', '后端地址（不要用 *.workers.dev）', c.api, 'text', 'placeholder="https://study.你的域名"') +
      fields.input('cloudToken', '同步口令', '', 'password', 'placeholder="SYNC_TOKEN"') +
      '<div class="hint">口令就是你在 Cloudflare Worker 里设的那个变量。' +
      '连上之后不用再输，换台设备才要重输一次。</div>' +
      '<div class="row"><button type="button" class="btn" data-action="cloud-diag">' +
        ICON.cloud + ' 先测一下这个地址通不通</button></div>';
    openModal('云同步', body, '连接', async fd => {
      const api = String(fd.get('cloudApi') || '').trim();
      const token = String(fd.get('cloudToken') || '');
      if(!token){ toast('请先填口令', true); return false; }
      try{
        await CLOUD.login(token, api);
        const cur = await CLOUD.req('/api/state');
        CLOUD.rev = Number(cur.rev) || 0;
        if(!cur.state){
          toast('连上了，但云端还没有数据');
          setTimeout(() => { if(!document.querySelector('.modal')) openCloudPanel(); }, 900);
          return;
        }
        // 本机可能已经攒了很多东西，不替用户决定
        setTimeout(() => CLOUD.askSidePicker(cur.state, cur.rev), 300);
      }catch(e){
        toast(e.message || '连接失败', true);
        return false;
      }
    });
    return;
  }

  const btns = [
    '<button type="button" class="btn" data-action="cloud-pull">' + ICON.down + ' 拉取云端（覆盖本机）</button>',
    '<button type="button" class="btn" data-action="cloud-push">' + ICON.up + ' 上传本机数据（覆盖云端）</button>',
    '<button type="button" class="btn" data-action="cloud-undo">' + ICON.history + ' 撤销上一次云端保存</button>',
    '<button type="button" class="btn" data-action="cloud-diag">' + ICON.cloud + ' 测试后端连通性</button>',
    '<button type="button" class="btn" data-action="cloud-change-api">' + ICON.link + ' 换个后端地址</button>',
    '<button type="button" class="btn" data-action="cloud-logout">' + ICON.unlink + ' 断开连接</button>'
  ];
  body += '<div class="row" style="margin-top:6px">' + btns.join('') + '</div>';
  body += '<div class="hint" style="margin-top:10px">' +
    '平时不用管这里：你一改数据，1 秒后就会自动传上去。' +
    '这两个按钮是手动兜底，用来把某一边整份覆盖到另一边（操作前都会先在本机留备份）。' +
    '「撤销」是把云端退回到上一次保存前的样子，手滑删错了可以用。' +
    '</div>';

  openModal('云同步', body, null, null);
}

/** 「设置」里的云同步分区 */
function cloudSectionHTML(){
  const c = CLOUD;
  const dotCls = { off:'off', saved:'ok', syncing:'busy', dirty:'warn', error:'bad' }[c.status] || 'off';
  let h = '<div class="cfg-sec"><b>云同步</b><span class="t-line"></span></div>';
  h += '<div class="cloud-state"><span class="dot ' + dotCls + '"></span><b>' + esc(c.msg || c.shortText()) + '</b></div>';
  h += '<div class="hint">' + (c.api
    ? ('后端：<code>' + esc(c.api) + '</code>' +
       (c.connected ? '<br>云端版本号 ' + esc(String(c.rev)) + (c.updatedAt ? '　最后更新 ' + esc(c.updatedAt) : '') : ''))
    : '还没填后端地址。把 Cloudflare Worker 部署好之后，点下面的按钮把地址和口令填进去。') + '</div>';
  h += '<div class="row"><button type="button" class="btn" data-action="open-cloud">' + ICON.cloud + ' 打开云同步设置</button></div>';
  return h;
}

/* ---------------- 云同步面板上的几个动作 ---------------- */

/** 用云端覆盖本机（先给本机留一份备份） */
async function cloudPull(){
  if(!CLOUD.connected) return openCloudPanel();
  try{
    CLOUD.write('backup_local_' + Date.now(), Store.state);
    const r = await CLOUD.pull();
    closeModal();
    toast(r.empty ? '云端还没有数据，可以点「上传本机数据」把它传上去' : '已拉取云端数据（本机旧数据已备份）');
  }catch(e){ toast('拉取失败：' + (e.message || e), true); }
}

/** 用本机覆盖云端（先给云端留一份备份） */
async function cloudPush(){
  if(!CLOUD.connected) return openCloudPanel();
  try{
    const cur = await CLOUD.req('/api/state');
    if(cur.state) CLOUD.write('backup_cloud_' + Date.now(), cur.state);
    CLOUD.rev = Number(cur.rev) || 0;
    CLOUD.lastSynced = null;              // 整份覆盖，不走合并
    await CLOUD.push();
    closeModal();
    toast(cur.state ? '本机数据已上传（原来的云端数据已在本机备份）' : '本机数据已上传到云端');
  }catch(e){ toast('上传失败：' + (e.message || e), true); }
}

/** 把云端退回到上一次保存前 */
async function cloudUndo(){
  if(!CLOUD.connected) return openCloudPanel();
  try{
    const cur = await CLOUD.req('/api/state');
    if(cur.state) CLOUD.write('backup_cloud_' + Date.now(), cur.state);
    const data = await CLOUD.req('/api/restore', { method:'POST', body:{} });
    CLOUD.rev = Number(data.rev) || 0;
    await CLOUD.pull();
    closeModal();
    toast('已撤销上一次云端保存');
  }catch(e){
    toast(e.status === 409 ? '没有更早的版本可以撤回了' : ('撤销失败：' + (e.message || e)), true);
  }
}

function cloudLogout(){
  CLOUD.logout(); closeModal();
  toast('已断开云同步，本机数据还在');
}

/** 换后端地址（常见于从 workers.dev 迁到自己域名）。断开只清会话，不清本机数据。 */
function cloudChangeApi(){
  CLOUD.logout();
  CLOUD.diag = null;
  openCloudPanel();
}

/** 把「连不上」拆成「到底哪一步断了」——域名不通 / 后端没起 / 配置不全 / 口令不对，
    四种原因的修法完全不同，让用户对着界面猜太亏。 */
async function cloudDiagnose(){
  const lines = [];
  // 面板上填了新地址就先按新的测，不然用户改完地址点「测试」测的还是旧的
  const field = $('[name="cloudApi"]');
  if(field && String(field.value || '').trim()) {
    CLOUD.api = String(field.value).trim().replace(/\/+$/, '');
  }
  const api = CLOUD.api;
  lines.push('后端地址：' + (api || '（空的）'));

  if(!api){
    lines.push('→ 地址是空的。先在下面把 Worker 地址填上。');
    return showDiag(false, lines);
  }
  if(isBlockedApi(api)){
    lines.push('→ 这个地址是 *.workers.dev。它在国内被 DNS 污染（不同 DNS 会返回不同的假 IP），'
      + '浏览器在 DNS 这一步就失败了，跟口令、跟代码都没关系。');
    lines.push('   先按上面的提示换成自己域名下的地址，再来测。');
    return showDiag(false, lines);
  }

  lines.push('正在请求 ' + api + '/api/health …');
  const t0 = Date.now();
  let res;
  try{
    const ctl = (typeof AbortController === 'function') ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), 8000) : null;
    try{
      res = await fetch(api + '/api/health', { cache:'no-store', signal: ctl ? ctl.signal : undefined });
    }finally{
      if(timer) clearTimeout(timer);
    }
  }catch(netErr){
    lines.push('请求失败：' + (netErr && netErr.name === 'AbortError'
      ? '8 秒没有任何响应（超时）' : ((netErr && netErr.message) || String(netErr))));
    lines.push('→ 网络层就断了。多半是这个域名在你这里被挡，或者地址打错了。');
    return showDiag(false, lines);
  }

  lines.push('HTTP ' + res.status + '，用了 ' + (Date.now() - t0) + ' ms');
  const txt = await res.text();
  let data = null;
  try{ data = JSON.parse(txt); }catch(e){ /* 不是 JSON 就按文本看 */ }

  if(data && (data.ok || data.error)){
    lines.push('后端原话：' + txt.slice(0, 220));
    if(data.error){
      lines.push('→ 后端已经跑起来了，但还没配齐。照着上面这句话去 Worker 的 Settings 里补。');
      return showDiag(false, lines);
    }
    lines.push('→ 通了。云端' + (data.hasData ? ('已有数据，版本号 ' + data.rev) : '还没有数据')
      + (data.hasPrev ? '，可以撤回一次' : '') + '。');
    return showDiag(true, lines);
  }

  lines.push('返回的不是我们认识的 JSON：' + txt.slice(0, 140));
  lines.push('→ 这个地址上跑的可能不是这份 worker.js（比如还是 Cloudflare 默认的 Hello World）。');
  return showDiag(false, lines);
}
function showDiag(ok, lines){
  CLOUD.diag = { ok: !!ok, lines: lines };
  openCloudPanel();
}

/* ================================================================
   十一、启动
   ================================================================ */

/** 打开之后：该连接的连接，该补传的补传 */
function afterBoot(){
  paintCloudStatus();

  if(!CLOUD.api){
    // 还没配后端地址：引导去填一次
    setTimeout(openCloudPanel, 300);
    return;
  }

  if(!CLOUD.connected){
    // 没连过：弹一次引导
    setTimeout(function(){ if(!CLOUD.connected) openCloudPanel(); }, 400);
    return;
  }

  // 本机有没传上去的改动 → 先上传；否则拉云端最新的
  if(CLOUD.dirty){ CLOUD.push(); return; }
  CLOUD.pull().then(function(r){
    if(r.empty) toast('云端还没有数据，点「同步」里的「上传本机数据」传上去', true);
  }).catch(function(e){ CLOUD.setStatus('error', e.message || '连不上云端'); });
}

function boot(opts){
  opts = opts || {};
  if(opts.cloudApi) CONFIG.cloudApi = opts.cloudApi;

  Store.canPersist = storageAvailable();   // 先探测能不能存，再决定要不要提示
  Store.load();
  normalizeState();   // 兼容旧版数据 / 手工改过的数据，补齐缺失字段
  rebuildCFG();       // 合并「设置」里的自定义配置（同时注入配色、标题）

  CLOUD.init();
  renderAll();
  // 首屏容器宽度需要等一帧才稳定，兜底再画一次
  requestAnimationFrame(drawCharts);
  if(!Store.canPersist) showStorageWarning();

  afterBoot();

  // 切回页面 / 每分钟 / 网络恢复：把没传的补上，或者对一下最新
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) CLOUD.onForeground(); });
  window.addEventListener('online', function(){ CLOUD.onForeground(); });
  setInterval(function(){ if(!document.hidden) CLOUD.onForeground(); }, 60000);

  // 关闭页面前，如果还有没传上去的改动，提醒一下（浏览器不保证能给时间传完）
  window.addEventListener('beforeunload', function(e){
    if(CLOUD.dirty && CLOUD.connected){ e.preventDefault(); e.returnValue = ''; }
  });

  // 窗口尺寸变了，卡片尺寸跟着变 → 位移贴图要重做（防抖，别一边拖一边算）
  let resizeTimer = 0;
  window.addEventListener('resize', function(){
    if(resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){ resizeTimer = 0; applyGlassLayers(); }, 200);
  });
}

