const express = require('express')
const app = express()
const bodyParser = require('body-parser') // somewhat depricated & built in
const MongoClient = require('mongodb').MongoClient
// what we use to talk to our mongo DataBase - Use MongoDB Atlas 

var db, collection;

const url = "mongodb+srv://thaonguyen:pafW5wI449rrBO5q@tnguyendev.ix5ze.mongodb.net/?retryWrites=true&w=majority";
const dbName = "savagedemo";

// 
app.listen(4000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))
// public folder and when we request it express handles it for us

// GET request -> '/' = main route/root -> here's the function/code that's going to run
// when building out a route we leave our params as (req, res)
// we are displaying the messages 
// messages stored in the DB -> finding the messages stored in the collection in DB --> find all documents in those collection -> make an array (holds all of our documents/objects from DB in array)
app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})

    // respond with the rendering of our ejs (we've passed all of our array/objects into messages)..which ejs responds with HTML and includes all the content we got back from out database

    // ejs is a templating language -> job is to have a template that we plug data into and then gives us an HTML file that displays to the user. 
    // can't build out data if we hardcode out HTML 
  })
})

// POST Request -> '/' = main route/root -> here's the function/code that's going to run
// we want data stored in the DataBase 
// go to DB -> find message collection -> insert one (insertOne) document -> request sends a lot of data -> 
// we can grab everything that gets sent along using the (req, res) params...use req.body.<name> (says Name (in DB): is now equal to name)
// wanna get data from the form SO we can hardcode thumb up and thumb down

app.post('/messages', (req, res) => {
  db.collection('messages').insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
    // redirect refreshes and triggers new GET request and there will be a new document. Get and post work together.
  })
})

// PUT - find one and update so add thumbs up 
app.put('/messages', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1,
    }
  }, {
    // sorts how it finds things (top to bottom, bottom to top in DB)
    sort: {_id: -1},
    upsert: true
    // tries to find a match so it creates one for you - can be turned to false
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

// PUT request 2 - thumps up and thumbs down 
// added thumbs down same as above but changed to subtract 1
app.put('/messagesTDown', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp - 1,
      // thumbDown:req.body.thumbDown - 1, //added at first 
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

// DELETE request - trash can to delete messages

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
