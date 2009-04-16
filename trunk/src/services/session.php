<?php 
	/*
	 * hyCMS
	 * Copyright(C)2009 by Peter Neubauer
	 * Published under the terms of the Lesser GNU General Public License v2
	 *
	 */
?>
<?php
 	session_start(); 
 	
 	// Checks if the password stored in /storage/private/passwd is valid for the user name
 	// maybe extended to check also the group or other belongings 
 	function is_authorised($hycms_user_name, $hycms_password)
 	{
 		$passwd = file_get_contents("../../storage/private/passwd");
 		
 		$passwd = json_decode($passwd);		// creates Object
 		$passwd = get_object_vars( $passwd );	// creates array
 		
 		if($passwd[$hycms_user_name]==$hycms_password){
 			return true;
 		}
 		else {
 			return false;
 		}
 	}
?>
