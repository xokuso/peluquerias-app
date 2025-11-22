# PeluqueriasPRO - Hair Salon Website Builder

A modern Next.js 14 application for creating professional hair salon websites with TypeScript and TailwindCSS.

## 🚀 Technologies Used

- **Next.js 14** with App Router
- **TypeScript** with strict configuration
- **TailwindCSS** with custom hair salon theme
- **Prisma** for database management
- **Stripe** for payment processing
- **Resend** for email services
- **React Hook Form** + **Zod** for forms and validation
- **Framer Motion** for animations
- **TanStack Query** for server state management
- **Lucide React** for icons
- **NextAuth.js** for authentication

## 🎨 Custom Theme

The application includes a custom TailwindCSS configuration with:
- **Salon colors**: Orange gradient palette (#f97316 to #f59e0b)
- **Gold accents**: Complementary gold tones
- **Custom animations**: Float, fade-in, slide-up effects
- **Custom shadows**: Salon-themed shadows
- **Typography**: Inter for sans-serif, Playfair Display for headings

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
│   └── ui/          # Base UI components
├── lib/             # Utility functions and configurations
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── styles/          # Global styles and CSS modules
└── utils/           # Helper functions
```

## 🛠 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build and Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint            # Run ESLint with auto-fix
npm run lint:check      # Check for lint errors
npm run type-check      # TypeScript type checking
npm run type-check:watch # TypeScript checking with watch mode

# Database (Prisma)
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database with sample data
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Set up the database:**
   ```bash
   # Configure your DATABASE_URL in .env.local
   npm run db:push
   npm run db:generate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

The application uses Prisma with PostgreSQL and includes models for:
- **Users** and **Authentication** (NextAuth.js integration)
- **Templates** for hair salon designs
- **Orders** for purchase management
- **FAQ** and **Testimonials** for content
- **Contact Messages** for customer inquiries

## 🎨 UI Components

Pre-built components following the hair salon theme:
- **Button** component with salon/gold variants
- Custom animations and hover effects
- Responsive design patterns
- Accessibility-first approach

## 🔧 Configuration Files

- **TypeScript**: Strict configuration with additional checks
- **ESLint**: Next.js recommended + custom rules
- **TailwindCSS**: Extended with salon-specific utilities
- **Prisma**: Configured for PostgreSQL with full schema

## 📝 Development Notes

- All components use TypeScript with strict typing
- TailwindCSS utilities include custom salon color palette
- Environment variables are properly typed and validated
- Database schema supports full hair salon business logic
- Payment processing ready with Stripe integration
- Email system configured with Resend

## 🚦 Verification Commands

Before deployment, run these commands to ensure everything works:

```bash
npm run type-check    # ✅ TypeScript validation
npm run lint:check    # ✅ Code quality check
npm run build         # ✅ Production build test
npm run dev          # ✅ Development server test
```

---

Built with ❤️ for hair salon professionals using modern web technologies.
