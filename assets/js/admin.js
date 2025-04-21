// Admin Dashboard functionality

// DOM Elements
let adminName;
let logoutBtn;
let totalUsers;
let totalCards;
let todayTransactions;
let usersTableBody;
let cardsTableBody;
let searchUserInput;
let searchCardInput;
let userFilterSelect;
let cardFilterSelect;
let globalLimitBtn;

// Modal elements
let userDetailsModal;
let closeUserDetailsBtn;
let userDetailsContent;
let globalLimitModal;
let closeGlobalLimitBtn;
let globalLimitForm;

// Current admin data
let currentAdmin = null;
let allUsers = [];
let allCards = [];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    adminName = document.getElementById('adminName');
    logoutBtn = document.getElementById('logoutBtn');
    totalUsers = document.getElementById('totalUsers');
    totalCards = document.getElementById('totalCards');
    todayTransactions = document.getElementById('todayTransactions');
    usersTableBody = document.getElementById('usersTableBody');
    cardsTableBody = document.getElementById('cardsTableBody');
    searchUserInput = document.getElementById('searchUser');
    searchCardInput = document.getElementById('searchCard');
    userFilterSelect = document.getElementById('userFilter');
    cardFilterSelect = document.getElementById('cardFilter');
    globalLimitBtn = document.getElementById('globalLimitBtn');
    
    // Get modal elements
    userDetailsModal = document.getElementById('userDetailsModal');
    closeUserDetailsBtn = userDetailsModal.querySelector('.close-btn');
    userDetailsContent = document.getElementById('userDetailsContent');
    
    globalLimitModal = document.getElementById('globalLimitModal');
    closeGlobalLimitBtn = globalLimitModal.querySelector('.close-btn');
    globalLimitForm = document.getElementById('globalLimitForm');

    // Add event listeners
    logoutBtn.addEventListener('click', handleLogout);
    globalLimitBtn.addEventListener('click', openGlobalLimitModal);
    closeUserDetailsBtn.addEventListener('click', closeUserDetailsModal);
    closeGlobalLimitBtn.addEventListener('click', closeGlobalLimitModal);
    globalLimitForm.addEventListener('submit', handleGlobalLimitUpdate);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === userDetailsModal) {
            closeUserDetailsModal();
        }
        if (e.target === globalLimitModal) {
            closeGlobalLimitModal();
        }
    });
    
    // Add search functionality
    if (searchUserInput) {
        searchUserInput.addEventListener('input', () => {
            const searchTerm = searchUserInput.value.toLowerCase();
            filterUsers(searchTerm, userFilterSelect.value);
        });
    }
    
    if (searchCardInput) {
        searchCardInput.addEventListener('input', () => {
            const searchTerm = searchCardInput.value.toLowerCase();
            filterCards(searchTerm, cardFilterSelect.value);
        });
    }
    
    // Add filter functionality
    if (userFilterSelect) {
        userFilterSelect.addEventListener('change', () => {
            const searchTerm = searchUserInput.value.toLowerCase();
            filterUsers(searchTerm, userFilterSelect.value);
        });
    }
    
    if (cardFilterSelect) {
        cardFilterSelect.addEventListener('change', () => {
            const searchTerm = searchCardInput.value.toLowerCase();
            filterCards(searchTerm, cardFilterSelect.value);
        });
    }

    // Check authentication state
    checkAuth();
});

// Check if admin is authenticated
function checkAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in, check if admin
            usersCollection.doc(user.uid).get()
                .then(doc => {
                    if (doc.exists && doc.data().role === 'admin') {
                        // User is an admin
                        currentAdmin = user;
                        adminName.textContent = doc.data().name;
                        
                        // Load admin dashboard data
                        loadDashboardStats();
                        loadUsers();
                        loadCards();
                    } else {
                        // Not an admin, redirect to user dashboard
                        window.location.href = 'dashboard.html';
                    }
                })
                .catch(error => {
                    console.error("Error checking admin status:", error);
                    handleLogout();
                });
        } else {
            // User is not signed in, redirect to login
            window.location.href = 'admin-login.html';
        }
    });
}

// Load dashboard statistics
function loadDashboardStats() {
    // Count total users (excluding admins)
    usersCollection.where('role', '==', 'user').get()
        .then(snapshot => {
            totalUsers.textContent = snapshot.size;
        })
        .catch(error => {
            console.error("Error counting users:", error);
            totalUsers.textContent = 'Error';
        });
    
    // Count total cards
    cardsCollection.get()
        .then(snapshot => {
            totalCards.textContent = snapshot.size;
        })
        .catch(error => {
            console.error("Error counting cards:", error);
            totalCards.textContent = 'Error';
        });
    
    // Count today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    transactionsCollection.where('date', '>=', today).get()
        .then(snapshot => {
            todayTransactions.textContent = snapshot.size;
        })
        .catch(error => {
            console.error("Error counting transactions:", error);
            todayTransactions.textContent = 'Error';
        });
}

// Load all users
function loadUsers() {
    usersTableBody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading users...</td></tr>';
    
    usersCollection.where('role', '==', 'user').get()
        .then(snapshot => {
            if (snapshot.empty) {
                usersTableBody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
                return;
            }
            
            // Clear loading indicator
            usersTableBody.innerHTML = '';
            allUsers = [];
            
            // Display users
            const promises = [];
            snapshot.forEach(doc => {
                const userData = doc.data();
                userData.id = doc.id;
                allUsers.push(userData);
                
                // Count cards for this user
                const promise = cardsCollection.where('user_id', '==', userData.uid).get()
                    .then(cardsSnapshot => {
                        userData.cardCount = cardsSnapshot.size;
                        // Return the completed user data
                        return userData;
                    });
                
                promises.push(promise);
            });
            
            // After all card counts are fetched
            Promise.all(promises).then(users => {
                // Sort users by name
                users.sort((a, b) => a.name.localeCompare(b.name));
                
                // Display each user
                users.forEach(userData => {
                    // Create user row
                    const userRow = createUserRow(userData.id, userData, userData.cardCount);
                    usersTableBody.innerHTML += userRow;
                });
                
                // Add event listeners for action buttons
                addUserActionListeners();
            });
        })
        .catch(error => {
            console.error("Error loading users:", error);
            usersTableBody.innerHTML = '<tr><td colspan="6" class="error-message">Failed to load users</td></tr>';
        });
}

// Create a row for a user
function createUserRow(userId, userData, cardCount) {
    const created = userData.created_at.toDate().toLocaleDateString();
    
    // Determine user status
    let statusClass = 'status-active';
    let statusText = 'Active';
    
    if (userData.status === 'blocked') {
        statusClass = 'status-blocked';
        statusText = 'Blocked';
    } else if (userData.status === 'pending') {
        statusClass = 'status-pending';
        statusText = 'Pending';
    }
    
    return `
        <tr data-user-id="${userId}" class="user-row">
            <td>${userData.name}</td>
            <td>${userData.email}</td>
            <td>${created}</td>
            <td>${cardCount}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view-btn" data-action="view" data-user-id="${userId}">View</button>
                    <button class="action-btn edit-btn" data-action="edit" data-user-id="${userId}">Edit</button>
                    ${statusText === 'Blocked' ? 
                      `<button class="action-btn activate-btn" data-action="activate" data-user-id="${userId}">Activate</button>` : 
                      `<button class="action-btn delete-btn" data-action="block" data-user-id="${userId}">Block</button>`
                    }
                </div>
            </td>
        </tr>
    `;
}

// Add event listeners to user action buttons
function addUserActionListeners() {
    // View user buttons
    const viewBtns = document.querySelectorAll('button[data-action="view"]');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.getAttribute('data-user-id');
            viewUserDetails(userId);
        });
    });
    
    // Edit user buttons
    const editBtns = document.querySelectorAll('button[data-action="edit"]');
    editBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.getAttribute('data-user-id');
            editUser(userId);
        });
    });
    
    // Block user buttons
    const blockBtns = document.querySelectorAll('button[data-action="block"]');
    blockBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.getAttribute('data-user-id');
            blockUser(userId);
        });
    });
    
    // Activate user buttons
    const activateBtns = document.querySelectorAll('button[data-action="activate"]');
    activateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.getAttribute('data-user-id');
            activateUser(userId);
        });
    });
}

// Filter users based on search term and filter option
function filterUsers(searchTerm, filterOption) {
    const rows = document.querySelectorAll('.user-row');
    
    rows.forEach(row => {
        const userId = row.getAttribute('data-user-id');
        const userData = allUsers.find(user => user.id === userId);
        
        if (!userData) return;
        
        let shouldShow = true;
        
        // Apply search term filter
        if (searchTerm) {
            const nameMatch = userData.name.toLowerCase().includes(searchTerm);
            const emailMatch = userData.email.toLowerCase().includes(searchTerm);
            shouldShow = nameMatch || emailMatch;
        }
        
        // Apply status filter
        if (shouldShow && filterOption !== 'all') {
            const status = userData.status || 'active'; // Default to active if not set
            shouldShow = status === filterOption;
        }
        
        // Show or hide row
        row.style.display = shouldShow ? '' : 'none';
    });
}

// Load all cards
function loadCards() {
    cardsTableBody.innerHTML = '<tr><td colspan="7" class="loading-cell">Loading cards...</td></tr>';
    
    cardsCollection.get()
        .then(snapshot => {
            if (snapshot.empty) {
                cardsTableBody.innerHTML = '<tr><td colspan="7">No cards found</td></tr>';
                return;
            }
            
            // Clear loading indicator
            cardsTableBody.innerHTML = '';
            allCards = [];
            
            // Process each card
            const promises = [];
            snapshot.forEach(doc => {
                const cardData = doc.data();
                cardData.id = doc.id;
                allCards.push(cardData);
                
                // Get user data for this card
                const promise = usersCollection.doc(cardData.user_id).get()
                    .then(userDoc => {
                        if (userDoc.exists) {
                            cardData.userData = userDoc.data();
                            cardData.userData.id = userDoc.id;
                        }
                        return cardData;
                    });
                
                promises.push(promise);
            });
            
            // After all user data is fetched
            Promise.all(promises).then(cards => {
                // Sort cards by user name then card name
                cards.sort((a, b) => {
                    // First sort by user name
                    const userNameA = a.userData ? a.userData.name : 'Unknown';
                    const userNameB = b.userData ? b.userData.name : 'Unknown';
                    const userCompare = userNameA.localeCompare(userNameB);
                    
                    // If user names are the same, sort by card name
                    if (userCompare === 0) {
                        return a.card_name.localeCompare(b.card_name);
                    }
                    
                    return userCompare;
                });
                
                // Display each card
                cards.forEach(cardData => {
                    // Create card row
                    const cardRow = createCardRow(cardData.id, cardData, cardData.userData);
                    cardsTableBody.innerHTML += cardRow;
                });
                
                // Add event listeners for action buttons
                addCardActionListeners();
            });
        })
        .catch(error => {
            console.error("Error loading cards:", error);
            cardsTableBody.innerHTML = '<tr><td colspan="7" class="error-message">Failed to load cards</td></tr>';
        });
}

// Create a row for a card
function createCardRow(cardId, cardData, userData) {
    // Mask card number for display
    const maskedNumber = maskCardNumber(cardData.card_number);
    const userName = userData ? userData.name : 'Unknown User';
    const utilization = ((cardData.limit - cardData.available_limit) / cardData.limit * 100).toFixed(0) + '%';
    
    return `
        <tr data-card-id="${cardId}" class="card-row" data-user-id="${userData ? userData.id : ''}">
            <td>${userName}</td>
            <td>${cardData.card_name}</td>
            <td>${maskedNumber}</td>
            <td>$${cardData.limit.toFixed(2)}</td>
            <td>$${cardData.available_limit.toFixed(2)}</td>
            <td>${utilization}</td>
            <td>${cardData.expiry_date}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view-btn" data-action="view" data-card-id="${cardId}">View</button>
                    <button class="action-btn edit-btn" data-action="edit" data-card-id="${cardId}">Edit</button>
                    <button class="action-btn delete-btn" data-action="delete" data-card-id="${cardId}">Delete</button>
                </div>
            </td>
        </tr>
    `;
}

// Filter cards based on search term and filter option
function filterCards(searchTerm, filterOption) {
    const rows = document.querySelectorAll('.card-row');
    
    rows.forEach(row => {
        const cardId = row.getAttribute('data-card-id');
        const cardData = allCards.find(card => card.id === cardId);
        
        if (!cardData) return;
        
        let shouldShow = true;
        
        // Apply search term filter
        if (searchTerm) {
            const cardNameMatch = cardData.card_name.toLowerCase().includes(searchTerm);
            const cardNumberMatch = cardData.card_number.includes(searchTerm);
            const userNameMatch = cardData.userData && cardData.userData.name.toLowerCase().includes(searchTerm);
            shouldShow = cardNameMatch || cardNumberMatch || userNameMatch;
        }
        
        // Apply card type filter
        if (shouldShow && filterOption !== 'all') {
            shouldShow = cardData.card_type === filterOption;
        }
        
        // Show or hide row
        row.style.display = shouldShow ? '' : 'none';
    });
}

// Add event listeners to card action buttons
function addCardActionListeners() {
    // View card buttons
    const viewBtns = document.querySelectorAll('button[data-action="view"][data-card-id]');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cardId = btn.getAttribute('data-card-id');
            viewCardDetails(cardId);
        });
    });
    
    // Edit card buttons
    const editBtns = document.querySelectorAll('button[data-action="edit"][data-card-id]');
    editBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cardId = btn.getAttribute('data-card-id');
            editCard(cardId);
        });
    });
    
    // Delete card buttons
    const deleteBtns = document.querySelectorAll('button[data-action="delete"][data-card-id]');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cardId = btn.getAttribute('data-card-id');
            deleteCard(cardId);
        });
    });
}

// View user details
function viewUserDetails(userId) {
    // Find user data
    const userData = allUsers.find(user => user.id === userId);
    
    if (!userData) {
        alert('User not found');
        return;
    }
    
    // Set modal content loading state
    userDetailsContent.innerHTML = '<div class="loading-cell">Loading user details...</div>';
    
    // Open the modal
    userDetailsModal.style.display = 'block';
    
    // Get user's cards
    cardsCollection.where('user_id', '==', userData.uid).get()
        .then(cardsSnapshot => {
            const cards = [];
            cardsSnapshot.forEach(doc => {
                const cardData = doc.data();
                cardData.id = doc.id;
                cards.push(cardData);
            });
            
            // Get user's recent transactions
            return transactionsCollection
                .where('user_id', '==', userData.uid)
                .orderBy('date', 'desc')
                .limit(10)
                .get()
                .then(transactionsSnapshot => {
                    const transactions = [];
                    transactionsSnapshot.forEach(doc => {
                        const txData = doc.data();
                        txData.id = doc.id;
                        transactions.push(txData);
                    });
                    
                    return { cards, transactions };
                });
        })
        .then(({ cards, transactions }) => {
            // Format date objects
            const joinDate = userData.created_at ? new Date(userData.created_at.toDate()).toLocaleDateString() : 'N/A';
            
            // Build user details HTML
            let html = `
                <div class="user-details-header">
                    <h2>${userData.name}</h2>
                    <span class="status-badge status-${userData.status || 'active'}">${userData.status || 'active'}</span>
                </div>
                
                <div class="user-info-grid">
                    <div class="user-info-item">
                        <label>Email</label>
                        <div>${userData.email}</div>
                    </div>
                    <div class="user-info-item">
                        <label>Joined</label>
                        <div>${joinDate}</div>
                    </div>
                    <div class="user-info-item">
                        <label>User ID</label>
                        <div>${userData.uid}</div>
                    </div>
                    <div class="user-info-item">
                        <label>Total Cards</label>
                        <div>${cards.length}</div>
                    </div>
                </div>
                
                <h3>Credit Cards</h3>`;
                
            if (cards.length === 0) {
                html += '<p>This user has no credit cards.</p>';
            } else {
                html += '<div class="user-cards-list">';
                
                cards.forEach(card => {
                    // Calculate utilization percentage
                    const utilization = Math.round(((card.limit - card.available_limit) / card.limit) * 100);
                    
                    html += `
                        <div class="user-card-item">
                            <div class="user-card-header">${card.card_name} (${card.card_type})</div>
                            <div class="user-card-number">${maskCardNumber(card.card_number)}</div>
                            <div class="user-card-details">
                                <div>Limit: $${card.limit.toLocaleString()}</div>
                                <div>Available: $${card.available_limit.toLocaleString()}</div>
                                <div>Utilization: ${utilization}%</div>
                                <div>Expires: ${card.expiry_date}</div>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
            }
            
            html += '<h3>Recent Transactions</h3>';
            
            if (transactions.length === 0) {
                html += '<p>No recent transactions found.</p>';
            } else {
                html += `
                    <table class="user-transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Merchant</th>
                                <th>Type</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                transactions.forEach(tx => {
                    const txDate = tx.date ? new Date(tx.date.toDate()).toLocaleDateString() : 'N/A';
                    const amountClass = tx.type === 'debit' ? 'text-danger' : 'text-success';
                    const amountPrefix = tx.type === 'debit' ? '-' : '+';
                    
                    html += `
                        <tr>
                            <td>${txDate}</td>
                            <td class="${amountClass}">${amountPrefix}$${tx.amount.toLocaleString()}</td>
                            <td>${tx.merchant}</td>
                            <td>${tx.type}</td>
                            <td>${tx.status}</td>
                        </tr>
                    `;
                });
                
                html += '</tbody></table>';
            }
            
            html += `
                <div class="user-details-actions">
                    <button onclick="editUser('${userId}')" class="btn-secondary">Edit User</button>
                    ${userData.status === 'blocked' 
                        ? `<button onclick="activateUser('${userId}')" class="btn-secondary">Activate User</button>`
                        : `<button onclick="blockUser('${userId}')" class="btn-danger">Block User</button>`
                    }
                </div>
            `;
            
            // Update the modal content
            userDetailsContent.innerHTML = html;
        })
        .catch(error => {
            console.error("Error fetching user details:", error);
            userDetailsContent.innerHTML = `<div class="error">Error loading user details: ${error.message}</div>`;
        });
}

// Edit user
function editUser(userId) {
    // Find user data
    const userData = allUsers.find(user => user.id === userId);
    
    if (!userData) {
        alert('User not found');
        return;
    }
    
    // Create a form for editing user details
    const name = prompt('Enter new name for user:', userData.name);
    if (!name) return; // User cancelled
    
    // Show loading
    userDetailsContent.innerHTML = '<div class="loading-cell">Updating user details...</div>';
    
    // Update the user
    usersCollection.doc(userId).update({
        name: name,
        last_updated: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert('User updated successfully');
        
        // Refresh user details view
        viewUserDetails(userId);
        
        // Also refresh the users table
        loadUsers();
    })
    .catch(error => {
        console.error("Error updating user:", error);
        alert(`Error: ${error.message}`);
        userDetailsContent.innerHTML = `<div class="error">Error updating user: ${error.message}</div>`;
    });
}

// Block user
function blockUser(userId) {
    // Find user data
    const userData = allUsers.find(user => user.id === userId);
    
    if (!userData) {
        alert('User not found');
        return;
    }
    
    if (!confirm(`Are you sure you want to block user ${userData.name}?`)) {
        return;
    }
    
    // Show loading
    userDetailsContent.innerHTML = '<div class="loading-cell">Blocking user...</div>';
    
    // Update the user status
    usersCollection.doc(userId).update({
        status: 'blocked',
        last_updated: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert('User blocked successfully');
        
        // Refresh user details view
        viewUserDetails(userId);
        
        // Also refresh the users table
        loadUsers();
    })
    .catch(error => {
        console.error("Error blocking user:", error);
        alert(`Error: ${error.message}`);
        userDetailsContent.innerHTML = `<div class="error">Error blocking user: ${error.message}</div>`;
    });
}

// Activate user
function activateUser(userId) {
    // Find user data
    const userData = allUsers.find(user => user.id === userId);
    
    if (!userData) {
        alert('User not found');
        return;
    }
    
    if (!confirm(`Are you sure you want to activate user ${userData.name}?`)) {
        return;
    }
    
    // Show loading
    userDetailsContent.innerHTML = '<div class="loading-cell">Activating user...</div>';
    
    // Update the user status
    usersCollection.doc(userId).update({
        status: 'active',
        last_updated: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert('User activated successfully');
        
        // Refresh user details view
        viewUserDetails(userId);
        
        // Also refresh the users table
        loadUsers();
    })
    .catch(error => {
        console.error("Error activating user:", error);
        alert(`Error: ${error.message}`);
        userDetailsContent.innerHTML = `<div class="error">Error activating user: ${error.message}</div>`;
    });
}

// View card details
function viewCardDetails(cardId) {
    // Get card details with transactions
    const cardData = allCards.find(card => card.id === cardId);
    if (!cardData) {
        alert('Card not found');
        return;
    }
    
    alert(`
        Card Details:
        Card Name: ${cardData.card_name}
        Card Number: ${maskCardNumber(cardData.card_number)}
        Card Type: ${cardData.card_type}
        Expiry Date: ${cardData.expiry_date}
        Limit: $${cardData.limit.toFixed(2)}
        Available: $${cardData.available_limit.toFixed(2)}
        User: ${cardData.userData ? cardData.userData.name : 'Unknown'}
    `);
}

// Edit card
function editCard(cardId) {
    const cardData = allCards.find(card => card.id === cardId);
    if (!cardData) {
        alert('Card not found');
        return;
    }
    
    // For this implementation, we'll just show a prompt to edit the limit
    const newLimit = prompt('Enter new card limit:', cardData.limit);
    if (newLimit && !isNaN(parseFloat(newLimit))) {
        const limitValue = parseFloat(newLimit);
        
        // Calculate available limit adjustment
        const limitDifference = limitValue - cardData.limit;
        const newAvailableLimit = cardData.available_limit + limitDifference;
        
        // Update card in Firestore
        cardsCollection.doc(cardId).update({
            limit: limitValue,
            available_limit: newAvailableLimit
        })
        .then(() => {
            alert('Card limit updated successfully!');
            // Refresh cards list
            loadCards();
        })
        .catch(error => {
            console.error("Error updating card:", error);
            alert('Failed to update card. Please try again.');
        });
    }
}

// Delete card
function deleteCard(cardId) {
    if (confirm("Are you sure you want to delete this card?")) {
        cardsCollection.doc(cardId).delete()
            .then(() => {
                alert('Card deleted successfully!');
                // Refresh cards list
                loadCards();
            })
            .catch(error => {
                console.error("Error deleting card:", error);
                alert('Failed to delete card. Please try again.');
            });
    }
}

// Open global limit modal
function openGlobalLimitModal() {
    document.getElementById('limitPercentage').value = 10;
    document.getElementById('limitAction').value = 'increase';
    globalLimitModal.style.display = 'block';
}

// Close global limit modal
function closeGlobalLimitModal() {
    globalLimitModal.style.display = 'none';
}

// Close user details modal
function closeUserDetailsModal() {
    userDetailsModal.style.display = 'none';
}

// Handle global limit update
function handleGlobalLimitUpdate(e) {
    e.preventDefault();
    
    const action = document.getElementById('limitAction').value;
    const percentage = parseInt(document.getElementById('limitPercentage').value);
    
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        alert('Please enter a valid percentage between 1 and 100');
        return;
    }
    
    // Display confirmation dialog
    const confirmMessage = `Are you sure you want to ${action} all card limits by ${percentage}%?`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Show loading state on button
    const submitButton = globalLimitForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    // Get all cards
    cardsCollection.get()
        .then(snapshot => {
            if (snapshot.empty) {
                throw new Error('No cards found in the system');
            }
            
            // Setup batch write
            const batch = db.batch();
            let successCount = 0;
            
            // Process each card
            snapshot.forEach(doc => {
                const cardData = doc.data();
                const cardRef = cardsCollection.doc(doc.id);
                
                let newLimit;
                if (action === 'increase') {
                    newLimit = Math.round(cardData.limit * (1 + percentage/100));
                } else {
                    newLimit = Math.round(cardData.limit * (1 - percentage/100));
                }
                
                // Calculate new available limit
                const used = cardData.limit - cardData.available_limit;
                const newAvailable = Math.max(0, newLimit - used);
                
                // Update card data
                batch.update(cardRef, {
                    limit: newLimit,
                    available_limit: newAvailable,
                    last_updated: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                successCount++;
            });
            
            // Commit the batch update
            return batch.commit().then(() => {
                return successCount;
            });
        })
        .then(count => {
            alert(`Successfully updated ${count} cards!`);
            closeGlobalLimitModal();
            
            // Reload cards to reflect changes
            loadCards();
        })
        .catch(error => {
            console.error("Error updating limits:", error);
            alert(`Error: ${error.message}`);
        })
        .finally(() => {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
}

// Helper function to mask card number (show only last 4 digits)
function maskCardNumber(cardNumber) {
    const last4Digits = cardNumber.slice(-4);
    return `**** **** **** ${last4Digits}`;
}

// Handle admin logout
function handleLogout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'admin-login.html';
        })
        .catch(error => {
            console.error("Error signing out:", error);
        });
} 