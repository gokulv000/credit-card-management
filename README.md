# Credit Card Management System

A web-based system for managing credit cards with user and admin interfaces. Built with HTML, CSS, JavaScript, and Firebase.

## Features

- User authentication (signup, login, logout)
- Admin authentication with special privileges
- Credit card management (add, view)
- Transaction history viewing
- Admin dashboard with user management
- Responsive design for all devices

## Project Setup

### Prerequisites

- Node.js and npm (for optional local server)
- Firebase account
- Modern web browser

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
3. Create Firestore Database:
   - Go to Firestore Database > Create database
   - Start in production mode
   - Choose a location closest to your users
4. Set up Firebase project configuration:
   - Go to Project settings > General
   - Scroll down to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Register the app with a nickname
   - Copy the firebaseConfig object
   - Replace the configuration in `assets/js/firebase-config.js` with your configuration

### Project Configuration

1. Clone or download this repository
2. Open `assets/js/firebase-config.js` and replace the placeholder Firebase configuration with your own
3. Create an admin user (optional):
   - Sign up using the application
   - Go to Firebase Console > Firestore Database
   - Find the user in the 'users' collection
   - Edit the document and change the 'role' field from 'user' to 'admin'

### Running the Application

You can run the application using any of these methods:

#### 1. Using a local server:

```bash
# Install a simple HTTP server
npm install -g http-server

# Run the server in the project directory
http-server -c-1 # -c-1 disables caching
```

Then open `http://localhost:8080` in your browser.

#### 2. Using GitHub Pages (for production):

1. Push the code to a GitHub repository
2. Go to repository Settings > Pages
3. Select the branch to deploy (usually 'main')
4. Set the root directory as the source
5. Click Save and wait for deployment
6. Access your application at `https://username.github.io/repository-name/`

#### 3. Direct file opening:

Simply open `index.html` in your web browser (some features might be limited due to CORS restrictions).

## File Structure

```
credit-card-management/
│
├── assets/
│   ├── css/
│   │   ├── style.css (Main styles)
│   │   ├── auth.css (Authentication styles)
│   │   ├── dashboard.css (User dashboard styles)
│   │   └── admin.css (Admin dashboard styles)
│   ├── js/
│   │   ├── firebase-config.js (Firebase setup)
│   │   ├── auth.js (Authentication logic)
│   │   ├── dashboard.js (User dashboard logic)
│   │   └── admin.js (Admin dashboard logic)
│   └── images/
│       ├── logo.png
│       └── card-templates/
│
├── index.html (Login page)
├── signup.html
├── dashboard.html
├── admin-login.html
├── admin-dashboard.html
└── README.md
```

## Security Considerations

- The project uses client-side security patterns suitable for demo/learning purposes
- In a production environment, additional server-side validation would be recommended
- Credit card numbers are stored directly in Firestore in this demo - in a real application, you should:
  - Implement proper encryption
  - Use a PCI-compliant payment processor
  - Never store sensitive card data directly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 