import pkg from 'pg';
const { Pool } = pkg;

import pool from '../config/db';

export const createBlog = async (title, content, imagePath) => {
  const result = await pool.query(
    'INSERT INTO blogs (title, content, image) VALUES ($1, $2, $3) RETURNING *',
    [title, content, imagePath]
  );
  return result.rows[0];
};

export const getAllBlogs = async () => {
  const result = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
  return result.rows;
};

export const getBlogById = async (id) => {
  const result = await pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
  return result.rows[0];
};

export const updateBlog = async (id, title, content, imagePath) => {
  const result = await pool.query(
    'UPDATE blogs SET title = $1, content = $2, image = $3 WHERE id = $4 RETURNING *',
    [title, content, imagePath, id]
  );
  return result.rows[0];
};

export const deleteBlog = async (id) => {
  const result = await pool.query('DELETE FROM blogs WHERE id = $1', [id]);
  return result;
};
