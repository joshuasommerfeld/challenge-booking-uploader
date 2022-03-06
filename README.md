# Booking Uploader

A web app for uploading bookings from `.csv` files.

## Versions

If you would rather work with JS, use the `master` branch. However, if you prefer TypeScript, check out our `typescript-refactor` branch.

## Existing code

### Overview

Existing functionality:

- ExpressJS server with `GET` endpoint `/bookings` which responds with existing bookings (from a hard-coded json file that is read in). Bookings have a time, duration, and user ID.
- ReactJS app which fetches and shows existing bookings in a list and has a file input for bookings files (`.csv` only).
- A `.csv` file with entries corresponding to bookings that is to be uploaded but which contains bookings that overlap with some of the existing bookings.

### Instructions for use

- To install dependencies: `yarn install`
- To run ExpressJS server: `yarn run server`
- To run ReactJS app: `yarn start`

Note: This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Additional required features

What needs to be added / changed:

- The app needs to read and parse the provided `.csv` file when submitted via the file input (dropzone).
- The app needs to identify new bookings parsed from this file that overlap with existing bookings.
- The app needs to visualise the existing bookings in a timeline instead of a list (i.e. as segments that are positioned based on their start time and have a width based on their duration).
- The app needs to show a similar timeline for the new bookings parsed from the file that shows which new bookings overlap with existing bookings (perhaps colour these bookings differently).
- The app needs to make a `POST` request (`/bookings`) to the server to add the new bookings that don't overlap with existing bookings and refetch the list of bookings from the server.
- The server needs to allow this `POST` request (`/bookings`) from app and update the booking list it has in memory (and therefore the list it returns for the existing `GET` request). There is no need to modify the server to use an actual database instead of storing the data in memory.

Feel free to change any of the existing code (and add any dependencies) to achieve the required specifications / functionality. There is no need to support old browsers, assume a recent version of Firefox/Chrome. If you're having trouble starting or need help with any part, please send us an email and we'll give you a pointer.

## Notes - Joshua Sommerfeld

If I had more time with this project I would:
- Add unit tests for the back-end, I seperated the express integration from the meat of the operations with testing in mind
- Utilise an actual calendar library for the bookings display
- Work on having the conflicting shifts show up next to the original shifts (multiple lanes) for better readability
- Migrate all css to styled components
- Adjust the json storage to align the `user_id` and `userId` fields
- Adjust the way the time is stored to ISO (cleans up the date instantiation)