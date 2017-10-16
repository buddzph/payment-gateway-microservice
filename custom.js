var sha1 = require('sha1');
// var crypto = require('crypto');
// const punycode = require('punycode');

/*var PI = Math.PI;

exports.area = function (r) {
  return PI * r * r;
};

exports.circumference = function (r) {
  return 2 * PI * r;
};*/

module.exports = {
	chr: (codePt) => {
	  //  discuss at: http://locutus.io/php/chr/
	  // original by: Kevin van Zonneveld (http://kvz.io)
	  // improved by: Brett Zamir (http://brett-zamir.me)
	  //   example 1: chr(75) === 'K'
	  //   example 1: chr(65536) === '\uD800\uDC00'
	  //   returns 1: true
	  //   returns 1: true
	  if (codePt > 0xFFFF) { // Create a four-byte string (length 2) since this code point is high
	    //   enough for the UTF-16 encoding (JavaScript internal use), to
	    //   require representation with two surrogates (reserved non-characters
	    //   used for building other characters; the first is "high" and the next "low")
	    codePt -= 0x10000
	    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF))
	  }
	  return String.fromCharCode(codePt)
	},
	utf16Encode: (input) => {
	    var output = [], i = 0, len = input.length, value;
	    while (i < len) {
	        value = input[i++];
	        if ( (value & 0xF800) === 0xD800 ) {
	            throw new RangeError("UTF-16(encode): Illegal UTF-16 value");
	        }
	        if (value > 0xFFFF) {
	            value -= 0x10000;
	            output.push(String.fromCharCode(((value >>>10) & 0x3FF) | 0xD800));
	            value = 0xDC00 | (value & 0x3FF);
	        }
	        output.push(String.fromCharCode(value));
	    }
	    return output.join("");
	},
	hexdec: (hexString) => {
	  //  discuss at: http://locutus.io/php/hexdec/
	  // original by: Philippe Baumann
	  //   example 1: hexdec('that')
	  //   returns 1: 10
	  //   example 2: hexdec('a0')
	  //   returns 2: 160
	  hexString = (hexString + '').replace(/[^a-f0-9]/gi, '')
	  return parseInt(hexString, 16)
	},
	generateSignature: (MerchantKey, MerchantCode, RefNo, Amount, Currency) => {
		// BASE64
		/*> console.log(new Buffer("Hello World").toString('base64'));
		SGVsbG8gV29ybGQ=
		> console.log(new Buffer("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'))
		Hello World*/

		var sha1source = sha1(MerchantKey + MerchantCode + RefNo + Amount + Currency);

		var bin = '';
		for ( i = 0; i < sha1source.length; i = i + 2 )
		{
			var input = module.exports.hexdec(sha1source.substr(i,2));
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
};