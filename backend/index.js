import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import players from './players'
import contestRouter from './router/contest'
import userRouter from './router/user'
import { contestUpdater, contestGetter } from './router/db'
import { app, io, http } from './socket'
const PORT = 4000
const corsOptions = {
  origin: 'http://localhost:2000',
  credentials: true
}
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan('dev'))
io.on('connection', (socket) => {
  socket.on('bid', (msg) => {
    const contest = contestUpdater('BID', { id: msg.contestId, name: msg.name })
    io.emit('currentBid', {
      price: contest.currentPrice,
      name: contest.currentBidder
    })
  })
  socket.on('bought', (msg) => {
    const { playersStatus, ...contest } = contestUpdater('BOUGHT', {
      id: msg.contestId,
      name: msg.name
    })
    io.emit('sold', {
      player: playersStatus[contest.playerIndex - 1],
      index: contest.playerIndex - 1,
      participantsObj: contest.participantsObj,
      currentPrice: contest.currentPrice,
      currentBidder: ''
    })
  })
  socket.on('unsold', (msg) => {
    const contest = contestGetter('', msg.contestId)
    if (msg.index === contest.playerIndex) {
      const updatedContest = contestUpdater('UNSOLD', {
        id: msg.contestId,
        currentPrice: msg.currentPrice
      })
      io.emit('unsold', { currentPrice: updatedContest.currentPrice })
    }
  })
})
app.use('/contest', contestRouter)
app.use('/user', userRouter)

app.get('/', (req, res) => {
  res.send('Hello IPL')
})

app.get('/reset', (req, res) => {
  playersStatus = JSON.parse(JSON.stringify(players))
  currentPrice = players[0].basePrice
  playerIndex = 0
  res.send({})
})
// app.get('/players', (req, res) => {
//   const start = Number(req.query.start)
//   const stop = Number(req.query.stop)
//   res.send({
//     players: playersStatus.slice(start, stop),
//     playerIndex: playerIndex
//   })
// })

http.listen(PORT, () => {
  console.log('listening on *:', PORT)
})
