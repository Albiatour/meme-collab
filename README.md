# MemeCollab

A collaborative space for creating memes with friends. Real-time chat with image sharing.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth + Database + Storage + Realtime)
- **Tailwind CSS**
- **TypeScript**

## Features

- User authentication (email + password)
- Create and manage meme projects
- Real-time messaging
- Image upload and sharing
- Responsive design

## Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd meme-collab
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready

### 3. Configure Environment

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials from Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key

### 4. Setup Database

1. Go to your Supabase project > SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL to create tables, policies, and triggers

### 5. Configure Authentication

1. Go to Authentication > Providers
2. Ensure Email provider is enabled
3. (Optional) Disable email confirmation for faster testing:
   - Go to Authentication > Settings
   - Turn off "Enable email confirmations"

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
meme-collab/
├── app/
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   ├── login/page.tsx      # Login page
│   └── register/page.tsx   # Registration page
├── components/
│   ├── Dashboard.tsx       # Main app container
│   ├── Sidebar.tsx         # Projects sidebar
│   ├── ChatArea.tsx        # Chat container
│   ├── MessageBubble.tsx   # Message component
│   └── MessageInput.tsx    # Input with image upload
├── lib/
│   ├── types.ts            # TypeScript types
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       ├── server.ts       # Server Supabase client
│       └── middleware.ts   # Auth middleware helper
├── supabase/
│   └── schema.sql          # Database schema
└── middleware.ts           # Next.js middleware
```

## Database Schema

### Tables

- **profiles**: User profiles (id, username, avatar_url)
- **projects**: Meme projects (id, title, created_by)
- **messages**: Chat messages (id, project_id, user_id, content, image_url)

### Storage

- **meme-images**: Public bucket for uploaded images

## Usage

1. Register a new account with email, password, and username
2. Create a new meme project
3. Start chatting and sharing images
4. All users can see all projects
5. Only project creators can delete their projects
6. Messages appear in real-time for all users

## License

MIT
