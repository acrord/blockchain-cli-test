
Node v.8.16에서 호환됩니다.
메인 실행 후 sub 실행해주세요
```bash
# Clone this repository
$ git clone https://github.com/acrord/blockchain-cli-test/

# Go into the repository
$ cd powmain 
or
$ cd posmain
or
$ cd shardmain

# Install dependencies
$ npm install

# Run the app
$ npm start

# 각 노드 환경 구성 후 

curl 192.168.56.102:5000/test 

# 를 통해 트랜잭션 발생
```

## ⚒️ Built With

* [Vorpal](https://github.com/dthree/vorpal) - Interactive node CLI
* [Peer Exchange](https://github.com/mappum/peer-exchange/) - Peer to peer communication
* [Crypto-js](https://github.com/brix/crypto-js) - Crypto library for hashing blocks

## 🎫 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

* [This article](https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54) written by Lauri Hartikka.
* Original [repo](https://github.com/lhartikk/naivechain) by Lauri Hartikka
* Antony Jone's [fork](https://github.com/antony/naivechain) for refactoring.
* Nick Fallon [fork](https://github.com/nickfallon/naivechain) for PoW implementation.
* Logo designed by Muammark / Freepik.
* FAQ by [/u/sheepiroth](https://www.reddit.com/r/javascript/comments/6ohc9h/a_blockchain_commandline_interface_built_with/dkiahix/)

## ℹ️ FAQ 

#### When or why I would use this?

You should use this if you want to build a bitcoin wallet, payment processor, or bitcoin merchant portal in javascript. You might also be interested in why decentralized networks or p2p applications are useful, or what advantages they have; this project seems like a good way to learn about that.

#### What is the block chain actually for?

The blockchain is for authorizing payments of a cryptocurrency between two peers without the need for a centralized 3rd party approving of the transaction. There are other uses of the blockchain which are more in line with the second point, digital signatures, but they are secondary to the main purpose of peer to peer transfer of value. Bitcoin is blockchain's killer app.

#### Why the hell should I care about the blockchain?

Blockchain facilitates trade over a network. Imagine a metal as scarce as gold with a magical property of "can be transported over a communications channel". This has implications with respect to individual rights, the world economy, and the way we monetize and transfer value at a level higher than bartering directly for goods.

Lately people are distancing themselves from the proof-of-work concept and are using blockchain to describe only the mechanism of signing a transaction as verification of sending an amount. Change "sending an amount" to almost anything else - authorizing a change in a ruleset, casting a vote for a politician, verifying a point of IoT data is authentic. Now add in the concept of a peer-to-peer network to this and you've eliminated a middleman that once existed, thereby improving the efficiency and reducing cost. In these cases, "blockchain" refers to the structuring of a program or database in such a way that it has no central point of failure while still providing all of the features expected. For example, augur and gnosis are decentralized prediction markets. Ethereum has implemented smart contracts which enable decentralized release of funds based on a gambling outcome.
