# Digital Card API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "plan": "free"
  },
  "token": "jwt_token_here"
}
```

---

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

---

### Get Current User
**GET** `/auth/me` 🔒

**Response:**
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "plan": "free"
  }
}
```

---

### Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email"
}
```

---

### Verify OTP
**POST** `/auth/verify-reset-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully"
}
```

---

### Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "email": "john@example.com",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

---

## 🎴 Card Endpoints

### Create Card
**POST** `/cards` 🔒

**Request Body:**
```json
{
  "title": "My Business Card",
  "businessType": "Photography",
  "about": "Professional photography services",
  "template": {
    "templateId": "list-basic",
    "filterType": "list"
  },
  "customization": {
    "colorTheme": {
      "id": "blue",
      "name": "Ocean Blue",
      "primary": "#3B82F6",
      "secondary": "#1E40AF",
      "accent": "#60A5FA"
    },
    "layout": "centered",
    "spacing": "normal",
    "borderRadius": 8,
    "backgroundPattern": "none",
    "backgroundColor": "#FFFFFF",
    "backgroundOpacity": 100
  },
  "coverMedia": {
    "type": "image",
    "source": "url",
    "url": "https://example.com/cover.jpg"
  },
  "gallery": [
    {
      "url": "https://example.com/image1.jpg",
      "caption": "Beautiful sunset",
      "alt": "Sunset photo"
    }
  ],
  "products": [
    {
      "name": "Product 1",
      "description": "Amazing product",
      "price": 99.99,
      "currency": "USD",
      "image": "https://example.com/product.jpg",
      "link": "https://shop.example.com",
      "inStock": true
    }
  ],
  "testimonials": [
    {
      "name": "Jane Doe",
      "role": "CEO",
      "company": "Tech Corp",
      "avatar": "https://example.com/avatar.jpg",
      "rating": 5,
      "text": "Great service!"
    }
  ],
  "offers": [
    {
      "title": "Summer Sale",
      "description": "50% off all items",
      "discount": 50,
      "discountType": "percentage",
      "code": "SUMMER50",
      "validUntil": "2024-12-31",
      "banner": "https://example.com/banner.jpg",
      "isActive": true
    }
  ],
  "buttons": [
    {
      "label": "Contact Me",
      "url": "tel:+1234567890",
      "icon": "phone",
      "style": "primary",
      "openInNew": false
    }
  ]
}
```

**Response:**
```json
{
  "card": {
    "_id": "...",
    "user": "...",
    "title": "My Business Card",
    "slug": "my-business-card",
    ...
  }
}
```

---

### Get User's Cards
**GET** `/cards/user` 🔒

**Response:**
```json
{
  "cards": [
    {
      "_id": "...",
      "title": "My Business Card",
      "slug": "my-business-card",
      "createdAt": "...",
      ...
    }
  ]
}
```

---

### Get Card by ID
**GET** `/cards/:id` 🔒

**Response:**
```json
{
  "card": {
    "_id": "...",
    "title": "My Business Card",
    "template": {...},
    "customization": {...},
    "coverMedia": {...},
    "gallery": [...],
    "products": [...],
    "testimonials": [...],
    "offers": [...],
    "buttons": [...],
    ...
  }
}
```

---

### Update Card
**PUT** `/cards/:id` 🔒

**Request Body:** (Same as Create Card)

**Response:**
```json
{
  "card": {
    "_id": "...",
    ...updated fields...
  }
}
```

---

### Delete Card
**DELETE** `/cards/:id` 🔒

**Response:**
```json
{
  "message": "Card deleted"
}
```

---

### Get Public Card
**GET** `/cards/public/:slugOrId`

**Parameters:**
- `slugOrId` - Card slug (e.g., "my-business-card") or MongoDB ObjectId

**Response:**
```json
{
  "card": {
    "_id": "...",
    "title": "My Business Card",
    "template": {...},
    "customization": {...},
    "coverMedia": {...},
    "gallery": [...],
    "products": [...],
    "testimonials": [...],
    "offers": [...],
    "buttons": [...],
    "analytics": {
      "views": 100,
      "shares": 10,
      "whatsappClicks": 5,
      "callClicks": 3
    },
    ...
  }
}
```

---

## 📊 Analytics Endpoints

### Track View
**POST** `/cards/:id/view`

**Response:**
```json
{
  "success": true
}
```

---

### Track Share
**POST** `/cards/:id/share`

**Response:**
```json
{
  "success": true
}
```

---

### Track WhatsApp Click
**POST** `/cards/:id/whatsapp`

**Response:**
```json
{
  "success": true
}
```

---

### Track Call Click
**POST** `/cards/:id/call`

**Response:**
```json
{
  "success": true
}
```

---

## 📤 Upload Endpoints

### Upload Single File
**POST** `/upload/single` 🔒

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` - The file to upload (image or video)

**Supported Formats:**
- Images: JPEG, JPG, PNG, GIF, WebP
- Videos: MP4, WebM, MOV

**Max File Size:** 50MB

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "url": "/uploads/file-1234567890-123456789.jpg",
    "filename": "file-1234567890-123456789.jpg",
    "originalName": "myimage.jpg",
    "mimetype": "image/jpeg",
    "size": 123456
  }
}
```

---

### Upload Multiple Files
**POST** `/upload/multiple` 🔒

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files` - Array of files to upload (max 10 files)

**Response:**
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "url": "/uploads/file-1234567890-123456789.jpg",
      "filename": "file-1234567890-123456789.jpg",
      "originalName": "image1.jpg",
      "mimetype": "image/jpeg",
      "size": 123456
    }
  ]
}
```

---

### Delete File
**DELETE** `/upload/:filename` 🔒

**Parameters:**
- `filename` - The filename to delete (e.g., "file-1234567890-123456789.jpg")

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

---

## 🏥 Health Check

### Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "ok"
}
```

---

## 📋 Card Data Structure

### Complete Card Schema

```json
{
  "user": "ObjectId",
  "title": "String (required)",
  "businessType": "String",
  "about": "String",

  "template": {
    "templateId": "String (default: list-basic)",
    "filterType": "String (default: all)"
  },

  "customization": {
    "colorTheme": {
      "id": "String",
      "name": "String",
      "primary": "String (hex color)",
      "secondary": "String (hex color)",
      "accent": "String (hex color)"
    },
    "layout": "String (default: centered)",
    "spacing": "String (default: normal)",
    "borderRadius": "Number (default: 8)",
    "backgroundPattern": "String (default: none)",
    "backgroundColor": "String (default: #FFFFFF)",
    "backgroundOpacity": "Number (default: 100)"
  },

  "coverMedia": {
    "type": "image | video",
    "source": "file | url",
    "url": "String",
    "fileName": "String",
    "fileSize": "Number"
  },

  "gallery": [
    {
      "url": "String (required)",
      "caption": "String",
      "alt": "String"
    }
  ],

  "products": [
    {
      "name": "String (required)",
      "description": "String",
      "price": "Number (required)",
      "currency": "String (default: USD)",
      "image": "String",
      "link": "String",
      "inStock": "Boolean (default: true)"
    }
  ],

  "testimonials": [
    {
      "name": "String (required)",
      "role": "String",
      "company": "String",
      "avatar": "String",
      "rating": "Number (1-5, default: 5)",
      "text": "String (required)"
    }
  ],

  "offers": [
    {
      "title": "String (required)",
      "description": "String",
      "discount": "Number",
      "discountType": "percentage | fixed (default: percentage)",
      "code": "String",
      "validUntil": "Date",
      "banner": "String",
      "link": "String",
      "isActive": "Boolean (default: true)"
    }
  ],

  "buttons": [
    {
      "label": "String (required)",
      "url": "String (required)",
      "icon": "String (default: link)",
      "style": "String (default: primary)",
      "openInNew": "Boolean (default: true)"
    }
  ],

  "slug": "String (auto-generated, unique)",

  "analytics": {
    "views": "Number (default: 0)",
    "shares": "Number (default: 0)",
    "whatsappClicks": "Number (default: 0)",
    "callClicks": "Number (default: 0)"
  },

  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## ⚠️ Error Responses

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## 🔒 Legend
- 🔒 = Requires authentication (JWT token)
- All dates are in ISO 8601 format
- All IDs are MongoDB ObjectIds
- File URLs are relative to the server (e.g., `/uploads/filename.jpg`)

---

## 📝 Notes

1. **File Uploads:** Files are stored locally in the `uploads/` directory. For production, consider using cloud storage (AWS S3, Cloudinary, etc.).

2. **Base64 Images:** The frontend can also send base64-encoded images directly in the card data fields (coverMedia, gallery, products, etc.) without using the upload endpoint.

3. **Slug Generation:** Card slugs are automatically generated from the title using the `slugify` library. Duplicate slugs get a numeric suffix (e.g., "my-card", "my-card-1", "my-card-2").

4. **Analytics:** Analytics endpoints are public and don't require authentication to allow tracking from the public card view.

5. **Legacy Fields:** The old fields (`logo`, `banner`, `contact`, `socialLinks`, `items`) are kept for backward compatibility.
