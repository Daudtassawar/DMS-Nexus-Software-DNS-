const fs = require('fs');
const axios = require('axios');

async function checkCloud() {
    const username = 'admin';
    const password = '38403"Sargodha#Laiq@3939@Ahmed';
    const url = 'https://dms-nexus-software-dns.onrender.com';
    
    try {
        console.log(`Logging in to ${url}...`);
        const loginRes = await axios.post(`${url}/api/v1/auth/login`, {
            username: username,
            password: password
        });
        
        const token = loginRes.data.token || loginRes.data.Token;
        if (!token) {
            console.log("No token received");
            return;
        }
        
        console.log("Login successful! Token:", token.substring(0, 20) + '...');
        
        console.log("Testing Products Endpoint...");
        const productsRes = await axios.get(`${url}/api/v1/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Products Status:", productsRes.status);
        console.log("Data length:", productsRes.data.length);

        console.log("Testing Distributors Endpoint...");
        const distRes = await axios.get(`${url}/api/distributors`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Distributors Status:", distRes.status);
        console.log("Data length:", distRes.data.length);


    } catch (err) {
        console.error("Failed:", err.response ? `${err.response.status} - ${JSON.stringify(err.response.data)}` : err.message);
    }
}

checkCloud();
