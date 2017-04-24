//var bcrypt = require('bcrypt');
var express = require('express');
var mongodb = require('mongodb');

var user = 'blood_press';
var password = 'password';
var host = '127.0.0.1';
var port = '27017'; // Default MongoDB port
var database = 'blood_press';
// var connectionString = 'mongodb://' + user + ':' + password + '@' +
var connectionString = 'mongodb://' +
  host + ':' + port + '/' + database;

// These will be set once connected, used by other functions below
var usersCollection;
var recordsCollection;
//Reference to the counter collection
var countersCollection;

//CORS Middleware, causes Express to allow Cross-Origin Requests
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers','Content-Type');

  next();
}

var app = express();
app.use(express.bodyParser());
app.use(allowCrossDomain);

// // Get all records associated with the given user
app.post('/getRecords', function (request, response) {
  console.log('Sending records');
  if (!request.body.userID || !request.body.password) {
    return response.send(400, 'Missing log in information.');
  }
  usersCollection.find({ userID: request.body.userID }, function (err, result) {
    if (err) {
      throw err;
    }
    result.next(function (err, foundUser) {
      if (err) {
        throw err;
      }
      if (!foundUser) {
        return response.send(400, 'User not found.');
      }
      if (!request.body.password == foundUser.password) {
        return response.send(400, 'Invalid password');
      }
      getRecords(request, function (err, result) {
        if (err) {
          return response.send(400,'An error occurred retrieving records.');
        }
        result.toArray(function (err, resultArray) {
          if (err) {
            return response.send(400,'An error occurred processing your records.');
          }
          return response.send(200, resultArray);
        });
      });
    });
  });
});

// Helper function to get all records for a given user
function getRecords(request, callback) {
  console.log('Retrieving records.');
  recordsCollection.find({user: request.body.userID}, callback);
}

// Updates the records in the database with the provided records
app.post('/syncRecords', function (request,response) {
  console.log('Save Records Request Received.');

  if (!request.body.email || !request.body.password) {
    return response.send(400, 'Missing log in information.');
  }

  //FIXME might need to change this to look for id
  usersCollection.find({userID: request.body.userID}, function (err, result) {
    if (err) {
      throw err;
    }
    result.next(function (err, foundUser) {
      if (err) {
        throw err;
      }
      if (!foundUser) {
        return response.send(400, 'User not found.');
      }
      if (!request.body.password == foundUser.password) {
        return response.send(400, 'Invalid password');
      }
      var newRecords = request.body.newRecords;
      for (var i = 0; i < newRecords.length; i++) {
        newRecords[i].user = request.body.userID;
        delete newRecords[i]._id;
      }
      syncRecords(request, response, newRecords);
    });
  });
});

// Helper function to remove all old records and insert all new records
//  We do this instead of a combination of UPDATE and
//  INSERT statements to simplify this process
function syncRecords(request, response,recordsToSave) {
  recordsCollection.remove({ userID: request.body.userID}, null, function (err) {
    if (err) {
      return response.send(400, 'Error occurred syncing records');
    }
    recordsCollection.insert(recordsToSave,function (err, result) {
        if (err) {
          console.log(err);
          return response.send(400, 'Error occurred syncing records');
        }
        return response.send(200, 'Records synced.');
      });
  });
}

// Uses a userID and password to retrieve a user from the database
app.post('/login', function (request, response) {
  console.log('Logging user in');

  if (!request.body.userID || !request.body.password) {
    return response.send(400, 'Missing log in information.');
  }

  usersCollection.find({ userID: request.body.userID }, function (err, result) {
    if (err) {
      throw err;
    }
    result.next(function (err, foundUser) {
      if (err) {
        throw err;
      }
      if (!foundUser) {
        return response.send(400, 'User not found.');
      }
      if (request.body.password != foundUser.password) {
        return response.send(400, 'Invalid password');
      }
      //delete foundUser.password;
      return response.send(200, foundUser);
    });
  });
});

// Creates a new user in the database
app.post('/saveNewUser', function (request, response) {
  console.log('New user being created.');

  var user = request.body.newUser;
  console.log(user);

  if (!user.userID || !user.email || !user.password || !user.firstName || !user.lastName || 
    !user.insCardNum || !user.dateOfBirth) {
    return response.json(400, 'Missing a parameter.');
  }

  //var salt = bcrypt.genSaltSync(10);
  //var passwordString = '' + user.password; 

  //Original synchronous bcrypt
  //user.password = bcrypt.hashSync(passwordString, salt);
  //user.agreedToLegal = false;
  //FIXME add function to create and return user ID

  usersCollection.find({ userID: user.userID}, function (err, result) {
    if (err) {
      return response.send(400, 'An error occurred creating this user.');
    }
    if (result.length) {
      return response.send(400,'A user with this ID already exists.');
      delete user.password;
    }

    //Original user db entry code
    usersCollection.insert(user, function (err, result) {
      console.log(user);
      if (err) {
        return response.send(400, 'An error occurred creating this user.');
      }
      //Alter this statement to send the user ID
      return response.send(200, user.userID);
    });
  });
});

// Update user information
app.post('/updateUser', function (request, response) {
  console.log('User being updated.');
  var user = request.body;
  usersCollection.find({ userID: user.userID }, function (err, result) {
    if (err) {
      throw err;
    }
    result.next(function (err, foundUser) {
      if (err) {
        return response.send(400, 'An error occurred finding a user to update.');
      }
      if (!foundUser) {
        return response.send(400, 'User not found.');
      }
      if (!request.body.password == foundUser.password) {
        return response.send(400, 'Invalid password.');
      }
      if (!user.password) {
        // Should not update password
        user.password = foundUser.password;
      } 
      //delete user._id;
      //delete user.password;
      
      usersCollection.update({ userID: user.userID }, user, null, function (err) {
        if (err) {
          console.log(err);
          return response.send(400, 'An error occurred updating users information.');
        }
        return response.send(200, foundUser);
      });
    });
  });
});

mongodb.connect(connectionString, function (error, db) {
  if (error) {
    throw error;
  }

  usersCollection = db.collection('users');
  recordsCollection = db.collection('records');

  // Close the database connection and server when the application ends
  process.on('SIGTERM', function () {
    console.log("Shutting server down.");
    db.close();
    app.close();
  });

  //var server = app.listen(3011, function () {
 //   console.log('Listening on port %d', server.address().port);
  //});
  
  var server = app.listen(3011);
});
