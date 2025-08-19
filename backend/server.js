import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mockDb from './utils/mock-db.js';
import route from './route.js'

import Nylas from 'nylas';

const app = express();

// Enable CORS
app.use(cors());

// The port the express app will run on
const port = 9000;


// Initialize the Nylas SDK using the client credentials
const nylasConfig = {
  clientId: process.env.NYLAS_CLIENT_ID,
  callbackUri: process.env.CLIENT_URI || `http://localhost:${process.env.PORT || 3000}`,
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_REGION_URI,
};

const nylas = new Nylas({
  apiKey: nylasConfig.apiKey,
  apiUri: nylasConfig.apiUri,
});

// Store the client URI for later use
const CLIENT_URI = nylasConfig.callbackUri;

console.log('Starting Nylas email application...');
console.log('Server configured with:', {
  apiUri: process.env.NYLAS_API_REGION_URI,
  clientUri: CLIENT_URI
});
  

// '/nylas/generate-auth-url': This route builds the URL for
// authenticating users to your Nylas application via Hosted Authentication
app.post('/nylas/generate-auth-url', express.json(), async (req, res) => {
  const { body } = req;

  const authUrl = nylas.auth.urlForOAuth2({
    clientId: process.env.NYLAS_CLIENT_ID,
    redirectUri: CLIENT_URI,
    loginHint: body.email_address,
    accessType: 'online',
    responseType: 'code',
    scopes: ['email.read_only', 'email.send']
  })

  return res.send(authUrl);
});

// '/nylas/exchange-mailbox-token': This route exchanges an authorization
// code for an grant Id
// and sends the details of the authenticated user to the client
app.post('/nylas/exchange-mailbox-token', express.json(), async (req, res) => {
  const body = req.body;

  const { grantId, email } = await nylas.auth.exchangeCodeForToken({ 
    clientSecret: process.env.NYLAS_API_KEY,
    clientId: process.env.NYLAS_CLIENT_ID,
    code: body.token,
    redirectUri: CLIENT_URI,
  });

  // Normally store the grant Id in the DB
  // console.log('Grant Id was generated for: ', response);

  // Replace this mock code with your actual database operations
  const user = await mockDb.createOrUpdateUser(email, {
    emailAddress: email,
    grantId,
  });

  // Return an authorization object to the user
  return res.json({
    id: user.id,
    emailAddress: user.emailAddress,
  });
});

// Middleware to check if the user is authenticated
async function isAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json('Unauthorized');
  }

  // Query our mock db to retrieve the stored user grant Id
  const user = await mockDb.findUser(req.headers.authorization);

  if (!user) {
    return res.status(401).json('Unauthorized');
  }

  // Add the user to the response locals
  res.locals.user = user;

  next();
}

// Handle routes
app.post('/nylas/send-email', isAuthenticated, express.json(), (req, res) =>
  route.sendEmail(req, res)
);

app.get('/nylas/read-emails', isAuthenticated, (req, res) =>
  route.readEmails(req, res)
);

app.get('/nylas/message', isAuthenticated, async (req, res) => {
  route.getMessage(req, res);
});

app.get('/nylas/messages', isAuthenticated, async (req, res) => {
  route.getMessages(req, res);
});

app.get('/nylas/file', isAuthenticated, async (req, res) => {
  route.getFile(req, res);
});

// Start listening on port 9000
app.listen(port, () => console.log('App listening on port ' + port));
