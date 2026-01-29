# Haven - Encrypted Messaging Authentication

A modern, secure sign-in/authentication page for Haven, an end-to-end encrypted messaging application.

## Features

- **Modern UI**: Built with React, TailwindCSS, and custom UI components
- **Dual Mode**: Toggle between Sign In and Sign Up
- **Security Focused**: Password visibility toggle, encryption messaging
- **Responsive Design**: Works seamlessly on all device sizes
- **Dark Mode Support**: Automatic dark mode styling
- **Beautiful Gradients**: Purple-themed gradient backgrounds
- **Form Validation**: Built-in HTML5 validation
- **Icon Integration**: Lucide React icons for visual appeal

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Custom UI Components**: Reusable Button, Input, Card, and Label components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. **(Optional) Supabase** – For accounts, recovery keys, contacts, and notifications in Supabase:
   - Create a project at [supabase.com](https://supabase.com).
   - Run `supabase/schema.sql` in the SQL Editor (Dashboard → SQL Editor).
   - Copy `.env.example` to `.env` and set:
     - `VITE_SUPABASE_URL` = your project URL
     - `VITE_SUPABASE_ANON_KEY` = your anon key
   - Without these, the app uses `localStorage` (fine for local testing).

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
sign in/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Label.jsx
│   │   └── AuthPage.jsx
│   ├── lib/
│   │   └── utils.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Features Breakdown

### Sign In Mode
- Email input
- Password input with visibility toggle
- Forgot password link
- Switch to Sign Up option

### Sign Up Mode
- Full name input
- Email input
- Password input with visibility toggle
- Confirm password input
- Switch to Sign In option

## Customization

### Colors
The primary color is purple (`#8B5CF6`). To change it, modify the `--primary` CSS variable in `src/index.css`.

### Branding
Update the app name and description in:
- `src/components/AuthPage.jsx` (main heading)
- `index.html` (page title)

## Security Notes

This is a frontend authentication UI. For production use, you should:
- Implement proper backend authentication
- Add CSRF protection
- Use HTTPS
- Implement rate limiting
- Add proper password strength validation
- Implement 2FA/MFA
- Use secure session management

## License

MIT
