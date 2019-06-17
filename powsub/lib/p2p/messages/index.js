const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
  RESPONSE_TRANSACTION,
  CHECK_MAIN,
  RESPONSE_MAIN
} = require('./message-type');
const logger = require('../../cli/util/logger.js');

class Messages {
  getQueryChainLengthMsg () {
    logger.log('⬆  Asking peer for latest block');
    return {
      type: QUERY_LATEST
    }
  }

  getQueryAllMsg () {
    logger.log('⬆  Asking peer for entire blockchain');
    return {
      type: QUERY_ALL
    }
  }

  getCheckMain (trans) {
    logger.log('⬆  Checking Main Chain');
    return {
      type: CHECK_MAIN,
      trans: trans
    }
  }

  getResponseMain(blockchain, trans){
   logger.log('⬆  MAIN entire blockchain');
    return {
      type: RESPONSE_MAIN,
      data: JSON.stringify(blockchain.get()),
      trans: trans
    }
  }

  getResponseChainMsg (blockchain) {
    logger.log('⬆  Sending peer entire blockchain');
    return {
      type: RESPONSE_BLOCKCHAIN,
      data: JSON.stringify(blockchain.get())
    }
  }

  getResponseLatestMsg (blockchain) {
    logger.log('⬆  Sending peer latest block');
    return {
      type: RESPONSE_BLOCKCHAIN,
      data: JSON.stringify([
        blockchain.latestBlock
      ])
    }
  }
  
  getBroadCastMsg (blockchain, message){
    logger.log('⬆  Sending peer transAction');
    return {
      type: RESPONSE_TRANSACTION,
      trans: JSON.stringify({msg:message}),
      data: JSON.stringify([
	blockchain.latestBlock
      ])
    }

  }
}

const messages = new Messages()
module.exports = messages
