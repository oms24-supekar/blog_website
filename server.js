const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_website';

// ============================================================================
// Middleware
// ============================================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files from root

// ============================================================================
// MongoDB Connection
// ============================================================================
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✓ MongoDB connected'))
  .catch((err) => {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ============================================================================
// Post Schema & Model
// ============================================================================
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Anonymous' },
    domain: { type: String, default: '' },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

// ============================================================================
// Routes
// ============================================================================

// GET / - serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// GET /api/posts - fetch all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts - create a new post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author, domain } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const post = new Post({
      title: title.trim(),
      content: content.trim(),
      author: author?.trim() || 'Anonymous',
      domain: domain?.trim() || '',
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:id - fetch a specific post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/posts/:id - update a post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, content, author, domain } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        content: content.trim(),
        author: author?.trim() || 'Anonymous',
        domain: domain?.trim() || '',
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:id - delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Start Server
// ============================================================================
app.listen(PORT, () => {
  console.log(`✓ Blog server running on http://localhost:${PORT}`);
  console.log(`✓ MongoDB URI: ${MONGODB_URI}`);
});
