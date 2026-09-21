# Dify 部署问题排查指南
> 环境：2核2G 阿里云 ECS + Ubuntu 24.04 + Docker 部署 Dify 1.17.1

## 1. 全家桶挤爆 2G 内存，服务器反复"僵死"
- 现象：部署 Dify 全家桶（20 容器）后，网页 502 → 超时 → 最后
  SSH 连密码提示都不出现；强制重启后好转几分钟，随后必然复发
- 原因：20 个容器的内存需求远超物理内存（1.7Gi），系统触发
  OOM 杀进程；但容器的 restart 策略让它们全部自动复活，再次
  挤爆——重启只是清空了桌面，没有解决"桌子太小"
- 定位：① 从自己电脑探测 22 端口——能握手 = 机器活着只是慢，
  排除"死机"误判；② free -h 看 available 贴地（一度只剩
  115Mi）；③ 登录信息里 System load 高企
- 解决：分两层——
  急救：控制台强制重启 / VNC 进去恢复操作能力
  根治：docker update --restart=no 给 9 个非必需容器（沙箱×2、
  ssrf_proxy×2、agent_backend、plugin_daemon、worker_beat、
  worker、weaviate）设置"重启不复活"，docker stop 它们，
  只保留 db/redis/api/web/nginx 核心五件套；另加 4G swap
  作为缓冲垫（写入 /etc/fstab 保证重启生效）
- 教训：① 部署前先算资源账，容器数量 ≠ 机器能承受的数量；
  ② 资源不足时重启是救火不是解决——要从机制（restart=no）
  上断掉"复活→窒息"的循环；③ SSH 连不上先探测端口再定性，
  VNC 是云服务器的急救直连线

## 2. 镜像拉取僵死：进度条不动，字节为零
- 现象：docker compose up -d 卡在拉取镜像，进度条长时间不动；
  另开窗口 du -sh /var/lib/docker 前后两次读数一模一样
  （一度只有 688K）——看起来在下载，实际一个字节都没进来
- 原因：Docker Hub 在境外，直连超时；部分公共加速站不稳定
  或配置未生效，Docker 实际在对着一个连不通的地址空转
- 定位：① 在自己电脑上 curl 各加速站 https://xxx/v2/，
  返回 401 = 站点活着（401 是正常心跳，表示"在等你鉴权"）；
  ② 服务器上跑 docker info | grep -A 5 "Registry Mirrors"
  确认加速器配置真的被加载了；③ du -sh /var/lib/docker
  前后对比，数字在涨 = 真在下载
- 解决：改用阿里云**专属**加速器（控制台 → 容器镜像服务 →
  镜像加速器，每人一个专属地址，走内网最稳），加上可用公共站
  兜底，一起写进 /etc/docker/daemon.json（用单行 printf 写入，
  避开多行粘贴的坑，见第 3 条），systemctl restart docker
  后 docker info 确认生效；拉取中断也没关系，断点续传，
  重跑同一条 up -d 会接着下
- 教训：① 国内从 Docker Hub 拉镜像，加速器是标配，且公共站
  会"死"，云厂商专属站走内网最可靠；② 判断"下载卡死"真假
  用存储目录的前后对比，不要盯着进度条猜；③ 拉取失败重跑
  即可，已下载的图层有缓存，不会白等
## 3. 多行命令粘贴后变成乱码命令
- 现象：粘贴 tee 多行配置后报 Failed to restart dockertee.service
  ——"docker"和"tee"粘成了一个词；VNC 里粘贴更长命令时直接截断
- 原因：多行文本在 SSH/VNC 粘贴时换行丢失错位
- 解决：改用单行命令（printf 写配置文件）
- 教训：环境会改变命令的形态——同一段文字换个通道贴进去可能
  就是另一条命令；长配置一律用单行命令或写成脚本文件执行。
  看到"我从没敲过的命令名"报错，先怀疑粘贴错位，不是玄学

## 4. "Running migrations" 滚不完，期间多次 502
- 现象：api 日志连刷十几行 Running migrations，网页一直 502，
  看着像卡死；实际每步迁移之间有 30~60 秒静默期，且每重启
  一次进度就回滚一次，重来十几分钟
- 原因：首次启动要跑几十步数据库迁移，弱机上以分钟计；
  每次重启都会打断重来
- 解决：docker logs -f 陪跑，等 startup complete / healthy 再操作
- 教训："没动静"≠"卡死"，先看日志判断是在干活还是真停了；
  初始化阶段最大的敌人是自己手痒重启——陪跑也是运维工作的一部分

## 5. 命令打错的三种姿势
- 现象一：cd/root/dify/docker 少了空格 → bash 把整串当命令名找，
  报 No such file or directory——空格是分隔符，一个不能省
- 现象二：ocker logs 丢了 d → bash 反问"你是不是想输入 docker？"
- 现象三：在家目录跑 docker compose ps 报 no configuration file
  → compose 只认当前目录的编排文件，先 cd /root/dify/docker
- 解决：敲完回车前扫一眼；报错读三遍再动手
- 教训：报错信息里往往就藏着正确答案（bash 会提示"你是不是想
  输入 docker？"）——这三次错误全部零成本修正，读报错是最便宜
  的调试方式

## 6. 截图转录 Secret 错了两个字符，签名失败
- 现象：IncompleteSignature
- 原因：0/O、l/I、g/q 截图上无法分辨，转录出错
- 解决：密钥传递一律走文本粘贴或 CSV 下载，禁止截图转录
- 教训：密钥是"一个字符都不能错"的数据，任何人工转录环节都是
  风险点；遇到签名/认证类报错（IncompleteSignature、401），
  第一反应应该是"重新完整复制一次密钥"，而不是反复重试或
  怀疑平台故障

## 7. 浏览器 502 的三种含义
- 剧本一：门卫在、引擎没上岗——nginx 容器活着，但 api 在跑
  数据库迁移还没监听。验证：docker compose ps 看 api 是
  (health: starting) 还是 (healthy)。处理：等 healthy，别动
- 剧本二：引擎被挤死——全家桶挤爆 2G 内存，api 起来就被 OOM
  压死、反复重启，nginx 背后永远没应答。验证：free -h 看
  available 贴地 + api 状态一直 Restarting。处理：永久减重
  （--restart=no + stop 非必需容器）
- 剧本三：纯属时机太早——api 刚变 healthy 的瞬间刷新，页面
  拿到的还是旧失败响应。验证：Ctrl+F5 强刷 + 控制台看这条
  请求现在还是不是 502。处理：刷新即可
- 教训：502 的字面意思只有"网关收不到上游应答"，但上游为什么
  不应答有好几个剧本——状态码负责定位层级（问题在 nginx 之后的
  上游），日志负责定位剧本。同一个码，不同的病，处方完全不同