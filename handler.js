'use strict';

const ipay88 = require('./consts'); // iPay88 Constants
const sha1 = require("./sha1"); 
const transactionlayout = require("./response");
const AWS = require('aws-sdk');
const axios = require('axios');

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const lexruntime = new AWS.LexRuntime();

const uuidv4 = require('uuid/v4');

// THIS IS THE MODULE TO PROCESS THE PAYMENT GOING TO IPAY88 PAYMENT PAGE
module.exports.paymentrequest = (event, context, callback) => {

  // TEST URL: https://nt6kh0sqzb.execute-api.us-east-1.amazonaws.com/dev/ipay88/payment-request?hid=0545bee9-420d-4833-8bac-ec2a358c925e

  // REFERENCE: Passing of value
  /*event['pathParameters']['param1']
  event["queryStringParameters"]['queryparam1']
  event['requestContext']['identity']['userAgent']
  event['requestContext']['identity']['sourceIP']*/

  let getdataipay88handler = (hid) => {
    return new Promise((resolve, reject) =>{
      // GET THE DATA FROM ipay88_handler
      var getParams = {
          TableName: ipay88.IPAY88_HANDLER,
          KeyConditionExpression: "handler_id = :p",
          ExpressionAttributeValues: {
              ':p': hid
          }
      };

      db.query(getParams, function (err, data) {
        if(err){
          console.log('DATA NOT FOUND', err);
        }else{
          resolve(data);
        }
      });
    });
  };

  // Chain with catch
  let v_hid = event["queryStringParameters"]['hid'];

  getdataipay88handler(v_hid).then( res =>{
    console.log("Data: ", res);

    // REMOVE PERIOD AND COMMA
    let tAmount = res.Items[0].amount;

    // IPAY88 ACCESS
    let actionURL = ipay88.ACTION_URL;
    let MerchantCode = ipay88.MERCHANT_CODE;
    let MerchantKey = ipay88.MERCHANT_KEY;

    let PaymentId = res.Items[0].payment_method;
    let RefNo = ipay88.REFNO_PREFIX + Math.floor(10000000 + Math.random() * 90000000);;
    let Amount = tAmount;
    let cAmount = tAmount.replace(/^[,. ]+|[,. ]+$|[,. ]+/g, "").trim();
    let Currency = ipay88.CURRENCY;
    let ProdDesc = res.Items[0].product_title;
    let UserName = res.Items[0].name;
    let UserEmail = res.Items[0].email;
    let UserContact = res.Items[0].contact;
    let Remark = '';
    let Lang = ipay88.LANG;
    let Signature = sha1.iPay88Signature(MerchantKey + MerchantCode + RefNo + cAmount + Currency); // 'v4f93AFaktObj79KywOlXbLAeTc=';
    let ResponseURL = ipay88.RESPONSE_URL;
    let BackendURL = ipay88.BACKEND_URL;
    let PageAccesstoken = res.Items[0].page_access_token;
    let ScopedID = res.Items[0].scoped_id;

    // SAVE TO DYNAMODB table name: ipay88_logs
    let d = Math.floor(Date.now() / 1000);
    let createParams = {
        TableName: ipay88.IPAY88_LOGS,
        Item: {
            id: RefNo,
            user_id: uuidv4(),
            name: UserName,
            email: UserEmail,
            contact: UserContact,
            product_title: ProdDesc,
            amount: Amount,
            payment_method: PaymentId,
            page_access_token: PageAccesstoken,
            scoped_id: ScopedID,
            transaction_status: 0,
            created_at: d,
            updated_at: null
        }
    };

    // Use create dynamoDB function and place resolve/reject (*)
    db.put(createParams, (e, data) => {
        if (e) {
            console.log("Error on PUT ITEM", e);
            // reject(e);
        } else {
            // resolve(payment);
            console.log("LOGS SUCCESSFULLY CREATED");
        }
    });

    const html = `
    <FORM method="post" name="ePayment" id="ePayment" action="${actionURL}">
      <INPUT type="hidden" name="MerchantCode" value="${MerchantCode}">
      <INPUT type="hidden" name="PaymentId" value="${PaymentId}">
      <INPUT type="hidden" name="RefNo" value="${RefNo}">
      <INPUT type="hidden" name="Amount" value="${Amount}">
      <INPUT type="hidden" name="Currency" value="${Currency}">
      <INPUT type="hidden" name="ProdDesc" value="${ProdDesc}">
      <INPUT type="hidden" name="UserName" value="${UserName}">
      <INPUT type="hidden" name="UserEmail" value="${UserEmail}">
      <INPUT type="hidden" name="UserContact" value="${UserContact}">
      <INPUT type="hidden" name="Remark" value="${Remark}">
      <INPUT type="hidden" name="Lang" value="${Lang}">
      <INPUT type="hidden" name="Signature" value="${Signature}">
      <INPUT type="hidden" name="ResponseURL" value="${ResponseURL}">
      <INPUT type="hidden" name="BackendURL" value="${BackendURL}">
    </FORM>
    <script type="text/javascript">document.getElementById("ePayment").submit();</script>`;

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: html,
    };

    // callback is sending HTML back
    callback(null, response);

  }, err => console.log("Error Exist!:", err));

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

function getUrlVars(url) {
    var hash;
    var myJson = {};
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        myJson[hash[0]] = hash[1];
    }
    return myJson;
}

// THIS IS THE MODULE FOR THE COMPLETE PROCESS
module.exports.requestresponse = (event, context, callback) => {

  console.log("event", event);
  console.log("context", context);

  /*const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Payment Response Page!',
      // input: event,
    }),
  };

  callback(null, response);*/

  if(event.httpMethod === "POST" && event.body){

    // RESULT: {"MerchantCode":"PH00419","PaymentId":"1","RefNo":"G94988540","Amount":"25.00","Currency":"PHP","Remark":"","TransId":"T0022974300","AuthCode":"","Status":"1","ErrDesc":"","Signature":"yzK0mbAXrZHI%2FoCb2mqdxLxOOI8%3D"}}

    let parseurl = getUrlVars(event.body);
    let response = null;

    // let json = JSON.parse(event.body);

    /*return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hi, I have receive a json object from you!',
        object: parseurl
        // input: event,
      }),
    })*/

    if(Number(parseurl.Status) === 1) {

      // UPDATE THE ipay88_logs
      let d = Math.floor(Date.now() / 1000);
      // Update STATE
      let updateParams = {
          TableName: ipay88.IPAY88_LOGS,
          Key: { id: parseurl.RefNo },
          UpdateExpression: 'set transaction_status = :s, updated_at = :u',
          ExpressionAttributeValues: {
              ':s': 1,
              ':u': d
          },
          ReturnValues: 'UPDATED_NEW'
      };

      db.update(updateParams, function(errOnUpdate, updatedData) {
          if (errOnUpdate) {
              console.log("Error on PUT ITEM", errOnUpdate);
              // reject(errOnUpdate);
          } else {
              console.log("SUCCESSFULLY UPDATED.");
              // resolve(successResponse);
          }
      });

      // PROCESS FACEBOOK RETURN RESPONSE
      let facebookcodehookreturnresponse = (refno) => {
        return new Promise((resolve, reject) =>{
          // GET THE DATA FROM ipay88_handler
          var getParams = {
              TableName: ipay88.IPAY88_LOGS,
              KeyConditionExpression: "id = :p",
              ExpressionAttributeValues: {
                  ':p': refno
              }
          };

          db.query(getParams, function (err, data) {
            if(err){
              console.log('DATA NOT FOUND', err);
            }else{
              resolve(data);
            }
          });
        });
      };

      // Chain with catch
      facebookcodehookreturnresponse(parseurl.RefNo).then( res =>{
        let messengerEndpoint = 'https://84j8nb34n1.execute-api.us-east-1.amazonaws.com/dev/messenger-api/access';
        let msParams = {
            access_token: res.Items[0].page_access_token,
            data: { message: ipay88.MSG_SUCCESSFUL_TRANSACTION },
            action_type: "TEXT_MESSAGE",
            psid: res.Items[0].scoped_id,
            push: "REGULAR"
        };

        // Post Text to Bot
        // POST /bot/botName/alias/botAlias/user/userId/text HTTP/1.1
        // Content-type: application/json

        // {
        //    "inputText": "string",
        //    "sessionAttributes": {
        //       "string" : "string"
        //    }
        // }
        let triggerIntentSlotUtterance = `Paid with ${parseurl.RefNo}`;

        let lexParams = {
            botAlias: 'demoBot',
            /* required */
            botName: 'PaymentBot',
            /* required */
            inputText: triggerIntentSlotUtterance,
            /* required */
            userId: res.Items[0].user_id,
            /* required */
            sessionAttributes: {}
        };
        console.log("Lex Parameter", lexParams);
        lexruntime.postText(lexParams, (err, data) => {
            if (err) {
              console.log(err);
              return err; // an error occurred
            } else {
                // Only if successful, post to messenger id
                // Return type promise
                console.log("Messenger Parameter", msParams);

                return axios.post(messengerEndpoint, msParams);
            }
        });
      }, err => console.log("Error Exist!:", err));
      // END FACEBOOK RESPONSE

      let html = transactionlayout.htmlSuccessTemplate(parseurl.RefNo);

      response = {
          statusCode: 200,
          headers: {
              'Content-Type': 'text/html',
          },
          body: html
      };

      callback(null, response);

    }else{

      console.log('ERROR', parseurl.ErrDesc);
      let html = transactionlayout.htmlFailedTemplate(parseurl.RefNo);
      response = {
          statusCode: 200,
          headers: {
              'Content-Type': 'text/html',
          },
          body: html
      };
      callback(null, response);

    }

  }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

// THIS IS THE MODULE FOR IPAY88 BACKEND RESPONSE
module.exports.backendresponse = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Payment Backend Response Page!',
      // input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

// THIS IS THE MODULE TO SAVE THE DATA FROM FACEBOOK. THIS WILL BE TRIGGERED BY SHARIES CODE.
module.exports.ipay88handler = (event, context, callback) => {

  if(event.httpMethod === "POST" && event.body){

    // RESULT: {"MerchantCode":"PH00419","PaymentId":"1","RefNo":"G94988540","Amount":"25.00","Currency":"PHP","Remark":"","TransId":"T0022974300","AuthCode":"","Status":"1","ErrDesc":"","Signature":"yzK0mbAXrZHI%2FoCb2mqdxLxOOI8%3D"}}

    /*let stringit = JSON.stringify(event.body);
    let parseurl = JSON.parse(stringit);*/

    let parseurl = getUrlVars(event.body);
    let response = null;

    // SAVE TO DYNAMODB table name: ipay88_handler
    let d = Math.floor(Date.now() / 1000);
    let createParams = {
        TableName: ipay88.IPAY88_HANDLER,
        Item: {
            handler_id: uuidv4(),
            name: parseurl.name.replace(/\+/g, ' '),
            email: decodeURIComponent(parseurl.email),
            contact: parseurl.contact,
            product_title: parseurl.product_title.replace(/\+/g, ' '),
            amount: parseurl.amount,
            payment_method: parseurl.paymentid,
            page_access_token: parseurl.page_access_token,
            scoped_id: parseurl.scoped_id,
            created_at: d
        }
    };

    // Use create dynamoDB function and place resolve/reject (*)
    
    db.put(createParams, (e, data) => {
        if (e) {

            console.log("Error on PUT ITEM", e);

            // reject(e);
        } else {
            // resolve(payment);
            console.log("LOGS SUCCESSFULLY CREATED");

        }
    });
  }

  const response = {
      statusCode: 200,
      headers: {
          'Content-Type': 'text/html',
      },
      body: 'Process Completed!'
  };

  callback(null, response);
};