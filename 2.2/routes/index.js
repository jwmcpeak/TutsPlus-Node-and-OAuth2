var express = require("express");
var basicAuth = require("../auth/basic");
var router = express.Router();

/* GET home page. */
router.get("/", basicAuth.isAuthenticated, function (req, res) {
    res.send("<html><body>Welcome " + req.user.displayName + "</body></html>");
});

module.exports = router;