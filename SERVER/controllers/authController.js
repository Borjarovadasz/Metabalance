const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const usersFile = __dirname + "/../data/users.json";

const readUsers = () => JSON.parse(fs.readFileSync(usersFile));
const writeUsers = (data) => fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));

// REGISZTRÁCIÓ
exports.registerUser = (req, res) => {
  const { name, email, password } = req.body;

  const users = readUsers();

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "Ezzel az email-el már regisztráltak!" });
  }

  const hashed = bcrypt.hashSync(password, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashed
  };

  users.push(newUser);
  writeUsers(users);

  res.json({ message: "Sikeres regisztráció" });
};

// LOGIN
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) return res.status(400).json({ message: "Hibás email vagy jelszó" });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(400).json({ message: "Hibás email vagy jelszó" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
};

// SAJÁT ADATOK (védett)
exports.getUserData = (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.userId);

  res.json({ id: user.id, name: user.name, email: user.email });
};
