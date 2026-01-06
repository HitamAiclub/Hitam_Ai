# HITAM AI Club - Web Application

A modern web application for managing the HITAM AI Club, built with React, Firebase, and Cloudinary.

## Features

- **Public Pages**: Home, Events, Upcoming Activities, Join Club
- **Admin Dashboard**: Committee Members, Form Submissions, Community Members, Media Management
- **Authentication**: Firebase-based admin authentication
- **Media Management**: Cloudinary integration for image uploads and management
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Modern UI**: Built with Tailwind CSS and Framer Motion animations

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Media Storage**: Cloudinary
- **Deployment**: Vercel (Frontend), Render/Vercel (Backend)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Cloudinary account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Hitam_Ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id_here

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dwva5ae36
VITE_CLOUDINARY_UPLOAD_PRESET=Hitam_ai
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
CLOUDINARY_CLOUD_NAME=dwva5ae36

# Server Configuration
PORT=5000
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings
5. Add the configuration to your `.env` file

### 5. Cloudinary Setup

1. Create a Cloudinary account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Create an upload preset named "Hitam_ai"
4. Add the configuration to your `.env` file

### 6. Run the Application

#### Development Mode (Frontend + Backend)
```bash
npm run dev:full
```

#### Frontend Only
```bash
npm run dev
```

#### Backend Only
```bash
npm run start:server
```

### 7. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Navbar, Footer)
│   └── ui/             # Generic UI components
├── contexts/           # React contexts (Auth, Theme)
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   └── public/         # Public pages
├── utils/              # Utility functions
└── firebase.js         # Firebase configuration

server/
└── index.js           # Express server with Cloudinary API
```

## API Endpoints

### Cloudinary Management
- `GET /api/cloudinary/all-images` - Get all images
- `GET /api/cloudinary/files?folder=<folder>` - Get files from specific folder
- `DELETE /api/cloudinary/delete` - Delete image by public ID

## Admin Access

1. Navigate to `/admin/login`
2. Use Firebase admin credentials
3. Access admin dashboard at `/admin`

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Vercel)
1. Deploy the server folder to your preferred platform
2. Set environment variables
3. Update the proxy configuration in `vite.config.js` for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.

## Club Logo (Developer note)

- To display the club logo in the site header and on the homepage, place your logo image file as `public/logo.jpg` (the dev server serves files in `public/` at the site root). The navbar and homepage will automatically use `/logo.jpg` if present, otherwise they fall back to the existing gradient icon.

- Example: save the attached image as `public/logo.jpg`.