function isIE () {
  var myNav = navigator.userAgent.toLowerCase();
  return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1], 0) : false;
}

var ie = {
	findIndex: function(needle, haystack) {
		for (var x in haystack) {
			//Does the value at this key match the needle?
			if (haystack[x] == needle) {
				return x;
			}
		}
		return -1;
	}
};