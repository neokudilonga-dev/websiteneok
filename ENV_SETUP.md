# Environment Variables Setup

This project uses environment variables to securely configure Firebase and other services. Create a `.env.local` file in the root directory with the following variables:

## Required Firebase Configuration

```bash
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBnTpglZ_7KnlZxDb30aRKMikHBzb6rzF4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=biblioangola.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=biblioangola
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=biblioangola.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=965265307414
NEXT_PUBLIC_FIREBASE_APP_ID=1:965265307414:web:c32050e53982f9d8f70237
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-31QQ4L2L27
```

## Optional Configuration

```bash
# Google Gemini AI API (Optional - for chatbot)
GEMINI_API_KEY=your_gemini_api_key_here

# Admin Configuration (Optional - can be hardcoded in files)
ADMIN_EMAILS=neokudilonga@gmail.com,anaruimelo@gmail.com,joaonfmelo@gmail.com
```

## Security Notes

- Never commit `.env.local` to version control
- The `.env.local` file is already included in `.gitignore`
- Firebase API keys are client-side keys and safe to expose in browser
- Server-side secrets (like service account keys) should never be in client code

## Getting Firebase Credentials

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project (biblioangola)
3. Go to Project Settings > General
4. Under "Your apps" section, find the web app config
5. Copy the configuration values to your `.env.local` file

## Deployment

For production deployment, ensure these environment variables are set in your hosting platform:
- Vercel: Environment Variables settings
- Netlify: Site settings > Build & deploy > Environment
- Firebase Hosting: Use `firebase functions:config:set`
