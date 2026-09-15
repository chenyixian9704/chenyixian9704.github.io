# P1 个人主页
## 需求：制作一个能写进简历、面试能当场打开的个人网站
## 做了什么
技术 + 过程：HTML 结构 → CSS 美化 → git → GitHub Pages 上线
## 踩坑点
-坑 1：中文占位符忘了替换→然后再vc中重新定位→然后加上相应词组，并最终核对，确定类似问题不会再出现在后续的代码中
-坑 2：孤儿标签 </a> 和 </ul>→首先使用vc中自带的搜索确定这些孤儿标签具体位置→然后在相应位置他配对修改
-坑 3：仓库名字和用户名不一致、CSS 搬家只复制没删旧的→在给i他github中找到仓库的具体位置→然后修改将用户名进行修改，防止再次出现类似问题，进行核对。
- 坑 4：推送时报 Repository not found
  - 现象：git push 报错，报错里的仓库地址写着 `https://github.com/你的用户名/...`
  - 原因：复制命令时忘了把占位符换成真实用户名；想改时 git remote add 又报
    origin already exists——add 不能覆盖已有配置
  - 解决：git remote set-url origin <正确地址>，用 git remote -v 验证后推送成功
## 结果
https://chenyixian9704.github.io/，通过流程设计最为简单的网页确实很有意思很有成就感，ai带来的便利