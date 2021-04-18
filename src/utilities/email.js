// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
const config = require('./config');
AWS.config.update({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region
});

const RECEIVER_EMAIL_ADDRESS = 'nickpt.0699@gmail.com';
const SENDER_EMAIL_ADDRESS = '21nikhilpatil1998@gmail.com';

var params = {
  Destination: { /* required */
    // CcAddresses: [
    //   'EMAIL_ADDRESS',
    //   /* more items */
    // ],
    ToAddresses: [
        RECEIVER_EMAIL_ADDRESS
    ]
  },
  Message: { /* required */
    Body: { /* required */
      Html: {
       Charset: "UTF-8",
       Data: "<div>This is the message</div>"
      },
      Text: {
       Charset: "UTF-8",
       Data: "This is the message"
      }
     },
     Subject: {
      Charset: 'UTF-8',
      Data: 'Sample Email using SES'
     }
    },
  Source: SENDER_EMAIL_ADDRESS, /* required */
//   ReplyToAddresses: [
//      'EMAIL_ADDRESS',
//     /* more items */
//   ],
};

// Create the promise and SES service object
var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
