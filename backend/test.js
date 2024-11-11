const express = require('express'),
    app = express(),
    cookieParser = require('cookie-parser');

const host = '127.0.0.1';
const port = 7000;

app.use(cookieParser('secret key'));

app.get('/get-cookie', (req, res) => {
    console.log('Cookie: ', req.cookies);
    res.send('Get Cookie');
});

app.get('/set-cookie', (req, res) => {
    res.cookie('token', '12345ABCDE');
    res.send('Set Cookie');
});

app.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
);