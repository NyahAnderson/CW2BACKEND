const express = require('express');
//const http = require('http');
var path = require("path");
var fs = require("fs");
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient;

const app = express();

app.use(cors());

app.use(express.json());

app.use(function (req, res, next) {
    console.log("Request URL: " + req.url);
    next();
});

let db;

MongoClient.connect('mongodb+srv://naDB:THISISMYAPSSWORD1010$@cw2cluster.rhjxe.mongodb.net/', (err, client) => {
    db = client.db('Webstore')
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
});


//GET lessons
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    }
    )
});

//POST new order
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops)
    })
});


const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e)
        res.send(result)
    })
})


//UPDATE spaces in Lesson
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update({ _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ?
                { msg: 'success' } : { msg: 'error' })
        })
})


app.get('/', (req, res, next) => {
        res.send('Select a collection or image, e.g., /collection/LessonInfo , /art.png', )
    });


app.use(function (req, res, next) {
    var filePath = path.join(__dirname, "static", req.url);

    fs.stat(filePath, function (err, fileInfo) {
        if (err) {
            next();
            return;
        }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();
    });
});


app.use(function (req, res) {
    res.status(404);
    res.send("File not found!");
});

const port = process.env.PORT || 3000
app.listen(port);

//app.listen(3000, function () {
    //console.log("Express server has started");

//});
