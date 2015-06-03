var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/user");


var localRegisterInit = function(req, email, password, callback) {
	User.findOne( { "local.email" : email}, function(err, user) {
		if (err) {
			return callback(err);
		}
		
		if (user) {
			// TODO: supply message
			return callback(null, false);
		}
		
		var newUser = new User();
		newUser.local.email = email;
		newUser.local.password = newUser.hashPassword(password);
		
		newUser.save(function(err) {
			if (err) {
				throw err;
			}
			
			return callback(null, newUser);
		});
	});
};

var localLoginInit = function(req, email, password, callback) {
	User.findOne( { "local.email" : email}, function(err, user) {
		if (err) {
			return callback(err);
		}
		
		if (!user || !user.validatePassword(password)) {
			// TODO: supply generic message
			return callback(null, false);
		}
		
		return callback(null, user);
	});
};

var localOptions = {
	usernameField : "emailAddress",
	passReqToCallback : true
};

passport.use("local-register", new LocalStrategy(localOptions, localRegisterInit));
passport.use("local-login", new LocalStrategy(localOptions, localLoginInit));

passport.serializeUser(function(user, callback) {
	callback(null, user.id);
});

passport.deserializeUser(function(id, callback) {
	User.findById(id, function(err, user) {
		callback(err, user);
	});
});


module.exports = {
	localRegister : passport.authenticate("local-register", {
		successRedirect : "/",
		failureRedirect : "/register"
	}),
	localLogin : passport.authenticate("local-login", {
		successRedirect : "/",
		failureRedirect : "/login"
	})
};