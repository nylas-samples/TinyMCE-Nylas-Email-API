import Nylas from 'nylas';

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

const sendEmail = async (req, res) => {
  const user = res.locals.user;

  const { to, subject, body } = req.body;
  // TODO: Consider using replyToMessageId


  const sentMessage = await nylas.messages.send({
    identifier: user.grantId,
    requestBody: {
      to: [{ email: to }],
      replyTo: [{ email: user.emailAddress }],
      subject: subject,
      body: body
    },
  });

  return res.json(sentMessage);
};

const readEmails = async (req, res) => {
  const user = res.locals.user;

  console.log({user})

  const threads = await nylas.threads.list({
    identifier: user.grantId,
    queryParams: {
      limit: 5,
    }
  });
  
  return res.json(threads.data);
};

const getMessage = async (req, res) => {
  const user = res.locals.user;

  const { id: messageId } = req.query;
  
  const message = await nylas.messages.find({
    identifier: user.grantId,
    messageId,
  });

  return res.json(message.data);
};

const getMessages = async (req, res) => {
  const user = res.locals.user;

  const { id: threadId } = req.query;
  
  const messages = await nylas.messages.list({
    identifier: user.grantId,
    queryParams: {
      threadId,
    }
  });

  return res.json(messages.data);
};

const getFile = async (req, res) => {
  const user = res.locals.user;

  // TODO: Add messageId to req.query on the frontend
  const { id: attachmentId, messageId } = req.query;

  const attachment = await nylas.attachments.find({
    identifier: user.grantId,
    attachmentId,
    queryParams: { messageId }
  });
  
  return res.end(attachment);
};

export default {
  sendEmail,
  readEmails,
  getMessage,
  getMessages,
  getFile,
}