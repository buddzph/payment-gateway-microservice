var sha1 = require('sha1');
module.exports = {
	chr: (codePt) => {
	  if (codePt > 0xFFFF) { 
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
	  hexString = (hexString + '').replace(/[^a-f0-9]/gi, '')
	  return parseInt(hexString, 16)
	},
	generateSignature: (MerchantKey, MerchantCode, RefNo, Amount, Currency) => {
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
	}
};