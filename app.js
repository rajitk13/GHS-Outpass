const express = require('express');
const port = 3000;
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
//EJS
const ejs = require("ejs");
app.set('view engine', 'ejs');
//static files 
app.use(express.static('Public'));




//HOME PAGE ROUTE 
app.get('/', (req, res) => {
res.render('home');
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });