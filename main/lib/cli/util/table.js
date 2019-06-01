const Table = require('cli-table2')
const logger = require('./logger.js');
const colors = require('colors/safe');
const excel = require('excel4node');

function logBlockchain(blockchain) {
  var workbook = new excel.Workbook();
  var worksheet = workbook.addWorksheet("Sheet 1");
  worksheet.cell(1,1).string("transaction");
  worksheet.cell(1,2).string("timestamp");
  worksheet.cell(1,3).string("nonce");
  worksheet.cell(1,4).string("hash");
  worksheet.cell(1,5).string("previous");

  blockchain.forEach((block, index) => {
    const table = new Table({
      style:{border:[],header:[]},
      wordWrap: true,
      colWidths:[20,20]
    });
    const object = JSON.parse(JSON.stringify(block))
    for(let key in object) {
      if (key === 'index') {
        const blockNumber = object[key]
        if (blockNumber === 0) {
          table.push([{colSpan:2,content:colors.green.bold("🏆  Genesis Block"), hAlign:'center'}])
        } else {
          table.push([{colSpan:2,content:colors.green.bold(`⛓  Block #${object[key]}`), hAlign:'center'}])
        }
      } else {
        const obj = {};
        if (key === 'previousHash') {
	  worksheet.cell(index+2, 5).string(object[key])
          obj[`⏮  ${colors.red('Previous Hash')}`] = object[key]
        } else if (key === 'timestamp') {
	  worksheet.cell(index+2,2).string(new Date(object[key] * 1000).toUTCString())
          obj[`📅  ${colors.red('Timestamp')}`] = new Date(object[key] * 1000).toUTCString()
        } else if (key === 'data') {
	   worksheet.cell(index+2,1).string(object[key])
           obj[`📄  ${colors.red('Data')}`] = object[key]
        } else if (key === 'hash') {
	  worksheet.cell(index+2,4).string(object[key])
          obj[`📛  ${colors.red('Hash')}`] = object[key]
        } else if (key === 'nonce') {
	  worksheet.cell(index+2,3).number(object[key])
          obj[`🔨  ${colors.red('Nonce')}`] = object[key]
        }
        table.push(obj)
      }
    }
    logger.log(table.toString())
   
  })
  workbook.write("threeNode.xlsx")
}

module.exports = logBlockchain;
