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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
  console.log(req.cookies["username"])
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  const templateVars = { id, longURL};
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

app.post("/auth", (req, res) => {   
  const username = req.body.username;
  res.cookie('username', username)
  console.log(req.body)
  res.redirect('/urls')
});