const mongoose = require('mongoose')
const Person = require('./models/person')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const connect = async () => {
  await mongoose.connect(`mongodb+srv://fullystacked:${process.argv[2]}@cluster0.ndp47lm.mongodb.net/?retryWrites=true&w=majority`)
    .catch(e => console.error(e.message))
}

const getPhonebook = async () => {
  await Person.find({})
    .then(found => {
      console.log('phonebook:')
      found.forEach(person => console.log(`${person.name} ${person.number}`))
    })
    .finally(() => {
      mongoose.connection.close()
    })
}

const getPerson = async (newName, newNumber) => {
  const person = new Person({
    name: newName,
    number: newNumber
  })

  if (person)
    await person.save()
      .then(result => console.log(`Added ${result.name} number ${result.number} to phonebook`))
      .catch(e => console.error(e.message))
      .finally(mongoose.connection.close())
  else
    process.exit(1)
}


connect().then(() => {
  const newName = process.argv[3]
  const newNumber = process.argv[4]

  if (!newName || !newNumber) {
    getPhonebook()
  } else {
    getPerson(newName, newNumber)
  }
})

