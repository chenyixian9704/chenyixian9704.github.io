# 提示词实验笔记

实验目标：同一个功能（每日一言），比较不同提问方式的效果差异。

### 第 1 轮：模糊提问
- 我的提示词：每天随机刷新一个每日一言，我应该怎么写代码
- AI 给了什么：<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>每日一言</title>
</head>
<body>
  <div id="quote"></div>
  <script>
    var quotes = ["学如逆水行舟，不进则退", "种一棵树最好的时间是十年前，其次是现在", "day day up", "凡事预则立，不预则废", "行胜于言"];
    var i = Math.floor(Math.random() * quotes.length);
    document.getElementById("quote").textContent = quotes[i];
  </script>
</body>
</html>
- 问题出在哪：它替我做了3个产品决定。 第一个是“每天随机刷新”——“每天一换”和“每次刷新都换”是两个不同的需求，而且互相矛盾。猜错哪个，做出来的东西都不是你要的。真实工作里这叫需求歧义，PRD 写不清这个，开发做出来就会被打回——这就是你们目标岗位存在的原因
第二个是“一个独立小页面”，不是“你网站的零件”。 因为我的提问里没有我的项目背景—— index.html、app.js、style.css，不知道我这个有深色模式，不知道句子该显示在页面哪个位置
第三个是零接入说明。 代码放哪个文件哪一行？和现有的 app.js 怎么共处？
代码不能使用
- 学到什么：第一点是要把需求详细的和他完成说明，防止它出现误判和一些乱猜导致效果出现误差，要把需求进行详细的说明，包括具体的定位。

### 第 2 轮：带需求细节的提问
- 我的提示词：（每次刷新都更换不同的语句，放在侧面，采用竖行排版，在浅色模式中用深蓝色字体，在深色模式中采用浅红色，字体要艺术一点，并且有警醒的效果，并且新代码要要融入到我现在已经有的代码文件中，并指出加到具体的位置上，3连push文件帮我写具体
- AI 给了什么：index.html —— 打开，找到第 32 行附近的 <footer>...</footer> 结束的位置，在 </footer> 的下面一行、<script src="app.js"></script> 的上面一行，插入：


html
<div id="daily-quote"></div>
② app.js —— 追加到文件末尾：


js
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
③ style.css —— 追加到文件末尾（注意最后一段用了你熟悉的后代选择器，深浅色两个模式都照顾到了）：


css
#daily-quote {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  font-family: "KaiTi", "STKaiti", serif;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 6px;
  color: #1a3a8f;
  opacity: 0.85;
}

.dark #daily-quote {
  color: #ff9e9e;
}
④ 三连 push：


bash
git add index.html app.js style.css
git commit -m "P2：新增每日一言侧边栏（随机+竖排+深浅色适配）"
git push
- AI 还替我做了什么决定：第一点是（句子是ai编的 —— 我没给内容，）
第二点是“侧面”哎猜了右侧 + 固定悬浮（滚动时不跟随，永远在屏幕右侧垂直居中）—— 不是左、不是贴底、不是跟着滚，都是猜的
第三点“艺术+警醒”ai翻译成了具体参数：楷体加粗 + 竖排 + 字间距 6px + 85% 透明度。主观词 AI 必须翻译成可执行的参数，翻译得对不对只有我看了才知道

- 学到什么：细节还是要注意，必须给ai更加详细的指令才能够让他完成你想要的操作，对于自己只有主观概念的事务可能需要多次让ai去实现，然后不断修改

### 第 3 轮：带截图的迭代反馈
- 我的提示词：句子应该放到这个位置，帮我做出调整·
- 发生了什么：（AI 没有直接改，先反问了一个什么问题？从我截图是一个“从头到尾的整页视角”判断，如果按第二种做：句子属于页面本身，住在内容列右侧的空白带里，大约在页头和页脚之间的高度。
- 学到什么：首先截图并不是万事大吉了，你要给ai具体的操作，你需要在截图上给他一个更加具体的位置信号。

## 实验结论
首先不能给ai一些带有歧义的话语，他会猜这些指令，可能与你的想法南辕北辙，造成资源的浪费和token的消耗：将具体的指令发给他，主观的观点发送给他，你需要在ai完成操作以后核对具体情况，防止出现错误；给ai截图并不是万事大吉了，你需要给它具体指令防止它猜测你的意思。