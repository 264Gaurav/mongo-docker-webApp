let express = require('express');
let path = require('path');
let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let cors = require('cors');  // <-- Add this line
let app = express();

app.use(cors()); // <-- Allow all origins by default

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({
  origin: '*' // replace with your frontend's origin
}));


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "user-account";

app.post('/update-profile', function (req, res) {
  let userObj = req.body;

  MongoClient.connect(mongoUrlDocker, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);
    userObj['userid'] = 1;

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    db.collection("users").updateOne(myquery, newvalues, {upsert: true}, function(err, res) {
      if (err) throw err;
      client.close();
    });

  });
  // Send response
  res.send(userObj);
});

app.get('/get-profile', function (req, res) {
  let response = {};
  // Connect to the db
  MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);

    let myquery = { userid: 1 };

    db.collection("users").findOne(myquery, function (err, result) {
      if (err) throw err;
      response = result;
      client.close();

      // Send response
      res.send(response ? response : {});
    });
  });
});

app.listen(3000, function () {
  console.log("app listening on port 3000!");
});



































// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');
// const { MongoClient } = require('mongodb');
// const bodyParser = require('body-parser');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Enable CORS
// app.use(cors());

// // Middleware
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// // Environment-based MongoDB URI (default to local)
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017';
// const DATABASE_NAME = process.env.DB_NAME || 'user-account';

// // Serve index.html
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// // Serve profile image
// app.get('/profile-picture', (req, res) => {
//   const imgPath = path.join(__dirname, 'images', 'profile-1.jpg');
//   fs.readFile(imgPath, (err, data) => {
//     if (err) {
//       console.error('Error reading image:', err);
//       return res.sendStatus(500);
//     }
//     res.type('jpg').send(data);
//   });
// });

// // Initialize Mongo Client once
// const client = new MongoClient(MONGO_URI);

// async function connectDB() {
//   if (!client.isConnected()) {
//     await client.connect();
//     console.log('✅ Connected to MongoDB');
//   }
//   return client.db(DATABASE_NAME);
// }

// // Update or insert user profile
// app.post('/update-profile', async (req, res) => {
//   try {
//     const db = await connectDB();
//     const users = db.collection('users');
//     const userObj = { ...req.body, userid: 1 };

//     const result = await users.updateOne(
//       { userid: 1 },
//       { $set: userObj },
//       { upsert: true }
//     );

//     res.json({ success: true, result, data: userObj });
//   } catch (err) {
//     console.error('❌ Error updating profile:', err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // Retrieve user profile
// app.get('/get-profile', async (req, res) => {
//   try {
//     const db = await connectDB();
//     const users = db.collection('users');

//     const profile = await users.findOne({ userid: 1 });
//     res.json(profile || {});
//   } catch (err) {
//     console.error('❌ Error fetching profile:', err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`App listening on port ${PORT}!`);
// });

























