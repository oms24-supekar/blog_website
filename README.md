# Blog Website

A simple in-memory blog application built with Node.js, Express, and EJS.

## Features

- Create new blog posts
- View all posts on the home page
- Edit existing posts
- Delete posts
- Categorize posts by hierarchical domain paths (e.g. `technology/web/javascript`)
- Responsive and clean UI styling for desktop and mobile

## Tech Stack

- Node.js
- Express.js
- EJS templating
- CSS (no frontend framework)

## Categories & Domain Hierarchy

You can organize posts by providing a **domain path** when creating or editing a post. Use forward slashes to define levels, for example:

```
technology/web/javascript
```

The home page groups posts into a nested structure based on these paths, and you can click on a category heading to filter by that branch.

### UI Upgrades
A separate stylesheet `public/ui-upgrades.css` is provided for optional design enhancements.
Link it after `styles.css` in your templates (already added in example views) and modify it to try things like dark mode, hover effects, and responsive layouts. The file contains comments and sample rules to get you started.

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

> Note: Posts are stored in memory and reset when the server restarts.
> THIS PROJECT IS A PRATICE AI GENERATED PROJECT THROUGH WHICH I AM GAINING NEW SKILLS

