require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// JSON request body parser
app.use(express.json());

// API Endpoint to proxy notifications
app.get('/api/notifications', async (req, res) => {
  const apiUrl = process.env.NOTIFICATION_API_URL;
  const token = process.env.BEARER_TOKEN;

  if (!apiUrl || !token) {
    console.error('Server Configuration Error: Missing NOTIFICATION_API_URL or BEARER_TOKEN');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upstream service returned status ${response.status}: ${errorText}`);
      return res.status(response.status).json({ 
        error: `Upstream error: ${response.status}`,
        details: errorText 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Failed to proxy notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications from evaluation service' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
