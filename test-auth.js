const bcrypt = require('bcryptjs');

// Test the default password hash
const ADMIN_PASSWORD_HASH = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
const testPassword = 'admin123';

async function testPasswordVerification() {
  console.log('Testing password verification...');
  console.log('Test password:', testPassword);
  console.log('Stored hash:', ADMIN_PASSWORD_HASH);
  
  try {
    const isValid = await bcrypt.compare(testPassword, ADMIN_PASSWORD_HASH);
    console.log('Password verification result:', isValid);
    
    if (isValid) {
      console.log('✅ Password verification is working correctly!');
    } else {
      console.log('❌ Password verification failed!');
    }
    // Generate a new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('Newly generated hash for "admin123":', newHash);
  } catch (error) {
    console.error('Error during password verification:', error);
  }
}

testPasswordVerification(); 