# Club 738 Web - AI Coding Agent Instructions

## Project Overview

**Club 738** is a Spanish-language member portal for a hunting/shooting/fishing club. The app provides members with document management, credential handling, weapon registration, and payment status tracking.

## Architecture

### Firebase Backend Integration
- **Authentication**: Firebase Auth (email/password sign-in and registration)
- **Database**: Firestore (initialized but not yet used in UI)
- **File Storage**: Firebase Cloud Storage (initialized for document uploads)

See [src/firebaseConfig.js](src/firebaseConfig.js) for all Firebase service initialization.

### Component Structure
- **App.jsx** ([src/App.jsx](src/App.jsx)): Main router component with auth state management using `auth.onAuthStateChanged()`. Renders Loading → Login → Dashboard based on user state.
- **Login.jsx** ([src/components/Login.jsx](src/components/Login.jsx)): Dual-mode auth component supporting both login and signup. Error handling uses Firebase error messages directly.

### Hosting
- Built for Firebase Hosting (see [firebase.json](firebase.json))
- SPA rewrites all routes to `/index.html`
- Production build outputs to `/dist`

## Key Patterns & Conventions

### Authentication Flow
- **Startup**: `useEffect` with `auth.onAuthStateChanged()` listener to detect logged-in state
- **Logout**: Direct `signOut(auth)` call without additional cleanup (Firebase handles session)
- **Error Display**: Firebase exception messages shown directly to users (e.g., "invalid-email", "wrong-password")
- Currently no user profile enrichment - using only Firebase `currentUser.email`

### Component Design
- Functional components with React Hooks (useState, useEffect)
- Loading states managed at app level (`loading` in App.jsx)
- Form submission prevents default and includes try/catch with finally block for loading state

### Internationalization
- **Spanish UI**: All strings are in Spanish (interface labels, error messages, placeholders)
- Planned features mentioned in dashboard: "Mis Documentos", "Mi Credencial", "Mis Armas", "Pagos"
- Comments in code are in Spanish

### Styling
- CSS files co-located with components ([src/components/Login.css](src/components/Login.css), [src/App.css](src/App.css))
- Emoji used in headings (e.g., `🎯 Club 738`)

## Development Workflow

### Running the Project
```bash
# Build for production
npm run build  # Outputs to /dist

# Deploy to Firebase Hosting
firebase deploy
```

### Adding Features
1. **New Components**: Create in `src/components/` with paired `.jsx` and `.css` files
2. **Firebase Operations**: Import from `firebaseConfig.js` (don't create new instances)
3. **State Management**: Use component-level hooks; no Redux/context store currently
4. **User Context**: Access via `auth.currentUser` after login; wrap async calls in try/catch

### Auth-Protected Routes
Add conditional rendering in App.jsx based on `user` state (see existing pattern with `if (!user)` check).

## Critical Dependencies

- **react**: 18.x (functional components with hooks)
- **firebase**: 11.x SDK
- **react-dom**: For rendering

## Next Steps for Future Development

Based on dashboard UI hints, expected features include:
- Document upload/download (Firebase Storage integration needed)
- Member credential generation (likely PDF from template)
- Weapon registry CRUD (Firestore collection design needed)
- Payment status tracking (Firestore query or API integration)
- User profile completion (extend currentUser with Firestore doc)

## Common Gotchas

- Firebase API keys are exposed in source (fine for public web apps, but security rules matter)
- Auth state changes can occur outside the app (other tab sign-out) - `onAuthStateChanged` handles this
- Component unmounting: Always cleanup Firebase listeners (see `return () => unsubscribe()` pattern)
- Forms don't validate email/password strength - rely on Firebase validation
