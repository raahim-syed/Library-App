if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");  
const methodOverride = require("method-override")

//Routers
const indexRouter = require("./routes/index");
const authorRouter = require("./routes/authors");
const booksRouter = require("./routes/books");

//Initializing server by creating express app
const server = express();

//Setting View Engine to EJS and setting views and layouts folders
server.set("view engine", "ejs");
server.set("views", __dirname + "/views");
server.set("layout", "layouts/layout");

//Middleware for all Paths
server.use(express.json())
server.use(expressLayouts);//For loading ejs layouts
server.use(express.static("public"));//for loading static files
server.use(bodyParser.urlencoded({extended: false, limit: "10mb"}))//to send form data
server.use(methodOverride("_method"));

//Connecting to our database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
}); 

//Connect to db
const database = mongoose.connection;

//Handling Error and other database events
database.on("open", () => {
    console.log("connection opened");
})
database.on("connection", () => {
    console.log("connection connected");
})
database.on("error", (err) => console.log(`there was an error: ${err}`));


//Using Router Middleware for certain paths
server.use("/", indexRouter);
server.use("/authors", authorRouter);
server.use("/books", booksRouter);


//Server is listening 
server.listen(process.env.PORT || 5000)