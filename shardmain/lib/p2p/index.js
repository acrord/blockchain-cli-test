const messages = require('./messages')
const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
  RESPONSE_TRANSACTION,
  SEND_PORT,
  RESPONSE_MAIN,
  SEND_PROPOSER
} = require('./messages/message-type');
const wrtc = require('wrtc');
const Exchange = require('peer-exchange');
const p2p = new Exchange('blockchain.js', { wrtc: wrtc });
const net = require('net');
const blockchain = require('../blockchain')
const logger = require('../cli/util/logger.js');
const blockSize = 100;

class PeerToPeer {
  constructor() {
    this.peers = [];
    this.peerhosts = [];
    this.proposer1 = {};
    this.proposer2 = {};
    this.proposer3 = {};
    this.tr = 1;
    this.shard1 = {};
    this.shardpeers1=[];
    this.shard2 = {};
    this.shardpeers2=[];
    this.shard3 = {};
    this.shardpeers3=[];
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
      if (err) {
        logger.log(`❗  ${err}`);
      } else {
	socket.port = port
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
      case QUERY_LATEST:
        logger.log(`⬇  Peer requested for latest block.`);
        this.write(peer, messages.getResponseLatestMsg(blockchain))
        break
      case QUERY_ALL:
        logger.log("⬇  Peer requested for blockchain.");
        this.write(peer, messages.getResponseChainMsg(blockchain))
        break
      case SEND_PORT:
        logger.log("Peer requested connect.");
        this.peerhosts.push(message.port)
        break
      case RESPONSE_BLOCKCHAIN:
        this.handleBlockchainResponse(message)
        break
      case RESPONSE_TRANSACTION:
	this.resendTransaction(message);
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

  broadcastMining(shard1, shard2, shard3) {
    this.shard1 = shard1;
    this.shard2 = shard2;
    this.shard3 = shard3;
    var count1 = 0;
    var count2 = 0;
    var count3 = 0;
    for(let i =0;i<this.peerhosts.length;i++){
      if(this.shard1[this.peerhosts[i]]==1){
          if(count1==0){this.proposer1 = this.peers[i]; count1++}
          this.shardpeers1.push(this.peers[i])
       }else if(this.shard2[this.peerhosts[i]]==1){
          if(count2==0){this.proposer2 = this.peers[i]; count2++}
          this.shardpeers2.push(this.peers[i])
       }else{
	  if(count3==0){this.proposer3 = this.peers[i]; count3++}
          this.shardpeers3.push(this.peers[i])
       }

    }
    this.startTransaction();
  }

  startTransaction(){
    if(Object.keys(this.proposer1).length!=0){
      this.write(this.proposer1, messages.sendStart(`\"transAction ${this.tr++}\"`))
    }
    if(Object.keys(this.proposer2).length!=0){
      this.write(this.proposer2, messages.sendStart(`\"transAction ${this.tr++}\"`))
    }
    if(Object.keys(this.proposer3).length!=0){
      this.write(this.proposer3, messages.sendStart(`\"transAction ${this.tr++}\"`))
    }
  }

  restartTransaction(port){
    if(this.shard1[port]==1){
      this.write(this.proposer1, messages.sendStart(`\"transAction ${this.tr++}\"`))
    }
    else if(this.shard2[port]==1){
      this.write(this.proposer2, messages.sendStart(`\"transAction ${this.tr++}\"`))
    }else{
      this.write(this.proposer3, messages.sendStart(`\"transAction ${this.tr++}\"`))
    }
  }


  resendTransaction(message){
    const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    const latestBlockReceived = blockchain.mine(receivedBlocks[receivedBlocks.length - 1].data);
    console.log(latestBlockReceived)
    const latestBlockHeld = blockchain.latestBlock;
    if (latestBlockReceived.index <= latestBlockHeld.index) {
      logger.log(`💤  Received latest block is not longer than current blockchain. Do nothing`)
      return null;
    }

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
    if(this.tr >100) {
     logger.log("finished!!!")
     return null 
    }
    this.restartTransaction(message.port)
  }

  broadcast(message) {
    this.peers.forEach(peer => this.write(peer, message))
  }

  write(peer, message) {
    peer.write(JSON.stringify(message));
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
