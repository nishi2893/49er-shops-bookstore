const express = require('express');
const router = express.Router();

const Book = require('../models/book');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

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
    
    renderNewPage(res, new Book(), false);
      
});


  //Display a particular book 

  router.get('/:id', async (req, res) =>{
         try {
           const book = await Book.findById(req.params.id).populate('author').exec();
       
           res.render('books/display', { book : book});
             
         } catch (error) {
             res.redirect('/');
         }
  });

  //Edit a particular book
  router.get('/:id/edit', async (req, res) => {

     try {
         const book = await Book.findById(req.params.id);
        
         renderEditPage(res, book, false);
         
     } catch (error) {
         res.redirect('/');
     }

  });

//Create a new book and store in db

router.post('/', async (req, res) => {
    
    const book = new Book({
        title: req.body.title,
        ISBN: req.body.isbn,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        price: req.body.price,
        author: req.body.author
    });
      saveCover(book, req.body.cover);
        
    try {
        const newBook = await book.save();
        res.redirect(`/books/${newBook.id}`);
        
    } catch (error) {

        renderNewPage(res, book, true);
    }
  });

  //Update a particular book and store in db

router.put('/:id', async (req, res) => {
    
    let book;
    try {
         book = await Book.findById(req.params.id);
         book.title = req.body.title;
         book.ISBN = req.body.isbn;
         book.author = req.body.author;
         book.publishDate = new Date(req.body.publishDate);
         book.price = req.body.price;
         book.description = req.body.description;

         if(req.body.cover != null && req.body.cover != ''){
             saveCover(book, req.body.cover);
         }
         await book.save();
         res.redirect(`/books/${book.id}`);
        
    } catch (error) {
         if(book != null){
            renderEditPage(res, book, true);
         }
         else{
             res.redirect('/');
         }
        
    }
  });

// Delete a particular book

  router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/books');
        
    } catch (error) {
        if(book != null){
            res.render('books/display',{
                book: book,
                errorMessage: "Could not remove the book"
            })
        } else{
            res.redirect('/');
        }
    }

  });

 
async function renderNewPage(res, book, hasError){
     renderFormPage(res, book, 'new', hasError);
   }  

async function renderEditPage(res, book, hasError){
          renderFormPage(res, book, 'edit', hasError);
   } 


   async function renderFormPage(res, book, form, hasError){
         
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if(hasError){
            if(form === 'edit'){
                params.errorMessage = 'Error updating book!!!'   
            }
            else if(form === 'new'){
                params.errorMessage = 'Error creating book!!!'
            }
            
        }
        res.render(`books/${form}`, params);
           
       } catch (error) {
           res.redirect('/books');
       }
   }     

  function saveCover(book, coverEncoded){
      console.log("Inside save cover");
     if(coverEncoded == null) return
     const cover = JSON.parse(coverEncoded);
     if(cover != null && imageMimeTypes.includes(cover.type)){
         
         book.coverImage = new Buffer.from(cover.data, 'base64');
         book.coverImageType = cover.type;
        
     }
  } 

module.exports = router;