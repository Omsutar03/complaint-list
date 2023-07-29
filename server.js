// Required npm packages
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

// Load Google Sheets credentials
const CREDENTIALS = JSON.parse(fs.readFileSync('credentials.json'));
const RESPONSES_SHEET_ID = '1VfgLnisxRRuPju-FS8nsm6tGXfsnTiYGzxdCQiGO35o';

// Serve static files from the same directory as the Node.js file
app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

// Route to handle form submissions
app.post('/submit', async (req, res) => {
  const title = req.body.title;
  const complaint = req.body.complaint;

  if (!title || !complaint) {
    return res.status(400).send('Title and Complaint are required.');
  }

  const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);

  try {
    // Use service account credentials
    await doc.useServiceAccountAuth({
      client_email: CREDENTIALS.client_email,
      private_key: CREDENTIALS.private_key,
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Add the row to the Google Sheet
    await sheet.addRow({ title, complaint });

    return res.status(200).send('Data submitted successfully.');
  } catch (error) {
    console.error('Error occurred:', error.message);
    return res.status(500).send('An error occurred while submitting data.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
