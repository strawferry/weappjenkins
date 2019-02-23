# 微信小程序开发 Jenkins 合并代码提交体验版本

## 1. 起因
最近公司项目在做小程序开发,有多个小伙伴一起开发,测试的小伙伴也要加入测试,为了做到敏捷开发,我这个懒人就在想有啥办法可以做到这点,最后发现微信的小程序工具提供[命令行调用](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html),查看其文档发现了新大陆,也就有了这篇文章;

## 2. 流程

1. 开发人员开发后代码推到 git 仓库;
2. 测试人员或开发触发 Jenkins 构建;
3. 通过微信的工具上传微信小程序最新代码,并通过钉钉机器人通知打包成功;
4. 测试就可以打开微信小程序的体验版开始体验最新的修改;

![](https://ws1.sinaimg.cn/large/8bbf0afbly1g0ge56olm3j217m0loacj.jpg)

## 3. Jenkins 配置
**1.** 配置参数化构建, 主要是配置了 接口请求环境,和打包的 Git 分支

![](https://ws1.sinaimg.cn/large/8bbf0afbly1g0gek8npfvj21ho14adk3.jpg)

**2.** Git 配置

![](https://ws1.sinaimg.cn/large/8bbf0afbly1g0gem3ja0vj21i60v8q6p.jpg)

**3.** Build 执行 shell 脚本

![](https://ws1.sinaimg.cn/large/8bbf0afbly1g0gena00thj21ik0s4adu.jpg)


```shell
echo ------------ 构建分支 --------------
echo $BRANCH 
echo ------------ 打包环境 --------------
echo $ENV

# 导入 node 环境
export PATH=$PATH:/usr/local/bin 

# 执行 接口请求环境的 替换操作
node env.js $ENV

# 上传最新修改到微信小程序
/Applications/wechatwebdevtools.app/Contents/MacOS/cli -u 1.0.0@$PWD --upload-desc 'Jenkins 小程序更新最新代码了,快去体验版查看'
# 上传成功后发送钉钉通知
node index.js $ENV $BRANCH
```

## 4. 微信开发工具配置
1. 微信开发工具登录并打开设置里面安全的服务端口;

> 本人手上是有一台 Mac 电脑专门用来打包 App 的,所以只讲了 Mac 的,但道理是差不多一样的,可以自己折腾 Windows 的系统,要在这台打包电脑安装 `Jenkins` 还有 `微信开发工具`;(因为自己脚本写的太差了,所以有两个地方用到了 `node` 来实现,所以还安装了 `node` 环境);

![](https://ws1.sinaimg.cn/large/8bbf0afbly1g0ggb5q8r8j227i1psqmv.jpg)

## 钉钉设置机器人
[之前我已经写了几个涉及钉钉机器人的配置,直接看之前的配置](https://gblog.ferryvip.com/2018/02/26/Log4js%20-%20Appenders%20%E5%BC%80%E5%8F%91,%E6%B6%88%E6%81%AF%E7%9B%B4%E5%8F%91%E9%92%89%E9%92%89%E6%9C%BA%E5%99%A8%E4%BA%BA/)

配置完成后,获取里面的 token
## 5. 主要代码配置
**1.** 配置环境的文件 `'./config/index.js'` 

```js
// 全局配置文件
let HOST = '', USERHOST = '';

let ENV = 'DEV'; // 设置环境 测试 DEV, 正式环境 PROD

if (ENV === 'PROD') {
  // 正式环境 host
  HOST = 'https://api.prod.com';
  USERHOST = 'https://user.prod.com';
} else {
  // 测试环境 host
  HOST = 'https://api.dev.com';
  USERHOST = 'https://user.dev.com';
}

module.exports = {
  ENV: ENV,
  HOST: HOST,
  USERHOST: USERHOST,
}
```

**2.** 替换接口环境的文件 `'./env.js'`

```js
const fs = require('fs');
const ENV = process.argv[2];
console.log(`/************* 替换环境为 ${ENV} 开始 *************/`);
// 环境文本
const prodTep = `
// 全局配置文件
let HOST = '', USERHOST = '';
let ENV = '${ENV}'; // 设置环境 测试 DEV, 正式环境 PROD
if (ENV === 'PROD') {
  // 正式环境 host
  HOST = 'https://api.prod.com';
  USERHOST = 'https://user.prod.com';
} else {
  // 测试环境 host
  HOST = 'https://api.dev.com';
  USERHOST = 'https://user.dev.com';
}
module.exports = {
  ENV: ENV,
  HOST: HOST,
  USERHOST: USERHOST,
}
`;
process.chdir(`./config`); // cd $1
console.log(`/************* 前往 config 文件夹,并替换写入文件 *************/`);
console.log(prodTep);
fs.writeFileSync('index.js', prodTep);
console.log(`/************* 替换环境为 ${ENV} 成功 *************/`);
process.exit(0);
```
**3.** 发送钉钉消息的文件 `'./index.js'`

```js
const ENV = process.argv[2];
const branch = process.argv[3];

const ddtoken = 'you-dingding-token'; // 钉钉机器人 token
const qrurl = 'you-qrcode-url';  // 微信体验版的 二维码地址

let tokens = [
  wscUrl,
];
const env = ENV === 'PROD' ? '正式环境' : '测试环境';
var exec = require('child_process').exec;
//  git 最近 5 条修改的 commit 信息
const str = `git log -5 --date=format:'%Y-%m-%d %H:%M:%S' --pretty=format:"* %cd - %s "`;
function runExec(cmdStr) {
  return new Promise((resolve, reject) => {
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        console.log('runExec error:' + stderr);
        reject();
      } else {
        // console.log(stdout);
        resolve(stdout);
      }
    });
  });
}
let gitlog = '';
runExec(str).then(res => {
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    gitlog = res;
    sendDing(token, gitlog)
  }
});
function sendDing(token, gitlog) {
  var https = require('https');
  var options = {
    hostname: "oapi.dingtalk.com", // 呼叫的域名
    port: 443,				// 端口固定
    path: `/robot/send?access_token=${token}`,				// 请求的api名称
    method: "POST",			// get和post请求
    json: true,				// 此地方表示json
    rejectUnauthorized: true,  //请校验服务器证书，否则ssl没有意义。
    headers: {
      'Accept': 'application/json;version=2.0',
      'Content-Type': 'application/json',             //此地方和json很有关联，需要注意
    }
  };
  var post_data = {
    "msgtype": "markdown",
    "markdown": {
      "title": "小程序新包更新",
      "text": `# 小程序新包发布 \n \n > 分支: ${branch} \n \n > 服务器环境: ${env} \n \n > 更新内容: \n \n ${gitlog}  \n \n > 微信扫码体验小程序: ![](${qrurl})`
    }
  };
  var json = JSON.stringify(post_data);
  var req = https.request(options, function (res) {
    res.setEncoding('utf8');
  });
  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });
  req.write(json);
  req.end();
}
```
## 6. 最终钉钉消息效果
![](https://ws1.sinaimg.cn/large/8bbf0afbly1g0ggu8vrcsj20ui1catej.jpg)

## 地址
> [GitHub 仓库地址](https://github.com/strawferry/weappjenkins)

## 个人博客
**博客地址:** 
[https://gblog.ferryvip.com/](https://gblog.ferryvip.com/) 