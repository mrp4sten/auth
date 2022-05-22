const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const User = require('./user')

mongoose.connect('mongodb+srv://mrp4sten:mrp4sten@firstcompletenodeapp.ch50k.mongodb.net/?retryWrites=true&w=majority')
const app = express()

app.use(express.json())

const signToken = (idUser) => jwt.sign({ _id: idUser }, 'secret')

app.post('/register', async (req, res) => {
    const { body } = req
    console.log({ body })
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

app.listen(3000, () => {
    console.log('Listening on port 3000')
})