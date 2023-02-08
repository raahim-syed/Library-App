const {Schema, model} = require("mongoose")
const Book = require("./book")

const authorSchema = new Schema({
    name: {
        type: String,
        required: true
    }
})
//Middleware used to check if a author is assigned to a Book
authorSchema.pre("remove", function(next) {
    const searchOption = {author: this.id};

    //Find a matching book with author
    Book.find(searchOption).then(book => {
        if(book.length > 0){
            next(new Error("Author Cannot be removed because he is assigned to a book"))
        }else{
            //Delete author if no matching book is found
            next();
        }
    }).catch(err => {
        next(err);
    })
})

//Creating and exporting the model
module.exports =  model("Author", authorSchema);