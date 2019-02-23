
const config = require('./index');

function FullUrl(route, host = config.HOST) {
  //route前边是否有斜线
  if (/^\//.test(route)) {
    route = route.substring(1, route.length);
  }
  return `${host}/${route}`;
}

const getList = '/info/list'; // 列表信息
const addUser = '/user/add'; // 添加用户

const urlList = {
  getList: FullUrl(getList),
  addUser: FullUrl(addUser, config.USERHOST),
};
module.exports = urlList;

