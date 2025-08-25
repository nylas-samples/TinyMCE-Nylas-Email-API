import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mockDb from './utils/mock-db.js';
import route from './route.js'

const app = express();

// Enable CORS
app.use(cors());

// The port the express app will run on
const port = 9000;

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
