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
 	
 	/*
 	 * is_authorized()
 	 *
 	 * Checks if the password stored in /storage/private/passwd is valid for the user name
 	 *
 	 */
 	function is_authorized($hycms_user_name, $hycms_password)
 	{
 		$passwd = file_get_contents("../storage/private/passwd");
 		
 		$passwd = json_decode($passwd);
 		$passwd = get_object_vars( $passwd );
 		
 		if($passwd[$hycms_user_name]==$hycms_password){
 			return true;
 		}
 		else {
 			return false;
 		}
 	}
 	
 	/*
 	 * has_session
 	 *
 	 * Tests whether a valid session exists or not
 	 *
 	 */
 	function has_session()
 	{
 		return $_SESSION["Login"];
 	}
 	
 	/*
 	 * delete_session
 	 *
 	 * Destroys a running session.
 	 *
 	 */
 	function delete_session()
 	{
 		session_destroy();
 		return true;
 	}
?>
