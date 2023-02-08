const express = require("express")
const Author = require("../models/author");
const Book = require("../models/book")

//Router
const router = express.Router();

router.get("/", async (req, res) =>{
    //Sepicifying Search Criteria 
    const searchOption = {};

    //Checking if query string has data in it or not
    if(req.query.search != null && req.query.search !== ""){
        searchOption.name = new RegExp(req.query.search, "i");
    }

    //Loading Authors
    try{
        //Getting Results from database
        const authors = await Author.find(searchOption);

        //Rendering results to page
        res.render("authors/index", {
            authors: authors,
            searchOption: req.query.search
        });
    }catch{
        res.redirect("/")
    }
});

//Route for adding new author
router.get("/new", (req, res) =>{
    //Getting All Authors
    res.render("authors/new", {author: new Author()});
});

//Get A Specific Author
router.get("/:id",async (req, res) => {
    try{
        const author = await Author.findById(req.params.id);
        const books = await Book.find({author: req.params.id})

        res.render("authors/show", {author: author, books: books});
    }catch(err){
        console.log(err);
    }
})

//Getting Author Edit Page
router.get("/:id/edit", async(req, res) => {
    try{
        const authors = await Author.findById(req.params.id);

        res.render("authors/edit", {id: req.params.id, author:authors})
    }catch(err){
        console.log(err)
        res.redirect("/authors");
    }
})

//Request for adding new author to database
router.post("/new", async (req, res)=>{

    //Creating an author of the schema 
    const author = new Author({
        name: req.body.author
    })
    //Saving the created author to database
    try{
        //Saves author to database
        const newAuthor = await author.save();
                    
        // res.redirect(`/authors/${newAuthor.name}`);
        res.redirect("/authors")

    }catch(err){
        console.log(err)
        res.render("authors/new", {author: author, error: "Error creating author"});
    }

})

//Updating Author Data in Database
router.put("/:id",async (req, res) => {
    let author;
    try{
        author = await Author.findById(req.params.id);
        
        author.name = req.body.author;

        await author.save();

        res.redirect("/authors")
    }catch{
        if(author == null){
            console.log(err);
        }else{
            res.redirect(`/authors/${author.id}/edit`);
        }
    }
})

//Deleteing an Author From Database
router.delete('/:id', async (req, res) => {
    let author;
    try {
      author = await Author.findById(req.params.id)
      await author.remove();

      res.redirect('/authors');
    } catch(e){
      if (author == null) {
        res.redirect('/')
      } else {
        console.log(e.message)
        res.redirect(`/authors/${author.id}`)
      }
    }
  })

module.exports = router;