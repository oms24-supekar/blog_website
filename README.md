# Blog Website

A lightweight blog app with a **vanilla JavaScript frontend** and **Express + MongoDB backend**.  
Posts persist across restarts and devices with automatic fallback to localStorage when offline.

## Features

- ✨ Create, edit, and delete blog posts
- 📁 Categorize posts by hierarchical domains (e.g., `technology/web/javascript`)
- 💾 **Persistent storage** via MongoDB (survives restarts & works across devices)
- 📱 Responsive design for desktop and mobile
- 🌙 Dark mode CSS support (easily customizable)
- 📡 **Works offline** – automatically falls back to localStorage if API is unavailable
- 🏷️ Click category headings to filter posts by domain

## Tech Stack

- **Frontend:** HTML5, vanilla JavaScript (zero frameworks)
- **Backend:** Express.js
- **Database:** MongoDB (Atlas or local)
- **Styling:** CSS3 (responsive, grid/flexbox)
- **Persistence:** localStorage (fallback) + MongoDB (primary)

## Quick Start

### Prerequisites

1. **Node.js** (v18+): [Download](https://nodejs.org/)
2. **MongoDB** (choose one):
   - **Local:** Install MongoDB Community or run Docker: `docker run -d -p 27017:27017 mongo`
   - **Cloud:** Free tier at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Setup

1. **Clone/navigate to the repo**:
   ```bash
   cd blog_website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure MongoDB** (create `.env` from `.env.example`):
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set `MONGODB_URI`:
   - **Local MongoDB:** `mongodb://localhost:27017/blog_website`
   - **MongoDB Atlas:** `mongodb+srv://username:password@cluster.mongodb.net/blog_website?retryWrites=true&w=majority`

4. **Start the server**:
   ```bash
   npm start
   # Or for auto-reload during development:
   npm run dev
   ```

5. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Usage

### Creating Posts

1. Click **"Create New Post"**
2. Fill in:
   - **Title** (required)
   - **Author** (optional, defaults to "Anonymous")
   - **Domain** (optional, e.g., `tech/web/javascript`)
   - **Content** (required)
3. Click **"Publish Post"**

### Organizing by Domain Hierarchy

Example domain paths:
```
hobby/gaming/rpg
hobby/gaming/strategy
hobby/music/jazz
hobby/music/classical
```

Posts automatically group under these paths. Click any category heading to filter.

### Editing & Deleting

- **Edit:** Click "Edit" on any post card
- **Delete:** Click "Delete" (with confirmation)

## Data Persistence

### With MongoDB (Default)

- Posts saved to MongoDB on every CRUD operation
- Data persists across server restarts
- Accessible from any device via the API
- Automatic fallback to localStorage if MongoDB is unavailable

### Offline Mode (localStorage only)

If MongoDB isn't available, the app caches posts in localStorage automatically.  
To use **only** localStorage (set `USE_API = false` in `app.js`), useful for learning or deployments without a database.

## Environment Configuration

Create a `.env` file (use `.env.example` as template):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

## API Endpoints

All responses are JSON.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Fetch all posts |
| POST | `/api/posts` | Create a new post |
| GET | `/api/posts/:id` | Fetch a specific post |
| PUT | `/api/posts/:id` | Update a post |
| DELETE | `/api/posts/:id` | Delete a post |

Example POST request:
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"World","domain":"test"}'
```

## Deploy

### Render (Recommended)

1. Push to GitHub  
2. Sign up at [render.com](https://render.com)
3. Create a new **Web Service**, connect your repo
4. Set environment variables in Render dashboard:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `NODE_ENV` = production
5. Deploy!

### Heroku

```bash
heroku login
heroku create your-app-name
heroku config:set MONGODB_URI="your-mongodb-uri"
git push heroku main
```

### Other Platforms

Similar setup: deploy Node.js app, set `MONGODB_URI` env var, ensure port is `process.env.PORT`.

## Development

### Run with auto-reload

```bash
npm run dev
# Uses nodemon to restart on file changes
```

### Project Structure

```
blog_website/
├── index.html       # Frontend (single-page app)
├── app.js           # Client-side logic + API calls
├── style.css        # Styling
├── server.js        # Express backend + MongoDB routes
├── package.json     # Dependencies
├── .env             # Configuration (gitignored)
└── .env.example     # Example config
```

## Future Ideas

- **Search/Filter:** Full-text search across posts
- **Tags:** In addition to domain hierarchy
- **Comments:** Per-post discussions
- **Auth:** User accounts & login
- **Export/Import:** JSON backups
- **Markdown Support:** Rich text in posts

## Notes

- This is a **learning project**. For production, add authentication, validation, and rate limiting.
- localStorage has a ~5-10 MB limit; MongoDB has no such limit.
- If MongoDB is down but the app is running, posts still work via localStorage cache.

---

Happy blogging! 📝

