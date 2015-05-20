// app/routes.js
module.exports = function(app,apiRoutes,jwt,User) {
	// ---------------------------------------------------------
	// authentication (no middleware necessary since this isnt authenticated)
	// ---------------------------------------------------------

	// on routes that end in /register
	// ----------------------------------------------------
	apiRoutes.route('/register')

	    // create a user (accessed at POST http://localhost:8080/api/register)
	    .post(function(req, res) {
	        console.log('I\'m starting to create a new user');
	        var user = new User();      // create a new instance of the user model
	        console.log("I created the object");
	        user.username = req.body.username;  // set the user username (comes from the request)
	        user.password = req.body.password;
	        user.admin = false;
	        console.log("apparently, I did it");

	        // save the user and check for errors
	        user.save(function(err) {
	            if (err)
	                res.send(err);

	            res.json({ message: 'User created!' });
	        });
	    });

	// http://localhost:8080/api/signin
	apiRoutes.post('/signin', function(req, res) {

		// find the user
		User.findOne({
			username: req.body.username
		}, function(err, user) {

			if (err) throw err;

			if (!user) {
				res.json({ success: false, message: 'Authentication failed. User not found.' });
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
	// route middleware to authenticate and check token
	// ---------------------------------------------------------
	apiRoutes.use(function(req, res, next) {

		// check header or url parameters or post parameters for token
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		// decode token
		if (token) {

			// verifies secret and checks exp
			jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
				if (err) {
					return res.json({ success: false, message: 'Failed to authenticate token.' });		
				} else {
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;	
					next();
				}
			});

		} else {

			// if there is no token
			// return an error
			return res.status(403).send({ 
				success: false, 
				message: 'No token provided.'
			});
			
		}
		
	});

	// ---------------------------------------------------------
	// authenticated routes
	// ---------------------------------------------------------
	apiRoutes.get('/', function(req, res) {
		res.json({ message: 'Welcome to the coolest API on earth!' });
	});

	apiRoutes.get('/users', function(req, res) {
		User.find({}, function(err, users) {
			res.json(users);
		});
	});

	apiRoutes.get('/check', function(req, res) {
		res.json(req.decoded);
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
}