const fs = require('fs');

async function testUserFlow() {
  const username = "LaiqAhmed";
  const password = "38403\"Sargodha#Laiq@3939@Ahmed";
  
  console.log(`Testing with Username: ${username}`);
  console.log(`Testing with Password: ${password}`);

  try {
    const res = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Username: username, Password: password })
    });
    
    const data = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${data}`);
  } catch (err) {
    console.error("Error connecting to backend:", err.message);
  }
}

testUserFlow();
