import express from 'express'
import mysql from "mysql2"
import dotenv from 'dotenv'
import cors from 'cors'
import bcrypt from 'bcrypt'
import userRoutes from './routes/userRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

const saltRounds = 10
const app = express()
dotenv.config()

if (process.env.NODE_ENV === undefined) {
    dotenv.config({ path: '../.env' })
}

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
}))

app.use('/', userRoutes)
app.use(notFound)
app.use(errorHandler)

const db = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    database: "auth_smart",
    password: "",
});

app.post('/register', (req) => {
    const username = req.body.firstName
    const password = req.body.password
    const email = req.body.email

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err)
        }
        db.query(
            'INSERT INTO users(username, password, email) VALUES(?, ?, ?)',
            [username, hash, email],
            (err, result) => {
                if (err) {
                    console.log("Ошибка из БД", err)
                }
                else {
                    console.log("Регистрация прошла успешно", result)
                }
            }
        )
    })
})

app.post('/login', (req, res) => {
    const password = req.body.password
    const email = req.body.email

    db.query(
        'SELECT * FROM users WHERE email = ?',
        email,
        (err, result) => {
            if (err) {
                res.send({ err: err })
            }

            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, responses) => {
                    if (responses) {
                        req.session.user = result;
                        console.log(req.session.user);
                        res.send(result);
                    }
                    else {
                        res.send({ message: 'Нет пользователя с таким email или паролем!' })
                    }
                })
            }
            else {
                res.send({ message: 'Пользователя не существует!' })
            }
        }
    )
})

const PORT = process.env.PORT || 5000
app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port http://localhost:${PORT}`
            .yellow.bold
    )
)