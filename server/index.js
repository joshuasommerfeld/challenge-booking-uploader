const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const fs = require('fs')
const csv = require('csvtojson')
const { DateTime } = require('luxon');

const app = express()
app.use(cors()) // so that app can access
app.use(fileUpload({ createParentPath: true }))
app.use(bodyParser.json())

const minutesToMilliseconds = (minutes) => minutes * 60 * 1000

const parseBookingFromJson = ({ time, duration, user_id }) => ({
  time: DateTime.fromJSDate(new Date(time)),
  duration: minutesToMilliseconds(duration), // mins into ms
  userId: user_id,
})

const parseBookingFromCsv = ({ time, duration, userId }) => ({
  time: DateTime.fromJSDate(new Date(time)),
  duration: minutesToMilliseconds(duration),
  userId,
});

const instantiateBooking = ({ time, duration, userId }) => ({
  time: DateTime.fromJSDate(new Date(time)),
  duration,
  userId,
})

const bookings = JSON.parse(fs.readFileSync('./server/bookings.json')).map(parseBookingFromJson)

const testForBookingConflict = (startTime, endTime) => bookingRecord => {
  const bookingStartTime = bookingRecord.time
  const bookingEndTime = bookingStartTime.plus({ milliseconds: bookingRecord.duration })

  // Proof provided by user Charles Bretana at https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap/22694048
  return DateTime.max(startTime, bookingStartTime) < DateTime.min(endTime, bookingEndTime)
}

const addConflictingBookings = existingBookings => bookingRecord => {
  const { time, duration } = bookingRecord
  const startTime = time
  const endTime = startTime.plus({ milliseconds: duration })

  const conflictingBookings = existingBookings.filter(testForBookingConflict(startTime, endTime))
  return {
    ...bookingRecord,
    conflicts: conflictingBookings,
  }
}

const readBookingsFromCsv = async (bookingFile) => {
  const rawBookings = await csv()
      .fromString(bookingFile.data.toString())

  return rawBookings.map(parseBookingFromCsv)
}

app.get('/bookings', (_, res) => {
  res.json(bookings)
})

app.post('/upload-bookings', async (req, res) => {
  const newBookings = await readBookingsFromCsv(req.files.bookings)
  const bookingsWithConflicts = newBookings.map(addConflictingBookings(bookings))
  res.json(bookingsWithConflicts)
})

app.post('/bookings-set', (req, res) => {
  // Ideally this would check that no new shifts have been added in the back-end
  //    to ensure no conflicts have been introduced while the user has been working in the front-end
  const validBookings = req.body
      .filter(bookingRecord => !bookingRecord.conflicts.length)
      .map(instantiateBooking)
  bookings.push(...validBookings)
  res.json({ message: 'successfully updated'})
})

app.listen(3001)
