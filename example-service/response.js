/**
 * Successful HTML Template
 * @param {*} paymentId
 */
let htmlSuccessTemplate = (paymentId = '') => {
    return `
    <html>
    <head>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/css/bootstrap.min.css">
    </head>
    <body>
      <div class="jumbotron text-xs-center">
      <h1 class="display-3">Thank You!</h1>
      <p class="lead"><strong>iPay88 Transaction - ${paymentId}</strong> has been verified! Please wait for chat notification.</p>
      <hr>
      <p>
        Having trouble? <a href="mailto:support@glyphgames.com">Contact us</a>
      </p>
    </div>
    </body>
  </html>
  `;
};

/**
 * Failed HTML Template
 * @param {*} paymentId
 */
let htmlFailedTemplate = (paymentId = '') => {
    return `
  <html>
  <head>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/css/bootstrap.min.css">
  </head>
  <body>
    <div class="jumbotron text-xs-center">
    <h1 class="display-3">We're sorry ...</h1>
    <p class="lead"><strong>iPay88 Transaction - ${paymentId}</strong> has a problem. Please contact us with link below and include <br>the Paypal Transaction ID in your subject header.</p>
    <hr>
    <p>
      Having trouble? <a href="mailto:support@glyphgames.com">Contact us</a>
    </p>
  </div>
  </body>
</html>
`;
};




module.exports = {
    htmlSuccessTemplate,
    htmlFailedTemplate,
};