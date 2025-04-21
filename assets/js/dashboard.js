// Dashboard functionality

// DOM Elements
let userName;
let logoutBtn;
let addCardBtn;
let addCardModal;
let editCardLimitModal;
let closeBtn;
let closeLimitBtn;
let addCardForm;
let editCardLimitForm;
let cardsContainer;
let transactionsContainer;

// Current user data
let currentUser = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    userName = document.getElementById('userName');
    logoutBtn = document.getElementById('logoutBtn');
    addCardBtn = document.getElementById('addCardBtn');
    addCardModal = document.getElementById('addCardModal');
    editCardLimitModal = document.getElementById('editCardLimitModal');
    closeBtn = addCardModal.querySelector('.close-btn');
    closeLimitBtn = editCardLimitModal.querySelector('.close-btn');
    addCardForm = document.getElementById('addCardForm');
    editCardLimitForm = document.getElementById('editCardLimitForm');
    cardsContainer = document.getElementById('cardsContainer');
    transactionsContainer = document.getElementById('transactionsContainer');

    // Add event listeners
    logoutBtn.addEventListener('click', handleLogout);
    addCardBtn.addEventListener('click', openAddCardModal);
    closeBtn.addEventListener('click', closeAddCardModal);
    closeLimitBtn.addEventListener('click', closeEditCardLimitModal);
    addCardForm.addEventListener('submit', handleAddCard);
    editCardLimitForm.addEventListener('submit', handleEditCardLimit);

    // Close modals when clicking outside of them
    window.addEventListener('click', (e) => {
        if (e.target === addCardModal) {
            closeAddCardModal();
        }
        if (e.target === editCardLimitModal) {
            closeEditCardLimitModal();
        }
    });

    // Format card number input with spaces
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }

    // Format expiry date input with slash
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', formatExpiryDate);
    }

    // Check authentication state
    checkAuth();
});

// Format card number with spaces (XXXX XXXX XXXX XXXX)
function formatCardNumber(e) {
    let input = e.target;
    let value = input.value.replace(/\D/g, ''); // Remove all non-digits
    
    if (value.length > 16) {
        value = value.substring(0, 16);
    }
    
    // Add spaces every 4 digits
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    input.value = formattedValue;
}

// Format expiry date with slash (MM/YY)
function formatExpiryDate(e) {
    let input = e.target;
    let value = input.value.replace(/\D/g, ''); // Remove all non-digits
    
    if (value.length > 4) {
        value = value.substring(0, 4);
    }
    
    // Add slash after first 2 digits
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    
    input.value = value;
}

// Check if user is authenticated
function checkAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            currentUser = user;
            fetchUserData(user.uid);
            fetchUserCards(user.uid);
            fetchTransactions(user.uid);
        } else {
            // User is not signed in, redirect to login
            window.location.href = 'index.html';
        }
    });
}

// Fetch user data from Firestore
function fetchUserData(userId) {
    usersCollection.doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Display user name
                userName.textContent = userData.name;
                
                // Check if user has admin role, redirect if needed
                if (userData.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                }
            } else {
                console.error("No user data found");
                handleLogout();
            }
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
        });
}

// Fetch user's credit cards
function fetchUserCards(userId) {
    cardsContainer.innerHTML = '<div class="loading-indicator">Loading your cards...</div>';
    
    cardsCollection.where('user_id', '==', userId)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                cardsContainer.innerHTML = `
                    <div class="no-cards-message">
                        <p>You don't have any credit cards yet.</p>
                        <p>Click the "Add New Card" button to get started!</p>
                    </div>
                `;
                return;
            }
            
            // Clear loading indicator
            cardsContainer.innerHTML = '';
            
            // Display each card
            snapshot.forEach(doc => {
                const card = doc.data();
                displayCard(doc.id, card);
            });
        })
        .catch(error => {
            console.error("Error fetching cards:", error);
            cardsContainer.innerHTML = '<div class="error-message">Failed to load cards. Please try again later.</div>';
        });
}

// Display a single card in the UI
function displayCard(cardId, cardData) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card-item';
    cardElement.id = `card-${cardId}`;
    
    // Determine card background color based on card type
    let cardBackground;
    switch(cardData.card_type) {
        case 'Visa':
            cardBackground = 'linear-gradient(135deg, #1A237E, #3949AB)';
            break;
        case 'MasterCard':
            cardBackground = 'linear-gradient(135deg, #B71C1C, #E53935)';
            break;
        case 'American Express':
            cardBackground = 'linear-gradient(135deg, #006064, #00ACC1)';
            break;
        case 'Discover':
            cardBackground = 'linear-gradient(135deg, #FF6F00, #FFA000)';
            break;
        default:
            cardBackground = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
    }
    cardElement.style.background = cardBackground;
    
    // Mask card number for display (show only last 4 digits)
    const maskedNumber = maskCardNumber(cardData.card_number);
    
    cardElement.innerHTML = `
        <div class="card-name">${cardData.card_name}</div>
        <div class="card-number">${maskedNumber}</div>
        <div class="card-details">
            <div class="card-expiry">
                <span>Expires</span>
                ${cardData.expiry_date}
            </div>
            <div class="card-limit">
                <span>Limit</span>
                $${cardData.limit.toFixed(2)}
            </div>
        </div>
        <div class="card-details">
            <div class="card-available">
                <span>Available</span>
                $${cardData.available_limit.toFixed(2)}
            </div>
            <div class="card-actions">
                <button class="card-adjust-btn" data-card-id="${cardId}" data-card-limit="${cardData.limit}">
                    Adjust Limit
                </button>
            </div>
        </div>
    `;
    
    cardsContainer.appendChild(cardElement);
    
    // Add event listener for the adjust limit button
    const adjustBtn = cardElement.querySelector('.card-adjust-btn');
    adjustBtn.addEventListener('click', () => openEditCardLimitModal(cardId, cardData.limit));
}

// Fetch recent transactions
function fetchTransactions(userId) {
    transactionsContainer.innerHTML = '<div class="loading-indicator">Loading transactions...</div>';
    
    transactionsCollection.where('user_id', '==', userId)
        .orderBy('date', 'desc')
        .limit(10)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                transactionsContainer.innerHTML = '<p>No transactions found.</p>';
                return;
            }
            
            // Create table for transactions
            let tableHTML = `
                <table class="transactions-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Card</th>
                            <th>Merchant</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            snapshot.forEach(doc => {
                const transaction = doc.data();
                tableHTML += createTransactionRow(transaction);
            });
            
            tableHTML += `
                    </tbody>
                </table>
            `;
            
            transactionsContainer.innerHTML = tableHTML;
        })
        .catch(error => {
            console.error("Error fetching transactions:", error);
            transactionsContainer.innerHTML = '<div class="error-message">Failed to load transactions. Please try again later.</div>';
        });
}

// Create HTML for a transaction row
function createTransactionRow(transaction) {
    const date = transaction.date.toDate().toLocaleDateString();
    const amountClass = transaction.type === 'credit' ? 'transaction-credit' : 'transaction-debit';
    const amountPrefix = transaction.type === 'credit' ? '+' : '-';
    
    return `
        <tr>
            <td>${date}</td>
            <td>${transaction.card_id.substring(0, 8)}...</td>
            <td>${transaction.merchant}</td>
            <td class="transaction-amount ${amountClass}">${amountPrefix}$${transaction.amount.toFixed(2)}</td>
            <td><span class="transaction-status status-${transaction.status.toLowerCase()}">${transaction.status}</span></td>
        </tr>
    `;
}

// Handle adding a new card
function handleAddCard(e) {
    e.preventDefault();
    
    // Get form values
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardLimit = parseFloat(document.getElementById('cardLimit').value);
    
    // Validate form (basic validation)
    if (!cardName || !cardNumber || !expiryDate || !cvv || isNaN(cardLimit)) {
        alert('Please fill in all fields correctly.');
        return;
    }
    
    // Additional validation
    if (cardNumber.length < 15 || cardNumber.length > 16) {
        alert('Card number should be 15-16 digits.');
        return;
    }
    
    if (!/^\d{1,2}\/\d{2}$/.test(expiryDate)) {
        alert('Expiry date should be in MM/YY format.');
        return;
    }
    
    if (cvv.length < 3 || cvv.length > 4) {
        alert('CVV should be 3-4 digits.');
        return;
    }
    
    if (cardLimit <= 0) {
        alert('Card limit should be greater than 0.');
        return;
    }
    
    // Create new card in Firestore
    const newCard = {
        user_id: currentUser.uid,
        card_name: cardName,
        card_number: cardNumber, // In a real app, you'd encrypt this
        card_type: getCardType(cardNumber),
        expiry_date: expiryDate,
        limit: cardLimit,
        available_limit: cardLimit, // Initially the available limit is the same as the limit
        created_at: new Date()
    };
    
    // Save to Firestore
    cardsCollection.add(newCard)
        .then(() => {
            // Close modal and refresh cards
            closeAddCardModal();
            fetchUserCards(currentUser.uid);
            
            // Reset form
            addCardForm.reset();
        })
        .catch(error => {
            console.error("Error adding card:", error);
            alert('Failed to add card. Please try again.');
        });
}

// Open the edit card limit modal
function openEditCardLimitModal(cardId, currentLimit) {
    document.getElementById('editCardId').value = cardId;
    document.getElementById('currentLimit').value = `$${currentLimit.toFixed(2)}`;
    document.getElementById('newLimit').value = currentLimit;
    document.getElementById('newLimit').min = currentLimit; // Set minimum to current limit
    editCardLimitModal.style.display = 'block';
}

// Handle edit card limit submission
function handleEditCardLimit(e) {
    e.preventDefault();
    
    const cardId = document.getElementById('editCardId').value;
    const newLimit = parseFloat(document.getElementById('newLimit').value);
    
    if (isNaN(newLimit) || newLimit <= 0) {
        alert('Please enter a valid limit amount.');
        return;
    }
    
    // Get current card data
    cardsCollection.doc(cardId).get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error('Card not found');
            }
            
            const cardData = doc.data();
            const currentLimit = cardData.limit;
            
            // Calculate how much more available limit the user gets
            const availableIncrease = newLimit - currentLimit;
            const newAvailableLimit = cardData.available_limit + availableIncrease;
            
            // Update card limit in Firestore
            return cardsCollection.doc(cardId).update({
                limit: newLimit,
                available_limit: newAvailableLimit
            });
        })
        .then(() => {
            // Close modal and refresh cards
            closeEditCardLimitModal();
            fetchUserCards(currentUser.uid);
            
            // Show success message
            alert('Card limit updated successfully!');
        })
        .catch(error => {
            console.error("Error updating card limit:", error);
            alert('Failed to update card limit. Please try again.');
        });
}

// Helper function to mask card number (show only last 4 digits)
function maskCardNumber(cardNumber) {
    const last4Digits = cardNumber.slice(-4);
    return `**** **** **** ${last4Digits}`;
}

// Helper function to determine card type from card number
function getCardType(cardNumber) {
    // Basic detection based on first digit
    const firstDigit = cardNumber.charAt(0);
    
    switch (firstDigit) {
        case '3':
            return 'American Express';
        case '4':
            return 'Visa';
        case '5':
            return 'MasterCard';
        case '6':
            return 'Discover';
        default:
            return 'Credit Card';
    }
}

// Open the add card modal
function openAddCardModal() {
    addCardModal.style.display = 'block';
}

// Close the add card modal
function closeAddCardModal() {
    addCardModal.style.display = 'none';
    // Reset form when closing
    addCardForm.reset();
}

// Close the edit card limit modal
function closeEditCardLimitModal() {
    editCardLimitModal.style.display = 'none';
}

// Handle user logout
function handleLogout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error("Error signing out:", error);
        });
} 