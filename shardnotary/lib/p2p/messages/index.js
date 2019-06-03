const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
  RESPONSE_TRANSACTION,
  SEND_PORT,
  RESPONSE_MAIN,
  SEND_PROPOSER,
  SEND_PROPOSAL,
  SEND_VOTE,
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

  sendPort (port) {
    logger.log('⬆  Checking Main Chain');
    return {
      type: SEND_PORT,
      port: port
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
  
  getProposal(block){
   logger.log('send Proposal to peers');
   return {
     type: SEND_PROPOSAL,
     data: JSON.stringify([block])
   }
  }
  sendVote(result){
   logger.log('send Voting')
   return {
    type:SEND_VOTE,
    data:result
   }
  }	
  validateChain(block){
   logger.log('send Validate Block')
   return {
      type: RESPONSE_TRANSACTION,
      data: JSON.stringify([block.block]),
      port: block.port
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
