const logger = require('./logger.js');
const vorpal = require('vorpal')();
const request = require('request');
const BASEURL = 'http://192.168.56.102:5000/'
module.exports = function (vorpal) {
  logger.log("👋  Welcome to Blockchain CLI!");
  vorpal.exec("help")
  request({ 
    uri: `${BASEURL}connect`, 
    method: "GET", 
    timeout: 10000, 
    followRedirect: true, 
    maxRedirects: 10 
  }, function(error, response, body) {
    const data = JSON.parse(body);
    vorpal.exec(`open ${data.port}`)
    vorpal.exec(`connect localhost 3000`)
    Object.keys(data.peers).forEach(pport => {
	if(pport != data.port){
	  logger.log(`connect with ${pport}`);
	  vorpal.exec(`connect localhost ${pport}`);
	}
    })
  });
}
