# CloudClass_WebAppClient
CC视频云课堂web客户端，供非Chrome浏览器用户使用
本工程基于electron开发

## 运行环境

Windows系统安装Cygwin或mingw，再分别安装下列应用：
1、node 版本：v8.10.0
2、npm 版本： 5.6.0
3、electron 版本：v1.8.4

## 运行demo

### 安装依赖

项目根路径下执行 `npm install`

### 修改配置

1、修改 renderer 目录下的 index.html文件，将 src="https://class.csslcloud.net/index/presenter/?roomid=645B41C5DC8361019C33DC5901307461&userid=E9607DAFB705A798"
中的roomid 和 userid 换成CC视频云课堂账号下创建的直播间ID和用户ID

### 启动服务

1、在项目跟路径下执行 `electron .` 

截图：

1、cygwin命令窗口：
<img src="/images/cygwin_cmd.jpg">

2、登录窗口：
<img src="/images/demo_login.jpg">

3、进入系统后窗口：
<img src="/images/demo_join.jpg">
