import express from 'express';
import multer from 'multer';
import { pool } from "../config/db.js";
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Multer Storage - memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });


// GET single blog by ID
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting blogs:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET all blogs
// router.get('/', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM blogs ORDER BY id DESC');
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error getting blogs:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// Create new blog
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    let imageUrl = '';

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploaded.secure_url;
    } else {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const newBlog = await pool.query(
      'INSERT INTO blogs (title, description, image_url) VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );

    res.status(201).json(newBlog.rows[0]);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete blog
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if blog exists
    const check = await pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Delete the blog
    await pool.query('DELETE FROM blogs WHERE id = $1', [id]);

    res.status(204).send(); // 204 means No Content
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update blog
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    let imageUrl = '';

    // Check if blog exists
    const check = await pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploaded.secure_url;
    } else {
      // Agar nayi image nahi bheji hai to purani image rakhni hai
      imageUrl = check.rows[0].image_url;
    }

    const updatedBlog = await pool.query(
      'UPDATE blogs SET title = $1, description = $2, image_url = $3 WHERE id = $4 RETURNING *',
      [title, description, imageUrl, id]
    );

    res.json(updatedBlog.rows[0]);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM blogs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog by id:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
