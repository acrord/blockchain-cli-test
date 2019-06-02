const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
  RESPONSE_TRANSACTION,
  RESPONSE_SENDMAIN,
  RESPONSE_VALIDATOR,
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

  getResponseLatestMsg (blockchain) {
    logger.log('⬆  Sending peer latest block');
    return {
      type: RESPONSE_BLOCKCHAIN,
      data: JSON.stringify([
        blockchain.latestBlock
      ])
    }
  }
  getResponseBlock(block){
     logger.log("dsads")
     return {
      type: RESPONSE_SENDMAIN,
      data: JSON.stringify([
        block
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

  getLock(){
   logger.log('Locked!!!!')
   return{
    type: LOCK
   }
  }

  getUnlock(message){
   logger.log('voting!!!!')
   return{
    type: UNLOCK,
    data: message
   } 
  }
}

const messages = new Messages()
module.exports = messages
