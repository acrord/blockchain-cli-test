const express = require('express');
const router = express.Router();
const p2p = require('../lib/p2p');
const blockchain = require('../lib/blockchain');
let blockSize =100;
let port = 3001;
let peers = {} 
let getItem = blockchain.get().length

function doStuff(){
  
  if(getItem === blockchain.get().length){
    setTimeout(doStuff, 50);
    return;
  }

  getItem = blockchain.get().length
  var  test  =Math.floor(Math.random()*peers.length)-1
  p2p.selectValidator()
}

router.get('/connect', (req, res) => {
	peers[port]=1
	res.send({port:port++, peers: peers});
});

router.get('/test', async(req,res)=>{
   p2p.selectValidator()
   for(var i = 0; i<blockSize-1; i++){
   	doStuff(); 
   }
   res.send("ok")
})

module.exports = router;
