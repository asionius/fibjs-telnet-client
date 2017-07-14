# fibjs telnet client

## 简介
这是一个采用[fibjs](http://fibjs.org)编写的telnet客户端，具有连接、登录及远程执行命令等功能
## 使用方法


```
var telnet = require("telnet-client");

var opt = {
	host: "127.0.0.1",
	port: 2323,
	shellPrompt: "/ # ",
	timeout: 3000
}

var conn = new telnet();
conn.connect(opt);
var res = conn.exec('uptime');
assert.equal(res, "23:14  up 1 day, 21:50, 6 users, " + "load averages: 1.41 1.43 1.41");
conn.close();
```

```
opt 为可选参数

{
	host: "127.0.0.1",	//telnet server address
	port: 2323,			//telnet server port
	timeout: 3000,		//connect timeout
	shellPrompt: "/ #",	//shell 提示符 注：使用的时候应该以实际的telnet server为主
	loginPrompt: "Username: ",	//登录提示符 注：使用的时候应该以实际的telnet server为主
	passwordPrompt: "Password: ",	//输入密码提示符 注：使用的时候应该以实际的telnet server为主
	username: "asionius",		// 用户名
	password: "123456"		//密码
	irs: "\r\n",			//输入换行符
	ors: "\r\n",			//输出换行符
	echoLines: 1,			//telnet server 回显行数
	stripShellPrompt: 1		//显示时消除shell提示符
	execTimeout: 3000,		//执行命令超时时间
	sendTimeout: 2000,		//发送命令超时时间
	maxBufferLength: 2048	//最大的缓存
}

```
## test
```
cd test
npm install
npm run
fibjs test.js
```
