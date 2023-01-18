if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const expressLayouts = require("express-ejs-layouts");

//Routers
const indexRouter = require("./routes/index");

//Initializing server
const app = express();

//Views and Layouts
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

//Middleware
app.use(expressLayouts);
app.use(express.static("public"));

//Setting Up Datebase
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
}); 

mongoose.set("strictQuery", false);

const db = mongoose.connection;

db.once("open", () => console.log("connected to mongoose"));


//Using Router Middleware
app.use("/", indexRouter);


//Listening 
app.listen(process.env.PORT || 5000)