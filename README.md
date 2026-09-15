# P1 个人主页
## 需求
制作一个能写进简历、面试能当场打开的个人网站。
## 做了什么
用 HTML 搭建页面结构（页头、关于我、技能、项目、页脚），用 CSS
完成配色和排版并拆分出独立的 style.css，用 git 做版本管理推送到
GitHub，最后通过 GitHub Pages 免费上线。

## 踩了什么坑

### 坑 1：推送时报 Repository not found
- 现象：git push 报错，报错里的仓库地址写着 `https://github.com/你的用户名/...`
- 原因：复制命令时忘了把占位符换成真实用户名；想改时 git remote add
  又报 origin already exists——add 不能覆盖已有配置
- 解决：git remote set-url origin <正确地址>，用 git remote -v 验证后
  推送成功
- 教训：复制命令前先检查占位符要不要替换

### 坑 2：孤儿标签 </a> 和 </ul>
- 现象：当时代码总感觉不对劲，然后看着代码一行行校对发现有很多红色标记，光标指引上去它显示问题的出现</a></ul>孤儿标签
- 原因：只删了成对标签中的一半，列表项脱离了所在的 ul
- 定位：用 VS Code 的标签配对高亮和搜索功能找到孤儿标签的位置
- 解决：补全配对，刷新页面验证恢复

### 坑 3：仓库名与用户名不一致，CSS 搬家只复制没删旧
- 现象： 网页404
- 原因：index.html 里的 <style> 规则搬家到新建的 style.css——搬 = 复制过去 + 删掉旧的。新建了 style.css、把规则复制了进去（但 index.html 里的旧 <style> 块没删，<link> 接线也还没加。
- 解决：删掉整个 <style>...</style> 块，在 <head> 里加上 <link rel="stylesheet" href="style.css">；然后重做改色实验——这次页面跟着变了，证明接线成功。
- 教训：验证改动有没有真正生效，最直接的办法就是“改一下，看页面变不变”。
事件 B：仓库名和用户名不一致（发生在“建 GitHub 仓库”那一步
-现象：我去访问 chenyixian9704.github.io 时得到 404（仓库不存在），再查你账号下的仓库列表，才发现你建了另一个名字的仓库。

-后果：名字不匹配的话，就算上线，网址也会变成 chenyixian9704.github.io/chenyixian-ai.github.io/ 这种套娃形式，写简历很难看。

-解决：GitHub 仓库页 → Settings → Repository name 改成 chenyixian9704.github.io → Rename。改完名本地什么都不用动，推送直接就通了。

## 结果
网站已上线：https://chenyixian9704.github.io
一个下午从零做出并上线了第一个属于自己的网页，很有成就感，
也体会到 AI 工具给开发流程带来的效率提升。