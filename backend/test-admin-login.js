// Test admin login
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://bodghiwoduxjzwbzggbx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZGdoaXdvZHV4anp3YnpnZ2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDQ3MTEsImV4cCI6MjA3NDQ4MDcxMX0.nNVZNzI5lAAStQVoynwQqnzmjIK79zzoVd-Duc_zz0E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminLogin() {
    console.log('🔍 Testing admin login process...');
    
    const email = 'vishalraut.contact@gmail.com';
    const password = 'Vishalraut@9890';
    
    try {
        // Step 1: Find user by email
        console.log('Step 1: Finding user by email...');
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
            
        if (userError) {
            console.log('❌ User not found:', userError.message);
            return;
        }
        
        console.log('✅ User found:', user.email, user.role, user.status);
        
        // Step 2: Check password
        console.log('Step 2: Checking password...');
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        console.log('Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return;
        }
        
        // Step 3: Check approval status
        console.log('Step 3: Checking approval status...');
        if (user.role === 'student' && user.status !== 'approved') {
            console.log('❌ Student account not approved');
            return;
        }
        
        console.log('✅ All checks passed - login should succeed');
        console.log('User details:', {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            fullName: user.full_name
        });
        
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
}

// Run the test
testAdminLogin().then(() => {
    console.log('Test completed');
    process.exit(0);
});
