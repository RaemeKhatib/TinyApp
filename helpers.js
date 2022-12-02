const generateRandomString = () => {
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
};

const findUserByUser_Id = (user_id, users) => {
  return users[user_id];
};

const findUserByEmail = (email, users) => {
  for (const user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
};

const emptyFields = (req, res) => {
  if (!req.body.email || !req.body.password) {
    //respond with an error
    res.status(400).send("400 Bad Request - ");
    return;
  }
};

const loggedIn = (req, users) => {
  if (!req.session.user_id) {
    console.log(1);
    return false;

  }

const cookiesID = req.session.user_id
  if (!findUserByUser_Id(cookiesID, users)) {
    console.log(2);
    return false;
  }
//password- needs to be fixed
  return true;
};

const urlsForUser = (user_id, urlDatabase) => {
  const filteredURLS = {};
  for (const urlId in urlDatabase) {
    if (user_id === urlDatabase[urlId].userID) {
      filteredURLS[urlId] = urlDatabase[urlId];
    }
  } return filteredURLS;
};

module.exports = {
  urlsForUser,
  loggedIn,
  emptyFields,
  findUserByEmail,
  findUserByUser_Id,
  generateRandomString

}