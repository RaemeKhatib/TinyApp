const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

const generateRandomString = () => {
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
};
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const findUserByEmail = (email) => {
  console.log(email, "<=")
  for (const user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
  return null;
};

const emptyFields = (req, res) => {
  if (!req.body.email || !req.body.password) {
    //respond with an error
    res.status(400).send("400 Bad Request - ");
    return;
  }
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
  "1234": {
    id: "1234",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
};
//
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
  const user = users[req.cookies["user_id"]?.id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]?.id] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  const randomName = generateRandomString();
  const newLongUrl = req.body.longURL;
  if (newLongUrl.slice(0, 8) === 'https://' || newLongUrl.slice(0, 7) === 'http://') {
    urlDatabase[randomName] = newLongUrl;  // check if contains http: already
  } else {
    urlDatabase[randomName] = `https://${newLongUrl}`;  // check if contains http: already
  }
  // check if contains http: already
  res.redirect(`/urls/${randomName}`);
});

app.get("/urls/:id", (req, res) => {   // redirect to  summary id page
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {   // redirect to actual website
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {   // redirect to  summary id page
  const shortUrl = req.params.id;
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  const newLongUrl = req.body.longUrl;

  if (newLongUrl.slice(0, 8) === 'https://' || newLongUrl.slice(0, 7) === 'http://') {
    urlDatabase[shortUrl] = newLongUrl;  // adds http: into input feild so http not manually required
  } else {
    urlDatabase[shortUrl] = `https://${newLongUrl}`;  // check if contains https: already
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = findUserByEmail(email);
  emptyFields(req,res)
if(!userId) {
  return res.status(400).send("User not found")
}
if(password !== users[userId].password) {
  return res.status(400).send("Incorrect password")
}
  const cookieObj = {
    email,
    password,
    id: userId
  };
  res.cookie('user_id', cookieObj);
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  // const user = users[getUserByEmail(req)];
  const user = req.body.email;
  const templateVars = { user };
  res.render("login", templateVars);
  
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = randomName;
emptyFields(req,res);
  // if (!email || !password) {
  //   //respond with an error
  //   res.status(400).send("400 Bad Request");
  // }
  const foundUser = findUserByEmail(email);
  if (foundUser) {
    //respond with error email in use 
    res.status(400).send("400 User Already in Database");
  } else {
    const newUser = {
      id: generateRandomString(),
      email: email,
      password: password
    };
    users[newUser.id] = newUser;
    // console.log(users)
    res.cookie('user_id', newUser);
    res.redirect('/urls');
  }
});
