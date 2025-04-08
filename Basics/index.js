const express = require('express')
require('dotenv').config()
//app is powerful like MATh

//sensitive info is passed from .env file
const port = 4000

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/twitter',(req,res) => {
    res.send(`<h1>Twitter is here</h1>`)
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})