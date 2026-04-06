# Authentication Fix - Login & Registration Issues

## 🐛 **Problem Identified**
The main issue was a **port mismatch** between frontend and backend:
- **Frontend** was configured to connect to `http://localhost:5000/api`
- **Backend** was running on `http://localhost:5001`

## ✅ **Fixes Applied**

### **1. Updated API URLs in All Frontend Components**
Fixed the default API URL from port 5000 to 5001 in:
- `AuthContext.js` - Authentication context
- `Dashboard.js` - Dashboard component
- `Expenses.js` - Expenses component  
- `Groups.js` - Groups component
- `Insights.js` - Insights component
- `Portfolio.js` - Portfolio component

### **2. Backend Configuration**
- Backend is correctly running on port 5001
- All API endpoints are working properly
- Database connection is functional

## 🔧 **Technical Details**

### **Before Fix:**
```javascript
// In multiple frontend files
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### **After Fix:**
```javascript
// In all frontend files
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

## 🧪 **Testing Results**

### **Backend API Tests:**
```bash
# Health check ✅
curl http://localhost:5001/api/health
# Response: {"status":"ok","message":"FinLens API is running"}

# Login test ✅  
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
# Response: {"user":{...},"token":"..."}

# Registration test ✅
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"newuser@example.com","password":"password123"}'
# Response: {"user":{...},"token":"..."}
```

## 🚀 **How to Run the Application**

### **1. Start Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5001
```

### **2. Start Frontend:**
```bash
cd frontend  
npm start
# App runs on http://localhost:3000
```

### **3. Access the Application:**
- Open browser to `http://localhost:3000`
- Login and registration should now work properly

## 🔍 **Troubleshooting Steps**

### **If Still Having Issues:**

#### **1. Check Backend Status:**
```bash
curl http://localhost:5001/api/health
```
Should return: `{"status":"ok","message":"FinLens API is running"}`

#### **2. Check Frontend Environment:**
Create `.env` file in `frontend/` directory:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

#### **3. Clear Browser Data:**
- Clear browser cache and localStorage
- Remove any existing tokens from browser storage
- Refresh the page

#### **4. Check Network Tab:**
- Open browser DevTools (F12)
- Go to Network tab
- Try to login/register
- Check if requests are going to `localhost:5001`

#### **5. Verify Database:**
```bash
cd backend
npx prisma studio
# Check if users table exists and has data
```

## 📋 **Common Error Messages & Solutions**

### **"Login Failed"**
- **Cause**: Wrong email/password or API connection issue
- **Solution**: Verify credentials and check backend is running

### **"Registration Failed"** 
- **Cause**: Email already exists or API connection issue
- **Solution**: Use different email or check backend connection

### **"Network Error"**
- **Cause**: Frontend can't reach backend
- **Solution**: Ensure backend is running on port 5001

### **"CORS Error"**
- **Cause**: Frontend and backend on different origins
- **Solution**: Backend CORS is configured correctly for localhost:3000

## 🎯 **Verification Checklist**

- [ ] Backend is running on port 5001
- [ ] Frontend is configured to use port 5001
- [ ] Database connection is working
- [ ] Can access health endpoint
- [ ] Login endpoint responds correctly
- [ ] Registration endpoint responds correctly
- [ ] Frontend can successfully register new users
- [ ] Frontend can successfully login existing users
- [ ] User is redirected after successful login
- [ ] User data is stored in localStorage
- [ ] Auth token is set in headers

## 🔄 **Next Steps**

1. **Test Complete Flow**: Register → Login → Access Dashboard
2. **Verify Persistence**: Refresh page should keep user logged in
3. **Test Logout**: Logout should clear user data and redirect
4. **Test Protected Routes**: Unauthenticated users should be redirected to login

## 📞 **Support**

If issues persist:
1. Check browser console for JavaScript errors
2. Check Network tab for failed requests
3. Verify backend logs for any errors
4. Ensure all dependencies are installed

The authentication system should now be fully functional! 🎉
