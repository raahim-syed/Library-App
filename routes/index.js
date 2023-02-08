const express = require("express")

//Router
const router = express.Router();

//Loading standard page
router.get("/", (req, res) =>{
    res.render("index");
})


//Exporting the router
module.exports = router;