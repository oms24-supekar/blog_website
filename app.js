// ============================================================================
// Blog App - Vanilla JavaScript + localStorage + MongoDB API
// ============================================================================

const API_BASE = '/api/posts';
const USE_API = true; // Set to false to use localStorage only (offline mode)

class BlogApp {
  constructor() {
    this.posts = [];
    this.nextId = 1;
    this.editingId = null;
    this.currentCategory = null;
    this.apiAvailable = true;
    this.init();
  }

  init() {
    this.loadInitialData();
    this.setupEventListeners();
    this.render();
  }

  // ========== Data Loading ==========
  async loadInitialData() {
    if (USE_API) {
      await this.loadFromAPI();
    } else {
      this.loadFromStorage();
    }
  }

  async loadFromAPI() {
    try {
      const response = await fetch(API_BASE);
      if (response.ok) {
        const data = await response.json();
        this.posts = data.map((post) => ({
          ...post,
          id: post._id, // MongoDB uses _id
          createdAt: post.createdAt,
        }));
        this.apiAvailable = true;
        // Update localStorage as cache
        this.saveToStorage();
      }
    } catch (err) {
      console.warn('API unavailable, falling back to localStorage:', err);
      this.apiAvailable = false;
      this.loadFromStorage();
    }
  }

  loadFromStorage() {
    const data = localStorage.getItem('blog_posts');
    if (data) {
      this.posts = JSON.parse(data);
      const maxId = this.posts.reduce((max, p) => Math.max(max, p.id || 0), 0);
      this.nextId = maxId + 1;
    }
  }

  saveToStorage() {
    localStorage.setItem('blog_posts', JSON.stringify(this.posts));
  }

  // ========== Event Listeners ==========
  setupEventListeners() {
    const createBtn = document.getElementById('createPostBtn');
    const domainBookBtn = document.getElementById('domainBookBtn');
    const modal = document.getElementById('postModal');
    const domainBookModal = document.getElementById('domainBookModal');
    const closeBtn = document.querySelector('.close');
    const closeDomainBookBtn = document.getElementById('closeDomainBook');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('postForm');
    const clearCategoryBtn = document.getElementById('clearCategoryBtn');

    createBtn.addEventListener('click', () => this.openModal());
    domainBookBtn.addEventListener('click', () => this.openDomainBook());
    closeBtn.addEventListener('click', () => this.closeModal());
    closeDomainBookBtn.addEventListener('click', () => this.closeDomainBook());
    cancelBtn.addEventListener('click', () => this.closeModal());
    window.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
      if (e.target === domainBookModal) this.closeDomainBook();
    });
    form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    clearCategoryBtn.addEventListener('click', () => this.clearCategory());
    
    // Domain book link delegation
    document.addEventListener('click', (e) => {
      if (e.target.closest('.domain-link')) {
        const domain = e.target.closest('.domain-link').dataset.domain;
        this.filterByCategory(domain);
        this.closeDomainBook();
      }
    });
  }

  // ========== Modal Management ==========
  openModal(postId = null) {
    const modal = document.getElementById('postModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('postForm');

    form.reset();
    this.editingId = postId;

    if (postId) {
      const post = this.posts.find((p) => p.id === postId);
      if (post) {
        modalTitle.textContent = 'Edit Post';
        submitBtn.textContent = 'Save Changes';
        document.getElementById('title').value = post.title;
        document.getElementById('author').value = post.author;
        document.getElementById('domain').value = post.domain || '';
        document.getElementById('content').value = post.content;
      }
    } else {
      modalTitle.textContent = 'Create a New Post';
      submitBtn.textContent = 'Publish Post';
    }

    modal.classList.remove('hidden');
  }

  closeModal() {
    const modal = document.getElementById('postModal');
    modal.classList.add('hidden');
    this.editingId = null;
  }

  // ========== Domain Book ==========
  openDomainBook() {
    const domainBookModal = document.getElementById('domainBookModal');
    domainBookModal.classList.remove('hidden');
    this.renderDomainBook();
  }

  closeDomainBook() {
    const domainBookModal = document.getElementById('domainBookModal');
    domainBookModal.classList.add('hidden');
  }

  extractAllDomains() {
    const domains = new Set();
    this.posts.forEach((post) => {
      if (post.domain) {
        const parts = post.domain.split('/').filter(Boolean);
        let path = '';
        parts.forEach((part) => {
          path = path ? `${path}/${part}` : part;
          domains.add(path);
        });
      }
    });
    return Array.from(domains).sort();
  }

  buildDomainIndex() {
    const index = {};
    const allDomains = this.extractAllDomains();

    allDomains.forEach((domain) => {
      const count = this.posts.filter((p) => p.domain && p.domain.startsWith(domain)).length;
      index[domain] = count;
    });

    return index;
  }

  renderDomainBook() {
    const container = document.getElementById('domainBookList');
    const domainIndex = this.buildDomainIndex();

    if (Object.keys(domainIndex).length === 0) {
      container.innerHTML = '<p class="empty-domains">No domains yet. Create posts with domain paths to populate the domain book.</p>';
      return;
    }

    // Group domains by level for visual hierarchy
    const grouped = this.groupDomainsByLevel(Object.keys(domainIndex));
    container.innerHTML = this.renderDomainTree(grouped, domainIndex);
  }

  groupDomainsByLevel(domains) {
    const root = { children: {} };

    domains.forEach((domain) => {
      const parts = domain.split('/');
      let node = root;

      parts.forEach((part, idx) => {
        if (!node.children[part]) {
          node.children[part] = { path: parts.slice(0, idx + 1).join('/'), children: {} };
        }
        node = node.children[part];
      });
    });

    return root;
  }

  renderDomainTree(node, domainIndex, level = 0) {
    if (!node.children || Object.keys(node.children).length === 0) {
      return '';
    }

    let html = `<div class="domain-tree-level level-${level}">`;

    Object.keys(node.children)
      .sort()
      .forEach((name) => {
        const child = node.children[name];
        const path = child.path;
        const count = domainIndex[path] || 0;
        const hasSubdomains = Object.keys(child.children).length > 0;

        html += `
          <div class="domain-item">
            <button 
              class="domain-link" 
              data-domain="${path}"
              title="Click to filter posts in this domain"
            >
              📁 ${name}
              <span class="domain-count">${count} post${count !== 1 ? 's' : ''}</span>
            </button>
        `;

        if (hasSubdomains) {
          html += this.renderDomainTree(child, domainIndex, level + 1);
        }

        html += `</div>`;
      });

    html += '</div>';
    return html;
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim() || 'Anonymous';
    const domain = document.getElementById('domain').value.trim() || '';
    const content = document.getElementById('content').value.trim();

    if (!title || !content) {
      alert('Title and content are required.');
      return;
    }

    try {
      if (this.editingId) {
        await this.updatePost(this.editingId, { title, author, domain, content });
      } else {
        await this.createPost({ title, author, domain, content });
      }
      this.saveToStorage();
      this.closeModal();
      this.render();
    } catch (err) {
      alert('Error saving post: ' + err.message);
    }
  }

  // ========== API Calls ==========
  async createPost(data) {
    if (!this.apiAvailable || !USE_API) {
      // Offline: save to localStorage only
      this.posts.unshift({
        id: this.nextId++,
        ...data,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    const post = await response.json();
    this.posts.unshift({
      ...post,
      id: post._id,
    });
  }

  async updatePost(postId, data) {
    if (!this.apiAvailable || !USE_API) {
      // Offline: update localStorage only
      const post = this.posts.find((p) => p.id === postId);
      if (post) {
        Object.assign(post, data);
      }
      return;
    }

    const response = await fetch(`${API_BASE}/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update post');
    }

    const updated = await response.json();
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      Object.assign(post, { ...updated, id: updated._id });
    }
  }

  async deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      if (this.apiAvailable && USE_API) {
        const response = await fetch(`${API_BASE}/${postId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete post');
        }
      }

      this.posts = this.posts.filter((p) => p.id !== postId);
      this.saveToStorage();
      this.render();
    } catch (err) {
      alert('Error deleting post: ' + err.message);
    }
  }

  // ========== Category Tree ==========
  buildCategoryTree(posts) {
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

  // ========== Filtering ==========
  filterByCategory(categoryPath) {
    this.currentCategory = categoryPath;
    this.render();
  }

  clearCategory() {
    this.currentCategory = null;
    this.render();
  }

  getDisplayPosts() {
    if (!this.currentCategory) {
      return this.posts;
    }
    return this.posts.filter((post) => post.domain && post.domain.startsWith(this.currentCategory));
  }

  // ========== Render ==========
  render() {
    this.renderCategoryInfo();
    this.renderPosts();
  }

  renderCategoryInfo() {
    const categoryInfo = document.getElementById('categoryInfo');
    if (this.currentCategory) {
      categoryInfo.classList.remove('hidden');
      document.getElementById('categoryName').textContent = this.currentCategory;
    } else {
      categoryInfo.classList.add('hidden');
    }
  }

  renderPosts() {
    const container = document.getElementById('postsContainer');
    const emptyState = document.getElementById('emptyState');
    const displayPosts = this.getDisplayPosts();
    const tree = this.buildCategoryTree(displayPosts);

    const hasAnyPosts = (node) => {
      if (node.posts && node.posts.length) return true;
      return Object.values(node.children || {}).some(hasAnyPosts);
    };

    if (!hasAnyPosts(tree)) {
      container.innerHTML = '<section class="empty-state"><p>Write your first post to get started.</p></section>';
      return;
    }

    container.innerHTML = '';
    this.renderNode(container, tree, 0, '');
  }

  renderNode(container, node, level, path) {
    if (node.posts && node.posts.length) {
      const section = document.createElement('section');
      section.className = `post-list level-${level}`;

      node.posts.forEach((post) => {
        const article = document.createElement('article');
        article.className = 'post-card';

        const createdDate = new Date(post.createdAt).toLocaleString();
        const domainHtml = post.domain ? `<p class="domain"><small>${post.domain}</small></p>` : '';

        article.innerHTML = `
          <div class="post-meta">
            <p class="author">By ${post.author}</p>
            <p>${createdDate}</p>
            ${domainHtml}
          </div>
          <h2>${post.title}</h2>
          <p class="post-content">${post.content}</p>
          <div class="actions">
            <button class="button" data-post-id="${post.id}" data-action="edit">Edit</button>
            <button class="button button-danger" data-post-id="${post.id}" data-action="delete">Delete</button>
          </div>
        `;

        article.querySelector('[data-action="edit"]').addEventListener('click', () => this.openModal(post.id));
        article.querySelector('[data-action="delete"]').addEventListener('click', () => this.deletePost(post.id));

        section.appendChild(article);
      });

      container.appendChild(section);
    }

    Object.keys(node.children || {}).forEach((name) => {
      const childPath = path ? `${path}/${name}` : name;
      const categoryDiv = document.createElement('div');
      categoryDiv.className = `category level-${level}`;

      const heading = document.createElement(`h${Math.min(6, level + 2)}`);
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = name;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.filterByCategory(childPath);
      });

      heading.appendChild(link);
      categoryDiv.appendChild(heading);
      this.renderNode(categoryDiv, node.children[name], level + 1, childPath);

      container.appendChild(categoryDiv);
    });
  }
}

// ============================================================================
// Initialize on DOM Ready
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  new BlogApp();
});
