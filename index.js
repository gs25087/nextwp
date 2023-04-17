const express = require('express');
const app = express();

app.use(express.json());

app.get('/deploy', (req, res) => {
  // Handle the POST request here
  // Pull and run the Docker image from the GitHub Registry Packages
  // ...
  res.status(200).json({ success: true, message: 'Yeah deployment successful from get post' });
});

app.post('/deploy', (req, res) => {
  // Handle the POST request here
  // Pull and run the Docker image from the GitHub Registry Packages
  // ...
  res.status(200).json({ success: true, message: 'Yeah deployment successful' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
