import express from 'express'
import mysql from "mysql2"

import path from 'path'
import dotenv from 'dotenv'

import cors from 'cors'

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'

import bcrypt from 'bcrypt'
const saltRounds = 10

import colors from 'colors'

import userRoutes from './routes/userRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

// from server.js
const __dirname = path.resolve()

dotenv.config()

if (process.env.NODE_ENV === undefined) {
    dotenv.config({ path: '../.env' })
}
// 

const app = express()

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
}))

// API routes
app.use('/', userRoutes)

// app.use(cookieParser())
// app.use(bodyParser.urlencoded({ extended: true }))

// app.use(session({
//     key: 'userId',
//     secret: 'subscribe',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         expires: 60 * 60 * 24
//     }
// }))

// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '/smart/build')))

//     app.get('*', (req, res) =>
//         res.sendFile(path.resolve(__dirname, 'smart', 'build', 'index.html'))
//     )
// }

// Middleware
app.use(notFound)
app.use(errorHandler)

const db = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    database: "auth_smart",
    password: "",
    // credentials: true,
});

// тестирование подключения
// connection.connect(function (err) {
//     if (err) {
//         return console.error("Ошибка: " + err.message);
//     }
//     else {
//         console.log("Подключение к серверу MySQL успешно установлено");
//     }
// });

// const sql = `INSERT INTO users(id, username, password, email) VALUES(1, 'Smart', 'smart_smart', 'smart@cpsmarth.ru')`

// const sql = `DELETE FROM users WHERE id=?`
// const data = [3]

// connection.query(sql, function (err, results) {
//     if (err) console.log(err);
//     console.log(results);
// });


// закрытие подключения
// connection.end(function (err) {
//     if (err) {
//         return console.log("Ошибка: " + err.message);
//     }
//     console.log("Подключение закрыто");
// });

app.post('/register', (req, res) => {
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

// app.get('/login', (req, res) => {
//     if (req.session.user) {
//         res.send({ loggedIn: true, user: req.session.user })
//     }
//     else {
//         res.send({ loggedIn: false })
//     }
// })

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