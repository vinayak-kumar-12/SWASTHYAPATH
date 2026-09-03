# SWASTHYAPATH Healthcare Platform - Frontend Application

A production-quality React + Vite + Tailwind CSS frontend application built for the SWASTHYAPATH healthcare management ecosystem.

## Features & Highlights

- **Modern Clinical Design System**: Healthcare visual palette using slate neutrals, clinical teal accents, clear font hierarchy, and Lucide React icons.
- **Full Authentication Suite**:
  - Registration with Password Strength Meter and Account Role Selection (Patient/Healthcare Provider).
  - 15-Minute Email Verification Pending Screen with Resend Cooldown.
  - Email Verification Link Handler supporting 5 distinct UI status states (*Verifying*, *Success*, *Expired Link*, *Invalid Link*, *Already Verified*).
  - Login Guard handling `EMAIL_NOT_VERIFIED` error with immediate resend email prompt.
  - Password Reset Request & New Password Entry pages.
- **Enterprise Security**: Token storage abstraction, Axios request/response interceptors with automatic 401 token refresh handling.
- **Responsive Layout**: Designed for mobile, tablet, laptop, and desktop displays.

---

## Tech Stack

- **Framework**: React 18, Vite 5
- **Styling**: Tailwind CSS 3, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM 6

---

## Folder Architecture

```
Frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── auth/         # AuthLayout, AuthHeader, PasswordInput
│   │   ├── common/       # Button, Input, Loader, Modal, Toast
│   │   └── layout/       # Navbar, Sidebar, PageContainer
│   ├── context/          # AuthContext.jsx
│   ├── hooks/            # useAuth.js
│   ├── pages/
│   │   ├── auth/         # Login, Register, VerificationPending, VerifyEmail, ForgotPassword, ResetPassword
│   │   ├── dashboard/    # Dashboard.jsx
│   │   └── errors/       # NotFound, ServerError
│   ├── routes/           # AppRoutes, ProtectedRoute, PublicRoute
│   ├── services/         # api.js, authApi.js
│   ├── utils/            # constants, storage, validation
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd Frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `Frontend/` root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Run Local Development Server
```bash
npm run dev
```
The application will be accessible at: [http://localhost:5173](http://localhost:5173)

---

## Building for Production

To create a production-ready minified bundle:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```
