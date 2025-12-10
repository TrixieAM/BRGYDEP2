# Barangay 145 Backend API

## Project Structure

```
backend/
├── config/
│   └── db.config.js          # Database connection configuration
├── middleware/
│   └── auth.middleware.js    # JWT authentication & authorization middleware
├── routes/
│   ├── auth.routes.js        # Authentication routes (login)
│   ├── users.routes.js       # User management routes
│   ├── residents.routes.js   # Resident CRUD routes
│   ├── indigency.routes.js   # Indigency certificate routes
│   ├── certificate-types.routes.js  # Various certificate type routes
│   ├── certificates.routes.js      # General certificate routes
│   ├── request-records.routes.js   # Request records routes
│   ├── oath-job.routes.js          # Oath job seeker routes
│   ├── solo-parent.routes.js       # Solo parent routes
│   └── verification.routes.js      # Certificate verification routes (public)
├── utils/
│   ├── transaction.utils.js  # Transaction number generation
│   └── hash.utils.js         # Document hash generation
├── server.js                 # Main server file
└── package.json
```

## Features

### JWT Token Authentication

The API now uses JWT (JSON Web Tokens) for authentication. After successful login, you'll receive a token that must be included in subsequent requests.

### Authentication Flow

1. **Login**: `POST /auth/login`
   - Request body: `{ username, password }`
   - Response: `{ message, user, token }`
   - The token is valid for 24 hours

2. **Protected Routes**: Include the token in the Authorization header
   - Header: `Authorization: Bearer <token>`

### Environment Variables

Create a `.env` file in the backend directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=brgy145
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
```

**Important**: Change `JWT_SECRET` to a strong, random string in production!

## API Routes

### Public Routes (No Authentication Required)
- `GET /` - API welcome message
- `GET /verify/:id` - Certificate verification (HTML page)
- `GET /verify/indigency/:id` - Verify indigency certificate (JSON)
- `GET /verify/business-clearance/:id` - Verify business clearance (JSON)
- `GET /verify/api/indigency/:id/hash` - Get verification hash
- `GET /verify/api/business-clearance/:id/hash` - Get business clearance hash

### Authentication Routes
- `POST /auth/login` - User login (returns JWT token)

### Protected Routes (Require JWT Token)

All protected routes require the `Authorization: Bearer <token>` header.

#### Users
- `GET /users` - Get all users (Admin only)
- `POST /users` - Create user (Admin only)
- `PUT /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

#### Residents
- `GET /residents` - Get all residents
- `POST /residents` - Create resident
- `PUT /residents/:id` - Update resident
- `DELETE /residents/:id` - Delete resident

#### Certificates
- `GET /indigency` - Get all indigency certificates
- `POST /indigency` - Create indigency certificate
- `GET /indigency/:id` - Get single indigency certificate
- `PUT /indigency/:id` - Update indigency certificate
- `DELETE /indigency/:id` - Delete indigency certificate
- `GET /indigency/transaction/:transactionNumber` - Get by transaction number

Similar routes exist for:
- `/barangay-clearance`
- `/business-clearance`
- `/certificate-of-residency`
- `/permit-to-travel`
- `/cash-assistance`
- `/financial-assistance`
- `/bhert-certificate-positive`
- `/bhert-certificate-normal`
- `/certificate-of-action`
- `/certificate-of-cohabitation`

#### Other Routes
- `/request-records` - Request records CRUD
- `/oath-job` - Oath job seeker CRUD
- `/solo-parent-records` - Solo parent records CRUD
- `/solo-parent-records/:id/children` - Solo parent children management
- `/certificates` - General certificates CRUD

## Usage Example

### Login and Get Token

```javascript
// Login
const response = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const { token, user } = await response.json();

// Store token for subsequent requests
localStorage.setItem('token', token);
```

### Making Authenticated Requests

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/residents', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const residents = await response.json();
```

## Role-Based Access Control

The API supports role-based access control:
- **admin**: Full access to all routes
- **chairman**: Limited access
- **staff**: Basic access

Some routes (like user management) are restricted to admin only.

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message here"
}
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env` file)

3. Start the server:
```bash
node server.js
```

The server will run on `http://localhost:5000` by default.

## Security Notes

1. **Never commit `.env` file** to version control
2. **Use a strong JWT_SECRET** in production
3. **Use HTTPS** in production
4. **Implement rate limiting** for production
5. **Regularly update dependencies** for security patches

