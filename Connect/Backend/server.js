import express from 'express'
import dotenv from 'dotenv'

dotenv.config();    

const app = express()

// app.get('/',(req,res) => {
//     res.send('Server is ready')
// })

const port = process.env.PORT || 5000

app.listen(
    port,() => {
        console.log(`server is serving at : http://localhost:${port}`);
    }
)

app.get('/api/jokes',(req,res) => {
    
    const jokes = [
        {
            index: 1,
            title: "Introduction to Node.js",
            text: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine."
        },
        {
            index: 2,
            title: "Understanding Express.js",
            text: "Express.js is a minimal and flexible Node.js web application framework."
        },
        {
            index: 3,
            title: "Environment Variables",
            text: "Environment variables are used to configure applications without hardcoding values."
        },
        {
            index: 4,
            title: "Setting Up a Server",
            text: "A server can be set up using Express.js to handle HTTP requests and responses."
        },
        {
            index: 5,
            title: "Deploying Applications",
            text: "Applications can be deployed to platforms like Heroku, AWS, or Vercel."
        }
    ]

    res.send(jokes)
})

