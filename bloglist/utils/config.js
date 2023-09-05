require('dotenv').config()

const { MONGO_URI, PORT } = process.env

module.exports = { PORT, MONGO_URI }
