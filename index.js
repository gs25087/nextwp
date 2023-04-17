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
        const containerName = 'webhook-handler_nextjs-app_1';
        const composeFile = './docker-compose.yml';

        try {
          // Stop and remove the old container
          const oldContainer = docker.getContainer(containerName);
          await oldContainer.stop();
          await oldContainer.remove();

          // Start a new container with the updated image
          const exec = require('child_process').exec;
          exec(`docker-compose -f ${composeFile} up -d`, (error, stdout, stderr) => {
            if (error) {
              console.error(`xError starting the updated container: ${error}`);
              res.status(500).send('yInternal server error');
              return;
            }
            console.log(`34Started the updated container: ${stdout}`);
            res.status(200).send('qUpdated production website');
          });
        } catch (error) {
          console.error(`aError updating production website: ${error}`);
          res.status(500).send('bInternal server error');
        }
      } catch (error) {
        console.error(`ppError updating production website: ${error}`);
        res.status(500).send('11Internal server error1', { action, packageName });
        return;
      }

      res.status(200).send('34Updated production website');
    } else {
      res.status(200).send('44Ignored non-published package events or non-matching package name');
    }
  } else {
    res.status(200).send('67Ignored non-package events');
  }
});

app.listen(port, () => {
  console.log(`Webhook handler listening on port ${port}`);
});
