import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import blogRoutes from './src/routes/blogRoutes.js';
import { connectDB } from './src/config/db.js';  // Import the connectDB function

const app = express();
const port = process.env.PORT ||5000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

connectDB();
// Set up multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.use('/api/posts', blogRoutes);

// app.use('/api/posts', upload.single('file'), blogRoutes);  // Here multer middleware is applied to the /api/posts route

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
