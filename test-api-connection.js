// Simple test script to verify API connection
const API_BASE_URL = "http://localhost:8000/api/v1";

async function testApiConnection() {
  console.log("🔍 Testing Londoolink AI API Connection...\n");

  // Test 1: Health Check
  try {
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch(`${API_BASE_URL}/agent/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData);
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
  }

  // Test 2: Registration
  try {
    console.log("\n2. Testing user registration...");
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "testpassword123"
      })
    });
    
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log("✅ Registration successful:", registerData);
    } else {
      console.log("⚠️  Registration response:", registerData);
    }
  } catch (error) {
    console.log("❌ Registration failed:", error.message);
  }

  // Test 3: Login
  try {
    console.log("\n3. Testing user login...");
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "testpassword123"
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.access_token) {
      console.log("✅ Login successful! Token received:", loginData.access_token.substring(0, 20) + "...");
      
      // Test 4: Daily Briefing (with auth)
      try {
        console.log("\n4. Testing daily briefing (authenticated)...");
        const briefingResponse = await fetch(`${API_BASE_URL}/agent/briefing/daily`, {
          headers: {
            'Authorization': `Bearer ${loginData.access_token}`
          }
        });
        
        const briefingData = await briefingResponse.json();
        
        if (briefingResponse.ok) {
          console.log("✅ Daily briefing successful:", briefingData);
        } else {
          console.log("⚠️  Daily briefing response:", briefingData);
        }
      } catch (error) {
        console.log("❌ Daily briefing failed:", error.message);
      }
      
    } else {
      console.log("⚠️  Login response:", loginData);
    }
  } catch (error) {
    console.log("❌ Login failed:", error.message);
  }

  console.log("\n🎯 API Connection Test Complete!");
}

// Run the test
testApiConnection().catch(console.error);
