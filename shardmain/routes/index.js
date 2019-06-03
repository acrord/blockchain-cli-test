const express = require('express');
const router = express.Router();
const p2p = require('../lib/p2p');
const blockchain = require('../lib/blockchain');
let blockSize =100;
// Welcome Page
const shardNum = 3;
let shard1 = {};
let shard2 = {};
let shard3 = {};
let port = 3001;
let getItem = blockchain.get().length

router.get('/connect', (req, res) => {
	const random = Math.floor(Math.random() * shardNum) 
	let peers;
	if(random == 0){
          //peer의 수가 너무적어서 사용
	  if(shard1.length == 3){
		if(shard2.legnth != 3){
		  peers = shard2;
		  shard2[port]=1
		}else{
                  peers = shard3;
                  shard3[port]=1
		}
          }
	  else{
		  peers = shard1;
		  shard1[port]=1
	  }
	}
	else if(random == 1){
	  if(shard2.length == 3) {
		if(shard3.length !=3){
		  peers = shard3;
		  shard3[port]=1
		}else{
                  peers = shard1;
		  shard1[port] =1
		}
	  }
	  else {
		  peers = shard2;
		  shard2[port] = 1
	  }
	}
        else{
           if(shard3.length == 3) {
                if(shard1.length !=3){
                  peers = shard1;
                  shard1[port]=1
                }else{
                  peers = shard2;
                  shard2[port] =1
                }
          }
          else {
                  peers = shard3;
                  shard3[port] = 1
          }

	}
	res.send({port:port++, peers: peers});
});

router.get('/test', async(req,res)=>{
   p2p.broadcastMining(shard1, shard2, shard3)
   res.send("ok")
})

module.exports = router;
