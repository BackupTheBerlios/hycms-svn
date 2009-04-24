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
	$hycms_user_name 	= htmlspecialchars($_POST["hycms_user_name"]);
	$hycms_password 	= htmlspecialchars($_POST["hycms_password"]);

	if(is_authorised($hycms_user_name, $hycms_password)){
		if(has_session()) { 
			$_SESSION["counter"]++;
		        echo $_SESSION["counter"];
			echo "anmeldungen mit --";
			echo session_id();
		}else {
			$_SESSION["counter"]= 0;
			$_SESSION["Login"] = true;
			$_SESSION["Identify"] = session_id(); // maybe Changed to something more complicated (id+user+date) 
			$_SESSION["User"] = $hycms_user_name;	
			echo session_id();					
		}
			

	}else{
		$_SESSION["Login"] = false;
		echo "Wrong Password or Username";
	}	
?>
