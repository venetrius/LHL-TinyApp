const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
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
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email);
  if(user && user.password === req.body.password){
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
    password : req.body.password
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
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/"+shortURL);
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
