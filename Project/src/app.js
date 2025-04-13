import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

//this works but it doesnt have any properties
// app.use(cors())

app.use(cors({
    origin : process.env.ORIGIN_URL
}))

app.use(express.json({
    limit : "16kb"
}))

app.use(express.urlencoded())

app.use(express.static("public"))

app.use(cookieParser())

export {app}