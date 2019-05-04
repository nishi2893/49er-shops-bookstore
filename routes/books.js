const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const Book = require('../models/book');
const Author = require('../models/author');
const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['images/jpeg', 'images/png', 'images/gif'];

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
});

console.log("Upload variable"+ uploadPath)

//Fetch all the books

router.get('/', async (req, res) => {

    let query = Book.find();

    if(req.query.title != null && req.query.title != ''){
         query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
         query = query.gte('publishDate', req.query.publishedAfter);
    }
    try {
        const books = await query.exec();
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
        
    } catch (error) {

        res.redirect('/');
        
    }
});

//Display the form to create new book

router.get('/new', async (req, res) => {
    
    renderNewPage(res, new Book());
      
});

//Create a new book and store in db

router.post('/', upload.single('cover'), async (req, res) => {
    

    const fileName = req.file != null ? req.file.filename : null;

    console.log("File name"+ req.file);
    

    const book = new Book({
        title: req.body.title,
        ISBN: req.body.isbn,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        price: req.body.price,
        coverImageName: fileName,
        author: req.body.author
    });

    console.log("New Book"+ book);

    try {
        const newBook = await book.save();
        res.redirect('/books');
        
    } catch (error) {

        if(book.coverImageName != null){
            removeBookCover(book.coverImageName);
        }
        renderNewPage(res, book, true);
    }
  });

 function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err){
            console.error(err);
        }
    });

 }

async function renderNewPage(res, book, hasError){

    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if(hasError){
            params.errorMessage = 'Error creating book!!!'
        }
        res.render('books/new', params);
           
       } catch (error) {
           res.redirect('/books');
       }
   


}  

module.exports = router;