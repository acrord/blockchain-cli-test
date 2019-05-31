const express = require('express');
const router = express.Router();
const p2p = require('../lib/p2p');
// Welcome Page

let peers = [3000];
let port = 3001;

router.get('/connect', (req, res) => {
	peers.push(port)
	res.send({port:port++});
});

router.get('/test',(req,res)=>{
	p2p.broadcastMining()
	res.send("ok")
})

module.exports = router;
