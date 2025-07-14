# HITAM AI Club Website

A modern, responsive website for the HITAM AI Club built with React, Firebase, and Tailwind CSS.

## 🚀 Features

### Public Features
- **Home Page**: Hero section with animated background, club information, and committee showcase
- **Events & Workshops**: Filterable events display with detailed information
- **Upcoming Activities**: Dynamic registration forms for events and workshops
- **Join the Club**: Student registration with email validation (@hitam.org)
- **Theme Toggle**: Dark/Light mode with persistent state

### Admin Features
- **Authentication**: Secure Firebase authentication for admin access
- **Committee Management**: CRUD operations for committee members with photo uploads
- **Event Management**: Create, edit, and delete events with image uploads
- **Form Builder**: Google Forms-like interface for creating registration forms
- **Registration Management**: View, export, and manage all form submissions
- **Community Management**: Manage club member registrations

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Styling**: Tailwind CSS with dark mode support
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React

## 📊 Database Structure

### Collections

#### `upcomingActivities`
```json
{
  "title": "string",
  "description": "string",
  "registrationStart": "ISO date string",
  "registrationEnd": "ISO date string", 
  "eventDate": "ISO date string",
  "maxParticipants": "number",
  "isPaid": "boolean",
  "fee": "string",
  "formSchema": [
    {
      "id": "string",
      "type": "text|textarea|email|phone|select|radio|checkbox|file|date|time|url|label|image|link",
      "label": "string",
      "required": "boolean",
      "placeholder": "string",
      "options": ["array for select/radio/checkbox"],
      "helpText": "string",
      "validation": {},
      "content": "string (for label type)",
      "imageUrl": "string (for image type)",
      "linkUrl": "string (for link type)",
      "linkText": "string (for link type)"
    }
  ],
  "paymentDetails": {
    "upiId": "string",
    "qrCodeUrl": "string", 
    "bankDetails": "string"
  },
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

#### `upcomingActivities/{activityId}/registrations`
```json
{
  "activityId": "string",
  "activityTitle": "string",
  "submittedAt": "ISO date string",
  "status": "pending_payment|confirmed",
  "formVersion": "ISO date string",
  "[fieldId]": "user response data",
  "paymentProof": {
    "fileName": "string",
    "fileUrl": "string",
    "fileSize": "number",
    "fileType": "string"
  }
}
```

#### `allRegistrations`
Global collection for easier admin access to all registrations across activities.

#### `events`
```json
{
  "meta": {
    "title": "string",
    "description": "string",
    "startDate": "ISO date string",
    "endDate": "ISO date string",
    "sessionBy": "string",
    "type": "event|workshop",
    "imageUrl": "string",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

#### `committeeMembers`
```json
{
  "name": "string",
  "role": "string",
  "branch": "string",
  "year": "string",
  "email": "string",
  "phone": "string",
  "photoUrl": "string",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

#### `clubJoins`
```json
{
  "name": "string",
  "rollNo": "string",
  "branch": "string",
  "year": "string",
  "section": "string",
  "email": "string",
  "joinedAt": "ISO date string",
  "status": "pending|approved|rejected"
}
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore, Authentication, and Storage enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hitam-ai-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   
   The Firebase configuration is already set up in `src/firebase.js`:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSyDtaV1gdByf5khP3AatvKMMpMHA8HozuUU",
     authDomain: "hitam-ai-club.firebaseapp.com",
     databaseURL: "https://hitam-ai-club-default-rtdb.firebaseio.com/",
     projectId: "hitam-ai-club",
     storageBucket: "hitam-ai-club.appspot.com",
     messagingSenderId: "87157714690",
     appId: "1:87157714690:web:hitam-ai-club-app"
   };
   ```

4. **Firebase Setup**
   - Enable Authentication with Email/Password
   - Create Firestore database
   - Enable Storage for file uploads
   - Set up security rules (see below)

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to public collections
    match /events/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /upcomingActivities/{document} {
      allow read: if true;
      allow write: if request.auth != null;
      
      match /registrations/{registration} {
        allow read: if request.auth != null;
        allow create: if true;
      }
    }
    
    match /committeeMembers/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /clubJoins/{document} {
      allow read: if request.auth != null;
      allow create: if true;
    }
    
    match /allRegistrations/{document} {
      allow read: if request.auth != null;
      allow create: if true;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /committee/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /registrations/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if true;
    }
  }
}
```

## 🎨 Form Builder Features

### Field Types
- **Text Fields**: Short text, long text (textarea), email, phone, number, URL
- **Selection Fields**: Dropdown, radio buttons, checkboxes
- **File Upload**: With file type restrictions
- **Date/Time**: Date picker, time picker
- **Content Elements**: Labels/descriptions, images, links/buttons

### Advanced Features
- **Drag & Drop**: Reorder form fields
- **Live Preview**: See how the form will look to users
- **Validation**: Required fields, custom validation rules
- **Rich Content**: Markdown links in descriptions
- **File Handling**: Automatic upload to Firebase Storage
- **Payment Integration**: UPI and bank details for paid events

## 🚀 Deployment

### Netlify Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set up environment variables if needed

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- **Mobile**: < 480px
- **Tablet**: 768px
- **Desktop**: > 1024px

## 🎯 Admin Access

To access admin features:
1. Navigate to `/admin/login`
2. Use Firebase Authentication credentials
3. Access admin-only pages through the navigation

## 🔒 Security Features

- **Protected Routes**: Admin pages require authentication
- **Email Validation**: Club registration restricted to @hitam.org emails
- **File Upload Security**: File type restrictions and secure storage
- **Form Validation**: Client and server-side validation
- **Data Sanitization**: Proper handling of user inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please contact the HITAM AI Club team.