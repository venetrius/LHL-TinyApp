const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());

/*
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};*/

let urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  1234:   { longURL: "https://www.google.ca", userID: "123" }
};


let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk",10)
  },
  "123": {
    id: "123",
    email: "gergelygjuhasz@gmail.com",
    password: bcrypt.hashSync("a",10)
  }
}

const isEmailExist = function(email){
  return getUserByEmail(email);
}

const getUserByEmail = function(email){
  for(let user in users){
    if( users[user].email===email){
      return users[user];
    }
  }
  return null;
}

const isValidUser = function(userID){
  return ( userID && users[userID]);
}

const getURLByUserId = function(userID){
  let userURLs = {};
  for (let urlId in urlDatabase){
    let url = urlDatabase[urlId];
    if (url.userID === userID){
      userURLs[urlId] = url.longURL;
    }
  }
  return userURLs;
}

const isAuthenticatedForURL = function(userID, urlId){
  let user = users[userID];
  let url = urlDatabase[urlId];
  return (user && url && user.id === url.userID);
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("login",templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("register",templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
    if(! isValidUser(req.cookies.user_id)){
    res.redirect("/login");
  }else{
    let templateVars = {
      urls: getURLByUserId(req.cookies.user_id),
      user: users[req.cookies.user_id]
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  if(! isValidUser(req.cookies.user_id)){
    res.redirect("/login");
  }else{
    const templateVars = {
      user: users[req.cookies.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let user = users[req.cookies.user_id];
  let url = urlDatabase[req.params.shortURL];
  if(user && url && user.id === url.userID){
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      user: users[req.cookies.user_id]
    };
    res.render("urls_show", templateVars);
  }else{
    res.status(400);
    res.send("Url can be only accesed by its authenticated creator");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if( !url){
    res.status(400);
    res.send("Error 400");
  }else{
    res.redirect(url.longURL);
  }
});

app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email);
  console.log(user);
  if(user && bcrypt.compareSync(req.body.password, user.password)){
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  }else{
    res.status(400);
    res.send("Username or password is not correct");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req,res) => {
  let newUser = {
    id : generateRandomString(),
    email : req.body.email,
    password :  bcrypt.hashSync(req.body.password,10)
  };
  if(!newUser.email || !newUser.password || isEmailExist(newUser.email)){
    res.status(400);
    res.send('E-mail or password is not valid, or E-mail is already registrated');
  }else{
    users[newUser.id] = newUser;
    res.cookie("user_id", newUser.id);
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if( ! isAuthenticatedForURL(req.cookies.userID, req.params.shortURL)){
    res.status(400);
    res.send("Access denied");
  }else{
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

/* deprecated ?
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = {
    longURL : req.body.longURL,
    userID  : req.cookies.user_id};
  res.redirect("/urls");
}); */

app.post("/urls", (req, res) => {
  if(isValidUser(req.cookies.user_id)){
    res.status(401);
    res.send('<a href="/login"> please login</a>');
  }else{
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL : req.body.longURL,
      userID  : req.cookies.user_id};
    res.redirect("/urls/"+shortURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     let randomString = [];
     for (let i = 0; i < 6; i++){
      let randomNumber = Math.floor(Math.random() * characters.length);
      randomString.push(characters[randomNumber]);
     }
     return randomString.join("");
}
