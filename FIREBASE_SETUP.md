# Firebase Authentication Setup Guide

## Steps to Configure Firebase

### 1. Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the ⚙️ (Settings) icon → Project Settings
4. Scroll down to "Your apps" section
5. If you haven't added a web app yet:
   - Click on the `</>` (Web) icon
   - Register your app with a nickname (e.g., "MoneyQuest")
   - Copy the Firebase configuration object

### 2. Update Firebase Configuration

Open the file: `src/firebase/config.js`

Your credentials are already configured! ✅

### 3. Enable Authentication Methods in Firebase

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click on it and toggle "Enable"
   - **Google**: Click on it, toggle "Enable", and provide your project's public-facing name and support email

### 4. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose a location (europe-west for Europe)
4. Start in **Production mode** (we'll add security rules next)
5. Click **Create**

### 5. Configure Firestore Security Rules

In Firestore Database → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Simulations collection - users can only read/write their own simulations
    match /simulations/{simulationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 6. Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `moneyquest.com`)

### 7. Optional: Email Settings

If you want to customize the email templates for password reset:

1. Go to **Authentication** → **Templates**
2. Customize the templates for:
   - Password reset
   - Email verification
   - Email address change

## Features Implemented

✅ **Email/Password Authentication**
- Sign up with email, password, name, and birth date
- Login with email and password
- Password strength validation (minimum 6 characters)
- User profile data stored in Firestore

✅ **Google Authentication**
- Sign in with Google popup
- Automatic profile creation

✅ **Password Recovery**
- Reset password via email

✅ **User Profile Management**
- Name and birth date collected during registration
- Profile data stored in Firestore `users` collection
- Profile displayed in user account area

✅ **User State Management**
- Global authentication context
- Automatic user state persistence
- User profile sync with Firestore

✅ **Conditional Authentication**
- Simulators work without authentication
- Authentication required for:
  - Saving simulations to account
  - Exporting simulations to CSV
  - Scheduling consultations (to be implemented)

✅ **Simulation Management**
- Save simulations to user account
- Export simulations to CSV format
- View saved simulations (to be implemented)
- Delete saved simulations

✅ **UI Integration**
- Login menu item in header (shows "Login" or "Conta" based on auth status)
- Beautiful modal popup matching website design
- Toggle between login and signup
- Name and birth date fields in registration
- Error handling with Portuguese messages

## Database Structure

### Users Collection (`users/{userId}`)
```javascript
{
  name: "João Silva",
  birthDate: "1990-05-15",
  email: "joao@example.com",
  createdAt: "2025-10-21T10:30:00.000Z",
  updatedAt: "2025-10-21T10:30:00.000Z"
}
```

### Simulations Collection (`simulations/{simulationId}`)
```javascript
{
  userId: "user_firebase_uid",
  type: "investment_simulator", // Type of simulator
  inputs: {
    // Simulator input values
  },
  results: {
    // Calculated results
  },
  createdAt: "2025-10-21T11:00:00.000Z",
  updatedAt: "2025-10-21T11:00:00.000Z"
}
```

## Usage

### For Users

Users can access the login by:
1. Clicking the "Login" or "🔐" menu item in the header dropdown
2. The modal will appear with options to:
   - Login with existing account
   - Create a new account (with name and birth date)
   - Sign in with Google
   - Reset password if forgotten

### For Developers

#### Using Conditional Authentication in Simulators

```javascript
import { useRequireAuth } from '../hooks/useRequireAuth'
import { simulationService } from '../services/simulationService'

function YourSimulator({ onOpenLogin }) {
  const { requireAuth, isAuthenticated, currentUser } = useRequireAuth(onOpenLogin)
  
  // Wrap actions that require authentication
  const handleSave = requireAuth(async () => {
    await simulationService.saveSimulation(currentUser.uid, data)
  })
  
  const handleExport = requireAuth(() => {
    const csv = simulationService.exportToCSV([data])
    simulationService.downloadCSV(csv, 'simulation.csv')
  })
  
  return (
    // Your simulator JSX with save/export buttons
  )
}
```

See `src/components/simulators/ExampleSimulatorWithAuth.jsx` for a complete example.

## Security Notes

⚠️ **IMPORTANT**: 
- Firebase credentials are now in the code (already configured)
- Firestore security rules protect user data
- Users can only access their own simulations and profile
- For production, consider using environment variables:
  ```javascript
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    // ... etc
  }
  ```
- Use Firebase App Check for additional security in production

## Testing

After configuration:
1. Run `npm run dev`
2. Click on "Login" in the header menu
3. Try creating a new account with name and birth date
4. Try logging in with Google
5. Test password reset functionality
6. Test saving a simulation (requires login)
7. Test exporting a simulation to CSV (requires login)

## Troubleshooting

**Error: "Firebase: Error (auth/invalid-api-key)"**
- Check that you've replaced all placeholder values in `config.js`

**Error: "Firebase: Error (auth/unauthorized-domain)"**
- Add your domain to Authorized domains in Firebase Console

**Google Sign-In not working**
- Make sure Google provider is enabled in Firebase Console
- Check that you've provided support email in Google provider settings

**Firestore permission denied**
- Make sure Firestore security rules are configured correctly
- Check that user is authenticated before accessing Firestore

**Simulations not saving**
- Verify Firestore is enabled in Firebase Console
- Check browser console for error messages
- Ensure user is authenticated
