import * as functions from 'firebase-functions';
import sgMail from '@sendgrid/mail';
import sendgridKey from './sendgrid-key.json';

sgMail.setApiKey(sendgridKey.SENDGRID_API_KEY);

const sendEmail = (req: functions.https.Request, res: functions.Response<string>): void => {
  const { senderName, recipientName, recipientEmail, variant } = req.body;
  const msg = {
    to: recipientEmail, // Change to your recipient
    from: 'jt568@cornell.edu', // Change to your verified sender
    subject: `${senderName} is sending you a ${variant}!`,
    text: `Hey ${recipientName}, ${senderName} sent a ${variant}!`,
    html: `Hey ${recipientName}, ${senderName} sent a ${variant}!`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
      res.send('sent');
    })
    .catch((error) => {
      console.error(error);
      res.send(`${error} error in sending ${variant} from ${senderName} to ${recipientName}`);
    });
};

export default sendEmail;
