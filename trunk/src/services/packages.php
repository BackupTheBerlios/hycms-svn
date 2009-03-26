<?
	/*
	 * hyCMS
	 * Copyright(C)2008 by Friedrich Gräter
	 * Published under the terms of the Lesser GNU General Public License v2
	 *
	 */
?>
	<script type='text/javascript' charset='UTF-8' src='../engine/definition.js'></script>
	<script type='text/javascript' charset='UTF-8' src='../engine/object.js'></script>
	<script type='text/javascript' charset='UTF-8' src='../engine/dispatcher.js'></script>
	<script type='text/javascript' charset='UTF-8' src='../engine/relation.js'></script>

<?
		function search_packages($base_path) 
		{
			$dir = opendir($base_path);
			$actions = array();
			
			while(false !== ($file=readdir($dir))) {

				// Select package
				if (filetype("$base_path/$file") != "dir")  {
					$file_object = substr($file, 0, -3);
				
					echo "\t<script type='text/javascript' charset='UTF-8' src='./$base_path/$file'></script>\n";
				}
				
				// Nested package directory
				if ((filetype("$base_path/$file") == "dir") && (substr($file, 0, 1) != ".")) {
					search_packages("$base_path/$file");
				}
			}
		}
		
		search_packages("../packages");
?>

