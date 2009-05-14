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
	
	$hycms_user_name 	= htmlspecialchars($_GET["hycms_user_name"]);
	$hycms_password 	= htmlspecialchars($_GET["hycms_password"]);

	if (is_authorized($hycms_user_name, $hycms_password)) {
		if (has_session()) { 
			echo session_id();
		} 
		 else {
			$_SESSION["login"] = true;
			$_SESSION["identify"] = session_id();
			$_SESSION["user"] = $hycms_user_name;
				
			echo session_id();	
		}
	}
	 else{
		$_SESSION["Login"] = false;
		echo "FAIL";
	}	
?>

