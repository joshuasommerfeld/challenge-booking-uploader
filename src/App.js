import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'
import styled from 'styled-components'
import './App.css'
import {DateTime} from "luxon";

const apiUrl = 'http://localhost:3001'

const Existing = "Existing"
const ImportNoConflict = "ImportNoConflict"
const ImportWithConflict = "ImportWithConflict"

const BookingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(24, 50px);
  grid-template-rows: repeat(6, 100px);
  row-gap: 10px;
`

const handleBookingBlockStatusColor = status => {
  switch (status) {
    case Existing:
      return 'aquamarine'
    case ImportNoConflict:
      return "lightgrey"
    case ImportWithConflict:
      return "red"
  }
}

const BookingBlock = styled.div`
  border-radius: 4px;
  background-color: ${props => handleBookingBlockStatusColor(props.status)};
  grid-column-start: ${props => props.startTime};
  grid-column-end: ${props => props.endTime};
  grid-row: ${props => props.day};
`

const BookingButton = styled.button`
  padding: 10px;
  margin-top: 12px;
`

export const App = () => {
  const [bookings, setBookings] = useState([])
  const [importBookings, setImportBookings] = useState([])
  const [refetchKey, setRefetchKey] = useState(0)

  useEffect(() => {
    fetch(`${apiUrl}/bookings`)
      .then((response) => response.json())
      .then(setBookings)
      .then(setImportBookings([]))
  }, [refetchKey])

  const onDrop = async (files) => {
    const formData = new FormData()
    formData.append('bookings', files[0])
    fetch(`${apiUrl}/upload-bookings`, {
      method: 'POST',
      body: formData
    })
        .then(response => response.json())
        .then(importBookings => setImportBookings(importBookings.bookings))
  }

  const onSubmit = async (bookingsToImport) => {
    fetch(`${apiUrl}/bookings-set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingsToImport)
    })
        .then(response => response.json())
        .then(_ => setRefetchKey(refetchKey + 1))
  }

  const bookingBlock = (booking, key, isImport = false) => {
    const startTime = DateTime.fromISO(booking.time)
    const duration = booking.duration / (60 * 1000)
    const endTime = startTime.plus({ minutes: duration});

    let status = Existing
    if (isImport) {
      status = booking && booking.conflicts.length ? ImportWithConflict : ImportNoConflict
    }

    return (
      <BookingBlock key={key} startTime={startTime.hour} endTime={endTime.hour} day={startTime.day} status={status}>
        <p>{startTime.toLocaleString(DateTime.DATETIME_MED)}</p>
        <p>
          {`Duration: ${duration.toFixed(1)}`}
        </p>
        <p>{`UserId: ${booking.userId}`}</p>
      </BookingBlock>
    )
  }

  return (
    <div className='App'>
      <div className='App-header'>
        <Dropzone accept='.csv' onDrop={onDrop}>
        {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drop some files here, or click to select files</p>
            </div>
          </section>
        )}
        </Dropzone>
      </div>
      <div className='App-main'>
        <p>Existing bookings:</p>
        <BookingGrid>
          {bookings.map((booking, i) => bookingBlock(booking, i))}
          {importBookings.map((booking, i) => bookingBlock(booking, i, true))}
        </BookingGrid>
        {
          !!importBookings.length && <BookingButton onClick={() => onSubmit(importBookings)}>Upload bookings without conflicts</BookingButton>
        }
      </div>
    </div>
  )
}
