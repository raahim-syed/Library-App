const {Schema, model} = require("mongoose")
const path = require("path");

const imageStore = "uploads/bookCover";

const bookSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    publishDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    pageCount: {
        type: Number,
        required: true
    },
    coverImgName: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Author"
    }
})



bookSchema.virtual('coverImagePath').get(function() {
    if (this.coverImgName != null) {
      return path.join('/', imageStore, this.coverImgName)
    }
})


//Creating and exporting the model
module.exports =  model("Book", bookSchema);
module.exports.imageStore = imageStore;