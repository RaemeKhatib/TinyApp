const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const {
  urlsForUser,
  loggedIn,
  emptyFields,
  findUserByEmail,
  findUserByUser_Id,
  generateRandomString
} = require("./helpers");



app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["table", "door", "window", "apple"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

// const randomName = generateRandomString();
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234",

  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "abcd",
  },
};

app.get("/", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});


app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    return res.redirect("/login");
  }
  const filteredUrlDatabase = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: filteredUrlDatabase, user: users[req.session["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {

  if (!loggedIn(req, users)) {
    return res.send("Please login to view this content.");
  }
  const randomName = generateRandomString();
  const newLongUrl = req.body.longURL;

  if (newLongUrl.slice(0, 8) === 'https://' || newLongUrl.slice(0, 7) === 'http://') {
    urlDatabase[randomName] = { longURL: newLongUrl, userID: req.session["user_id"] };  // check if contains http: already
  } else {
    urlDatabase[randomName] = { longURL: `https://${newLongUrl}`, userID: req.session["user_id"] };  // check if contains https: already
  }
  res.redirect(`/urls/${randomName}`);

});
//change url databases to the filtered databases and for delete and edit
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session["user_id"];
  if (!urlDatabase[id]) {
    return res.status(404).send("Error 404 not found");
  }
  if (!loggedIn(req, users)) {
    return res.send("Please login to view this content.");
  }
  const filteredUrlDatabase = urlsForUser(userId, urlDatabase);
  if(!filteredUrlDatabase[id]) {
    return res.status(401).send("Only owners can edit their own urls");
  }
  const longURL = urlDatabase[id].longURL;
  const templateVars = {
    id,
    longURL,
    urls: filteredUrlDatabase,
    user: users[req.session["user_id"]],
  };

  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {   // redirect to actual website
  const id = req.params.id;
  if (!urlDatabase[id].longURL) {
    return res.send("the short url doesnt exist");
  }
  const longURL = urlDatabase[id].longURL;

  res.redirect(longURL);

});

app.post("/urls/:id/delete", (req, res) => {   // redirect to  summary id page
  const userId = req.session["user_id"];
  const deleteshortUrl = req.params.id;
  const filteredUrlDatabase = urlsForUser(userId, urlDatabase);
  let doesExist = false; // the url does not belong to that obj
  if (!userId) {
    return res.status(400).send("User not found!");
  }
  if (!req.session.user_id) {
    return res.status(401).send("User is not logged in to TinyUrl");
  }
  // we want to check the deletedshort url exists in the list of filtered urls or not, owned by current user
  for (let shortUrl in filteredUrlDatabase) {
    if (shortUrl === deleteshortUrl) {
      doesExist = true; // if it does, then we change this to true
    }
  }
  if (doesExist === false) { // then send an error
    return res.status(402).send("Only Owners can delete URLs");
  }

  // if true then we can delete the url
  delete urlDatabase[deleteshortUrl];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  const newLongUrl = req.body.longUrl;
  if (!loggedIn(req, users)) {
    return res.status(400).send("Sorry you need to log in to edit");
  }

  if (newLongUrl.slice(0, 8) === 'https://' || newLongUrl.slice(0, 7) === 'http://') {
    urlDatabase[shortUrl] = { longURL: newLongUrl, userID: req.session["user_id"] };  // adds http: into input feild so http not manually required
  } else {
    urlDatabase[shortUrl] = { longURL: `https://${newLongUrl}`, userID: req.session["user_id"] };  // check if contains https: already
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userId = findUserByEmail(email, users);
  emptyFields(req, res);
  if (!userId) {
    return res.status(400).send("User not found!");
  }
  //comparing plain password to hash
  if (!bcrypt.compareSync(req.body.password, users[userId].password)) {

    return res.status(400).send("Incorrect password");
  }
  req.session["user_id"] = userId;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  // const user = users[getUserByEmail(req)];
  const user = req.body.email;
  const templateVars = { user };
  if (loggedIn(req, users)) {
    return res.redirect('/urls');
  }

  res.render("login", templateVars);
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/register", (req, res) => {
  const templateVars = { user: null };
  if (loggedIn(req, users)) {
    return res.redirect('/urls');
  }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user_id = generateRandomString();
  emptyFields(req, res);
  const foundUser = findUserByEmail(email, users);
  if (foundUser) {
    //respond with error email in use
    res.status(400).send("400 User Already in Database");
  } else {
    const newUser = {
      id: user_id,
      email: email,
      password: hashedPassword
    };
    users[newUser.id] = newUser;
    // console.log(users)
    req.session['user_id'] = user_id;
    res.redirect('/urls');
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});