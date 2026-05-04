# Postman Testing Guide for Learnify Backend

## Setup

### 1. Import Collection
- Open Postman
- Click **Import** → Select `POSTMAN_TESTS.json` from the project root
- Set environment variable: `base_url = http://localhost:3000`

### 2. Start Your Server
```bash
cd server
npm install
npm run dev
```

---

## Test Workflow

### **Phase 1: Authentication Tests**

#### Test 1: Register Valid Student
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "student",
  "bio": "Learning web development"
}
```
**Expected:** Status 201, `{ "message": "User created successfully" }`

---

#### Test 2: Register Valid Teacher
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

  {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.teacher@example.com",
    "password": "TeacherPass123!",
    "role": "teacher",
    "bio": "10 years teaching experience"
  }
```
**Expected:** Status 201, Success message

---

#### Test 3: Register Duplicate Email (Should Fail)
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "firstName": "Duplicate",
  "lastName": "User",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "student"
}
```
**Expected:** Status 400, `{ "message": "User already exists" }`

---

#### Test 4: Login Valid User
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
**Expected:** Status 200, Returns JWT token
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**💡 Save this token for next tests** (set to `{{auth_token}}` variable)

---

#### Test 5: Login Wrong Password (Should Fail)
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "WrongPassword123!"
}
```
**Expected:** Status 401, `{ "message": "Invalid credentials" }`

---

#### Test 6: Login Non-existent User (Should Fail)
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "nonexistent@example.com",
  "password": "SomePassword123!"
}
```
**Expected:** Status 404, `{ "message": "User not found" }`

---

### **Phase 2: Protected Routes (User Management)**

#### Test 7: Get User Info (With Valid Token)
```http
GET http://localhost:3000/api/user
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```
**Expected:** Status 200, User data returned
**Note:** Replace `YOUR_JWT_TOKEN_HERE` with token from Test 4

---

#### Test 8: Get User Info Without Token (Should Fail)
```http
GET http://localhost:3000/api/user
```
**Expected:** Status 401, `{ "message": "No token provided, authorization denied" }`

---

#### Test 9: Get User Info With Invalid Token (Should Fail)
```http
GET http://localhost:3000/api/user
Authorization: Bearer invalid_token_123
```
**Expected:** Status 401, `{ "message": "Invalid or expired token" }`

---

### **Phase 3: Logout**

#### Test 10: Logout (With Valid Token)
```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```
**Expected:** Status 200, `{ "message": "Logged out successfully..." }`

---

#### Test 11: Logout Without Token (Should Fail)
```http
POST http://localhost:3000/api/auth/logout
```
**Expected:** Status 401, No token error

---

### **Phase 4: Edge Cases & Validation**

#### Test 12: Register with Missing Password
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "role": "student"
}
```
**Expected:** Should fail (MongoDB validation error)

---

#### Test 13: Register with Long Bio (>250 chars)
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "biotest@example.com",
  "password": "Pass123!",
  "role": "student",
  "bio": "This is a very long bio that exceeds the maximum allowed length of 250 characters. This is a very long bio that exceeds the maximum allowed length of 250 characters. This is a very long bio that exceeds the maximum allowed length of 250 characters. This is a very long bio that exceeds the maximum allowed length..."
}
```
**Expected:** Should be rejected (bio > 250 chars)

---

#### Test 14: Login with Empty Email
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "",
  "password": "SomePassword123!"
}
```
**Expected:** Validation error

---

---

## Setting Variables in Postman

### Automate Token Capture
Add this **Post-response script** to `Test 4: Login Valid User`:

```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    pm.environment.set("auth_token", responseJson.token);
    console.log("Token saved:", responseJson.token);
}
```

Now after each login, the token auto-saves to `{{auth_token}}`

---

## Test Summary Table

| Test # | Endpoint | Method | Expected Status | Purpose |
|--------|----------|--------|-----------------|---------|
| 1 | `/api/auth/register` | POST | 201 | Valid registration |
| 2 | `/api/auth/register` | POST | 201 | Teacher registration |
| 3 | `/api/auth/register` | POST | 400 | Duplicate email check |
| 4 | `/api/auth/login` | POST | 200 | Valid login (get token) |
| 5 | `/api/auth/login` | POST | 401 | Wrong password |
| 6 | `/api/auth/login` | POST | 404 | User not found |
| 7 | `/api/user` | GET | 200 | Get user with token |
| 8 | `/api/user` | GET | 401 | Missing token |
| 9 | `/api/user` | GET | 401 | Invalid token |
| 10 | `/api/auth/logout` | POST | 200 | Logout success |
| 11 | `/api/auth/logout` | POST | 401 | Logout without token |
| 12-14 | Various | POST | Error | Validation tests |

---

## Tips

✅ **Always test in order** - Tests 1, 4 → Get token → Tests 7, 10  
✅ **Check response status codes** first  
✅ **Check response body** for error messages  
✅ **Use environment variables** to avoid repetitive copy-paste  
✅ **Run full collection** to catch unexpected failures  

