var sha1 = require('sha1');

function hexdec (hexString) {
  //  discuss at: http://locutus.io/php/hexdec/
  // original by: Philippe Baumann
  //   example 1: hexdec('that')
  //   returns 1: 10
  //   example 2: hexdec('a0')
  //   returns 2: 160
  hexString = (hexString + '').replace(/[^a-f0-9]/gi, '')
  return parseInt(hexString, 16)
}

	function generateSignature () {
		// BASE64
		/*> console.log(new Buffer("Hello World").toString('base64'));
		SGVsbG8gV29ybGQ=
		> console.log(new Buffer("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'))
		Hello World*/

		var MerchantCode = 'PH00419';
		  var MerchantKey = 'pbU3gDGvOr';

		  // PRODUCTION
		  /*var actionURL = 'https://payment.ipay88.com.ph/epayment/entry.asp';
		  var MerchantCode = 'PH00479';
		  var MerchantKey = 'VJOCMs03EC';*/

		  var PaymentId = 1;
		  var RefNo = 'A00000001';
		  var Amount = '2500';
		  var Currency = 'PHP';
		  var ProdDesc = 'Photo Print';
		  var UserName = 'Frederick de Guzman';
		  var UserEmail = 'frederick@glyphgames.com';
		  var UserContact = '09062846807';
		  var Remark = '';
		  var Lang = 'UTF-8';
		  var Signature = 'v4f93AFaktObj79KywOlXbLAeTc=';
		  var ResponseURL = 'https://nt6kh0sqzb.execute-api.us-east-1.amazonaws.com/dev/ipay88/request-response';
		  var BackendURL = 'https://nt6kh0sqzb.execute-api.us-east-1.amazonaws.com/dev/ipay88/backend-responst';

		var sha1source = sha1(MerchantKey + MerchantCode + RefNo + Amount + Currency);

		var bin = '';
		for ( i = 0; i < sha1source.length; i = i + 2 )
		{
			var input = hexdec(sha1source.substr(i,2));
    		// var res = String.fromCharCode(parseInt(input,10));
    		var foo = [input, "\ufffd"];
			bin += foo[1];
		}

		const signature = new Buffer(bin).toString('base64');

		var foo = ["alex", "\ufffd\ufffd\ufffd\ufffd\ufffd\ufffd\ufffd\ufffd"];

		return foo[1];

		/*var bin = '';
		for ( i = 0; i < sha1source.length; i = i + 2 )
		{
			bin += chr(hexdec(sha1source.substr(i,2)));
		}

		return bin;*/

		// return sha1source;
	}

	console.log(generateSignature());