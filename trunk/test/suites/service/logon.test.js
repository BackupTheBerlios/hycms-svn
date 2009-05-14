// Login Test
// Suite:		logonTest
// Requires:	packages/services/session.js


var logonTest =
{
	"Test of some conditions":
		function()
		{
		   	var receivedID = null;   
		   	function testCallback(sessionid) { receivedID = sessionid; }    
		   	checkPassword("username", "password", testCallback); 
		   	while (receivedID == null); 
		   	console.assert(receivedID != null); 
		}		
}
