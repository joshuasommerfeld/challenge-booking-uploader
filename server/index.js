const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const fs = require('fs')
const csv = require('csvtojson')
const { DateTime } = require("luxon");

const app = express()
app.use(cors()) // so that app can access
app.use(fileUpload({ createParentPath: true }))

const parseDuration = (duration) => duration * 60 * 1000

const parseBooking = ({ time, duration, user_id }) => ({
  time: DateTime.fromJSDate(new Date(time)),
  duration: parseDuration(duration), // mins into ms
  userId: user_id,
})

const bookings = JSON.parse(fs.readFileSync('./server/bookings.json')).map(parseBooking)

app.get('/bookings', (_, res) => {
  res.json(bookings)
})

const bookingConflictTest = (startTime, endTime) => bookingRecord => {
  const bookingStartTime = bookingRecord.time
  const bookingEndTime = bookingStartTime.plus({ milliseconds: bookingRecord.duration })

  return DateTime.max(startTime, bookingStartTime) < DateTime.min(endTime, bookingEndTime)
}

const addConflictingBookings = (bookingRecord) => {
  const { time, duration } = bookingRecord
  const startTime = time
  const endTime = startTime.plus({ milliseconds: duration })

  const conflictingBookings = bookings.filter(bookingConflictTest(startTime, endTime))
  console.log(conflictingBookings)
  return {
    ...bookingRecord,
    conflicts: conflictingBookings,
  }
}

const readNewBookings = async (bookingFile) => {
  const rawBookings = await csv()
      .fromString(bookingFile.data.toString())

  return rawBookings.map(({ time, duration, userId}) => ({
    time: DateTime.fromJSDate(new Date(time)),
    duration: parseDuration(duration),
    userId
  }))
}

app.post('/upload-bookings', async (req, res) => {
  const newBookings = await readNewBookings(req.files.bookings)
  const bookingsWithConflicts = newBookings.map(addConflictingBookings)
  console.log(bookingsWithConflicts)
  res.send({ bookings: bookingsWithConflicts })
})

app.listen(3001)
