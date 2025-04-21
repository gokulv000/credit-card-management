// Utility script to seed sample data for testing
// This file should only be used during development

// Sample card data generator
function generateSampleCards(userId, count = 3) {
    const cardTypes = ['Visa', 'MasterCard', 'American Express', 'Discover'];
    const cardNames = ['Everyday Card', 'Travel Rewards', 'Cashback', 'Student Card', 'Premium Card'];
    
    const sampleCards = [];
    
    for (let i = 0; i < count; i++) {
        const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
        const cardName = cardNames[Math.floor(Math.random() * cardNames.length)] + ' ' + cardType;
        
        // Generate a random card number starting with the appropriate prefix
        let cardNumber;
        switch(cardType) {
            case 'Visa':
                cardNumber = '4' + generateRandomDigits(15);
                break;
            case 'MasterCard':
                cardNumber = '5' + generateRandomDigits(15);
                break;
            case 'American Express':
                cardNumber = '3' + generateRandomDigits(14);
                break;
            case 'Discover':
                cardNumber = '6' + generateRandomDigits(15);
                break;
            default:
                cardNumber = generateRandomDigits(16);
        }
        
        // Generate a random expiry date in the future
        const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of year
        const expiryMonth = Math.floor(Math.random() * 12) + 1;
        const expiryYear = currentYear + Math.floor(Math.random() * 5) + 1;
        const expiryDate = `${expiryMonth.toString().padStart(2, '0')}/${expiryYear}`;
        
        // Generate a random limit between 1000 and 10000
        const limit = Math.floor(Math.random() * 9000) + 1000;
        
        // Generate a random available amount that's less than or equal to the limit
        const availableLimit = Math.floor(Math.random() * limit);
        
        sampleCards.push({
            user_id: userId,
            card_name: cardName,
            card_number: cardNumber,
            card_type: cardType,
            expiry_date: expiryDate,
            limit: limit,
            available_limit: availableLimit,
            created_at: new Date()
        });
    }
    
    return sampleCards;
}

// Sample transaction data generator
function generateSampleTransactions(userId, cardIds, count = 10) {
    const merchants = [
        'Amazon', 'Walmart', 'Target', 'Starbucks', 'Netflix', 
        'Uber', 'Spotify', 'Apple', 'Gas Station', 'Restaurant',
        'Grocery Store', 'Department Store', 'Hotel', 'Airline'
    ];
    
    const types = ['debit', 'credit'];
    const statuses = ['completed', 'pending', 'declined'];
    
    const sampleTransactions = [];
    
    for (let i = 0; i < count; i++) {
        const cardId = cardIds[Math.floor(Math.random() * cardIds.length)];
        const merchant = merchants[Math.floor(Math.random() * merchants.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Generate a random amount between 1 and 500
        const amount = Math.floor(Math.random() * 500) + 1;
        
        // Generate a random date within the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        sampleTransactions.push({
            transaction_id: generateRandomId(),
            card_id: cardId,
            user_id: userId,
            amount: amount,
            type: type,
            merchant: merchant,
            date: date,
            status: status
        });
    }
    
    return sampleTransactions;
}

// Helper function to generate random digits
function generateRandomDigits(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

// Helper function to generate a random ID
function generateRandomId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Function to seed data for a user
function seedUserData(userId) {
    console.log('Seeding data for user:', userId);
    
    // Generate and add sample cards
    const sampleCards = generateSampleCards(userId);
    const cardPromises = sampleCards.map(card => cardsCollection.add(card));
    
    // After adding cards, get their IDs and generate transactions
    return Promise.all(cardPromises)
        .then(cardRefs => {
            const cardIds = cardRefs.map(ref => ref.id);
            console.log('Added sample cards with IDs:', cardIds);
            
            // Generate and add sample transactions
            const sampleTransactions = generateSampleTransactions(userId, cardIds);
            const transactionPromises = sampleTransactions.map(transaction => transactionsCollection.add(transaction));
            
            return Promise.all(transactionPromises);
        })
        .then(transactionRefs => {
            console.log('Added sample transactions:', transactionRefs.length);
            return { success: true, message: `Added ${sampleCards.length} cards and ${transactionRefs.length} transactions` };
        })
        .catch(error => {
            console.error('Error seeding data:', error);
            return { success: false, error: error.message };
        });
}

// Add a button to the dashboard to seed data (for development only)
document.addEventListener('DOMContentLoaded', () => {
    // Only add this in development environments
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const dashboardWelcome = document.querySelector('.dashboard-welcome');
        if (dashboardWelcome && currentUser) {
            const seedButton = document.createElement('button');
            seedButton.textContent = 'Generate Sample Data';
            seedButton.className = 'btn-secondary';
            seedButton.style.marginLeft = '10px';
            seedButton.addEventListener('click', () => {
                seedUserData(currentUser.uid)
                    .then(result => {
                        if (result.success) {
                            alert('Sample data generated! Refreshing page...');
                            window.location.reload();
                        } else {
                            alert('Error generating sample data: ' + result.error);
                        }
                    });
            });
            
            dashboardWelcome.querySelector('p').appendChild(seedButton);
        }
    }
}); 