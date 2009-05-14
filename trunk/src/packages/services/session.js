
	function checkPassword(hycms_name, hycms_password, callback)
	{
		var httpRequest;

		if (window.XMLHttpRequest)
			httpRequest = new XMLHttpRequest();
		else if (window.ActiveXObject)
			httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		
		
		httpRequest.onreadystatechange = function(){
			
			if (httpRequest.readyState == 4) {
				callback(httpRequest.responseText);				
			}
		}
		

		
		httpRequest.open('POST', "../src/services/logon.php", true);
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpRequest.send('hycms_user_name='+hycms_name+'&hycms_password='+hycms_password);



		
	}
	
	
	function deleteSession(callback)
	{
		var httpRequest;
		
		if (window.XMLHttpRequest)
			httpRequest = new XMLHttpRequest();
		else if (window.ActiveXObject)
			httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		
		
		httpRequest.onreadystatechange = function() {
			
			if (httpRequest.readyState == 4) {
				callback(httpRequest.responseText);
			}
		}
		httpRequest.open('POST', "../../src/services/logout.php", true);
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpRequest.send("");
		
	}
	
/*(20:07:01) HydrixOS: und zwar:  logon(username, password, callback)  und callback ist eine "function callback(sessionid)", die dein httpRequest-Handler aufruft...
(20:07:24) HydrixOS: und logon hat keinen rückgabewert mehr...
(20:08:10) smeky: dann hab ich aber in callback das selbe problem
(20:09:25) HydrixOS: nicht ganz... im Test musst du dann synchronität erzwingen - geht mit ner while-schleife... (nur später im eigtl. programm möchte man das nicht tun, damit der browser nicht abstürzt...) damit das mit der testsuite klappt, musst du in etwa folgendes machen:  function() {   var receivedID = null;   function testCallback(sessionid) { receivedID = sessionid; }    logon("username", "password", testCallback); while (receivedID == null); console.assert(receivedID == ERWARTETER_WERT); }
(20:10:46) HydrixOS: also was untere test-funktion im prinzip macht ist folgendes:  1. globale variable "receiveID" deklarieren, die anfangs null ist 2. logon mit einem callback aufrufen 3. warten, bis der callback einen wert in receiveID geschrieben hat 4. wert testen
(20:12:07) smeky: aber wie löse ich die problematik dann im echten system
(20:12:18) smeky: aber eigentlich braucht man ja die session id nicht
(20:12:55) HydrixOS: geht ja nicht nur um die session-id, sondern auch um das wissen, dass das login erfolgreich war... also der editor muss bei einem login die methode mit dem callback aufrufen... und der callback muss dann das tun, was alles nach dem login passieren sollte (dateien laden o.ä.)
(20:13:19) HydrixOS: anders geht das nicht, weil sich der browser aufhängt, wenn man synchron kommuniziert...
(20:13:35) HydrixOS: (also er hängt sich nicht auf, aber bei firefox friert die oberfläche ein, bis die antwort da is)
(20:14:11) smeky: ok ich probier das morgen mal hab da grad nicht mehr die zeit und den kopf dafür*/

