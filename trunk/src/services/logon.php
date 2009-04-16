<?php
	/*
	 * hyCMS
	 * Copyright(C)2009 by Peter Neubauer
	 * Published under the terms of the Lesser GNU General Public License v2
	 *
	 */
?>
<?php
	include "session.php";
	$hycms_user_name 	= $_POST["hycms_user_name"];
	$hycms_password 	= $_POST["hycms_password"];

	if(is_authorised($hycms_user_name, $hycms_password)){
		echo session_id();		
	}else{
		echo "Wrong Password or Username";
	}	
?>
