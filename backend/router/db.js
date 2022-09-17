import players from '../players'
import { v4 as uuid } from 'uuid'
export const contests = {}
// export const contests = {
//   'f4f955c5-4b17-4a59-8b17-707ff611adb9': {
//     id: 'f4f955c5-4b17-4a59-8b17-707ff611adb9',
//     maxParticipants: 4,
//     playersStatus: JSON.parse(JSON.stringify(players)),
//     playerIndex: 0,
//     currentPrice: players[0].basePrice,
//     participants: ['akilan', 'kaviya'],
//     status: 'waiting',
//     createdBy: 'akilan',
//     participantsObj: {
//       akilan: {
//         team: '',
//         balance: '600'
//       },
//       kaviya: {
//         team: '',
//         balance: '600'
//       }
//     }
//   }
// }
const teams = ['CSK', 'MI', 'RCB', 'KKR', 'SRH', 'RR', 'KXIP', 'DC']
export const contestUpdater = (cmd, payload) => {
  const currentContest = contests[payload.id] || {}
  // console.log('CurrentContest, paylaod.....', currentContest, payload)
  switch (cmd) {
    case 'BID':
      currentContest.currentPrice += 2
      currentContest.currentBidder = payload.name
      return currentContest
    case 'BOUGHT':
      currentContest.playersStatus[currentContest.playerIndex].soldTo =
        payload.name
      currentContest.playersStatus[currentContest.playerIndex].soldFor =
        currentContest.currentPrice
      currentContest.participantsObj[payload.name].balance -=
        currentContest.currentPrice

      if (currentContest.playerIndex + 1 < players.length) {
        currentContest.playerIndex++
        currentContest.currentBidder = ''
        currentContest.currentPrice =
          currentContest.playersStatus[currentContest.playerIndex].basePrice
      }
      return currentContest
    case 'UNSOLD':
      if (currentContest.playerIndex + 1 < players.length) {
        currentContest.playerIndex++
        currentContest.currentPrice =
          currentContest.playersStatus[currentContest.playerIndex].basePrice
        currentContest.currentBidder = ''
      }
      return currentContest
    case 'ADD_PARTICIPANT':
      currentContest.participants.push(payload.name)
      currentContest.participantsObj[payload.name] = {
        team: '',
        balance: 600
      }
      if (
        currentContest.participants.length === currentContest.maxParticipants
      ) {
        contests[contestId].status = 'READY'
      }
      return currentContest
    case 'START_CONTEST':
      currentContest.status = 'ACTIVE'
      return currentContest
    case 'ASSIGN_TEAMS':
      let x = currentContest.participants
      let random = Math.floor(Math.random() * Math.floor(x.length))
      x.map((eachParticipant, index) => {
        currentContest.participantsObj[eachParticipant]['team'] = teams[random]
        random = (random + 1) % x.length
      })
      currentContest.status = 'READY'
      return currentContest
    default:
      return currentContest
  }
}
export const contestGetter = (cmd = '', contestId) => {
  switch (cmd) {
    case 'ALL_PLAYERS':
      return contests[contestId].playersStatus
    default:
      if (contestId) return contests[contestId]
      return null
  }
}
export const createContest = (createdBy, maxParticipants) => {
  let contestId = uuid()
  contests[contestId] = {
    id: contestId,
    maxParticipants,
    playersStatus: JSON.parse(JSON.stringify(players)),
    currentBidder: '',
    playerIndex: 0,
    currentPrice: players[0].basePrice,
    participants: [createdBy],
    status: 'WAITING',
    createdBy,
    participantsObj: {
      [createdBy]: {
        team: '',
        balance: 600
      }
    }
  }
  return contests[contestId]
}
