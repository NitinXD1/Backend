import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from 'axios'
import './App.css'

function App() {

  const [jokes,setJokes] = useState([])


  useEffect(() => {
    axios.get('/api/jokes')
      .then((res) => {
        setJokes(res.data)
    })
    .catch((err) => {
        console.log(err);
      })
  },[])
  

  return (
    <>
      <h1>FullStack dev</h1>
      <p>jokes: {jokes.length}</p>

      {jokes.map((joke) => (
        <div key={joke.index}>
          <h2>{joke.title}</h2>
          <p>{joke.text}</p>
        </div>
      ))}
    </>
  )
}

export default App
