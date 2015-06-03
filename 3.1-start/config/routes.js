var router = require("express").Router();

router.get("/", function (req, res) {
    res.render("index.ejs");
});

router.get("/login", function (req, res) {
    res.render("login.ejs");
});

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

router.get("/register", function (req, res) {
    res.render("register.ejs");
});

module.exports = router;