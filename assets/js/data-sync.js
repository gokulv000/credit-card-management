// Utility script to sync Firebase Auth users with Firestore
// This is a one-time script to ensure all Auth users have corresponding Firestore documents

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're logged in as admin
    const syncButton = document.getElementById('syncUsersButton');
    if (syncButton) {
        syncButton.addEventListener('click', syncAuthUsersWithFirestore);
    }
});

// Function to sync existing auth users with Firestore
function syncAuthUsersWithFirestore() {
    const statusElement = document.getElementById('syncStatus');
    
    // Check if we're logged in as admin
    auth.onAuthStateChanged(user => {
        if (user) {
            usersCollection.doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    // We're an admin, proceed with sync
                    performSync(statusElement);
                } else {
                    statusElement.innerHTML = '<p class="error">Error: Admin privileges required to sync users</p>';
                }
            });
        } else {
            statusElement.innerHTML = '<p class="error">Error: You must be logged in as admin</p>';
        }
    });
}

// Perform the actual sync operation
function performSync(statusElement) {
    statusElement.innerHTML = '<p>Starting sync process...</p>';
    
    // Get all authenticated users
    getAllAuthUsers().then(authUsers => {
        statusElement.innerHTML += `<p>Found ${authUsers.length} authenticated users</p>`;
        
        // Get all Firestore users
        usersCollection.get().then(snapshot => {
            const firestoreUsers = {};
            snapshot.forEach(doc => {
                firestoreUsers[doc.data().uid] = doc.data();
            });
            
            statusElement.innerHTML += `<p>Found ${Object.keys(firestoreUsers).length} Firestore user documents</p>`;
            
            // Find users that exist in Auth but not in Firestore
            const usersToAdd = authUsers.filter(authUser => 
                !firestoreUsers[authUser.uid]
            );
            
            statusElement.innerHTML += `<p>Found ${usersToAdd.length} users to add to Firestore</p>`;
            
            if (usersToAdd.length === 0) {
                statusElement.innerHTML += '<p class="success">Sync complete! All Auth users already exist in Firestore.</p>';
                return;
            }
            
            // Add missing users to Firestore
            const batch = db.batch();
            
            usersToAdd.forEach(authUser => {
                const userRef = usersCollection.doc(authUser.uid);
                batch.set(userRef, {
                    uid: authUser.uid,
                    email: authUser.email,
                    name: authUser.displayName || authUser.email.split('@')[0],
                    role: 'user', // Default role
                    status: 'active',
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            // Commit the batch
            batch.commit().then(() => {
                statusElement.innerHTML += `<p class="success">Successfully added ${usersToAdd.length} users to Firestore!</p>`;
            }).catch(error => {
                statusElement.innerHTML += `<p class="error">Error adding users to Firestore: ${error.message}</p>`;
            });
        }).catch(error => {
            statusElement.innerHTML += `<p class="error">Error getting Firestore users: ${error.message}</p>`;
        });
    }).catch(error => {
        statusElement.innerHTML += `<p class="error">Error getting Auth users: ${error.message}</p>`;
    });
}

// Helper function to get all authenticated users
// Note: This is a simulated function since client-side JS can't list all users
// In a real application, this would be a Cloud Function or Admin SDK operation
function getAllAuthUsers() {
    return new Promise((resolve, reject) => {
        // This is a fallback that uses the current user as a proxy
        // In production, use Firebase Admin SDK in a secure environment
        auth.onAuthStateChanged(user => {
            if (user) {
                // Simulate getting all users (in reality we can only get the current user)
                resolve([{
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                }]);
                
                // Display warning about limitations
                const statusElement = document.getElementById('syncStatus');
                if (statusElement) {
                    statusElement.innerHTML += `
                        <p class="warning">
                            ⚠️ Warning: The client-side Firebase SDK can't list all users. 
                            This demo only processes the current user. 
                            For a complete sync, use Firebase Admin SDK in a secure environment.
                        </p>
                    `;
                }
            } else {
                reject(new Error('No user is currently logged in'));
            }
        });
    });
}

// Export the function for use in other scripts or console
window.syncAuthUsersWithFirestore = syncAuthUsersWithFirestore; 