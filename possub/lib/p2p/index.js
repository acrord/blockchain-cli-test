const messages = require('./messages')
const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
  RESPONSE_TRANSACTION,
  RESPONSE_SENDMAIN,
  RESPONSE_VALIDATOR,
  LOCK,
  UNLOCK
} = require('./messages/message-type');
const wrtc = require('wrtc');
const Exchange = require('peer-exchange');
const p2p = new Exchange('blockchain.js', { wrtc: wrtc });
const net = require('net');
const blockchain = require('../blockchain')
const logger = require('../cli/util/logger.js');


class PeerToPeer {
  constructor() {
    this.peers = [];
    this.lock = false;
  }

  startServer (port) {
    const server = net.createServer(socket => p2p.accept(socket, (err, connection) => {
      if (err) {
        logger.log(`❗  ${err}`);
      } else {
        logger.log('👥  A peer has connected to the server!')
        this.initConnection.call(this, connection)
      }
    })).listen(port);
    logger.log(`📡  listening to peers on ${server.address().address}:${server.address().port}... `);
  }

  connectToPeer(host, port) {
    const socket = net.connect(port, host, () => p2p.connect(socket, (err, connection) => {
	 socket.port = port
      if (err) {
        logger.log(`❗  ${err}`);
      } else {
        logger.log('👥  Successfully connected to a new peer!');
        this.initConnection.call(this, connection);
      }
    }));
  }

  discoverPeers() {
    p2p.getNewPeer((err, connection) => {
      if (err) {
        logger.log(`❗  ${err}`);
      } else {
	this.initConnection.call(this, connection)
        logger.log('👀  Discovered new peers.') //todo
      }
    })
  }

  initConnection(connection) {
    this.peers.push(connection);
    this.initMessageHandler(connection);
    this.initErrorHandler(connection);
    this.write(connection, messages.getQueryChainLengthMsg());
  }

  initMessageHandler(connection) {
    connection.on('data', data => {
      const message = JSON.parse(data.toString('utf8'));
      this.handleMessage(connection, message);
    })
  }

  //투표가 완료되기 전까지 기다림
  Locking(){
    if(this.lock === true){
      setTimeout(()=>this.Locking(), 50);
      return;
    }
    
  }

  handleMessage(peer, message) {
    switch (message.type) {
      case LOCK:
	this.lock = true
	this.Locking()  
	break
      //if complete the validation then release lock
      case UNLOCK:
        this.lock = false
	break
      case QUERY_LATEST:
        logger.log(`⬇  Peer requested for latest block.`);
        this.write(peer, messages.getResponseLatestMsg(blockchain))
        break
      case QUERY_ALL:
        logger.log("⬇  Peer requested for blockchain.");
        this.write(peer, messages.getResponseChainMsg(blockchain))
        break
      case RESPONSE_VALIDATOR:
	logger.log("⬇  Peer requested for validate.");
        this.handleValidate(peer, message)
        break
      case RESPONSE_BLOCKCHAIN:
        this.handleBlockchainResponse(message)
        break
      case RESPONSE_TRANSACTION:
	this.handleTransaction(message, peer)
	break
      default:
        logger.log(`❓  Received unknown message type ${message.type}`)
    }
  }

  initErrorHandler(connection) {
    connection.on('error', error => logger.log(`❗  ${error}`));
  }

  broadcastLatest () {
    this.broadcast(messages.getResponseLatestMsg(blockchain))
  }

  broadcast(message) {
    this.peers.forEach(peer => this.write(peer, message))
  }

  write(peer, message) {
    peer.write(JSON.stringify(message));
  }

  closeConnection() {

  }
  
  handleBlockchainResponse(message) {
    const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlockHeld = blockchain.latestBlock;

    const blockOrChain = receivedBlocks.length === 1 ? 'single block' : 'blockchain';
    logger.log(`⬇  Peer sent over ${blockOrChain}.`);

    if (latestBlockReceived.index <= latestBlockHeld.index) {
      logger.log(`💤  Received latest block is not longer than current blockchain. Do nothing`)
      return null;
    }

    logger.log(`🐢  Blockchain possibly behind. Received latest block is #${latestBlockReceived.index}. Current latest block is #${latestBlockHeld.index}.`);
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      logger.log(`👍  Previous hash received is equal to current hash. Append received block to blockchain.`)
      console.log(latestBlockReceived)
      blockchain.addBlockFromPeer(latestBlockReceived)
      this.broadcast(messages.getResponseLatestMsg(blockchain))
    } else if (receivedBlocks.length === 1) {
      logger.log(`🤔  Received previous hash different from current hash. Get entire blockchain from peer.`)
      this.broadcast(messages.getQueryAllMsg())
    } else {
      logger.log(`⛓  Peer blockchain is longer than current blockchain.`)
      blockchain.replaceChain(receivedBlocks)
    }
  }

  //validation process
	//check previous hash & index of transaction(block)
  handleValidate(peer, message) {
    const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlockHeld = blockchain.latestBlock;
    console.log(latestBlockReceived)
    let result = true;
    if (latestBlockHeld.hash !== latestBlockReceived.previousHash){
       result = false;
    }
    else if(latestBlockReceived.index < latestBlockHeld.index) result = false
    this.write(peer, messages.getUnlock(result)) 
  }

  //if 블록 생산자 then create block and locking all peers and check validation
  handleTransaction(message, peer){
    this.lock = true;
    let newBlock = blockchain.mine(message.trans);
    this.write(peer, messages.getResponseBlock(newBlock))
    this.Locking();
  }
}


module.exports = new PeerToPeer();
