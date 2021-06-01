const request = require("../")

request('http://www.baidu.com').then(data => {
  console.log('data', data)
})
