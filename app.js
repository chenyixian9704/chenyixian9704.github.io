// ========== 主题切换:墨夜(默认) / 宣昼 ==========
const btn = document.querySelector("#theme-btn");

btn.addEventListener("click", function () {
  document.body.classList.toggle("light");
  btn.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
});

// ========== 一键复制邮箱 / 电话 ==========
function bindCopy(btnId, text, doneText) {
  const btn = document.querySelector(btnId);
  btn.addEventListener("click", function () {
    navigator.clipboard.writeText(text).then(function () {
      btn.textContent = doneText;
      setTimeout(function () { btn.textContent = text; }, 1500);
    });
  });
}
bindCopy("#copy-email-btn", "cyx9704@126.com", "✅ 已复制,欢迎来信");
bindCopy("#copy-phone-btn", "1399714118", "✅ 已复制");

// ========== 每日一言:每次打开轮换下一句(localStorage 记忆) ==========
const quotes = [
  "行胜于言",
  "不怕慢,只怕站",
  "种一棵树最好的时间是十年前,其次是现在",
  "学如逆水行舟,不进则退",
  "改变,从今天这一小时开始",
  "先上车,路上再学骑",
  "你焦虑的每一次未来,都由现在的你来安放",
  "凡事预则立,不预则废"
];

const quoteEl = document.querySelector("#daily-quote");
const quoteIdx = Number(localStorage.getItem("quote-idx") || 0) % quotes.length;
quoteEl.textContent = quotes[quoteIdx];
localStorage.setItem("quote-idx", (quoteIdx + 1) % quotes.length);

// ========== 滚动高亮:右侧圆点 + 导航胶囊 ==========
const sections = document.querySelectorAll("section.panel");
const dotsNav = document.querySelector("#dots");

sections.forEach(function (s) {
  const a = document.createElement("a");
  a.href = "#" + s.id;
  dotsNav.appendChild(a);
});

const io = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (!e.isIntersecting) return;
    const id = "#" + e.target.id;
    document.querySelectorAll("#dots a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === id);
    });
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === id);
    });
  });
}, { threshold: 0.55 });

sections.forEach(function (s) { io.observe(s); });

// ========== 吉祥物互动:眼神跟随 + 点击指向 ==========
const mascots = Array.prototype.slice.call(
  document.querySelectorAll(".sec-mascot, .hero-right .avatar-ring")
);
mascots.forEach(function (m) {
  m.dataset.rot = m.dataset.rot || "0";
});

function visibleMascots() {
  return mascots.filter(function (m) {
    const r = m.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  });
}

let rafPending = false;
document.addEventListener("mousemove", function (e) {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(function () {
    rafPending = false;
    visibleMascots().forEach(function (m) {
      const r = m.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / r.width));
      const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / r.height));
      const base = Number(m.dataset.rot || 0);
      // 3D:转头 + 俯仰 + 微倾,像拿在手里转的卡牌
      m.style.transform =
        "rotateY(" + (nx * 18).toFixed(1) + "deg)" +
        " rotateX(" + (-ny * 14).toFixed(1) + "deg)" +
        " rotate(" + (base + nx * 4).toFixed(1) + "deg)";
    });
  });
});

document.addEventListener("pointerdown", function (e) {
  if (e.target.closest && e.target.closest("a, button, nav, input, textarea")) return;
  const alive = visibleMascots();
  if (!alive.length) return;
  const m = alive[0];
  const r = m.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist < 40) return; // 点得太近,不用指
  const ang = Math.atan2(dy, dx) * 180 / Math.PI;

  // 3D:朝点击方向猛地一转
  const nx = Math.max(-1, Math.min(1, dx / r.width));
  const ny = Math.max(-1, Math.min(1, dy / r.height));
  const base = Number(m.dataset.rot || 0);
  m.style.transform =
    "rotateY(" + (nx * 26).toFixed(1) + "deg)" +
    " rotateX(" + (-ny * 20).toFixed(1) + "deg)" +
    " rotate(" + base + "deg)";

  const line = document.createElement("div");
  line.className = "point-line";
  line.style.left = cx + "px";
  line.style.top = cy + "px";
  line.style.width = dist + "px";
  line.style.transform = "rotate(" + ang + "deg)";
  const tip = document.createElement("div");
  tip.className = "point-tip";
  tip.textContent = "👉";
  line.appendChild(tip);
  document.body.appendChild(line);
  setTimeout(function () { line.remove(); }, 1200);

  m.classList.remove("excited");
  void m.offsetWidth; // 重启动画
  m.classList.add("excited");
});

// ========== 3D 形象:头和视线跟随鼠标 ==========
// 模型是静态网格、没有骨骼,"转头"的做法是让相机绕着他小幅移动:
// 视角一偏,脸和眼睛看起来就朝鼠标的方向转过去了
const hero3d = document.querySelector("#hero-3d");

if (hero3d) {
  let followQueued = false;
  let idleTimer = null;
  let dragging3d = false;

  hero3d.addEventListener("pointerdown", function () { dragging3d = true; });
  window.addEventListener("pointerup", function () { dragging3d = false; });

  document.addEventListener("mousemove", function (e) {
    if (!hero3d.loaded || dragging3d) return; // 没加载完 / 用户在拖拽时不介入
    const r = hero3d.getBoundingClientRect();
    const onScreen = r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
    if (!onScreen) return;

    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / r.width));
    const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / r.height));

    if (!followQueued) {
      followQueued = true;
      requestAnimationFrame(function () {
        followQueued = false;
        hero3d.autoRotate = false; // 跟随期间暂停自转
        hero3d.cameraOrbit =
          (nx * 22).toFixed(1) + "deg " +
          (75 + ny * 10).toFixed(1) + "deg auto";
      });
    }

    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      hero3d.autoRotate = true; // 鼠标停 4 秒,恢复慢速自转
    }, 4000);
  });
}
