// Login Test
// Suite:		logonTest
// Requires:	packages/services/ajax.js
// Requires:	packages/services/session.js

var logonTest =
{
	"Test of logon":
		function()
		{
		   	var receivedID = null;   
		   	
		   	function testCallback(sessionid) { receivedID = sessionid; }    

		   	checkPassword("username", "password", testCallback); 

		   	console.assert(receivedID != null); 
		}		
}

