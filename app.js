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