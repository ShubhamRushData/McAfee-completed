import { pool } from '../config/db.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';  // Assuming uploadToCloudinary handles file upload to Cloudinary

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting blogs:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create blog
export const createBlog = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    let imageUrl = '';

    // Handle file upload using multer (Cloudinary upload)
    if (req.file) {
      // If a file is uploaded, upload it to Cloudinary
      const uploaded = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploaded.secure_url;
    } else if (image) {
      // If an image URL is provided, use it directly
      imageUrl = image;
    } else {
      // Return an error if neither file nor image URL is provided
      return res.status(400).json({ message: 'No image file or image URL provided' });
    }

    // Insert the new blog into the database
    const newBlog = await pool.query(
      'INSERT INTO blogs (title, description, image_url) VALUES ($1, $2, $3) RETURNING *',
      [title, description, imageUrl]
    );

    res.status(201).json(newBlog.rows[0]);
  } catch (error) {
    console.error('Error creating blog:', error);  // Enhanced logging for error
    res.status(500).json({ message: error.message });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM blogs WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    let imageUrl = '';

    // Handle image URL if provided
    if (image) {
      imageUrl = image;
    }

    // Update the blog in the database
    const updatedBlog = await pool.query(
      'UPDATE blogs SET title = $1, description = $2, image_url = $3 WHERE id = $4 RETURNING *',
      [title, description, imageUrl, id]
    );

    if (updatedBlog.rowCount === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(updatedBlog.rows[0]);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: error.message });
  }
};
