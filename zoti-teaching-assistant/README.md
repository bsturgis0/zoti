# Zoti Teaching Assistant

An AI-powered teaching assistant that helps users understand documents and educational content.

## Features

- Document upload and analysis
- Interactive chat with AI teaching assistant
- Voice synthesis for spoken explanations
- User authentication and document management
- Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use the provided Neon database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/zoti-teaching-assistant.git
cd zoti-teaching-assistant
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
JWT_SECRET_KEY="your-secret-key"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
GOOGLE_API_KEY="your-google-api-key"
TAVILY_API_KEY="your-tavily-api-key"
```

4. Generate Prisma client
```bash
npm run db:generate
```

5. Check database connection
```bash
npm run db:check
```

6. Run the development server
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application uses Prisma ORM with a PostgreSQL database. The database schema is defined in `prisma/schema.prisma`.

If you encounter any issues with the Prisma client, try running:
```bash
npm run db:generate
```

## Deployment

1. Build the application
```bash
npm run build
```

2. Start the production server
```bash
npm start
```

## Technologies Used

- Next.js 15
- React 19
- Prisma ORM
- PostgreSQL
- LangChain
- Google Generative AI
- AWS Polly for voice synthesis
- Tailwind CSS
- Radix UI components 