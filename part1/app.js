var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

let db;

(async()=>{
    try{
        const connection =await mysql.createConnection({
            host:'localhost',
            user: 'root',
            password: ''
        });
        await connection.query("CREATE DATABASE IF NOT EXITS DogWalkService");
        await connection.end();
        db=await mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'',
            database:'DogWalkService'
        });

        // Users
        var [userRows]= await db.execute('SELECT COUNT(*) AS count FROM Users');
        if(userRows[0].count ===0){
            await db.execute(`INSERT INTO Users (username,email,password_hash, role)
                VALUES ('alice123', 'alice@example.com','hashed123','owner'),
                ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
                ('carol123', 'carol@example.com', 'hashed789', 'owner'),
                ('kobe824', 'kobe@example.com', 'hashed007', 'walker'),
                ('jordan623', 'jordan@example.com', 'hashed824', 'owner')`);
        }

        // Dogs table
        var [dogRows]= await db.execute('SELECT COUNT(*) AS count FROM Dogs');
        if(dogRows[0].count ===0){
            await db.execute(`
                INSERT INTO Dogs(owner_id, name, size)
                VALUES ((SELECT user_id FROM Users WHERE username='alice123'), 'Max', 'medium'),
                `)
        }
    }
});
module.exports = app;
