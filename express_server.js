const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { application } = require("express");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


const generateRandomString = () => {
  return ((Math.random() + 1)* 0x10000).toString(36).substring(6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const randomName = generateRandomString(); 
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars );
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const randomName = generateRandomString()
  const newLongUrl = req.body.longURL
  if (newLongUrl.slice(0,8) === 'https://' || newLongUrl.slice(0,7) === 'http://') {
    urlDatabase[randomName] = newLongUrl  // check if contains http: already
  } else {
    urlDatabase[randomName] = `https://${newLongUrl}`  // check if contains http: already
  }
    // check if contains http: already
  res.redirect(`/urls/${randomName}`)
});

app.get("/urls/:id", (req, res) => {   // redirect to  summary id page
  const id = req.params.id
  const longURL = urlDatabase[id]
  const templateVars = { id, longURL, username:req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {   // redirect to actual website
  const id = req.params.id
  const longURL = urlDatabase[id]
  console.log(longURL)
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {   // redirect to  summary id page
  const shortUrl = req.params.id;
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  const newLongUrl = req.body.longUrl
  
  if (newLongUrl.slice(0, 8) === 'https://' || newLongUrl.slice(0, 7) === 'http://') {
    urlDatabase[shortUrl] = newLongUrl;  // adds http: into input feild so http not manually required
  } else {
    urlDatabase[shortUrl] = `https://${newLongUrl}`;  // check if contains https: already
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {   
  const username = req.body.username;
  res.cookie('username', username)
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {   
  res.clearCookie("username")
  res.redirect('/urls')
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_register", templateVars);
});

app.post("/register",(req, res) => { 
  const email = req.body.email;
  const password = req.body.password;
  res.cookie('email', email)
  res.cookie('password', password)
  res.redirect('/register')
});