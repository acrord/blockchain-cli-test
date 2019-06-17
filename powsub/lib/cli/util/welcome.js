const logger = require('./logger.js');
const vorpal = require('vorpal')();
const request = require('request');
const BASEURL = 'http://192.168.56.102:5000/'//현재 localhost에서 사용중인 ip
module.exports = function (vorpal) {
  logger.log("👋  Welcome to Blockchain CLI!");
  vorpal.exec("help")

//Process 실행 시 main 서버 연결 및 p2p 네트워크에 참여
  request({ 
    uri: `${BASEURL}connect`, 
    method: "GET", 
    timeout: 10000, 
    followRedirect: true, 
    maxRedirects: 10 
  }, function(error, response, body) {
    vorpal.exec(`open ${JSON.parse(body).port}`)
    vorpal.exec(`connect localhost 3000`)
  });
}
