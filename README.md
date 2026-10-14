# EagleAI - Career Intelligence Platform

<div align="center">
  <img src="public/brain-icon.svg" alt="EagleAI Logo" width="120" height="120">
  <h3>AI-Powered Career Intelligence for Students</h3>
  <p>Make informed career decisions through data-driven insights, mentorship matching, and personalized learning paths.</p>
  
  [![Project](https://img.shields.io/badge/project-EagleAI-2563eb)](https://github.com/iamedisonu/eagleAI)
  [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
  [![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](package.json)
  [![React Version](https://img.shields.io/badge/react-18.2.0-blue)](package.json)
  [![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue)](package.json)
</div>

---

## 🚀 Features

### 🎯 Career Intelligence
- **AI-Powered Analysis**: Advanced algorithms analyze career paths with compatibility scores
- **Salary Insights**: Real-time salary data and market trends
- **Job Outlook**: Growth projections and demand analysis
- **Skill Gap Analysis**: Identify missing skills for target careers

### 🤝 Mentorship Matching
- **Smart Matching**: AI-powered mentor-student compatibility analysis
- **Expert Network**: Access to industry professionals and alumni
- **Success Metrics**: Track mentorship effectiveness and outcomes
- **Personalized Recommendations**: Tailored mentor suggestions

### 💼 Project Portfolio
- **AI Suggestions**: Smart project recommendations based on career goals
- **Progress Tracking**: Monitor project completion and skill development
- **Portfolio Builder**: Create impressive portfolios for job applications
- **Impact Analysis**: Understand how projects boost career prospects

### 🗺️ Academic Roadmap
- **Course Recommendations**: AI-generated academic planning
- **Elective Suggestions**: Strategic course selection for career goals
- **Prerequisite Mapping**: Clear path to graduation and career readiness
- **Timeline Optimization**: Efficient degree completion strategies

### 🛠️ Skills Development
- **Market Analysis**: Real-time job market skill demand
- **Learning Paths**: Structured skill development roadmaps
- **Certification Tracking**: Monitor professional certifications
- **Progress Visualization**: Track skill growth over time

### 📄 Resume Intelligence
- **AI Analysis**: Comprehensive resume scoring and feedback
- **Skill Extraction**: Automatic skill identification and categorization
- **Improvement Suggestions**: Actionable recommendations for enhancement
- **Job Matching**: Intelligent resume-job compatibility scoring

---

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS with OC brand colors
- **State Management**: React Context API
- **Icons**: Lucide React icon library
- **Build Tool**: Vite with optimized production builds

### Backend (Node.js + Express)
- **API Server**: Express.js with RESTful endpoints
- **Real-time**: WebSocket support for live updates
- **Database**: MongoDB with Mongoose ODM
- **Job Scraping**: Automated job collection from multiple sources
- **Matching Engine**: AI-powered resume-job matching algorithm

### Backend (Python + FastAPI)
- **API Server**: FastAPI with automatic documentation
- **File Management**: Secure resume upload and storage
- **AI Analysis**: Resume analysis and scoring
- **Database**: MongoDB integration with PyMongo

### External Integrations
- **Google AI**: Resume analysis and career recommendations
- **Job Boards**: LinkedIn, Indeed, Glassdoor scraping
- **MongoDB**: Primary database for all data storage

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **Vite** 4.5.14 - Build tool and dev server
- **Tailwind CSS** 3.4.18 - Utility-first CSS framework
- **Lucide React** 0.263.1 - Icon library
- **TypeScript** 5.3.3 - Type safety

### Backend (Node.js)
- **Express** 4.18.2 - Web framework
- **Socket.IO** 4.7.4 - Real-time communication
- **Mongoose** 8.0.3 - MongoDB ODM
- **Puppeteer** 21.6.1 - Web scraping
- **Winston** 3.11.0 - Logging

### Backend (Python)
- **FastAPI** - Modern web framework
- **PyMongo** - MongoDB driver
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Husky** - Git hooks
- **Lint-staged** - Pre-commit linting

---

## 📦 Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **Python** >= 3.9
- **MongoDB** >= 5.0
- **Git** (latest version)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/iamedisonu/eagleAI.git
   cd eagleai
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   cd ../backend_python && pip install -r requirements.txt
   ```

3. **Environment setup**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp backend_python/.env.example backend_python/.env
   
   # Edit environment files with your values
   nano .env
   nano backend/.env
   nano backend_python/.env
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or using system service
   sudo systemctl start mongod
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Node.js Backend
   npm run backend:dev
   
   # Terminal 3: Python Backend
   npm run python:dev
   ```

6. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Node.js API**: http://localhost:3001
   - **Python API**: http://localhost:3001 (alternative port)
   - **API Docs**: http://localhost:3001/docs

---

## 🏗️ Project Structure

```
eagleAI/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── career/              # Career intelligence
│   │   ├── jobs/                # Job matching and filtering
│   │   ├── mentorship/          # Mentor matching
│   │   ├── projects/            # Project portfolio
│   │   ├── roadmap/             # Academic planning
│   │   ├── skills/              # Skills development
│   │   ├── resume/              # Resume management
│   │   ├── shared/              # Reusable components
│   │   └── eagle-mentor/        # AI mentor features
│   ├── context/                 # React Context providers
│   ├── services/                # API services and utilities
│   ├── App.jsx                  # Main application component
│   └── index.jsx                # Application entry point
├── backend/                      # Node.js backend
│   ├── routes/                  # API route handlers
│   ├── services/                # Business logic services
│   ├── models/                  # Database models
│   ├── utils/                   # Utility functions
│   └── server.js                # Main server file
├── backend_python/              # Python backend
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt         # Python dependencies
│   └── uploads/                 # File upload directory
├── docs/                        # Documentation
├── dist/                        # Production build output
└── logs/                        # Application logs
```

---

## 🎨 Design System

### Brand Colors (OC University)
- **Primary**: Maroon (#811429)
- **Secondary**: Crimson (#660000)
- **Accents**: Teal (#5EC4B6), Coral (#FF937A), Gold (#F9C634)
- **Neutrals**: White (#FFFFFF), Near-white (#F9F9F9)

### Typography
- **Font Family**: Inter (sans-serif)
- **Headings**: Bold, maroon color
- **Body Text**: Regular, gray-800

### Components
- **Border Radius**: Consistent rounded corners (rounded-xl)
- **Shadows**: Soft, medium, and strong shadow system
- **Transitions**: Smooth hover states and animations
- **Responsive**: Mobile-first design approach

---

## 🚀 Available Scripts

### Development
```bash
npm run dev              # Start frontend development server
npm run backend:dev      # Start Node.js backend
npm run python:dev       # Start Python backend
npm run docker:up        # Start all services with Docker
```

### Building
```bash
npm run build            # Build frontend for production
npm run build:analyze    # Build and analyze bundle size
npm run preview          # Preview production build
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run check            # Run all quality checks
npm run check:fix        # Fix all quality issues
```

### Testing
```bash
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ci          # Run tests for CI/CD
```

### Database
```bash
npm run db:seed          # Seed database with sample data
npm run db:migrate       # Run database migrations
npm run db:reset         # Reset database
```

### Utilities
```bash
npm run clean            # Clean build artifacts
npm run reinstall        # Clean and reinstall dependencies
npm run health:check     # Check application health
```

---

## 🔧 Configuration

### Environment Variables
See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for complete configuration guide.

### Key Configuration Files
- **Vite**: `vite.config.js` - Build tool configuration
- **Tailwind**: `tailwind.config.js` - CSS framework configuration
- **ESLint**: `.eslintrc.js` - Code linting rules
- **Prettier**: `.prettierrc.js` - Code formatting rules
- **Jest**: `package.json` - Testing configuration

---

## 📚 Documentation

- [**API Documentation**](API_DOCUMENTATION.md) - Complete API reference
- [**Deployment Guide**](DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [**Environment Variables**](ENVIRONMENT_VARIABLES.md) - Configuration guide
- [**Code Architecture**](code-architecture-plan.plan.md) - Technical architecture overview

---

## 🧪 Testing

### Frontend Testing
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Backend Testing
```bash
# Node.js backend tests
cd backend && npm test

# Python backend tests
cd backend_python && python -m pytest
```

### Test Coverage
- **Frontend**: Jest with React Testing Library
- **Backend**: Jest for Node.js, pytest for Python
- **Coverage Threshold**: 70% minimum coverage required

---

## 🚀 Deployment

### Production Deployment
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy Options
- **Vercel**: `vercel --prod`
- **Netlify**: Drag `dist/` folder to Netlify
- **Docker**: `docker-compose up -d`
- **AWS**: Use provided CloudFormation templates

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run quality checks (`npm run check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation**: Check our comprehensive docs
- **Issues**: [GitHub Issues](https://github.com/iamedisonu/eagleAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iamedisonu/eagleAI/discussions)
- **Email**: support@eagleai.com

---

## 🙏 Acknowledgments

- **Oklahoma Christian University** for brand colors and inspiration
- **React Team** for the amazing framework
- **Vite Team** for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Open Source Community** for the amazing tools and libraries

---

<div align="center">
  <p>Made with ❤️ by the EagleAI Team</p>
  <p>© 2024 EagleAI. All rights reserved.</p>
</div>
