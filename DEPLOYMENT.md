# Deployment Guide - Credit Card Management System

This guide covers how to deploy the Credit Card Management System to GitHub Pages and configure Firebase for production use.

## Prerequisites

Before deployment, ensure you have:

1. A GitHub account
2. Git installed on your computer
3. A Firebase project with Authentication and Firestore enabled
4. Node.js and npm (optional, for running local tests)

## Step 1: Create a GitHub Repository

1. Log in to your GitHub account
2. Click the "+" button in the top-right corner and select "New repository"
3. Enter a repository name (e.g., "credit-card-management")
4. Choose "Public" or "Private" visibility as needed
5. Check "Add a README file"
6. Click "Create repository"

## Step 2: Clone the Repository

```bash
git clone https://github.com/yourusername/credit-card-management.git
cd credit-card-management
```

## Step 3: Add Your Project Files

Copy all project files to the repository folder:

```bash
# Replace /path/to/your/project with the actual path
cp -r /path/to/your/project/* .
```

## Step 4: Update Firebase Configuration

1. Make sure your Firebase configuration in `assets/js/firebase-config.js` is set up for production
2. Configure Firebase Authentication providers (Email/Password)
3. Set up Firestore security rules for production

**Example Firebase Security Rules:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read their own data
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Allow admins to read all user data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Card rules - users can only access their own cards
    match /cards/{cardId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
      // Admins can access all cards
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Transaction rules
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
      // Admins can access all transactions
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Step 5: Commit and Push to GitHub

```bash
git add .
git commit -m "Initial project upload"
git push origin main
```

## Step 6: Configure GitHub Pages

1. Go to your GitHub repository
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "main" branch
5. Click "Save"
6. Wait a few minutes for the deployment to complete
7. GitHub will provide a URL where your site is published (e.g., https://yourusername.github.io/credit-card-management/)

## Step 7: Configure Firebase for GitHub Pages

1. Go to your Firebase console
2. Select your project
3. Go to "Authentication" → "Sign-in method" → "Authorized domains"
4. Add your GitHub Pages domain (e.g., yourusername.github.io)

## Step 8: Testing the Deployed Application

1. Visit your GitHub Pages URL
2. Test all functionality:
   - User authentication
   - Admin login
   - Card management
   - Transaction history
   - Admin features

## Step 9: Setting Up Custom Domain (Optional)

If you want to use a custom domain:

1. Purchase a domain from a domain registrar
2. Go to your GitHub repository settings
3. Under "GitHub Pages", enter your custom domain
4. Update your DNS settings at your domain registrar:
   - Create an A record that points to GitHub Pages IP addresses:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Or create a CNAME record pointing to your GitHub Pages URL

## Step 10: Add Admin Users

For security reasons, admin users should be created directly in Firebase console:

1. Go to Firebase console → Firestore Database
2. Create or edit a user document
3. Set the `role` field to `"admin"`

## Troubleshooting

### Blank Page After Deployment

- Check browser console for errors
- Ensure all paths are relative, not absolute
- Verify Firebase configuration is correct

### Authentication Errors

- Check if your domain is added to Firebase authorized domains
- Verify Firebase API keys and configuration

### Firestore Access Errors

- Check your Firebase security rules
- Verify user permissions

## Maintenance

### Updating Your Application

1. Make changes locally
2. Test thoroughly
3. Commit and push changes:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

GitHub Pages will automatically update with your new changes.

### Monitoring

- Set up Firebase Analytics to monitor usage
- Use Firebase Performance Monitoring for performance tracking
- Configure Firebase Crash Reporting for error tracking

## Security Considerations

1. Never commit sensitive API keys or secrets to GitHub
2. Use environment variables for sensitive information
3. Implement proper authentication and authorization
4. Regularly update dependencies
5. Set up strong security rules in Firebase

## Backup Strategy

1. Export Firestore data regularly
2. Keep local copies of your codebase
3. Consider setting up automated backups

---

For any issues with deployment, please refer to:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting) 