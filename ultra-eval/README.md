# Ultra Eval 🎯

An AI-powered student evaluation system that grades accomplishments, awards, and impact reports using OpenAI's GPT-4, awarding ELO points and maintaining a competitive leaderboard.

![Ultra Eval](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)

## 🌟 Features

- **AI-Powered Evaluation**: Uses OpenAI GPT-5 Mini to analyze and grade student reports
- **ELO Ranking System**: Fair competitive ranking based on accomplishments
- **Leaderboard**: Global rankings with search and filtering
- **Automated Email**: Generated feedback emails for students
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Real-time Database**: Supabase for authentication and data storage

## 📋 Pages

1. **Landing Page** (`/`) - Marketing page with features and CTA
2. **Login Page** (`/login`) - Google OAuth and email/password authentication
3. **Dashboard** (`/dashboard`) - Submit reports, view stats, and recent submissions
4. **Leaderboard** (`/leaderboard`) - Global rankings of all students
5. **Profile** (`/profile`) - Student profile with academic info and achievements

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
cd ultra-eval
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
SUPABASE_SECRET_KEY=your_supabase_secret_key_here

# Database Connection (optional)
DATABASE_URL=your_database_connection_string_here
```

**Your Credentials** (from the request):
```env
OPENAI_API=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
NEXT_PUBLIC_SUPABASE_URL=https://rhbgejhoigdbbdwiklih.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_soUbNvF-osGjl5YIJPNnug_VurwgzH-
SUPABASE_SECRET_KEY=sb_secret_kQPn4XCe5PK2rMN4wKG1mQ__MO8T4rf
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-schema.sql`
4. Run the SQL to create tables, indexes, and policies

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🏗️ Project Structure

```
ultra-eval/
├── app/
│   ├── api/
│   │   └── submit-report/       # API route for report submission
│   ├── dashboard/               # Dashboard page
│   ├── leaderboard/            # Leaderboard page
│   ├── login/                  # Login page
│   ├── profile/                # Profile page
│   ├── globals.css             # Global styles with Ultra theme
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard-layout.tsx    # Dashboard layout wrapper
│   └── sidebar.tsx             # Sidebar navigation
├── lib/
│   ├── openai.ts              # OpenAI evaluation logic
│   ├── supabase.ts            # Supabase client & types
│   └── utils.ts               # Utility functions
├── supabase-schema.sql        # Database schema
└── package.json
```

## 🎨 Design System

The project uses Ultra's design aesthetic:

- **Typography**: Inter font family with -0.02em letter spacing
- **Color Scheme**: Dark theme (#0A0A0A, #1A1A1A, #2A2A2A)
- **Components**: shadcn/ui with custom 3D button styles
- **Spacing**: Consistent padding and margins following 8px grid
- **Animations**: Smooth transitions using cubic-bezier easing

### 3D Button Classes

```tsx
// Primary (light) 3D button
<button className="btn-3d btn-3d-primary">Click me</button>

// Dark 3D button
<button className="btn-3d btn-3d-dark">Click me</button>
```

## 🔄 How It Works

### Report Submission Flow

1. **Student submits report** via dashboard form (title, description, category, optional files)
2. **API receives request** at `/api/submit-report`
3. **OpenAI evaluates** the report based on:
   - Impact (1-10)
   - Productivity (1-10)
   - Quality (1-10)
   - Relevance (1-10)
4. **ELO awarded** based on evaluation scores:
   - Low Impact (1-3): 0-30 ELO
   - Medium Impact (4-6): 31-60 ELO
   - High Impact (7-9): 61-90 ELO
   - Exceptional (10): 91-100 ELO
5. **Database updated** with report and new student ELO
6. **Email generated** with feedback (logged to console for now)

### Leaderboard Calculation

- Students ranked by total ELO (descending)
- Real-time updates when new reports are graded
- Searchable by name, school, or highlight
- Top 3 students get special badge styling

## 🛠️ Key Technologies

- **Framework**: Next.js 16.1 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Icons**: Lucide React
- **State**: React hooks (useState, useEffect)

## 📊 Database Schema

### Students Table
- `id`: UUID (primary key)
- `email`: Unique email address
- `name`: Student name
- `elo`: Current ELO rating (default: 1000)
- `school`: School name
- `grade`: Class year
- `avatar_url`: Profile picture URL
- `created_at`, `updated_at`: Timestamps

### Reports Table
- `id`: UUID (primary key)
- `student_id`: Foreign key to students
- `title`: Report title
- `description`: Detailed description
- `category`: Type (accomplishment, award, impact, todo)
- `file_urls`: Array of uploaded file URLs
- `elo_awarded`: Points awarded for this report
- `ai_feedback`: Generated feedback from OpenAI
- `status`: pending | graded | rejected
- `created_at`, `graded_at`: Timestamps

## 🔐 Security

- Row Level Security (RLS) enabled in Supabase
- Students can only view/edit their own data
- API routes validate student ownership
- Environment variables for sensitive keys
- HTTPS required in production

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

Make sure to add environment variables in Vercel dashboard.

### Environment Variables for Production
- Set all `.env.local` variables in your hosting platform
- Ensure `NEXT_PUBLIC_*` variables are set at build time
- Keep `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` secret

## 📝 TODO / Future Enhancements

- [ ] Implement Google OAuth authentication
- [ ] Add file upload functionality (Supabase Storage)
- [ ] Email service integration (SendGrid/Resend)
- [ ] Real-time leaderboard updates (Supabase Realtime)
- [ ] Admin dashboard for report moderation
- [ ] Detailed analytics and charts
- [ ] Mobile app (React Native)
- [ ] Achievement badges system
- [ ] Peer reviews and endorsements

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ by the Ultra team
