/*managing the node connections*/
const express = require('express');
const router = express.Router();
const p2p = require('../lib/p2p');
const blockchain = require('../lib/blockchain');
let blockSize =100;
// Welcome Page
let peers = [3000];
let port = 3001;
let getItem = blockchain.get().length

function doStuff(){
  
  if(getItem === blockchain.get().length){
    setTimeout(doStuff, 50);
    return;
  }
  getItem = blockchain.get().length
   p2p.broadcastMining()
}

router.get('/connect', (req, res) => {
	peers.push(port)
	res.send({port:port++});
});

router.get('/test', async(req,res)=>{
   p2p.broadcastMining()
   for(var i = 0; i<blockSize-1; i++){
   	doStuff(); 
   }
   res.send("ok")
})

module.exports = router;
