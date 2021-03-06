#!/usr/bin/env node
/*node for generating transactions with server
 * 결과 노드에 포함되지 않는다.
 * */

const vorpal = require('vorpal')();
vorpal.use(require('./lib/cli'));
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Express body parser
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));



//HTTP 접근 제어(cor) 처리
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);

// Routes
app.use('/', require('./routes/index.js'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', console.log(`Server running on port ${PORT}`));
module.exports = app;

