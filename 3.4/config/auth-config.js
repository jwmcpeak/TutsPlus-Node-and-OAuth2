var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var User = require("../models/user");

var facebookConfig = {
	clientID : "",
	clientSecret : "",
	callbackURL : "http://localhost:1337/facebook/callback",
	passReqToCallback : true
};


var localRegisterInit = function(req, email, password, callback) {
	User.findOne( { "local.email" : email}, function(err, existingUser) {
		if (err) {
			return callback(err);
		}
		
		if (existingUser) {
			// TODO: supply message
			return callback(null, false);
		}
		
		var user = (req.user) ? req.user : new User();		
		
		user.local.email = email;
		user.local.password = user.hashPassword(password);
		
		user.save(function(err) {
			if (err) {
				throw err;
			}
			
			return callback(null, user);
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


var facebookInit = function(req, token, refreshToken, profile, callback) {
	User.findOne( { "facebook.id" : profile.id }, function(err, existingUser) {
		if (err) {
			return callback(err);
		}
		
		if (existingUser) {
			return callback(null, existingUser);
		}
		
		var user = (req.user) ? req.user : new User();
		
		user.facebook.id = profile.id;
		user.facebook.token = token;
		user.facebook.email = profile.emails[0].value;
		
		user.save(function(err) {
			if (err) {
				throw err;
			}
			
			return callback(null, user);
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
	localConnect : passport.authorize("local-register", {
		successRedirect : "/profile",
		failureRedirect : "/connect/local"
	}),
	localLogin : passport.authenticate("local-login", {
		successRedirect : "/profile",
		failureRedirect : "/login"
	}),
	facebookLogin: passport.authenticate("facebook", { scope: "email" }),
	facebookCallback: passport.authenticate("facebook", {
		successRedirect : "/profile",
		failureRedirect : "/"
	}),
	facebookConnect: passport.authorize("facebook", { scope: "email" }),
	facebookConnectCallback: passport.authorize("facebook", {
		successRedirect : "/profile",
		failureRedirect : "/profile"
	})
};