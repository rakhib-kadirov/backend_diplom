const express = require('express');
const passport = require('passport');
// const router = express.Router()

const mysql = require('mysql2')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const app = express()
const LocalStrategy = require('passport-local').Strategy;

// Настройка стратегии аутентификации
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
        });
    }
));

// Сериализация и десериализация пользователя
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(express.json())
passport.use(cors({
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
}))
passport.use(cookieParser())
passport.use(bodyParser.urlencoded({ extended: true }))

// Использование Passport.js в приложении
passport.use(passport.initialize());
passport.use(passport.session());

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
)

const db = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    database: "auth_smart",
    password: "",
    // credentials: true,
});

// Маршрут для регистрации нового пользователя
app.post('/register', (req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.log(err)
                next(err)
            }

            if (!user) { return res.status(400).send({ message: info.message }); }

            db.query(
                'INSERT INTO users(username, password, email) VALUES(?, ?, ?)',
                [name, hash, email],
                req.logIn(user, (err) => {
                    if (err) { return next(err); }
                    return res.send({ message: 'User registered successfully.' });
                })
            )
        })
    })(req, res, next);
});

// Маршрут для входа в систему
app.post('/login', (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        db.query(
            'SELECT * FROM users WHERE email = ?',
            email,
            (err, result) => {
                if (err) {
                    res.send({ err: err })
                    next(err)
                }

                if (!user) { return res.status(401).send({ message: info.message }); }

                // if (result.length > 0) {
                //     bcrypt.compare(password, result[0].password, (error, responses) => {
                //         if (responses) {
                //             req.session.user = result;
                //             console.log(req.session.user);
                //             res.send(result);
                //         }
                //         else {
                //             res.send({ message: 'Нет пользователя с таким email или паролем!' })
                //         }
                //     })
                // }
                // else {
                //     res.send({ message: 'Пользователя не существует!' })
                // }
                req.logIn(user, (err) => {
                    if (err) { return next(err); }
                    return res.send({ message: 'User logged in successfully.' });
                });
            }
        )
    })(req, res, next);
});

// Маршрут для выхода из системы
app.get('/logout', (req, res) => {
    req.logout();
    res.send({ message: 'User logged out successfully.' });
});

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

app.listen(5000, () => {
	console.log("Running server", 5000)
})

module.exports = app;