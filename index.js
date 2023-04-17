const express = require('express');
const bodyParser = require('body-parser');
const Docker = require('dockerode');
const crypto = require('crypto');

const app = express();
const docker = new Docker();
const port = process.env.PORT || 3000;

const secret = process.env.NEXTWP_TOKEN;

app.use(bodyParser.json());

function verifySignature(req) {
  const signature = req.header('X-Hub-Signature-256');
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  return digest === signature;
}

app.post('/deploy', async (req, res) => {
  if (!verifySignature(req)) {
    res.status(403).send('Invalid signature');
    return;
  }

  const event = req.header('X-GitHub-Event');

  if (event === 'package') {
    const action = req.body.action;
    const packageName = req.body.package.name;

    if (action === 'published' && packageName === 'imagename') {
      const imageUrl = 'ghcr.io/gs25087/imagename:latest';

      try {
        await docker.pull(imageUrl, {});

        const containerName = 'webhook-handler_nextjs-app_1';
        const composeFile = './docker-compose.yml';

        try {
          const oldContainer = docker.getContainer(containerName);
          await oldContainer.stop();
          await oldContainer.remove();

          const exec = require('child_process').exec;
          exec(`docker-compose -f ${composeFile} up -d`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error starting the updated container: ${error}`);
              res.status(500).send('1Internal server error');
              return;
            }
            console.log(`Started the updated container: ${stdout}`);
            res.status(200).send('Updated production website');
          });
        } catch (error) {
          console.error(`Error updating production website: ${error}`);
          res.status(500).send('2Internal server error');
        }
      } catch (error) {
        console.error(`Error updating production website: ${error}`);
        console.error(error.stack);
        console.error(`Error updating production website: ${error}`);
        res.status(500).send('3Internal server error', { error, errorStack: error.stack });
      }
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
