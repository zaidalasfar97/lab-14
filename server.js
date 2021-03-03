'use strict'
const express = require("express");
const { get } = require("superagent");
const su = require("superagent")
const app = express();
const pg = require("pg");
const methodOverride = require('method-override');

require("dotenv").config();
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

app.use(express.static('./public'));

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));


const Port = process.env.PORT || 2000
app.use(express.urlencoded({ extended: true }));
app.listen(Port, () => {
    console.log(`listening on ${Port}`);
})
client.connect()
app.get('/', homePage);
app.post('/searches', getData);
app.get('/searches/new', newSearch);
app.get(`/books/:id`, getBookID);
app.post(`/books`, saveData);
app.put('/updatebooks/:id', updateDetalis);
app.delete('/deletebooks/:id', deleteHandler);

function deleteHandler(req, res) {
    let SQL = `DELETE FROM books WHERE id=$1`;
    let value = [req.params.id];
    client.query(SQL, value)
        .then(() => {
            res.redirect('/');
        })
}

function updateDetalis(req, res) {
    let { author, title, isbn, image_url, description } = req.body;
    let SQL = `UPDATE books SET author=$1,title=$2,isbn=$3,image_url=$4,description=$5 WHERE id=$6;`;
    let values = [author, title, isbn, image_url, description, req.params.id];
    client.query(SQL, values)
        .then(() => {
            res.redirect(`/books/${req.params.id}`);

        })
}

function saveData(req, res) {
    let Image = req.body.image_url

    let Title = req.body.title

    let Description = req.body.description

    let Author = req.body.author

    let ISBN = req.body.isbn

    let sql = `INSERT INTO books(author,title,isbn,image_url,description) VALUES ($1,$2,$3,$4,$5) RETURNING *;`;

    let values = [Author, Title, ISBN, Image, Description]



    client.query(sql, values)
        .then((result) => {

            res.render('pages/books/detail', { bookDetail: result.rows[0] })
            // console.log(result.rows);
        })

}
function getBookID(req, res) {

    let SQL = `SELECT * from books WHERE id=$1;`;
    let value = [req.params.id]
    client.query(SQL, value).then(result => {

        res.render('pages/books/detail', { bookDetail: result.rows[0] })
    })

}


function getData(req, res) {
    // let x = req.body.title
    // console.log(x);
    // res.render('pages/index')
    // // res.send("d")
    let search = req.body.q;
    //selecting from form
    let sel = req.body.TorA
    // console.log(y); this.url=data.image || https://i.imgur.com/J5LVHEL.jpg
    // let trigger;
    // if(tri)
    let url = `https://www.googleapis.com/books/v1/volumes?q=+${sel}:${search}`;
    su.get(url)
        .then((result) => {
            let boolImage;
            let boolIsbn;
            //  let boolIsbm;
            // res.send(result.body.items[4].volumeInfo);

            let itemsARR = result.body.items.map(function (elem, idx) {
                //    r.push(elem.volumeInfo.title)
                // console.log(typeof elem.volumeInfo.industryIdentifiers);
                //    console.log(elem.volumeInfo.industryIdentifiers[0].identifier);
                if (typeof elem.volumeInfo.imageLinks == "undefined") {
                    // console.log("false");
                    boolImage = false;
                } else {
                    boolImage = true
                    // console.log("true");
                }
                //////////////////////////////////////////////////////
                if (typeof elem.volumeInfo.industryIdentifiers == "undefined") {
                    // console.log("false");
                    boolIsbn = false;
                } else {
                    boolIsbn = true
                    // console.log("true");
                }



                return new Book(elem, boolImage, boolIsbn)




            })

            // console.log(itemsARR.isbn);
            res.render("pages/searches/show", { Data: itemsARR })


        })


}
function newSearch(req, res) {


    res.render("pages/searches/new")
}


function homePage(req, res) {

    let sql = 'select * from books;'
    client.query(sql).then(result => {
        let numberPage;
        numberPage = result.rowCount;
        // console.log(result.rows);

        res.render("pages/index",
            {
                data: result.rows,
                numberOfBooks: numberPage
            })
    })


}


function Book(data, image, isbn) {
    if (image == false) {
        // console.log("dd");
        this.image_url = "https://i.imgur.com/J5LVHEL.jpg"

    } else if (image) {

        this.image_url = data.volumeInfo.imageLinks.smallThumbnail
    }
    ///////////////////////////////
    if (isbn == false) {
        this.isbn = "There Is No ISBN"

    } else if (isbn) {

        this.isbn = data.volumeInfo.industryIdentifiers[0].type + " " + data.volumeInfo.industryIdentifiers[0].identifier
    }
    // 
    // this.isbn =data.volumeInfo.industryIdentifiers[0] || "There Is No ISBN"


    this.title = data.volumeInfo.title || "There Is No Title"
    this.author = data.volumeInfo.authors || "There Is No Author"
    this.description = data.volumeInfo.description || "There Is No Description"
    this.bookshelf = data.volumeInfo.categories || "there is no category"


}