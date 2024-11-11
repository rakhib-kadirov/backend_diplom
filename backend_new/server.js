// изменения 07.06
const dotenv = require('dotenv')

const express = require('express')
const mysql = require("mysql2")
const cors = require('cors')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const bcrypt = require('bcrypt')
const saltRounds = 10

dotenv.config()

const app = express()

// configure env file in production
if (process.env.NODE_ENV === undefined) {
	dotenv.config({ path: '../.env' })
}

app.use(express.json())
app.use(cors({
	origin: ['http://localhost:3000'],
	methods: ['GET', 'POST'],
	credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
	session({
		key: "userId", // ИЗМЕНИТЬ ЗНАЧЕНИЕ НА ИМЯ ПОЛЬЗОВАТЕЛЯ
		secret: 'subscribe',
		resave: false,
		saveUninitialized: false,
		cookie: {
			expires: 60 * 60 * 24
		},
	})
)

const db = mysql.createConnection({
	host: "127.0.0.1",
	port: 3306,
	user: "root",
	database: "auth_smart",
	password: "",
});

app.post('/register', (req, res) => {
	const firstName = req.body.firstName
	const email = req.body.email
	const password = req.body.password

	bcrypt.hash(password, saltRounds, (err, hash) => {
		if (err) {
			console.log(err)
		}

		db.query(
			'INSERT INTO users(username, password, email) VALUES(?, ?, ?)',
			[firstName, hash, email],
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

app.get('/login', (req, res) => {
	const email = req.body.email

	if (req.session.user) {
		res.send('Создаются куки')
		res.cookie('cookieName', email, { maxAge: 900000, httpOnly: true });
		return
	}
	else {
		res.send('Не авторизован')
		res.cookie('cookieName', 'NOT FOUND USER', { maxAge: 900000, httpOnly: true });
		return
	}
})

app.post('/login', (req, res) => {
	const email = req.body.email
	const password = req.body.password

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
						console.log(result);
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

// добавление данных с сайта (страница room)
app.post('/room', (req, res) => {
	const vlaga = req.body.vlaga
	const holod = req.body.holod
	const teplo = req.body.teplo
	const temp = req.body.temp

	db.query(
		'INSERT INTO temp_values(vlaga, holod, teplo, temp) VALUES(?, ?, ?, ?)',
		[vlaga, holod, teplo, temp],
		(err, result) => {
			if (err) {
				console.log("Ошибка добавления в БД", err)
			}
			else {
				console.log("Запись с датчиков прошла успешно", result)
			}
		}
	)
})

// удаление последних 5-ти строк данных с сайта (страница room)
// app.post('/room1', (req, res) => {
// 	const vlaga = req.body.vlaga
// 	const holod = req.body.holod
// 	const teplo = req.body.teplo
// 	const temp = req.body.temp

// 	db.query(
// 		// 'DELETE FROM temp_values WHERE (vlaga, holod, teplo, temp) IN ( SELECT * FROM temp_values ORDER BY (vlaga, holod, teplo, temp) DESC LIMIT 5)',
// 		'DELETE FROM temp_values WHERE (vlaga) < ( SELECT MAX(vlaga) - 5 )',
// 		[vlaga, holod, teplo, temp],
// 		(err, result) => {
// 			if (err) {
// 				console.log("Ошибка удаления в БД", err)
// 			}
// 			else {
// 				console.log("Удаление с датчиков прошло успешно", result)
// 			}
// 		}
// 	)
// })

app.listen(3000, () => {
	console.log("Running server", 3000)
})