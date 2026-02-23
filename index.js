const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

let posts = [];
let nextId = 1;

// helper to build a hierarchical tree based on the "domain" string stored
// on each post. the path is slash-separated (e.g. "tech/web/javascript").
// the resulting tree has nodes with `posts` array and `children` object.
function buildCategoryTree(posts) {
  const root = { posts: [], children: {} };

  posts.forEach((post) => {
    const path = post.domain || '';
    const parts = path
      .split('/')
      .map((p) => p.trim())
      .filter(Boolean);
    let node = root;
    parts.forEach((part) => {
      if (!node.children[part]) {
        node.children[part] = { posts: [], children: {} };
      }
      node = node.children[part];
    });
    node.posts.push(post);
  });

  return root;
}


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  // build a category tree for rendering hierarchy on the home page
  const tree = buildCategoryTree(posts);
  res.render('index', { tree, currentCategory: null });
});

// show posts in a specific domain path (and its subdomains)
app.get('/category/*', (req, res) => {
  const path = req.params[0]; // wildcard captures everything after /category/
  const filtered = posts.filter(
    (post) => post.domain && post.domain.startsWith(path)
  );
  const tree = buildCategoryTree(filtered);
  res.render('index', { tree, currentCategory: path });
});

app.get('/posts/new', (req, res) => {
  // pass an empty values object to avoid undefined errors in template
  res.render('new', { error: null, values: {} });
});

app.post('/posts', (req, res) => {
  const { title, content, author, domain } = req.body;

  console.log('POST /posts body:', req.body);
  console.log('Current posts before insert:', posts);
  console.log('nextId before insert:', nextId);

  if (!title || !content) {
    console.log('Validation failed, returning to new with values:', { title, content, author, domain });
    return res.status(400).render('new', {
      error: 'Title and content are required.',
      values: { title, content, author, domain }
    });
  }

  posts.unshift({
    id: nextId++,
    title: title.trim(),
    content: content.trim(),
    author: author?.trim() || 'Anonymous',
    domain: domain?.trim() || '',
    createdAt: new Date()
  });

  console.log('Posts after insert:', posts);

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
  console.log(`POST /posts/${id}/update body:`, req.body);
  console.log('Posts before update:', posts);

  const post = posts.find((item) => item.id === id);

  if (!post) {
    return res.status(404).send('Post not found');
  }

  const { title, content, author, domain } = req.body;

  if (!title || !content) {
    return res.status(400).render('edit', {
      error: 'Title and content are required.',
      post: {
        ...post,
        title,
        content,
        author,
        domain
      }
    });
  }

  post.title = title.trim();
  post.content = content.trim();
  post.author = author?.trim() || 'Anonymous';
  post.domain = domain?.trim() || '';

  console.log('Posts after update:', posts);
  
  return res.redirect('/');
});

app.post('/posts/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  posts = posts.filter((item) => item.id !== id);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Blog app listening on http://localhost:${3000}`);
});
