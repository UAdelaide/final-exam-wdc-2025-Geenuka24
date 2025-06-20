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

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        await connection.query("CREATE DATABASE IF NOT EXITS DogWalkService");
        await connection.end();
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'DogWalkService'
        });

        // Users
        var [userRows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
        if (userRows[0].count === 0) {
            await db.execute(`INSERT INTO Users (username,email,password_hash, role)
                VALUES ('alice123', 'alice@example.com','hashed123','owner'),
                ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
                ('carol123', 'carol@example.com', 'hashed789', 'owner'),
                ('kobe824', 'kobe@example.com', 'hashed007', 'walker'),
                ('jordan623', 'jordan@example.com', 'hashed824', 'owner')`);
        }

        // Dogs table
        var [dogRows] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
        if (dogRows[0].count === 0) {
            await db.execute(`
                INSERT INTO Dogs(owner_id, name, size)
                VALUES ((SELECT user_id FROM Users WHERE username='alice123'), 'Max', 'medium'),
                (SELECT user_id FROM Users WHERE username = 'carol123'),'Bella', 'small'),
                (SELECT user_id FROM Users WHERE username = 'kobe824'),'Shaq', 'medium'),
                (SELECT user_id FROM Users WHERE username = 'kobe824'),'Mamba', 'large'),
                (SELECT user_id FROM Users WHERE username = 'carol'),'foo', 'large');
                `);
            }
            // WalkRequests
            const [requestRows]= await db.execute('SELECT COUNT(*) AS count FROM Dogs');
            if(requestRows[0].count ===0){
                await db.execute(`
                    INSERT INTO WalkRequests(dog_id, requested_time, duration_minutes,location,status)
                    VALUES
                    ((SELECT dog_id FROM Dogs WHERE name = 'Max' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')),'2025-06-10 08:00:00', 30, 'Parklands','open'),
                    ((SELECT dog_id FROM Dogs WHERE name = 'Bella' AND owner_id = (SELECT user_id FROM Users WHERE username = 'carol123')),'2025-06-10 09:30:00',45, 'Beachside Ave','accepted',)
                    ((SELECT dog_id FROM Dogs WHERE name = 'Shaq' AND owner_id = (SELECT user_id FROM Users WHERE username = 'kobe824')),'2025-06-11 07:30:00',60,'Beachside Ave', 'open'),
                    ((SELECT dog_id FROM Dogs WHERE name = 'Mamba' AND owner_id = (SELECT user_id FROM Users WHERE username = 'kobe824')), '2025-06-12 14:00:00', 30,'Parklands', 'completed'),
                    ((SELECT dog_id FROM Dogs WHERE name = 'foo' AND owner_id = (SELECT user_id FROM Users WHERE username = 'carol123')), '2025-06-13 16:00:00', 45, 'Beachside Ave', 'open')
                    `);
                }
                console.log('Database setup  is working');
            }
            catch (err){
                console.error("error setting up the database", err);
            }
})();

// API DOGS
app.get('/api/dogs', async(req,res)=>{
    try{
        var[rows]=await db.execute(`
            SELECT Dogs.name dog_name, Dogs.size, Users.usersname owners_usersname
            FROM Dogs
            JOIN Users ON Dogs.owners_id = Users.user_id
            ORDER BY Dogs.name`);
            res.json(rows);
    }
    catch(err){
        res.status(500).json({error: 'Failed to fetch dogs'});
    }
});

// API  WALKREQUESTS
app.get('/api/walkrequests/open', async(req,res)=> {
    try{
        var[rows]=await db.execute(`
            SELECT
            WalkRequests.request_id,
            Dogs.name dog_name,
            WalkRequests.requested_time,
            WalkRequests.durtion_mintues,
            WalkRequests.location,
            Users.username owner_username
            FROM WalkRequests
            JOIN Dogs ON WalkRequests.dog_id =Dogs.dog_id
            JOIN Users ON Dogs.owner_id= Users.user_id
            WHERE WalkRequests.status = 'open
            ORDER BY WalkRequests.requested_time`);
            res.json(rows);
    }
    catch (err){
        res.status(500).json({error: 'Failed to fetch '})
    }
})
module.exports = app;
