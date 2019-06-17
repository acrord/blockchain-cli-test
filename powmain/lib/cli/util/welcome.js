const logger = require('./logger.js');
const vorpal = require('vorpal')();
module.exports = function (vorpal) {
  logger.log("👋  Welcome to Blockchain CLI!");
  vorpal.exec("help")
  vorpal.exec(`open 3000`)
}
