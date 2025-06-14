const User = require("../models/User");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Please singup to the portal" });
  }
  const validate = await bcrypt.compare(password, user.password);
  console.log(user, validate);
  if (!validate) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // TEMP: Attach to req.user (in prod use session/JWT)
  req.user = user;
  console.log(req.user)

  res.status(200).json({
    message: "Login successful",
    user: {
      userId:user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

module.exports = { register, login };
