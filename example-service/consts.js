/**
 *  Place all important constants here for Paypal
 */

const ipay88Constants = {
  /** Payment Method */
  PAYMENT_METHOD : 'iPay88',

  /** Ipay88 Access */
  // SANDBOX
  ACTION_URL : 'https://sandbox.ipay88.com.ph/epayment/entry.asp',
  MERCHANT_CODE : 'PH00419',
  MERCHANT_KEY : 'pbU3gDGvOr',

  // PRODUCTION
  /*ACTION_URL : 'https://payment.ipay88.com.ph/epayment/entry.asp',
  MERCHANT_CODE : 'PH00479',
  MERCHANT_KEY : 'VJOCMs03EC',*/

  /** CONSTANTS */
  REFNO_PREFIX : 'G',
  CURRENCY : 'PHP',
  LANG : 'UTF-8',
  RESPONSE_URL : 'https://nt6kh0sqzb.execute-api.us-east-1.amazonaws.com/dev/ipay88/request-response',
  BACKEND_URL : 'https://nt6kh0sqzb.execute-api.us-east-1.amazonaws.com/dev/ipay88/backend-response',

  /** DynamoDB Tables */
  IPAY88_HANDLER : 'ipay88_handler',
  IPAY88_LOGS : 'ipay88_logs',

  /** iPay88 Messages */
  MSG_SUCCESSFUL_TRANSACTION :  `Your iPay88 transaction has been acknowledged and verified. Thank you for your purchase!`,
  MSG_FAILED_TRANSACTION :  `Your iPay88 transaction has a problem. Please try again by clicking again the buy button.`,

};



module.exports = ipay88Constants;