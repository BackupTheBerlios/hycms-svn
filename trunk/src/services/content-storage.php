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
	
	
	if(has_session()) {  // maybe Change into is_authorised
		$hycms_json_data	= $_POST["hycms_json_data"]; 
		$hycms_content		= htmlspecialchars(trim($_POST["hycms_content"]));
		$hycms_folder		= explode("/",$hycms_content);
		$hycms_folder		= array_splice($hycms_folder, 0,-1); //deletes Filename
		
		
		
		if(substr_count($hycms_content, './')) {
			echo "FAIL -- Bad Path";
		}else {
			//Creates new Folder 
			if(!is_dir("../storage/persistent/".implode("/",$hycms_folder)."/")){
				mkdir("../storage/persistent/".implode("/",$hycms_folder)."/",0744);
			}
			
			//Writes .json file
			$hycms_path		= "../storage/persistent/".$hycms_content.".json" ;
			
			if (!$handle = fopen($hycms_path, "w+")) {
				echo "Not able to open ".$hycms_path;
			}else {
				if (!fwrite($handle, $hycms_json_data)) {
					echo "Not able to wirte ".$hycms_path;
				}else {
					echo "File $hycms_path written";
				}
			}
		

		}
	}else {
		echo "Session not authenticated";
	}
	
?>
