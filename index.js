const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

let posts = [];
let nextId = 1;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/posts/new', (req, res) => {
  res.render('new');
});

app.post('/posts', (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content) {
    return res.status(400).render('new', {
      error: 'Title and content are required.',
      values: { title, content, author }
    });
  }

  posts.unshift({
    id: nextId++,
    title: title.trim(),
    content: content.trim(),
    author: author?.trim() || 'Anonymous',
    createdAt: new Date()
  });

  return res.redirect('/');
});

app.get('/posts/:id/edit', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find((item) => item.id === id);

  if (!post) {
    return res.status(404).send('Post not found');
  }

  return res.render('edit', { post, error: null });
});

app.post('/posts/:id/update', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find((item) => item.id === id);

  if (!post) {
    return res.status(404).send('Post not found');
  }

  const { title, content, author } = req.body;

  if (!title || !content) {
    return res.status(400).render('edit', {
      error: 'Title and content are required.',
      post: {
        ...post,
        title,
        content,
        author
      }
    });
  }

  post.title = title.trim();
  post.content = content.trim();
  post.author = author?.trim() || 'Anonymous';

  return res.redirect('/');
});

app.post('/posts/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  posts = posts.filter((item) => item.id !== id);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Blog app listening on http://localhost:${port}`);
});
