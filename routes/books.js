const express = require("express")
const multer = require("multer")
const path = require("path");
const fs = require("fs/promises")

//Importing Models
const Book = require("../models/book");
const Author = require("../models/author");
const { remove } = require("../models/book");

//Router
const router = express.Router();

//Multipart From Setup
const uploadPath = path.join("public", Book.imageStore);
const imageMimeTypes = ["image/jpeg","image/png","image/gif"];

//Creating Multer Middleware
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
})

//Main Book Route
router.get("/", async (req, res) =>{
    //Destructuring Important Objects fro req
    const {title, publishedAfter, publishedBefore} = req.query;

    //Query
    let query = Book.find();

    //Getting Books for the respective queries typed
    if(title != null && title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(publishedBefore != null && publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(publishedAfter != null && publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }

    //Sepicifying Search Criteria 
    const searchOption = {};

    //Loading the books
    try{
        //Executing the above query
        const books = await query.exec();

        //Redering Books Page View
        res.render("books/index", {books, searchOption: req.query});
    }catch(err){
        console.log(err);
    }
});

//Rendering Route For Adding A Book
router.get("/new",async (req, res) =>{
    renderNewPage(res, new Book());
});

//Showing Book Details Route
router.get("/:id",async (req, res) => {
    try{
        const book = await Book.findById(req.params.id)
        const authors = await Author.find({});

        res.render("books/show.ejs", {book: book, authors: authors});
    }catch(err){
        console.log(err)
    }
})

//Editing Book Route
router.get("/edit/:id",async (req, res) => {
    let book;
    let authors;
    try{
        book = await Book.findById(req.params.id)
        authors = await Author.find({});

        res.render("books/edit.ejs", {book: book, authors: authors});
    }catch(err){
        console.log(err)
    }
})

//Processing Book Edit Request
router.put("/:id/edit", upload.single("cover") , async (req, res) => {
    //Destructuring Useful Data From Request Object
    const {title, publishDate, description, pageCount, author } = req.body;

    //Getting filename
    const fileName = req.file != null ? req.file.filename : null;
    console.log(fileName)

    let book;

    //Edit Book Data
    let update;
    try{
        book = await Book.findOne({id: req.params.id});

        const previousCover = book.coverImgName;

        if(fileName != null){
            //Add New Cover
            const update = {
                title: title,
                publishDate: publishDate,
                description: description,
                pageCount: pageCount,
                author: author,
                coverImgName: fileName
            }
            //Remove Previous Cover
            removeCover(previousCover);
        }else{
            update = {
                title: title,
                publishDate: publishDate,
                description: description,
                pageCount: pageCount,
                author: author,
            }
        }

        //Saving the details
        await book.updateOne(update);

        //Redirecting 
        res.redirect("/books");
    }catch(err){
        if(book.coverImgName != null){
            removeCover(fileName);
        }
        console.log(err);
    }
})

//Request for adding new author to database
router.post("/new", upload.single("cover") , async (req, res)=>{
    //Destructuring Useful Data From Request Object
    const {title, publishDate, description, pageCount, author } = req.body;

    //Getting filename
    const fileName = req.file != null ? req.file.filename : null;

    //Adding data to book object
    const book  = new Book({
        title: title,
        author: author,
        pageCount: pageCount,
        description: description,
        publishDate: new Date(publishDate),
        coverImgName: fileName,
    })

    try{  
        //Saving to database
        const newBook = await book.save();

        //Redirecting to books pages
        res.redirect("/books");
    }catch(err){
        console.log(err.message)

        //Preventing Book Cover Form Being Stored
        if(book.coverImgName != null){
            removeCover(book.coverImgName);
        }

        //Rendering The Add Author Page
        renderNewPage(res, book, true, err.message);
    }
})

router.delete("/:id",async (req, res) => {
    //Delete books here
    let book;

    try{
        book = await Book.findOne({id: req.params.id});

        //Removing Cover
        if(book.coverImgName != null){
            removeCover(book.coverImgName);
        }

        await book.remove();

        //Redirecting
        res.redirect("/books")
    }catch(err){
        console.log(err)
    }

})

//Custom Functions
function removeCover(fileName){
    //Deleting the uploaded file
    fs.unlink(path.join(uploadPath, fileName)).catch(err => {
        console.log(err)
    })
}

//Loading authors/new page
async function renderNewPage(res, book, error = false, errorMessage){
    try{
        //Getting all authors to display in 
        const allAuthors = await Author.find({});

        if(error){
            //Sending Empty Book Object To Avoid Errors
            res.render("books/new", {authors: allAuthors, book: book, error: errorMessage}); 
        }else{
            //Sending Empty Book Object To Avoid Errors
            res.render("books/new", {authors: allAuthors, book: book}); 
        } 

    }catch(err){
        console.log(err);
    }
}

//Exporting Router
module.exports = router;