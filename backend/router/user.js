import express from 'express'
const userRouter = express.Router()
userRouter.get('/', (req, res) => {
  const { name } = req.cookies
  res.send({ name: name })
})
userRouter.post('/', (req, res) => {
  const { name } = req.body.payload
  res.cookie('name', name, {
    expires: new Date(Date.now() + 900000),
    httpOnly: true
  })
  res.send({})
})
export default userRouter
