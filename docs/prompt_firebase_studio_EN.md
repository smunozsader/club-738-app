# Firebase Studio Prompt - Club 738 Web Portal Redesign

## ⚠️ IMPORTANT: Before You Start

1. **Analyze the codebase first** - Review the existing components, CSS files, and structure before making any changes
2. **Create a new branch** - All changes must be on a separate branch:
   ```bash
   git checkout -b facelift/visual-redesign
   ```
3. **Club logo is at:** `public/assets/logo-club-738.jpg` - incorporate it into your designs

---

## Project Overview

This is a functional React + Vite web application deployed on Firebase Hosting. It serves as the member portal for a sport shooting club in Mexico (Club de Caza, Tiro y Pesca de Yucatán, A.C. - Hunting, Shooting & Fishing Club of Yucatan).

**Production URL:** https://yucatanctp.org

---

## Current Tech Stack

- **Frontend:** React 18 + Vite 5
- **Styling:** Co-located CSS files (ComponentName.jsx + ComponentName.css)
- **Backend:** Firebase (Authentication, Firestore, Cloud Storage, Hosting)
- **Language:** 100% Spanish UI (consider adding English translation feature)

---

## What I Need: Complete Visual Redesign

I'm looking for a **modern, professional visual redesign** of the entire frontend. You have **creative freedom** to suggest:

- New layouts and component arrangements
- Additional sections and features
- Modern UI patterns and interactions
- AI-generated imagery to illustrate the website
- Your own color palette recommendations (with accessibility in mind)

### Target Users

1. **Public visitors** - Potential new members browsing the landing page
2. **Club members (Socios)** - Authenticated users managing their documents and permits
3. **Club Secretary (Admin)** - Managing member records, payments, and permit processing

### Core Pages to Redesign

#### 1. Landing Page (Public)
This page serves as **marketing/advertising** to attract new members while providing access to existing members.

**Current features:**
- Hero section with club information
- Feature cards (Calendar, Calculator, Membership info)
- Login portal for members
- SEDENA links section
- Contact information and social media

**Suggestions welcome:**
- Photo galleries / Competition albums
- Testimonials from members
- Interactive elements
- Video backgrounds or hero images
- Animated statistics or counters
- News/Events section

#### 2. Member Dashboard (Authenticated)
Portal for members to manage their documentation for PETA permits (firearm transport permits from Mexican military authority - SEDENA).

**Current features:**
- Document upload/management (Digital Dossier)
- Registered firearms list
- PETA request tracking
- Payment status
- Official documents (CURP, Background Check)

#### 3. Admin/Secretary Panel
Tools for club administration.

**Current features:**
- Member verification checklists
- Payment registration
- Cash register reports
- Member demographics
- PETA document generator (PDF)
- Document printing preparation

#### 4. Public Tools
- Competition calendar (Club + Regional events)
- PCP Energy Calculator (air rifle regulations)

---

## Design Guidelines

### Must Follow

✅ **Accessibility Best Practices**
- WCAG 2.1 compliance
- Sufficient color contrast ratios
- Keyboard navigable
- Screen reader friendly
- Clear focus indicators

✅ **Mobile-First & Responsive**
- Optimized for mobile web browsers
- Touch-friendly interfaces
- Responsive layouts for all screen sizes
- Fast loading on mobile networks

✅ **Professional Aesthetic**
- Clean, modern, and sophisticated
- NOT childish or playful
- Trustworthy appearance (handling sensitive government documents)
- Appropriate for a sports organization

✅ **Firebase Compatibility**
- Maintain compatibility with Firebase Auth, Firestore, Storage
- Keep deployment-ready for Firebase Hosting

✅ **Spanish Language**
- All UI text must remain in SPANISH
- Consider implementing a language toggle (Spanish/English) as future feature

### Must Avoid

❌ **No weapon emojis** (🔫🎯🦆) - Maintain professional image
- Instead, use AI-generated images (via your tools) that are tasteful and appropriate
- Nature scenes, sporting activities, outdoor lifestyle imagery

❌ **No hardcoded color restrictions**
- You have freedom to propose your own color palette
- Prioritize accessibility and contrast
- Consider the outdoor/sporting nature of the club

---

## Creative Freedom Areas

I encourage you to suggest improvements in these areas:

### Visual Identity
- Propose a modern color palette with good accessibility
- Suggest typography pairings
- Design a visual language/style guide
- Create or suggest iconography style

### New Sections/Features
- Photo galleries of competitions and events
- Member spotlight or testimonials
- Interactive club history timeline
- Virtual tour of shooting range
- Social media feed integration
- Newsletter signup
- FAQ accordions
- Achievement badges or gamification elements

### Interactions & Animations
- Micro-interactions on buttons and cards
- Smooth page transitions
- Loading states and skeletons
- Scroll-triggered animations
- Hover effects

### Layout Innovations
- Modern dashboard layouts
- Card-based designs
- Sidebar navigation alternatives
- Floating action buttons
- Bottom navigation for mobile

---

## Technical Context

### Main Files to Review
```
src/
├── App.jsx + App.css              # Main router and global styles
├── components/
│   ├── LandingPage.jsx + .css     # Public homepage
│   ├── Login.jsx + .css           # Authentication
│   ├── CalendarioTiradas.jsx      # Competition calendar
│   ├── CalculadoraPCP.jsx         # Energy calculator
│   ├── MisArmas.jsx               # Member's firearms
│   ├── SolicitarPETA.jsx          # PETA request form
│   ├── MisPETAs.jsx               # PETA tracking
│   ├── VerificadorPETA.jsx        # Admin verification
│   ├── ExpedienteImpresor.jsx     # Document printer
│   ├── RegistroPagos.jsx          # Payment registration
│   ├── ReporteCaja.jsx            # Cash reports
│   └── documents/
│       ├── DocumentList.jsx       # Digital dossier
│       └── DocumentCard.jsx       # Document cards
```

### Current CSS Variables (App.css)
The app currently uses CSS custom properties. Feel free to completely redesign the color system:
```css
:root {
  --color-primary: #2d5a2d;
  --color-primary-dark: #1a2e1a;
  /* ... etc */
}
```

---

## Deliverables Expected

1. **Visual Redesign Proposal**
   - Mockups or design concepts
   - Color palette with accessibility ratios
   - Typography recommendations

2. **Updated CSS Files**
   - Modern styling for all components
   - CSS variables for theming
   - Responsive breakpoints

3. **JSX Structure Improvements** (if needed)
   - Better semantic HTML
   - Improved component organization
   - New sections/components you recommend

4. **AI-Generated Assets**
   - Hero images
   - Illustrative graphics
   - Icons or decorative elements

---

## Questions for You (Gemini)

Before starting, please consider:

1. What color palette would you recommend for a professional sports club that deals with outdoor activities (hunting, shooting, fishing)?

2. What modern UI patterns would work best for a document management portal?

3. What additional sections would make the landing page more compelling for potential new members?

4. How can we make the mobile experience exceptional?

---

## Let's Begin!

**Scope: COMPLETE REDESIGN** - Redesign ALL pages and components in a single comprehensive effort.

**Workflow:**
1. Create branch `facelift/visual-redesign`
2. Analyze existing code structure
3. Propose your design vision (colors, typography, layout approach)
4. Implement changes across all components
5. Test responsiveness and accessibility
6. Commit changes with clear messages

Please analyze the current codebase and transform this functional portal into a modern, professional, and visually stunning web application.

Remember: **You have creative freedom** - surprise me with innovative ideas while respecting the technical constraints and accessibility requirements.
