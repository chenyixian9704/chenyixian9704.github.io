# 运维操作手册（云端学习机 + 本地环境）
> 机器：2核2G 阿里云 ECS（上海）· Ubuntu 24.04 · Dify 1.17.1（精简组合）
> 读者：未来的自己 / 接手运维的人

## 一、日常访问
- Dify 地址：http://8.159.129.135
- SSH 登录：ssh root@8.159.129.135（密码见密钥档案）
- 注意：这是精简组合，知识库功能用时要先启动 weaviate 和 worker（见第三节）

## 二、心跳自检（怀疑出问题时按顺序跑）
1. 控制台看实例状态是否"运行中"
2. ssh 上去 → cd /root/dify/docker → docker compose ps（都该是 Up/healthy）
3. free -h（available 低于 100Mi 就是危险信号）
4. 网页 502 = nginx 在但 api 没应答；超时 = 端口/防火墙问题

## 三、常用操作命令
- - 【把知识库容器拉起来】docker start docker-worker-1 docker-weaviate-1
  （worker 负责后台索引任务，weaviate 是向量库——建知识库/检索时才需要；
   用完建议 docker stop 掉，把内存还回去）

- 【看所有容器实时状态】cd /root/dify/docker && docker compose ps
  （看起没起、healthy 否；要看实时内存/CPU 占用用 docker stats，Ctrl+C 退出）

- 【看某个容器的最近日志】docker logs --tail 30 容器名
  （如 docker logs --tail 30 docker-api-1；加 -f 可实时滚动跟踪，
   Ctrl+C 只是退出观看，不影响容器运行）

- 【服务器卡死时，第一步去哪里做什么？】
  第一步：先定性，再动手——在自己电脑上探测 22 端口
  （能握手 = 活着只是慢；超时 = 真危险），同时去阿里云控制台 →
  实例 → 远程连接（VNC）急救直连。VNC 能登录就先减负
  （docker stop 非必需容器），VNC 也无响应才「强制重启」。
  禁止一上来就重启：迁移会被打断、容器会复活再窒息
  ## 四、已知限制
- 2G 内存只够核心五件套，全家桶会窒息（详见 troubleshooting.md 第 1 条）
- 知识库功能按需启用：worker + weaviate 平时处于 stopped 状态，
  建知识库前手动拉起，用完建议停回——常驻会再次把内存吃穿
- api 冷启动有迁移等待期：服务器重启后 api 要跑几分钟迁移，
  期间访问是 502，属正常现象，看日志出现 startup complete 再刷新
- 无域名无 HTTPS：只能 http://IP 访问，浏览器标"不安全"；
  依赖 HTTPS 的浏览器能力（如剪贴板在部分场景）不可用
- 插件/代码沙箱功能被精简停用：涉及插件市场、代码执行的功能
  不可用；确需时单独 docker start docker-plugin_daemon-1，
  但内存可能顶不住，用完即停
- 安全面：root + 密码登录长期暴露公网有被爆破风险，后续可升级
  SSH 密钥登录；安全组只放行 22/80，新增端口前先想清楚
- 磁盘暂充裕（40G 用了不到一半），但镜像和日志会累积，
  定期 docker system df 检查，必要时 docker system prune 清理
## 本地环境篇（48G 电脑 · Docker Desktop）
> 本地 Dify（完整版 + 简历问答助手）跑在本机 Docker Desktop（WSL2）里。
> 它与云端学习机是两套完全独立的系统：账号、数据、知识库互不相通。

- 每次开机后想用本地 Dify，第一件事：启动 Docker Desktop
  （开始菜单搜 "Docker Desktop"，等左下角状态变绿 Running
   ——它不随 Windows 开机自启，忘了开就是"localhost 打不开"）
- 启动后容器自动起床，等 1~2 分钟 → 浏览器访问 http://localhost
- 登录账号：09-18 创建的本地账号（不是云端账号，别混）
- 「简历问答助手」在 工作室 → 应用列表里，点开右侧调试窗口即可问答
- 数据住在 WSL2 的 Docker 卷里——重装/重置 Docker Desktop 前必须先研究备份
- 本地是提示词调优和评测的主战场（资源充足随便折腾），
  云端只做成品展示——两边的分工别搞反
