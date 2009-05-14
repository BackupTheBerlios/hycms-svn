/*
 * hyJS
 *
 * Services package
 *
 * Copyright(C) 2009 by Peter Neubauer
 * Published under the terms of the GNU General Public License v2
 *
 */
function checkPassword(hycms_name, hycms_password, callback)
{
	({
		hycms_user_name:	hycms_name,
		hycms_password:		hycms_password
	})._send({url: "../src/services/logon.php", callback: callback, method: "POST"});
}


function deleteSession(callback)
{
	({})._send({url: "../src/services/logon.php", callback: callback, method: "POST"});
}

