/**
 *  Place all important constants here for Paypal
 */

const ipay88Constants = {
  /** Payment Method */
  PAYMENT_METHOD : 'iPay88',

  // SANDBOX
  ACTION_URL : 'sandboxurl',
  MERCHANT_CODE : 'PH00419',
  MERCHANT_KEY : 'pbU3gDGvOr',

  /** CONSTANTS */
  REFNO_PREFIX : 'G',
  CURRENCY : 'PHP',
  LANG : 'UTF-8',
  RESPONSE_URL : 'response_url',
  BACKEND_URL : 'backend_url',

  /** DynamoDB Tables */
  IPAY88_HANDLER : 'ipay88_handler',
  IPAY88_LOGS : 'ipay88_logs',

  /** iPay88 Messages */
  MSG_SUCCESSFUL_TRANSACTION :  `Your transaction is successful! Thank you for choosing PAYLOAD:) You will receive an SMS confirmation shortly. Happy to asisst you again with your next load purchase soon :) Want to receive updates and load promos? Click YES below `,
  MSG_FAILED_TRANSACTION :  `Your iPay88 transaction has a problem. Please try again by clicking again the buy button.`,

};



module.exports = ipay88Constants;