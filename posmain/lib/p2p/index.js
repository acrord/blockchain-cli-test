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
    this.hosts = [];
    this.newBlock ={}
    this.peers = [];
    this.tr = 1;
    this.lock = false;
    this.block = [],
    this.voting = []
  }

  startServer (port) {
    const server = net.createServer(socket => p2p.accept(socket, (err, connection) => {
      if (err) {
        logger.log(`❗  ${err}`);
      } else {
	this.hosts.push(port)
	socket.port = port
        logger.log('👥  A peer has connected to the server!')
        this.initConnection.call(this, connection)
      }
    })).listen(port);
    logger.log(`📡  listening to peers on ${server.address().address}:${server.address().port}... `);
  }

  connectToPeer(host, port) {
    const socket = net.connect(port, host, () => p2p.connect(socket, (err, connection) => {
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

  handleMessage(peer, message) {
    switch (message.type) {
      case LOCK:
	break
      case UNLOCK:
	this.voting.push(message.data)
	if(this.voting.length != this.hosts.length) return null;
	this.lock = false;
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
        logger.log("⬇  Peer requested for Validate.");
        this.handleValidate(message)
        break
      case RESPONSE_SENDMAIN:
        logger.log("⬇  Select Block Builder.");
        this.handleBlockBuilder(message, peer)
        break

      case RESPONSE_BLOCKCHAIN:
        this.handleBlockchainResponse(message)
        break
      case RESPONSE_TRANSACTION:
        break
      case RESPONSE_MAIN:
        this.handleMain(message)
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

  selectValidator() {
   //this.peers[node].write(JSON.stringify(messages.getUnlock()));
   //this.peers[node].write(JSON.stringify(messages.getBroadCastMsg(blockchain, `\"transAction ${this.tr++}\"`)))
   this.broadcast(messages.getBroadCastMsg(blockchain, `\"transAction ${this.tr++}\"`))
   this.broadcast(messages.getLock())
  }

  broadcast(message) {
    this.peers.forEach(peer => this.write(peer, message))
  }

  write(peer, message) {
    peer.write(JSON.stringify(message));
  }

  closeConnection() {

  }

  Locking(){
    if(this.lock === true){
      setTimeout(()=>this.Locking(), 50);
      return;
    }
    let count = 0;
    for(let i = 0; i < this.voting.length; ++i){
      if(this.voting[i] == true)
        count++;
    }
    if(count >= this.hosts.length*2/3){
      blockchain.addBlockFromPeer(this.newBlock)
      this.broadcast(messages.getResponseLatestMsg(blockchain))
      this.broadcast(messages.getUnlock())
    } else{
	console.log("rejected!!")
     this.broadcast(messages.getUnlock())
    }
    this.voting = []
    this.newBlock = {}
  }

  handleBlockBuilder(message, peer) {
    const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    this.block.push(latestBlockReceived)
    if(this.block.length != this.hosts.length) {
	    return null
    }
    let rand = Math.floor(Math.random()*this.hosts.length)
    this.newBlock = this.block[rand]
    this.broadcast(messages.getResponseValidate(this.newBlock))
    this.block= []
    this.lock = true
    this.Locking()
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

}


module.exports = new PeerToPeer();
