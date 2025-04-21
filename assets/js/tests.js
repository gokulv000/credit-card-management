// Credit Card Management System - Test Suite

// Test configuration
const testConfig = {
    runAutomatedTests: true,
    logResults: true,
    testTimeout: 5000,
};

// Test results storage
const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    errors: []
};

// Initialize testing
document.addEventListener('DOMContentLoaded', () => {
    if (testConfig.runAutomatedTests) {
        console.log('🧪 Running Credit Card Management System Tests');
        runTests();
    }
});

// Main test runner
async function runTests() {
    try {
        // Start with authentication tests
        await runAuthTests();
        
        // Run user dashboard tests if logged in as user
        if (getCurrentUserRole() === 'user') {
            await runUserDashboardTests();
        }
        
        // Run admin tests if logged in as admin
        if (getCurrentUserRole() === 'admin') {
            await runAdminTests();
        }
        
        // Display final results
        displayTestResults();
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
}

// Authentication tests
async function runAuthTests() {
    console.log('🔐 Running Authentication Tests');
    
    // Test 1: Check Firebase configuration
    await runTest('Firebase Configuration', () => {
        const config = firebaseConfig;
        return {
            passed: config && config.apiKey && config.authDomain && config.projectId,
            message: 'Firebase is properly configured'
        };
    });
    
    // Test 2: Check if Firebase is initialized
    await runTest('Firebase Initialization', () => {
        return {
            passed: typeof firebase !== 'undefined' && firebase.apps.length > 0,
            message: 'Firebase is initialized'
        };
    });
    
    // Test 3: Check auth service
    await runTest('Authentication Service', () => {
        return {
            passed: typeof auth !== 'undefined',
            message: 'Auth service is available'
        };
    });
    
    // Test 4: Check database service
    await runTest('Database Service', () => {
        return {
            passed: typeof db !== 'undefined',
            message: 'Firestore service is available'
        };
    });
}

// User dashboard tests
async function runUserDashboardTests() {
    console.log('👤 Running User Dashboard Tests');
    
    // Test 1: User profile loaded
    await runTest('User Profile Loading', () => {
        const userElement = document.getElementById('userName');
        return {
            passed: userElement && userElement.textContent !== 'Loading...',
            message: 'User profile data loaded successfully'
        };
    });
    
    // Test 2: Cards collection reference
    await runTest('Cards Collection', () => {
        return {
            passed: typeof cardsCollection !== 'undefined',
            message: 'Cards collection reference exists'
        };
    });
    
    // Test 3: Transactions collection reference
    await runTest('Transactions Collection', () => {
        return {
            passed: typeof transactionsCollection !== 'undefined',
            message: 'Transactions collection reference exists'
        };
    });
    
    // Test 4: Add card form
    await runTest('Add Card Form', () => {
        const addCardBtn = document.getElementById('addCardBtn');
        return {
            passed: !!addCardBtn,
            message: 'Add card functionality is available'
        };
    });
}

// Admin dashboard tests
async function runAdminTests() {
    console.log('👑 Running Admin Dashboard Tests');
    
    // Test 1: Admin stats loading
    await runTest('Admin Stats Loading', () => {
        const totalUsers = document.getElementById('totalUsers');
        const totalCards = document.getElementById('totalCards');
        return {
            passed: totalUsers && totalCards && 
                    totalUsers.textContent !== 'Loading...' && 
                    totalCards.textContent !== 'Loading...',
            message: 'Admin statistics loaded successfully'
        };
    });
    
    // Test 2: Users table
    await runTest('Users Table', () => {
        const usersTable = document.getElementById('usersTableBody');
        return {
            passed: !!usersTable && usersTable.innerHTML !== '',
            message: 'Users table is populated'
        };
    });
    
    // Test 3: Cards table
    await runTest('Cards Table', () => {
        const cardsTable = document.getElementById('cardsTableBody');
        return {
            passed: !!cardsTable && cardsTable.innerHTML !== '',
            message: 'Cards table is populated'
        };
    });
    
    // Test 4: Global limit button
    await runTest('Global Limit Feature', () => {
        const globalLimitBtn = document.getElementById('globalLimitBtn');
        return {
            passed: !!globalLimitBtn,
            message: 'Global limit feature is available'
        };
    });
}

// Helper: Run a single test
async function runTest(testName, testFn) {
    console.log(`  ⏱️ Testing: ${testName}`);
    testResults.total++;
    
    try {
        // Run the test with timeout
        const result = await Promise.race([
            testFn(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Test timeout')), testConfig.testTimeout)
            )
        ]);
        
        if (result.passed) {
            testResults.passed++;
            console.log(`  ✅ ${testName}: ${result.message}`);
        } else {
            testResults.failed++;
            const errorMsg = `${testName} failed: ${result.message || 'No error message'}`;
            testResults.errors.push(errorMsg);
            console.error(`  ❌ ${errorMsg}`);
        }
    } catch (error) {
        testResults.failed++;
        const errorMsg = `${testName} error: ${error.message}`;
        testResults.errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
    }
}

// Helper: Get current user role
function getCurrentUserRole() {
    // This assumes you store the user role in localStorage when they log in
    return localStorage.getItem('userRole') || 'none';
}

// Display final test results
function displayTestResults() {
    console.log('\n🧪 TEST RESULTS:');
    console.log(`✅ Passed: ${testResults.passed}/${testResults.total} tests`);
    
    if (testResults.failed > 0) {
        console.log(`❌ Failed: ${testResults.failed} tests`);
        console.log('\nError details:');
        testResults.errors.forEach((err, i) => {
            console.log(`${i+1}. ${err}`);
        });
    }
    
    // Show percentage of passed tests
    const percentage = Math.round((testResults.passed / testResults.total) * 100);
    console.log(`\n🏆 Test coverage: ${percentage}%`);
    
    // If we want to show a visual result on the page
    if (document.getElementById('testResults')) {
        document.getElementById('testResults').innerHTML = `
            <div class="test-summary">
                <h3>Test Results</h3>
                <p>Passed: ${testResults.passed}/${testResults.total} (${percentage}%)</p>
                ${testResults.failed > 0 ? `<p>Failed: ${testResults.failed}</p>` : ''}
            </div>
        `;
    }
}

// Browser compatibility check
function checkBrowserCompatibility() {
    const compatibilityResults = {
        localStorage: typeof localStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined',
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        compatibility: 0
    };
    
    // Calculate compatibility percentage
    let supported = 0;
    let total = 0;
    
    for (const feature in compatibilityResults) {
        if (feature !== 'compatibility') {
            total++;
            if (compatibilityResults[feature]) supported++;
        }
    }
    
    compatibilityResults.compatibility = Math.round((supported / total) * 100);
    
    console.log('🔍 Browser Compatibility Check:');
    console.log(`   Browser compatibility: ${compatibilityResults.compatibility}%`);
    
    return compatibilityResults;
}

// Performance testing functions
const performanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    domSize: 0
};

function measurePerformance() {
    // Measure page load time
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        performanceMetrics.loadTime = pageLoadTime;
        
        // DOM rendering time
        const domRenderTime = perfData.domComplete - perfData.domLoading;
        performanceMetrics.renderTime = domRenderTime;
    }
    
    // Measure DOM size
    performanceMetrics.domSize = document.getElementsByTagName('*').length;
    
    console.log('⚡ Performance Metrics:');
    console.log(`   Page load time: ${performanceMetrics.loadTime}ms`);
    console.log(`   DOM render time: ${performanceMetrics.renderTime}ms`);
    console.log(`   DOM elements: ${performanceMetrics.domSize}`);
    
    return performanceMetrics;
}

// Export testing functions for console usage
window.testApp = {
    runTests,
    checkBrowserCompatibility,
    measurePerformance,
    testResults
}; 