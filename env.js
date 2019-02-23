/**
 * pages模版快速生成脚本,执行命令 npm run tep `文件名`
 */

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
