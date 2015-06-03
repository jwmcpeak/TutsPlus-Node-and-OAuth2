var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var User = require("../models/user");

var facebookConfig = {
	clientID : "",
	clientSecret : "",
	callbackURL : "http://localhost:1337/facebook/callback"
};


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


var facebookInit = function(token, refreshToken, profile, callback) {
	User.findOne( { "facebook.id" : profile.id }, function(err, user) {
		if (err) {
			return callback(err);
		}
		
		if (user) {
			return callback(null, user);
		}
		
		var newUser = new User();
		
		newUser.facebook.id = profile.id;
		newUser.facebook.token = token;
		newUser.facebook.email = profile.emails[0].value;
		
		newUser.save(function(err) {
			if (err) {
				throw err;
			}
			
			return callback(null, newUser);
		});
	});
};

passport.use("local-register", new LocalStrategy(localOptions, localRegisterInit));
passport.use("local-login", new LocalStrategy(localOptions, localLoginInit));
passport.use(new FacebookStrategy(facebookConfig, facebookInit));

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
		successRedirect : "/profile",
		failureRedirect : "/register"
	}),
	localLogin : passport.authenticate("local-login", {
		successRedirect : "/profile",
		failureRedirect : "/login"
	}),
	facebookLogin: passport.authenticate("facebook", { scope: "email" }),
	facebookCallback: passport.authenticate("facebook", {
		successRedirect : "/profile",
		failureRedirect : "/"
	})
};