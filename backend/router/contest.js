import express from 'express'
import { io } from '../socket'
import { contestUpdater, createContest, contestGetter } from './db'
const contestRouter = express.Router()

contestRouter.get('/', (req, res) => {
  const { activeContestId } = req.cookies
  const contest = contestGetter('', activeContestId)
  if (contest && contest.status !== 'completed') {
    return res.send({ contest })
  } else {
    res.clearCookie('activeContestId')
    res.clearCookie('name')
    return res.send({ contest: null })
  }
})

contestRouter.post('/create', (req, res) => {
  const { name, maxParticipants } = req.body.payload
  const contest = createContest(name, maxParticipants)
  res.cookie('activeContestId', contest.id, {
    expires: new Date(Date.now() + 900000)
  })
  res.send(contest)
})
contestRouter.get('/start', (req, res) => {
  const { activeContestId } = req.cookies
  contestUpdater('START_CONTEST', { id: activeContestId })
  res.send({})
  io.emit('start-contest', {})
})
contestRouter.post('/join', (req, res) => {
  const { name, contestId } = req.body.payload
  contestUpdater('ADD_PARTICIPANT', { id: contestId, name })
  res.cookie('activeContestId', contestId, {
    expires: new Date(Date.now() + 900000),
    httpOnly: true
  })
  io.emit('participant-joined', { name })
  res.send({})
})
contestRouter.get('/assign-teams', (req, res) => {
  const { activeContestId } = req.cookies
  const contest = contestUpdater('ASSIGN_TEAMS', { id: activeContestId })
  io.emit('assigned-teams', { participantsObj: contest.participantsObj })
  res.send({})
})

contestRouter.get('/players', (req, res) => {
  return contestGetter('ALL_PLAYERS')
})

export default contestRouter
