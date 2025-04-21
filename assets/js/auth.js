// Auth related functions

// DOM Elements - will check which page we're on and get the appropriate elements
document.addEventListener('DOMContentLoaded', () => {
    // Regular user login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // User signup
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Admin login
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Check if user is already logged in
    checkAuthState();
});

// Handle user login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    // Clear previous error messages
    errorMessage.textContent = '';
    
    // Firebase authentication
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Check if the user is a regular user (not admin)
            return usersCollection.doc(userCredential.user.uid).get()
                .then((doc) => {
                    if (doc.exists && doc.data().role === 'user') {
                        window.location.href = 'dashboard.html';
                    } else {
                        // If trying to log in as admin using user login
                        auth.signOut();
                        errorMessage.textContent = 'Invalid user account. Use admin login for admin accounts.';
                    }
                });
        })
        .catch((error) => {
            errorMessage.textContent = getErrorMessage(error);
        });
}

// Handle user signup
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('error-message');
    
    // Clear previous error messages
    errorMessage.textContent = '';
    
    // Validate passwords
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match.';
        return;
    }
    
    // Firebase authentication - create new user
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Add user to Firestore
            return usersCollection.doc(userCredential.user.uid).set({
                uid: userCredential.user.uid,
                name: name,
                email: email,
                role: 'user',
                created_at: new Date()
            })
            .then(() => {
                window.location.href = 'dashboard.html';
            });
        })
        .catch((error) => {
            errorMessage.textContent = getErrorMessage(error);
        });
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    // Clear previous error messages
    errorMessage.textContent = '';
    
    // Firebase authentication
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Check if the user is an admin
            return usersCollection.doc(userCredential.user.uid).get()
                .then((doc) => {
                    if (doc.exists && doc.data().role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        // If trying to log in as user using admin login
                        auth.signOut();
                        errorMessage.textContent = 'Invalid admin credentials.';
                    }
                });
        })
        .catch((error) => {
            errorMessage.textContent = getErrorMessage(error);
        });
}

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            usersCollection.doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        
                        // Redirect based on role and current page
                        const currentPath = window.location.pathname;
                        const isAuthPage = 
                            currentPath.includes('index.html') || 
                            currentPath.includes('signup.html') || 
                            currentPath.includes('admin-login.html') || 
                            currentPath === '/';
                        
                        if (isAuthPage) {
                            if (userData.role === 'admin') {
                                window.location.href = 'admin-dashboard.html';
                            } else {
                                window.location.href = 'dashboard.html';
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error getting user data:", error);
                });
        }
    });
}

// Helper function to get user-friendly error messages
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'Email is already in use.';
        case 'auth/weak-password':
            return 'Password is too weak. It should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        default:
            return 'An error occurred. Please try again.';
    }
} 