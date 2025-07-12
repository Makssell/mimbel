// Test script to verify RLS policies are working
// Run this in your browser console or as a Node.js script

import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSPolicies() {
  console.log('Testing RLS policies...\n');

  try {
    // Test 1: Fetch continents
    console.log('1. Testing continents table...');
    const { data: continents, error: continentsError } = await supabase
      .from('continents')
      .select('*')
      .limit(5);
    
    if (continentsError) {
      console.error('❌ Continents error:', continentsError);
    } else {
      console.log('✅ Continents loaded:', continents?.length || 0, 'records');
    }

    // Test 2: Fetch flags
    console.log('\n2. Testing flags table...');
    const { data: flags, error: flagsError } = await supabase
      .from('flags')
      .select('*')
      .limit(5);
    
    if (flagsError) {
      console.error('❌ Flags error:', flagsError);
    } else {
      console.log('✅ Flags loaded:', flags?.length || 0, 'records');
    }

    // Test 3: Fetch regional flag countries
    console.log('\n3. Testing regional_flag_countries table...');
    const { data: regionalCountries, error: regionalCountriesError } = await supabase
      .from('regional_flag_countries')
      .select('*')
      .eq('is_active', true)
      .limit(5);
    
    if (regionalCountriesError) {
      console.error('❌ Regional countries error:', regionalCountriesError);
    } else {
      console.log('✅ Regional countries loaded:', regionalCountries?.length || 0, 'records');
    }

    // Test 4: Fetch region division types
    console.log('\n4. Testing region_division_types table...');
    const { data: divisionTypes, error: divisionTypesError } = await supabase
      .from('region_division_types')
      .select('*')
      .eq('is_active', true)
      .limit(5);
    
    if (divisionTypesError) {
      console.error('❌ Division types error:', divisionTypesError);
    } else {
      console.log('✅ Division types loaded:', divisionTypes?.length || 0, 'records');
    }

    // Test 5: Fetch regional flags
    console.log('\n5. Testing regional_flags table...');
    const { data: regionalFlags, error: regionalFlagsError } = await supabase
      .from('regional_flags')
      .select('*')
      .limit(5);
    
    if (regionalFlagsError) {
      console.error('❌ Regional flags error:', regionalFlagsError);
    } else {
      console.log('✅ Regional flags loaded:', regionalFlags?.length || 0, 'records');
    }

    // Test 6: Test the exact query from site1.js
    console.log('\n6. Testing the exact fetchDivisionTypes query...');
    const { data: testDivisionTypes, error: testError } = await supabase
      .from('region_division_types')
      .select('*')
      .eq('is_active', true)
      .order('type_name');
    
    if (testError) {
      console.error('❌ Test division types error:', testError);
      console.error('Error details:', {
        message: testError.message,
        details: testError.details,
        hint: testError.hint
      });
    } else {
      console.log('✅ Test division types loaded:', testDivisionTypes?.length || 0, 'records');
      if (testDivisionTypes && testDivisionTypes.length > 0) {
        console.log('Sample division type:', testDivisionTypes[0]);
      }
    }

    console.log('\n🎉 RLS policy test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testRLSPolicies(); 