




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
