#!/usr/bin/env tsx

const TBURN_API_KEY = process.env.TBURN_API_KEY;
const TBURN_NODE_URL = process.env.TBURN_NODE_URL || 'https://tburn1.replit.app';

console.log('\n🔍 Testing TBURN API Connection...\n');
console.log('URL:', TBURN_NODE_URL);
console.log('API Key present:', !!TBURN_API_KEY);
console.log('API Key length:', TBURN_API_KEY?.length || 0);
console.log('API Key prefix:', TBURN_API_KEY?.substring(0, 8) + '...' || 'None');

async function testEndpoint(endpoint: string, includeAuth: boolean = true) {
  const url = `${TBURN_NODE_URL}${endpoint}`;
  console.log(`\n📍 Testing: ${endpoint}`);
  console.log(`   URL: ${url}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (includeAuth && TBURN_API_KEY) {
    headers['Authorization'] = `Bearer ${TBURN_API_KEY}`;
    console.log('   Auth: Bearer token included');
  } else {
    console.log('   Auth: No authentication');
  }
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000)
    });
    const elapsed = Date.now() - startTime;
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Time: ${elapsed}ms`);
    
    // Log headers that might be useful
    const rateLimitHeaders = [
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'retry-after'
    ];
    
    rateLimitHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        console.log(`   ${header}: ${value}`);
      }
    });
    
    // Try to get response body
    const contentType = response.headers.get('content-type');
    let body: any;
    
    if (contentType?.includes('application/json')) {
      body = await response.json();
      console.log('   Response:', JSON.stringify(body, null, 2).substring(0, 200));
    } else {
      const text = await response.text();
      console.log('   Response (text):', text.substring(0, 200));
      body = text;
    }
    
    return { status: response.status, body, elapsed };
    
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.cause) {
      console.log(`   Cause: ${error.cause}`);
    }
    return { status: 0, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('Starting API tests...');
  console.log('='.repeat(60));
  
  // Test various endpoints
  const endpoints = [
    '/api/status',           // Basic status check
    '/api/network/stats',    // Network statistics
    '/api/blocks/recent',    // Recent blocks
    '/api/validators',       // Validators list
  ];
  
  // Test without auth first
  console.log('\n🔐 Testing WITHOUT authentication:');
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint, false);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between requests
  }
  
  // Test with auth
  if (TBURN_API_KEY) {
    console.log('\n🔑 Testing WITH authentication:');
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint, true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between requests
    }
  } else {
    console.log('\n⚠️  No API key found - skipping authenticated tests');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Tests completed');
  console.log('='.repeat(60) + '\n');
}

runTests().catch(console.error);