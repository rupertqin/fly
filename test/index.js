const fly = require("../")

fly('http://www.example.com').then(data => {
  console.log('data', data)
})
