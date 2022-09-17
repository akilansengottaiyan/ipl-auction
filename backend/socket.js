import express from 'express'
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

export { app, io, http }
