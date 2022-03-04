const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const fs = require('fs')
const csv = require('csvtojson')

const app = express()
app.use(cors()) // so that app can access
app.use(fileUpload({ createParentPath: true }))

const parseDuration = (duration) => duration * 60 * 1000

const parseBooking = ({ time, duration, user_id }) => ({
  time: Date.parse(time),
  duration: parseDuration(duration), // mins into ms
  userId: user_id,
})

const bookings = JSON.parse(fs.readFileSync('./server/bookings.json')).map(parseBooking)

app.get('/bookings', (_, res) => {
  res.json(bookings)
})

const readNewBookings = async (bookingFile) => {
  const rawBookings = await csv()
      .fromString(bookingFile.data.toString())

  return rawBookings.map(({ time, duration, userId}) => ({
    time: Date.parse(time),
    duration: parseDuration(duration),
    userId
  }))
}

app.post('/upload-bookings', async (req, res) => {
  const newBookings = await readNewBookings(req.files.bookings)
  bookings.push(...newBookings)
  res.send({ message: 'file uploaded successfully' })
})

app.listen(3001)
