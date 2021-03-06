const express = require('express');
const router = express.Router();
const p2p = require('../lib/p2p');
const blockchain = require('../lib/blockchain');
let blockSize =100;
let port = 3001;
let peers = {} 
let getItem = blockchain.get().length

/*
 * 하나의 블록이 생성되면 다음 트랜잭션 전달
 * */
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
	//if new node connection then give port++
	peers[port]=1
	res.send({port:port++, peers: peers});
});

router.get('/test', async(req,res)=>{
   //블록 생산자를 정하고 검증을 시작
   p2p.selectValidator()
   for(var i = 0; i<blockSize-1; i++){
   	doStuff(); 
   }
   res.send("ok")
})

module.exports = router;
