const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
  RESPONSE_TRANSACTION,
  RESPONSE_VALIDATOR,
  RESPONSE_SENDMAIN,
  LOCK,
  UNLOCK
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

  getResponseChainMsg (blockchain) {
    logger.log('⬆  Sending peer entire blockchain');
    return {
      type: RESPONSE_BLOCKCHAIN,
      data: JSON.stringify(blockchain.get())
    }
  }

  getCheckMain () {
    logger.log('⬆  Checking Main Chain');
    return {
      type: CHECK_MAIN
    }
  }

  getResponseMain(blockchain, trans){
   logger.log('⬆  MAIN entire blockchain');
    return {
      type: RESPONSE_MAIN,
      data: JSON.stringify(blockchain.get()),
      trans: trans,
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
      trans: message,
      data: blockchain.latestBlock
    }
  }
  getResponseValidate(block){
    console.log(block)
   logger.log('⬆  Sending peer latest block');
    return {
      type: RESPONSE_VALIDATOR,
      data: JSON.stringify([
        block
      ])
    }
  }
  getLock(){
   logger.log('Locked!!!!')
   return{
    type: LOCK
   }
  }

  getUnlock(){
   logger.log('unlocked!!!!')
   return{
    type: UNLOCK
   }
  }

}

const messages = new Messages()
module.exports = messages
