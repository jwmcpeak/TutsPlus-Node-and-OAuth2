var router = require("express").Router();
var authConfig = require("./auth-config");

router.get("/", function (req, res) {
    res.render("index.ejs");
});

router.get("/login", function (req, res) {
    res.render("login.ejs");
});

router.post("/login", authConfig.localLogin);

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

router.get("/register", function (req, res) {
    res.render("register.ejs");
});

router.post("/register", authConfig.localRegister);


module.exports = router;