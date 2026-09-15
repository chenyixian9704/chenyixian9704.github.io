const btn = document.querySelector("#theme-btn");

btn.addEventListener("click", function () {
  document.body.classList.toggle("dark");
});const copyBtn = document.querySelector("#copy-email-btn");

copyBtn.addEventListener("click", function () {
  navigator.clipboard.writeText("cyx9704@126.com").then(function () {
    copyBtn.textContent = "✅ 已复制";
    setTimeout(function () {
      copyBtn.textContent = "复制邮箱";
    }, 1500);
  });
});
const quotes = [
  "行胜于言",
  "不怕慢，只怕站",
  "种一棵树最好的时间是十年前，其次是现在",
  "学如逆水行舟，不进则退",
  "改变，从今天这一小时开始",
  "先上车，路上再学骑",
  "你焦虑的每一次未来，都由现在的你来安放",
  "凡事预则立，不预则废"
];

const quoteEl = document.querySelector("#daily-quote");
quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];