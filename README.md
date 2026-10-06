# 🎓 Yaksha Internship FAQ & Support Portal

[![Framework](https://img.shields.io/badge/Framework-Next.js%2015-blue?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-green?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Authentication](https://img.shields.io/badge/Auth-NextAuth.js%20v5-purple?style=flat-square&logo=auth0&logoColor=white)](https://authjs.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Animations](https://img.shields.io/badge/Animations-Framer%20Motion-FF69B4?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)

Welcome to **Yaksha FAQ & Support Portal** (`yaksha-faq`), a full-featured web application built to streamline onboarding, support, and query resolution for candidates of the **Vicharanashala Internship (VINS)** at **IIT Ropar**.

The platform provides interns with self-service support via interactive FAQ search, an instant assistant chatbot with verified source citations, and structured support query workflows, accompanied by a comprehensive administrative control center.

---

## 🏗️ Architecture & Data Flow

Below is the conceptual architecture showing how client components, API handlers, route guards, and database schemas integrate:

```mermaid
graph TD
    classDef client fill:#2563EB,stroke:#1D4ED8,stroke-width:2px,color:#FFF;
    classDef server fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#FFF;
    classDef db fill:#10B981,stroke:#047857,stroke-width:2px,color:#FFF;
    classDef guard fill:#EF4444,stroke:#B91C1C,stroke-width:2px,color:#FFF;

    subgraph Client ["Client Side (React 19 & Framer Motion)"]
        Landing["🏠 Home / Portal Entry"]
        FaqView["🔍 FAQ Search & Category Filter"]
        UserDash["📊 User Dashboard (Protected)"]
        ChatBot["💬 Yaksha Mini Floating Assistant"]
        AdminDash["🛠️ Admin Dashboard & Recharts Analytics"]
        Submitter["📝 Support Query / FAQ Suggestion Forms"]
    end

    subgraph Server ["Server Side (Next.js 15 App Router)"]
        Middleware["🛡️ NextAuth v5 Middleware (RBAC Guard)"]
        API_Auth["🔑 /api/auth/* (Credentials Provider)"]
        API_Chat["🤖 /api/chat (Assistant Search & History)"]
        API_FAQs["📚 /api/faqs/* (CRUD & Search Endpoint)"]
        API_Queries["✉️ /api/queries/* (Create & Reply Handler)"]
        API_Suggest["💡 /api/faq-suggestions/* (Moderate Suggestion)"]
        API_Stats["📈 /api/admin/stats (Aggregate Analytics)"]
    end

    subgraph DB ["Database Tier (MongoDB & Mongoose Schema)"]
        Coll_Users[("👤 Users Collection")]
        Coll_FAQs[("📚 FAQs Collection (Vector & Text Index)")]
        Coll_Queries[("✉️ Queries Collection")]
        Coll_Suggestions[("💡 FAQ Suggestions Collection")]
        Coll_Chat[("💬 Chat History Collection")]
    end

    Landing --> FaqView
    Landing --> ChatBot
    UserDash --> Submitter
    UserDash --> ChatBot

    %% Middleware flow
    UserDash -.-> Middleware
    AdminDash -.-> Middleware
    Middleware --> API_FAQs
    Middleware --> API_Queries
    Middleware --> API_Suggest
    Middleware --> API_Stats

    %% Direct endpoints
    Submitter --> API_Queries
    Submitter --> API_Suggest
    ChatBot --> API_Chat
    Landing --> API_Auth

    %% API to DB
    API_Auth --> Coll_Users
    API_Chat --> Coll_FAQs
    API_Chat --> Coll_Chat
    API_FAQs --> Coll_FAQs
    API_Queries --> Coll_Queries
    API_Suggest --> Coll_Suggestions
    API_Stats --> Coll_Users
    API_Stats --> Coll_FAQs
    API_Stats --> Coll_Queries
    API_Stats --> Coll_Suggestions

    class Landing,FaqView,UserDash,ChatBot,AdminDash,Submitter client;
    class Middleware guard;
    class API_Auth,API_Chat,API_FAQs,API_Queries,API_Suggest,API_Stats server;
    class Coll_Users,Coll_FAQs,Coll_Queries,Coll_Suggestions,Coll_Chat db;
```

---

## ⚡ Core Features

### 1. Unified Authentication System (NextAuth.js v5)
- **Role-Based Access Control (RBAC)**: Separates platform functionality into `user` and `admin` portals.
- **Secure Credentials Auth**: Passwords securely hashed using `bcryptjs` upon user registration.
- **Session Protection**: Protects protected sections (`/dashboard`, `/admin/*`) using Next.js Middleware.
- **Dual Login Views**: Seamlessly handles standard candidate login alongside dedicated administrator portals.

### 2. Rich Interactive FAQ Browser
- **Dynamic Search**: Instant responsive filtering with text and category matching.
- **Category Filter Pills**: Clickable category pills corresponding to primary cohort topics (NOC, Certificates, Selection, Work & Mentorship, Rosetta Journal, etc.).
- **Smooth Animations**: Animated collapsible accordions built with `framer-motion` for a clean interface.

### 3. "Yaksha Mini" Support Assistant
- **Interactive Popup**: An animated floating assistant widget located at the bottom-right corner.
- **Context-Grounded Answers**: Retrieves verified FAQ entries to answer internship questions accurately.
- **Verified Sources**: Shows source FAQ categories and questions used for generating answers.
- **Action Fallbacks**: Guides users when questions are out-of-scope with shortcuts to suggest a FAQ or submit a direct query.
- **Chat Histories**: Stores dialogues directly in `chatHistory` associated with the authenticated user session.

### 4. Support Queries & Suggestion Workflows
- **Raise Queries**: Dedicated portal to submit formal query cases complete with categorization and priority levels (`Low`, `Medium`, `High`).
- **Query Tracking**: Monitor status, timestamps, and administrator replies in real-time.
- **FAQ Suggestions**: Empower cohort members to suggest fresh FAQs, automatically routing submissions to the moderation panel.

### 5. Multi-dimensional Admin Dashboard
- **Recharts Analytics**: Interactive visual charts (Pie, Bar) outlining FAQ categories, query frequencies, and status distributions.
- **CRUD Operations**: Edit, add, or delete live FAQs dynamically with automatic index synchronization.
- **Moderation Panel**: Accept or reject community FAQ suggestions with review notes, updating the FAQ collection automatically upon approval.
- **User and Support Management**: User access management and reply modals to resolve pending support tickets.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 15.1.0 (App Router) | High-performance React framework for server components and APIs. |
| **Database** | MongoDB & Mongoose 8.8.2 | Document database with vector search and text indexing support. |
| **Authentication** | NextAuth.js v5 (Beta 25) | Unified role-based JWT authentication and middleware guards. |
| **Styling** | Tailwind CSS v4.0.0 | Utility-first styling for clean, responsive interfaces. |
| **Animations** | Framer Motion 11.11.17 | Fluid micro-interactions, page reveals, and assistant popups. |
| **Visual Reports** | Recharts 2.13.3 | Charts and visualization for admin statistics. |
| **Icons** | Lucide React 0.460.0 | Clean, lightweight SVG icons. |

---

## 📂 Project Structure

```bash
├── app/                      # Next.js App Router root
│   ├── (auth)/               # Auth routes (Login & Registration)
│   ├── admin/                # Admin views (Login & Dashboards)
│   ├── api/                  # Backend REST API Routes
│   │   ├── admin/stats/      # Aggregated metrics for Recharts
│   │   ├── auth/             # Custom signup API endpoints
│   │   ├── chat/             # Assistant search and history logging
│   │   ├── faq-suggestions/  # User FAQ suggestions CRUD
│   │   ├── faqs/             # Main FAQ CRUD and Search API
│   │   ├── queries/          # User Support query submissions
│   │   └── users/            # Administrator user administration
│   ├── dashboard/            # Candidate home space (protected)
│   ├── faqs/                 # Interactive user FAQ directory
│   ├── query-status/         # Direct query lookup portal
│   ├── raise-query/          # Submit support queries form
│   ├── suggest-faq/          # Suggestion form interface
│   ├── globals.css           # Global CSS variables & Tailwind v4
│   ├── layout.tsx            # Main HTML structure & Root layout
│   └── page.tsx              # Landing Page
├── components/               # Shareable UI elements (YakshaChat, Navbar, AdminLayout)
├── lib/                      # Core helpers
│   ├── db.ts                 # MongoDB connection manager (Singleton Pattern)
│   ├── embeddings.ts         # Embedding generation utility
│   ├── vectorSearch.ts       # Unified vector search & similarity matching
│   ├── keywordSearch.ts      # Keyword/text search fallback
│   ├── openrouter.ts         # LLM answer generation with grounding
│   └── rateLimit.ts          # API rate limiting helper
├── models/                   # Mongoose Database Schemas
│   ├── ChatHistory.ts        # Conversational bot log schema
│   ├── Faq.ts                # Base FAQ Schema (question, answer, category, embedding)
│   ├── FaqSuggestion.ts      # FAQ recommendation schema
│   ├── Query.ts              # Ticket system database schema
│   └── User.ts               # Authenticated candidate credentials schema
├── public/                   # Static icons and assets
├── scripts/                  # Project utilities and seeds
│   ├── seedFaqs.ts           # Clears collections & imports seed FAQ payload
│   ├── generateFaqEmbeddings.ts # FAQ embedding backfill script
│   ├── createAtlasIndex.ts   # Atlas Search Index creation utility
│   └── testChatPipeline.ts   # Assistant pipeline test suite
├── package.json              # App dependencies & script records
├── tsconfig.json             # Typescript configurations
└── next.config.ts            # Next.js app configurations
```

---

## 🚀 Setup & Execution Guide

### 📋 Prerequisites
- **Node.js**: `v18.x` or higher (compatible with React 19)
- **MongoDB**: A running local MongoDB instance or a remote **MongoDB Atlas** database URI.

---

### Step 1: Install Dependencies
Clone the repository and install packages:
```bash
npm install
```

---

### Step 2: Configure Environment Variables
Create a `.env.local` file at the project root based on `.env.example`:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/yaksha_portal?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your_super_secret_jwt_signature_key
NEXTAUTH_URL=http://localhost:3000

# OpenRouter Assistant Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 3: Seed the Database & Index FAQs
Seed Vicharanashala's official internship FAQ entries (12 categories, 50+ structured items):

```bash
# Seed initial FAQ dataset
npm run seed

# (Optional) Backfill embeddings for any existing FAQs
npm run embed-faqs

# (Optional) Register MongoDB Atlas vector index
npm run create-atlas-index
```

---

### Step 4: Run the Development Server
Launch the Next.js development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

### Step 5: Production Build and Start

```bash
# Build the optimized production output
npm run build

# Start the production server
npm run start
```

---

## 👤 Database Schemas

### Users (`users`)
```typescript
{
  name: string;
  email: string;
  password (hashed): string;
  role: 'user' | 'admin';
  createdAt: Date;
}
```

### FAQs (`faqs`)
```typescript
{
  question: string;
  answer: string;
  category: string; // "NOC", "Timing and Dates", "Work & Mentorship", etc.
  embedding?: number[]; // select: false
  embeddingHash?: string; // select: false
  createdAt: Date;
}
```

### Support Queries (`queries`)
```typescript
{
  userId?: ObjectId;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Solved';
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Chat Logs (`chatHistory`)
```typescript
{
  userId?: ObjectId;
  messages: [
    {
      sender: 'user' | 'bot';
      text: string;
      timestamp: Date;
    }
  ]
}
```

### FAQ Suggestions (`faqSuggestions`)
```typescript
{
  userId?: ObjectId;
  question: string;
  suggestedAnswer: string;
  category: string;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminReview?: string;
  createdAt: Date;
}
```

---

## 🎨 UI & Design Principles

The UI reflects Vicharanashala's design aesthetic:
- **Clean Theme**: Pristine modern backdrop styling (`#FFFFFF` / `#F8FAFC`).
- **Harmonious Accents**: Professional Ocean Blue (`#2563EB`) as primary tone, accented with deep amethyst violet (`#7C3AED`).
- **Glassmorphism Panels**: Interactive containers utilize soft backdrop blur filters (`backdrop-blur-md`), subtle borders, and gentle shadows.
- **Responsive Animations**: Subtle slide-ins, spring-based hovers, and clean responsive micro-interactions using Framer Motion.
- **Inter Font**: Streamlined typography using Google's Inter sans-serif typeface.

---

## 🛡️ License & Attributions
- Created for **Vicharanashala Research Lab** (IIT Ropar).
- Intern FAQ guidelines and data compiled from the official [Vicharanashala Portal](https://samagama.in/internship/faq).
