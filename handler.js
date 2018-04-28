'use strict';

const ipay88 = require('./consts'); // iPay88 Constants
const sha1 = require("./sha1"); 
const transactionlayout = require("./response");
const AWS = require('aws-sdk');
const axios = require('axios');

const db = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const lexruntime = new AWS.LexRuntime();

const uuidv4 = require('uuid/v4');

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

// THIS IS THE MODULE TO PROCESS THE PAYMENT GOING TO IPAY88 PAYMENT PAGE
module.exports.paymentrequest = (event, context, callback) => {
  let checkAvailability = (hid) => {
    return new Promise((resolve, reject) =>{
      // GET THE DATA FROM ipay88_handler
      var getParams = {
          TableName: ipay88.IPAY88_LOGS,
          IndexName: "user_id-transaction_status-index",
          KeyConditionExpression: "user_id = :p AND transaction_status = :u",
          ExpressionAttributeValues: {
              ':p': hid,
              ':u': 1
          }
      };

      db.query(getParams, function (err, data) {
        if(err){
          // console.log('DATA NOT FOUND', err);
          resolve(null);
        }else{
          resolve(data);
        }
      });
    });
  };

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

  // PROMISE 01
  checkAvailability(v_hid).then( res =>{
    if(res.Items.length === 0){
      console.log('check 0: ', res);
      console.log('check 1: ', v_hid);
      return getdataipay88handler(v_hid);
    }else{
      console.log('check 1: ', v_hid);
      console.log('check 2: ', res);
      return Promise.resolve(null);
    }
  }).then( d_data =>{
    console.log("Data: ", d_data);

    if(d_data === null){

        let html = transactionlayout.htmlExpiredTemplate();
        const response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html',
            },
            body: html
        };
        callback(null, response);

    }else{

        // REMOVE PERIOD AND COMMA
        let tAmount = d_data.Items[0].amount;
        // console.log('amount to clean: ', tAmount);
        let tsAmount = tAmount.toString();
        let remAmountCommaSpace = tsAmount.replace(/[, ]+/g, "").trim();
        let remAmountPeriod = remAmountCommaSpace.replace(/\./g, ""); 

        // IPAY88 ACCESS
        let actionURL = ipay88.ACTION_URL;
        let MerchantCode = ipay88.MERCHANT_CODE;
        let MerchantKey = ipay88.MERCHANT_KEY;

        let PaymentId = d_data.Items[0].payment_method;
        let RefNo = ipay88.REFNO_PREFIX + Math.floor(10000000 + Math.random() * 90000000);;
        let Amount = tAmount;
        let cAmount = remAmountPeriod;
        let Currency = ipay88.CURRENCY;
        let ProdDesc = d_data.Items[0].product_title;
        let UserName = d_data.Items[0].name;
        let UserEmail = d_data.Items[0].email;
        let UserContact = d_data.Items[0].contact;
        let bot_alias = d_data.Items[0].bot_alias;
        let bot_name = d_data.Items[0].bot_name;
        let Remark = '';
        let Lang = ipay88.LANG;
        let Signature = sha1.iPay88Signature(MerchantKey + MerchantCode + RefNo + cAmount + Currency); // 'v4f93AFaktObj79KywOlXbLAeTc=';
        let ResponseURL = ipay88.RESPONSE_URL;
        let BackendURL = ipay88.BACKEND_URL;
        let PageAccesstoken = d_data.Items[0].page_access_token;
        let ScopedID = d_data.Items[0].scoped_id;
        let ItemCode = (!!d_data.Items[0].item_code) ? d_data.Items[0].item_code : null;

        console.log('Items: ', d_data.Items);
        console.log('MerchantKey: ', MerchantKey);
        console.log('MerchantCode: ', MerchantCode);
        console.log('RefNo: ', RefNo);
        console.log('cAmount: ', cAmount);
        console.log('Currency: ', Currency);
        console.log('Signature: ', Signature);

        // SAVE TO DYNAMODB table name: ipay88_logs
        let d = Math.floor(Date.now() / 1000);
        let createParams = {
            TableName: ipay88.IPAY88_LOGS,
            Item: {
                id: RefNo,
                user_id: v_hid,
                name: UserName,
                email: UserEmail,
                bot_alias: bot_alias,
                bot_name: bot_name,
                contact: UserContact,
                product_title: ProdDesc,
                amount: Amount,
                payment_method: PaymentId,
                page_access_token: PageAccesstoken,
                scoped_id: ScopedID,
                transaction_status: 0,
                item_code: ItemCode,
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
    }

  }).catch(err => console.log("Error Exist!:", err));
};

// THIS IS THE MODULE FOR THE COMPLETE PROCESS
module.exports.requestresponse = (event, context, callback) => {

  if(event.httpMethod === "POST" && event.body){

    // RESULT: {"MerchantCode":"PH00419","PaymentId":"1","RefNo":"G94988540","Amount":"25.00","Currency":"PHP","Remark":"","TransId":"T0022974300","AuthCode":"","Status":"1","ErrDesc":"","Signature":"yzK0mbAXrZHI%2FoCb2mqdxLxOOI8%3D"}}

    let parseurl = getUrlVars(event.body);
    let response = null;

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
        let messengerEndpoint = 'Accesspoint-link-here. Check Original for best example';
        let qR = [{
                 content_type: "text",
                 title: "YES, Subscribe me!",
                 payload: "YES_SUBSCRIBE_ME"
                },
               {
                   content_type: "text",
                   title: "NO, Thanks!",
                   payload: "NO_THANKS"
               }
           ];
           let msParams = {
               access_token: res.Items[0].page_access_token,
               data: { attachment: ipay88.MSG_SUCCESSFUL_TRANSACTION, quickReplies: qR },
               action_type: "QUICK_REPLIES_MESSAGE",
               psid: res.Items[0].scoped_id,
               push: "REGULAR"
           };
        
        let triggerIntentSlotUtterance = `Paid with ${res.Items[0].user_id}`;

        let lexParams = {
            botAlias: res.Items[0].bot_alias,
            /* required */
            botName: res.Items[0].bot_name,
            /* required */
            inputText: triggerIntentSlotUtterance,
            /* required */
            userId: res.Items[0].scoped_id,
            /* required */
            sessionAttributes: { mobile_number: res.Items[0].contact, item_code: (!!res.Items[0].item_code) ? res.Items[0].item_code : null }
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
};

// THIS IS THE MODULE FOR IPAY88 BACKEND RESPONSE
module.exports.backendresponse = (event, context, callback) => {
  let html = 'RECEIVEOK';

  const response = {
      statusCode: 200,
      headers: {
          'Content-Type': 'text/html',
      },
      body: html
  };

  callback(null, response);

};

// THIS IS THE MODULE TO SAVE THE DATA FROM FACEBOOK. THIS WILL BE TRIGGERED BY SHARIES CODE.
module.exports.ipay88handler = (event, context, callback) => {

  const handlerId = uuidv4();
  
  if(event.httpMethod === "POST" && event.body){
    
    let payment_method = null;

    // let parseurl = getUrlVars(event.body); // NOT USING THIS, SHARIE WILL SEND JSON PARAMS
    let parseurl = JSON.parse(event.body);
    let response = null;

    if(parseurl.payment_method === 'any' || parseurl.payment_method === '') payment_method = 0;
    if(parseurl.payment_method === 'credit_card') payment_method = 1;
    if(parseurl.payment_method === 'bancnet') payment_method = 5;

    let user_name = '';

    if(parseurl.name != ''){
      user_name = parseurl.name.replace(/\+/g, ' ');
    }

    let d_botname = '';

    if(parseurl.bot_name != ''){
      d_botname = parseurl.bot_name.replace(/\+/g, ' ');
    }

    let productTitle = '';

    if(parseurl.product_title != ''){
      productTitle = parseurl.product_title.replace(/\+/g, ' ');
    }

    // SAVE TO DYNAMODB table name: ipay88_handler
    let d = Math.floor(Date.now() / 1000);    
    let createParams = {
        TableName: ipay88.IPAY88_HANDLER,
        Item: {
            handler_id: handlerId,
            name: user_name,
            bot_alias: parseurl.bot_alias,
            bot_name: d_botname,
            email: decodeURIComponent(parseurl.email),
            contact: parseurl.contact,
            product_title: productTitle,
            amount: parseurl.amount,
            payment_method: payment_method,
            page_access_token: parseurl.page_access_token,
            scoped_id: parseurl.scoped_id,
            item_code: (!!parseurl.item_code) ? parseurl.item_code : null,
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
      body: JSON.stringify({
        result : true,
        message : 'Process Completed!',
        hid : handlerId,
        payment_url : '/payment-request?hid=' + handlerId 
      }),
  };

  callback(null, response);
};