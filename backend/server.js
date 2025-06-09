const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
<<<<<<< HEAD
const pgScholarRoutes = require('./routes/pgScholarRoutes');
const publicationRoutes = require('./routes/publicationRoutes');

=======
const pgScholarRoutes = require("./routes/pgScholarRoutes");
const facultyRoutes = require("./routes/faculty");
>>>>>>> 60c38a58e9194827d87974be43650caefa092127
dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Faculty Portal Backend Running");
});
// Temporary middleware to simulate login
app.use((req, res, next) => {
  req.user = {
    _id: '6845c010f4d7457e793dfd3d', // faculty
    role: 'faculty',
    // _id: "6845bcc003d9421f7b3a4cd0", // admin
    // role: "admin",
    // _id: "6845c02cf4d7457e793dfd41", // hod
    // role: "hod",
  };
  next();
});

<<<<<<< HEAD
app.use('/api/pgscholars', pgScholarRoutes);
app.use('/api/publications', publicationRoutes);


=======
app.use("/api/pgscholars", pgScholarRoutes);
app.use("/api/faculty", facultyRoutes);
>>>>>>> 60c38a58e9194827d87974be43650caefa092127

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
