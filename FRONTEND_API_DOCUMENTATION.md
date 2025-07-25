# Numera Backend API Documentation

## 🌐 **Interactive API Documentation**

### **Primary Documentation URL**
```
http://localhost:3000/docs
```
**Features:**
- ✅ Interactive Swagger UI
- ✅ Test API endpoints directly
- ✅ Real-time request/response examples
- ✅ Authentication testing
- ✅ Error code documentation

### **OpenAPI Specification**
```
http://localhost:3000/docs/swagger.json
```
**Use for:**
- Code generation tools
- API design tools (Postman, Insomnia)
- Static documentation generation

---

## 🔐 **Authentication**

### **JWT Token Authentication**
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### **Getting a JWT Token**

#### 1. Register a new user (if you don't have an account):
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

#### 2. Login to get a token:
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    }
  }
}
```

---

## 📋 **Core API Endpoints**

### **Authentication Endpoints**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/password-reset` - Request password reset
- `POST /api/v1/auth/password-reset/verify` - Verify reset token
- `POST /api/v1/auth/password-reset/confirm` - Confirm new password

### **User Management**
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/{id}` - Get user by ID (admin)

### **Content Management**
- `GET /api/v1/subjects` - Get all subjects
- `GET /api/v1/topics` - Get topics by subject
- `GET /api/v1/lessons` - Get lessons by topic
- `GET /api/v1/worked-examples` - Get worked examples
- `GET /api/v1/quizzes` - Get quizzes by topic

### **Quiz System**
- `POST /api/v1/quiz-attempts` - Start quiz attempt
- `PUT /api/v1/quiz-attempts/{id}` - Submit quiz answers
- `GET /api/v1/quiz-attempts` - Get user's quiz attempts
- `GET /api/v1/quiz-attempts/{id}` - Get specific attempt

### **Progress Tracking**
- `GET /api/v1/progress` - Get user progress
- `POST /api/v1/progress` - Update progress
- `GET /api/v1/progress/analytics` - Get progress analytics

### **Subscription & Premium Features**
- `GET /api/v1/subscription-plans` - Get available plans
- `POST /api/v1/subscription-plans` - Subscribe to plan
- `GET /api/v1/subscription-plans/current` - Get current subscription

---

## 🎯 **Key Features**

### **Freemium Model**
- **Free Users**: Limited to 3 quizzes per day
- **Premium Users**: Unlimited access to all content
- **Premium Content**: Marked with `is_premium_only: true`

### **Daily Limits**
Free users have daily limits on:
- Quiz attempts (3 per day)
- Premium content access (blocked)
- Advanced features (limited)

### **Role-Based Access**
- **Student**: Access to learning content and quizzes
- **Admin**: Full access to all endpoints and user management

---

## 📊 **Response Format**

### **Success Response**
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### **Common HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 🔧 **Development Setup**

### **Environment Variables**
```env
# API Base URL
API_BASE_URL=http://localhost:3000

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/numera

# Redis (for caching)
REDIS_URL=redis://localhost:6379
```

### **Testing API Endpoints**

#### **Using cURL**
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user profile (with token)
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### **Using JavaScript/Fetch**
```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.data.token;

// Get user profile
const profileResponse = await fetch('http://localhost:3000/api/v1/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🚀 **Production Deployment**

### **Production URLs**
Replace `localhost:3000` with your production domain:
```
https://api.numera.com/docs
https://api.numera.com/docs/swagger.json
```

### **CORS Configuration**
The API is configured to accept requests from:
- Development: `http://localhost:3001`
- Production: Your frontend domain

---

## 📚 **Additional Resources**

### **API Guide**
- **File**: `docs/API_GUIDE.md`
- **Content**: Detailed endpoint documentation with examples

### **Database Schema**
- **Migrations**: 26 completed migrations
- **Tables**: All core tables implemented
- **Relationships**: Properly configured

### **Testing**
- **Test Coverage**: 75%+ of core functionality
- **Test Files**: 8 comprehensive test suites
- **Integration Tests**: All major endpoints tested

---

## 🆘 **Support & Troubleshooting**

### **Common Issues**

#### **401 Unauthorized**
- Check if JWT token is valid and not expired
- Ensure token is included in Authorization header
- Verify token format: `Bearer <token>`

#### **403 Forbidden**
- Check user role permissions
- Verify subscription status for premium content
- Check daily limits for free users

#### **429 Too Many Requests**
- Rate limiting is active (100 requests per 15 minutes)
- Wait before making more requests

#### **404 Not Found**
- Verify endpoint URL is correct
- Check if resource exists
- Ensure proper authentication

### **Getting Help**
1. Check the interactive documentation at `/docs`
2. Review error responses for specific error codes
3. Test endpoints using the Swagger UI
4. Check server logs for detailed error information

---

## 📈 **Performance & Monitoring**

### **Health Check**
```http
GET /health
```

**Response includes:**
- Server status
- Database connectivity
- Cache status
- Performance metrics
- Memory usage

### **Performance Metrics**
- **API Response Time**: < 200ms average
- **Database Queries**: Optimized with indexes
- **Caching**: Redis-based caching for GET requests
- **Rate Limiting**: 100 requests per 15 minutes per IP

---

**Last Updated**: July 25, 2025  
**API Version**: 1.0.0  
**Status**: Production Ready ✅ 