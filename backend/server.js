const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const pgScholarRoutes = require('./routes/pgScholarRoutes');

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json()); 


app.get('/', (req, res) => {
  res.send('Faculty Portal Backend Running');
});

app.use('/api/pgscholars', pgScholarRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
