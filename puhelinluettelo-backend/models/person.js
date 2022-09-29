const mongoose = require('mongoose')
const url = process.env.MONGO_URI

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    minlength: 1,
    validate: validator => {
      if (/^(?=.{8,}$).*[0-9]{2,3}-[0-9]{4,}/.test(validator))
        return Promise.resolve(true)
      return Promise.reject(new Error('Not a valid phone number'))
    },
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)