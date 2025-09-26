// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://bodghiwoduxjzwbzggbx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZGdoaXdvZHV4anp3YnpnZ2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDQ3MTEsImV4cCI6MjA3NDQ4MDcxMX0.nNVZNzI5lAAStQVoynwQqnzmjIK79zzoVd-Duc_zz0E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔍 Testing Supabase connection...');
    
    try {
        // Test basic connection
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
            
        if (error) {
            console.log('❌ Database connection error:', error.message);
            console.log('💡 This means the database schema is not set up yet.');
            console.log('📋 Please run the schema_fixed.sql in your Supabase SQL Editor');
            return false;
        }
        
        console.log('✅ Supabase connection successful!');
        console.log('📊 Database is accessible');
        return true;
        
    } catch (err) {
        console.log('❌ Connection failed:', err.message);
        return false;
    }
}

// Run the test
testConnection().then(success => {
    if (success) {
        console.log('🎉 Ready to test authentication!');
    } else {
        console.log('🔧 Please set up the database schema first');
    }
    process.exit(0);
});
