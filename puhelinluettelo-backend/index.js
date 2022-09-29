require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('post', req => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ' '
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))

app.get('/api/persons', (_req, res, next) => {
  Person.find({})
    .then(response => res.json(response))
    .catch(e => next(e))
})

app.get('/info', async (_req, res, next) => {
  Person.countDocuments({}, (e, count) => {
    const html =
            `<div>
                <p>Phonebook has info for ${count} people</p>
                <p>${new Date()}</p>
            </div>`
    res.send(html)
    if (e)
      next(e)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(found => res.json(found))
    .catch(e => next(e))
})

app.post('/api/persons', (req, res, next) => {
  Person.countDocuments({ 'name': req.body.name }).then((count, e) => {
    if (count > 0) {
      return res.status(400).json({ error: 'name must be unique' })
    }
    if (e) {
      return next(e)
    }

    const person = new Person({
      name: req.body.name,
      number: req.body.number,
    })
    person.save()
      .then(saved => res.json(saved))
      .catch(e => next(e))
  })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(e => next(e))

})

app.put('/api/persons/:id', (req, res, next) => {
  if (req.body.number && req.body.id) {
    Person.findOneAndUpdate(
      { '_id': req.body.id },
      { 'number': req.body.number },
      { new: true, runValidators: true, context: 'query' }
    )
      .then(updated => res.json(updated))
      .catch(e => next(e))
  }
})

const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, _request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})