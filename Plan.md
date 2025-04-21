# Credit Card Management Software - Project Plan

## Overview
A web-based Credit Card Management System with two user roles: Admin and Regular Users. The system will use Firebase for authentication and database storage, and will be deployed on GitHub Pages.

## Technology Stack
- HTML5, CSS3, JavaScript (Frontend)
- Firebase Authentication (User management)
- Firebase Firestore (Database)
- GitHub Pages (Deployment)

## Project Structure

```
credit-card-management/
│
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   └── admin.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── firebase-config.js
│   │   ├── dashboard.js
│   │   └── admin.js
│   └── images/
│       ├── logo.png
│       └── card-templates/
│
├── index.html (Home/Login page)
├── signup.html
├── dashboard.html
├── admin-login.html
├── admin-dashboard.html
└── README.md
```

## Features & Implementation Plan

### Phase 1: Project Setup & Authentication (Week 1)
1. **Setup Firebase Project**
   - Create a new Firebase project
   - Configure Authentication (Email & Password)
   - Setup Firestore database
   - Create necessary collections: users, cards, transactions

2. **Authentication Pages**
   - Create homepage with login form
   - Develop signup page
   - Create admin login page
   - Implement login/signup functionality using Firebase Auth
   - Create user role differentiation (admin vs regular users)

### Phase 2: User Dashboard Development (Week 2)
1. **User Dashboard**
   - Display user profile information
   - Show user's credit cards in a grid/list view
   - Create "Add Card" functionality
   - Implement card limit management feature
   - Develop transaction history viewing

2. **Card Management Features**
   - Form for adding new credit cards
   - Interface for modifying card limits
   - Mock transaction generation/display
   - Data validation and error handling

### Phase 3: Admin Features (Week 3)
1. **Admin Dashboard**
   - Overview of all users
   - View all cards in the system
   - Ability to manage user accounts
   - System statistics display

2. **Admin Management Features**
   - User approval/blocking
   - Global card limit settings
   - Advanced filtering and searching
   - Admin profile management

### Phase 4: Testing & Deployment (Week 4)
1. **Testing**
   - Test all features across different browsers
   - Fix any bugs or issues
   - Optimize for performance

2. **Deployment**
   - Setup GitHub repository
   - Configure GitHub Pages
   - Deploy the application
   - Create documentation

## Firebase Database Structure

### Collections

1. **users**
   ```
   {
     uid: string,
     email: string,
     name: string,
     role: string (admin/user),
     created_at: timestamp
   }
   ```

2. **cards**
   ```
   {
     card_id: string,
     user_id: string,
     card_number: string (masked),
     card_type: string,
     card_name: string,
     limit: number,
     available_limit: number,
     expiry_date: string,
     created_at: timestamp
   }
   ```

3. **transactions**
   ```
   {
     transaction_id: string,
     card_id: string,
     user_id: string,
     amount: number,
     type: string (credit/debit),
     merchant: string,
     date: timestamp,
     status: string
   }
   ```

## Implementation Details

### 1. Authentication
- Use Firebase email/password authentication
- Store user role in Firestore after signup
- Admin credentials will be pre-configured
- Redirect to appropriate dashboard based on role

### 2. User Dashboard
- Fetch and display cards from Firestore
- Implement modal/form for adding new cards
- Create slider/input for modifying card limits
- Develop transaction table with sorting/filtering

### 3. Admin Features
- Admin-specific navigation and controls
- User management interface
- System-wide statistics and reporting
- Privilege-based access control

### 4. Security Rules
- Implement Firebase security rules to protect data
- Ensure users can only access their own data
- Admin has access to all data but with specific restrictions

## Deployment Strategy
1. Create a GitHub repository for the project
2. Configure GitHub Pages in repository settings
3. Ensure Firebase configuration is properly set up for web deployment
4. Deploy and test the live application

## Minimal Viable Product Features
For the professor evaluation, focus on these core features:
1. User authentication (signup/login)
2. Admin login with special privileges
3. Display of user's credit cards
4. Add new credit card functionality
5. Change credit limit feature
6. View transaction history
7. Basic admin overview of system

## Evaluation Checklist
- ✓ Working user authentication
- ✓ Role-based access (admin/user)
- ✓ Credit card display and management
- ✓ Card limit adjustment functionality
- ✓ Transaction history display
- ✓ Firebase integration
- ✓ Clean, minimal UI
- ✓ Responsive design
- ✓ GitHub Pages deployment