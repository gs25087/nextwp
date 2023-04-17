const express = require('express');
const bodyParser = require('body-parser');
const Docker = require('dockerode');
const crypto = require('crypto');

const app = express();
const docker = new Docker();
const port = process.env.PORT || 3000;

const secret = process.env.NEXTWP_TOKEN; // Replace this with your webhook secret

app.use(bodyParser.json());

function verifySignature(req) {
  const signature = req.header('X-Hub-Signature-256');
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  return digest === signature;
}

app.post('/deploy', async (req, res) => {
  res.status(403).send('secret', secret);

  if (!verifySignature(req)) {
    res.status(403).send('Invalid signature');
    return;
  }

  const event = req.header('X-GitHub-Event');

  if (event === 'package') {
    const action = req.body.action;
    const packageName = req.body.package.name;
    console.log('action', action);
    console.log('packageName', packageName);

    if (action === 'published' && packageName === 'imagename') {
      // Replace this with your Docker image name
      const imageUrl = 'ghcr.io/gs25087/imagename';

      try {
        // Pull the new Docker image
        await docker.pull(imageUrl, {});

        // Update the production website
        // This step depends on your specific deployment scenario.
        // You may need to restart a container, update a Kubernetes deployment, or perform another action.
      } catch (error) {
        console.error(`Error updating production website: ${error}`);
        res.status(500).send('Internal server error');
        return;
      }

      res.status(200).send('Updated production website');
    } else {
      res.status(200).send('Ignored non-published package events or non-matching package name');
    }
  } else {
    res.status(200).send('Ignored non-package events');
  }
});

app.listen(port, () => {
  console.log(`Webhook handler listening on port ${port}`);
});
