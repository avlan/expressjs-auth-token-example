// app/routes/default.js
module.exports = function(app,apiRoutes) {

    // used to create, sign, and verify tokens
    var jwt         = require('jsonwebtoken');  //https://npmjs.org/package/node-jsonwebtoken
    var expressJwt  = require('express-jwt'); //https://npmjs.org/package/express-jwt

    var User        = require('../models/user'); // get our mongoose model

    // on routes that end in /users
    // this creates a simple user
    // ----------------------------------------------------
    apiRoutes.route('/users')

        // create a user (accessed at POST http://localhost:8080/api/users)
        .post(function(req, res) {
            console.log('I\'m starting to create a new user');
            var user = new User();      // create a new instance of the user model
            console.log("I created the object");
            user.username = req.body.username;  // set the user username (comes from the request)
            user.password = req.body.password;
            user.name = req.body.name;
            user.lastname = req.body.lastname;
            console.log("apparently, I did it");
            console.log(user.username,user.password,user.name,user.lastname);

            // save the user and check for errors
            user.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'User created!' });
            });
        });

    // http://localhost:8080/api/authenticate
    apiRoutes.post('/authenticate', function(req, res) {

        // find the user
        User.findOne({
            username: req.body.username
        }, function(err, user) {

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found. ' + req.body.username});
            } else if (user) {

                // check if password matches
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        // if user is found and password is right
                        // create a token
                        var token = jwt.sign(user, app.get('superSecret'), {
                            expiresInMinutes: 1440 // expires in 24 hours
                        });

                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: token
                        });
                    } else {
                        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                    }
                });
            }
        });
    });

    // ---------------------------------------------------------
    // authenticated routes
    // ---------------------------------------------------------
    apiRoutes.get('/', function(req, res) {
        res.json({ message: 'Welcome to the coolest API on earth!' });
    });

    apiRoutes.get('/restricted', function (req, res) {
        console.log('Someone is calling /api/restricted');
        res.json({
            name: 'foo'
        });
    });

    apiRoutes.get('/check', function(req, res) {
        res.json(req.decoded);
    });
    /*
    apiRoutes.route('/tasks')

        // create a task (accessed at POST http://localhost:8080/api/tasks)
        .post(function(req, res) {
            console.log('I\'m starting to create a new task');
            var task = new Task();      // create a new instance of the task model
            task.text = req.body.text;  // set the task username (comes from the request)
            console.log("apparently, I did it");

            // save the task and check for errors
            task.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Task created!' });
            });
        })

        // get all the tasks (accessed at GET http://localhost:8080/api/tasks)
        .get(function(req, res) {
            Task.find({}, function(err, tasks) {
                res.json(tasks);
            });
        });

        apiRoutes.route('/tasks/:task_id')

        // get the task with that id (accessed at GET http://localhost:8080/api/tasks/:tasks_id)
        .get(function(req, res) {
            Task.findById(req.params.task_id, function(err, task) {
                if (err)
                    res.send(err);
                res.json(task);
            });
        })

        // update the task with this id (accessed at PUT http://localhost:8080/api/tasks/:task_id)
        .put(function(req, res) {

            // use our task model to find the task we want
            Task.findById(req.params.task_id, function(err, task) {

                if (err)
                    res.send(err);

                task.text = req.body.text;
                task.done = req.body.done;

                // save the task
                task.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'Task updated!' });
                });

            });
        })

        // delete the task with this id (accessed at DELETE http://localhost:8080/api/tasks/:task_id)
        .delete(function(req, res) {
            Task.remove({
                _id: req.params.task_id
            }, function(err, task) {
                if (err)
                    res.send(err);

                res.json({ message: 'Task successfully deleted' });
            });
        });

        // on routes that end in /user/:user_id
        // ----------------------------------------------------
        apiRoutes.route('/users/:user_id')

            // get the user with that id (accessed at GET http://localhost:8080/api/user/:user_id)
            .get(function(req, res) {
                User.findById(req.params.user_id, function(err, user) {
                    if (err)
                        res.send(err);
                    res.json(user);
                });
            })

            // update the user with this id (accessed at PUT http://localhost:8080/api/user/:user_id)
            .put(function(req, res) {

                // use our user model to find the user we want
                User.findById(req.params.user_id, function(err, user) {

                    if (err)
                        res.send(err);

                    user.username = req.body.username;  // set the user username (comes from the request)
                    user.password = req.body.password;

                    // save the user
                    user.save(function(err) {
                        if (err)
                            res.send(err);

                        res.json({ message: 'User updated!' });
                    });

                });
            })

            // delete the user with this id (accessed at DELETE http://localhost:8080/api/user/:user_id)
            .delete(function(req, res) {
                User.remove({
                    _id: req.params.user_id
                }, function(err, user) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'Successfully deleted' });
                });
            });
*/
    // We are going to protect /api routes with JWT
    app.use('/api/check', expressJwt({secret: app.get('superSecret')}));
    app.use('/api/restricted', expressJwt({secret: app.get('superSecret')}));

}