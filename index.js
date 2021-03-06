const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { expressjwt } = require('express-jwt')
const User = require('./user')

mongoose.connect('mongodb+srv://mrp4sten:mrp4sten@firstcompletenodeapp.ch50k.mongodb.net/?retryWrites=true&w=majority')
const app = express()

app.use(express.json())

const validateJwt = expressjwt({ secret: process.env.SECRET, algorithms: ['HS256'] })
const signToken = (idUser) => jwt.sign({ _id: idUser }, process.env.SECRET)

app.post('/register', async (req, res) => {
    const { body } = req
    try {
        const isUser = await User.findOne({ email: body.email })
        if (isUser) {
            return res.status(403).send('User is exist')
        }

        const salt = await bcrypt.genSalt()
        const hashed = await bcrypt.hash(body.password, salt)
        const user = await User.create({ email: body.email, password: hashed, salt: salt })

        const signed = signToken(user._id)
        res.status(201).send(signed)

    } catch (err) {
        console.error(err)
        res.status(500).send(err.message)
    }
})

app.post('/login', async (req, res) => {
    const { body } = req
    try {
        const user = await User.findOne({ email: body.email })
        if (user) {
            const isMatch = await bcrypt.compare(body.password, user.password)
            if (isMatch) {
                const signed = signToken(user._id)
                res.status(200).send(signed)
            } else {
                res.status(403).send('User or password incorrect')
            }
        } else {
            res.status(403).send('User or password incorrect')
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err.message)
    }
})

const findAndAssingUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.auth._id)
        if (user) {
            req.auth = user
            next()
        } else {
            return res.status(401).end()
        }
    } catch (err) {
        next(err)
    }
}

const isAuthenticated = express.Router().use(validateJwt, findAndAssingUser)

app.get('/JwtValidation', isAuthenticated, (req, res) => {
    res.send(req.auth)
})

app.use((err, req, res, nex) => {
    console.error('ERROR', err.stack)
    next(err)
})

app.use((err, req, res, nex) => {
    res.send('An error occurred')
})

app.listen(3000, () => {
    console.log('Listening on port 3000')
})