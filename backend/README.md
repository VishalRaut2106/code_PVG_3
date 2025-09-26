# CodePVG Backend API

A comprehensive backend API for the CodePVG platform built with Node.js, Express, and Supabase.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Student registration, admin approval workflow
- **Problem Management**: CRUD operations for coding problems
- **Code Execution**: Integration with code execution services
- **Progress Tracking**: User progress, badges, and analytics
- **File Upload**: Bulk problem upload via JSON/CSV
- **Real-time Data**: Supabase integration for real-time updates

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens
- **File Processing**: Multer, CSV Parser
- **Validation**: Joi, Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Supabase account and project
- Code execution service (optional)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Fill in your environment variables in `.env`:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   
   # Server Configuration
   PORT=4545
   NODE_ENV=development
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # Admin Access Code
   ADMIN_ACCESS_CODE=your_admin_access_code
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
   - The schema includes all necessary tables, indexes, and RLS policies

5. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:4545` (or your configured PORT).

## 📚 API Documentation

### Authentication Endpoints

#### Student Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "prnNumber": "123456789",
  "mobileNumber": "9876543210",
  "branch": "Computer Engineering",
  "year": "Second Year"
}
```

#### Admin Registration
```http
POST /api/auth/register/admin
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "password123",
  "department": "Computer Science",
  "adminAccessCode": "your_admin_access_code"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Student Endpoints

#### Get Dashboard Data
```http
GET /api/student/dashboard
Authorization: Bearer <jwt_token>
```

#### Get Problems List
```http
GET /api/student/problems
Authorization: Bearer <jwt_token>
```

#### Get Problem Details
```http
GET /api/student/problems/:problemId
Authorization: Bearer <jwt_token>
```

#### Run Code (Test)
```http
POST /api/student/submissions/run
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "problemId": "uuid",
  "sourceCode": "class Solution:\n    def solve(self):\n        return True",
  "language": "python",
  "languageId": 71
}
```

#### Submit Code
```http
POST /api/student/submissions/execute
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "problemId": "uuid",
  "sourceCode": "class Solution:\n    def solve(self):\n        return True",
  "language": "python",
  "languageId": 71
}
```

### Admin Endpoints

#### Get Pending Users
```http
GET /api/admin/users/pending
Authorization: Bearer <jwt_token>
```

#### Approve User
```http
POST /api/admin/users/:userId/approve
Authorization: Bearer <jwt_token>
```

#### Get Problems
```http
GET /api/admin/problems
Authorization: Bearer <jwt_token>
```

#### Create Problem
```http
POST /api/admin/problems
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Two Sum",
  "description": "Find two numbers that add up to target",
  "difficulty": "Easy",
  "testCases": [...],
  "codeTemplates": {...}
}
```

#### Upload Problems (Bulk)
```http
POST /api/admin/problems/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <json_or_csv_file>
```

## 🗄️ Database Schema

The database includes the following main tables:

- **users**: User accounts and profiles
- **problems**: Coding problems and metadata
- **submissions**: Code submissions and results
- **user_problem_progress**: User progress tracking
- **badges**: Achievement badges
- **user_badges**: User badge assignments
- **contests**: Programming contests
- **student_projects**: Student project submissions
- **weekly_goals**: Weekly goal tracking

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Student and Admin roles
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation
- **CORS Protection**: Configurable CORS policies
- **Helmet Security**: Security headers
- **Row Level Security**: Supabase RLS policies

## 🧪 Testing

```bash
npm test
```

## 📦 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=4545
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
JWT_SECRET=your_strong_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_ACCESS_CODE=your_secure_admin_code
```

### Deployment Options

1. **Railway**: Easy deployment with automatic builds
2. **Heroku**: Traditional PaaS deployment
3. **DigitalOcean App Platform**: Simple container deployment
4. **AWS EC2**: Full control over server environment
5. **Vercel**: Serverless deployment

## 🔧 Code Execution Service

The backend integrates with external code execution services. You can:

1. **Use Judge0 API**: Set `CODE_EXECUTION_URL` to Judge0 endpoint
2. **Use HackerEarth API**: Configure with HackerEarth credentials
3. **Use Mock Service**: Development mode uses mock execution
4. **Build Custom Service**: Create your own Docker-based execution environment

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Error Handling**: Comprehensive error handling middleware
- **Health Check**: `/health` endpoint for monitoring
- **Console Logging**: Detailed error and info logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 API Versioning

The API uses URL-based versioning. Current version is v1 (implicit).

## 📈 Performance Considerations

- **Database Indexing**: Optimized indexes for common queries
- **Connection Pooling**: Supabase handles connection pooling
- **Caching**: Consider implementing Redis for frequently accessed data
- **Rate Limiting**: Prevents API abuse
- **Compression**: Gzip compression enabled

## 🚨 Error Codes

- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server error

---

Built with ❤️ for the CodePVG platform
