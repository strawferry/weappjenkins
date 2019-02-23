
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
