const path = require('path');
const express = require('express');
const app = express();

// 👉 Express templating engine
app.set('view engine', 'ejs');

// 👉 Serving static files in Express
app.use('/assets', express.static('assets'))

app.get('/', function(req, res){
    res.render('index');
});

const port = 8080;
const host = "localhost";

app.listen(port, host, function(){
    console.log(`Server on http://${host}:${port}/`);
});