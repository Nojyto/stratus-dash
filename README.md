# Stratus Dash

![Screenshot of the new-tab page](docs/images/new-tab.png)

Stratus Dash is a personal productivity dashboard that replaces your browser's "New Tab" page. It's designed to be fast, and with a modern design, to give you quick access to your most-used links, tasks, weather, stocks, and news.

## Features

### New Tab Page

- **Beautiful Background:** Shows a new high-quality image from Unsplash every hour, or a simple gradient.
- **Wallpaper Controls:**
  - Load a new random background.
  - Lock your favorite background so it stays.
  - View the photographer's profile on Unsplash.
- **Search Bar:** Quickly search the web. You can right-click the search button to switch between Google, DuckDuckGo, and Brave.
- **Quick Links:** Add, edit, and delete your favorite websites. You can also drag and drop them to re-order.
- **Todo Lists:**
  - **Daily Tasks:** A list that resets every day.
  - **General Todos:** A list for tasks that don't have a deadline.
  - Both lists support adding, editing, deleting, and re-ordering.
- **Weather Widget:** Shows the current temperature, high/low, and a simple hourly forecast for any location you set.
- **News Widget:** Shows the latest top headlines. You can customize the country and news categories in the settings.
- **Stock Widgt:** Shows the current price of some stocks.
- **Theme Controls:**
  - Switch between Light, Dark, and System modes.
  - A "Custom" theme option with an editor to create your own color scheme.

### Notes Dashboard

- **File Explorer:** Create, rename, and delete notes and folders.
- **Markdown Editor:** A simple and clean editor for writing your notes.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Backend:** [Supabase](https://supabase.com/) (Auth, Postgres Database, Row Level Security)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **External APIs:**
  - [Unsplash](https://unsplash.com/developers) (for wallpapers)
  - [OpenWeatherMap](https://openweathermap.org/) (for weather)
  - [NewsAPI.org](https://newsapi.org/) (for news)
  - [Finnhub](https://finnhub.io/dashboard) (for stock prices)
- **Package Manager:** [pnpm](https://pnpm.io/)

## How to Get Started

### 1. Get the Code

Clone the project to your computer:

```bash
git clone https://github.com/Nojyto/stratus-dash.git
cd stratus-dash
```

### 2. Install Packages

This project uses `pnpm`. Install all the packages:

```bash
pnpm install
```

### 3. Set up Supabase

This project needs a Supabase project for the database and user sign-ups.

1. **Create a Project:** Go to [Supabase.com](https://supabase.com/) and create a new project.
2. **Run the SQL Schema:**
   - In your Supabase project, go to the **SQL Editor**.
   - Click **+ New query**.
   - Copy the entire contents of the `schema.sql` file (included in this project) and paste it into the query window.
   - Click **Run**.
   - This will create all the tables (`notes`, `folders`, `quick_links`, etc.) and set up the security rules so users can only see their own data.

### 4. Set up Environment Variables

1. **Copy the Example:** In the project folder, make a copy of `.env.example` and rename it to `.env.local`.

   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the Keys:** Open the new `.env` file and add your secret keys.

### 5. Develop

#### Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should be able to sign up for a new account and start using the app.

#### Format and lint

```bash
pnpm format
pnpm lint
```

#### Add additional UI components

```bash
pnpm dlx shadcn@latest add context-menu
```

## Project Structure

Here is a simple overview of the project's folders:

- `/app`: Contains all the pages (routes) for the app.
  - `/app/auth`: The sign-up, login, and forgot password pages.
  - `/app/dashboard`: The note-taking app.
  - `/app/new-tab`: The main "New Tab" dashboard page and its server actions.
  - `/app/page.tsx`: The simple landing page.
- `/components`: All the reusable React components, organized by feature.
- `/lib`: Helper functions and shared code.
  - `/lib/supabase`: Code for connecting to Supabase.
  - `/lib/external`: Code for fetching data from external APIs (Unsplash, etc.).
  - `/lib/utils.ts`: Small helper functions.
