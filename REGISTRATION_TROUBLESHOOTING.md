# Registration Troubleshooting Guide

## 🚨 **Common Registration Issues & Fixes**

### **1. CORS Error**
**Problem**: Frontend can't connect to backend
**Fix**: Updated CORS to allow ports 3000 & 3001

### **2. Email Already Exists**
**Problem**: User already in database
**Fix**: Use different email address

### **3. Invalid Email Format**
**Problem**: Email validation failing
**Fix**: Use valid email format (user@domain.com)

### **4. Password Too Short**
**Problem**: Password less than 6 characters
**Fix**: Use password with 6+ characters

## 🧪 **Test Registration**

Use these test credentials:
- Email: `testuser123@example.com`
- Password: `password123`
- Name: `Test User`

## 🔧 **Quick Fixes**

1. **Clear browser cache**
2. **Use incognito window**
3. **Check browser console for errors**
4. **Ensure backend is running on port 5001**

## ✅ **Working Test**

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"testuser123@example.com","password":"password123"}'
```

Should return user data and token.
