const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cors())

morgan.token("post", req => {
    return req.method === "POST" ? JSON.stringify(req.body) : " "
})
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :post"))

let phonebook = [
    {
        name: "Arto Hellas",
        number: "040-142356",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    }
]

app.get("/api/persons", (_req, res) => {
    res.json(phonebook)
})

app.get("/info", (_req, res) => {
    const html =
        `<div>
            <p>Phonebook has info for ${phonebook.length} people</p>
            <p>${new Date()}</p>
        </div>`
    res.send(html)
})

app.get("/api/persons/:id", (req, res) => {
    const person = phonebook.find(person => person.id === Number(req.params.id))
    if (person)
        return res.json(person)
    res.status(404).end()
})

app.post("/api/persons", (req, res) => {
    const newId = parseInt(Math.random() * 1_000_000)

    if (!req.body.name || !req.body.number)
        return res.status(400).json({ error: "name or number missing" })
    if (phonebook.some(person => person.name === req.body.name))
        return res.status(400).json({ error: "name must be unique" })

    const person = {
        name: req.body.name,
        number: req.body.number,
        id: newId
    }
    phonebook = phonebook.concat(person)
    res.json(person)
})

app.delete("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id)
    if (id)
        phonebook = phonebook.filter(person => person.id !== id)
    res.status(204).end()
})

app.put("/api/persons/:id", (req, res) => {
    const person = phonebook.find(person => person.id === Number(req.params.id))
    if (person && req.body.number && req.body.name) {
        const index = phonebook.indexOf(person)
        const newPerson = { ...person, number: req.body.number }
        phonebook[index] = newPerson
        return res.json(newPerson)
    }
    res.status(404).end()
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})