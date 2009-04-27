<?
	/*
	 * hyCMS
	 * Copyright(C)2008 by Friedrich Gräter
	 * Published under the terms of the Lesser GNU General Public License v2
	 *
	 */
?>
	<script type='text/javascript' charset='UTF-8' src='../engine/tagging.js'></script>
	<script type='text/javascript' charset='UTF-8' src='../engine/dispatcher.js'></script>
	<script type='text/javascript' charset='UTF-8' src='../engine/serialization.js'></script>

<?
		function search_packages($base_path, $suffix) 
		{
			$dir = opendir($base_path);
			$actions = array();
			
			while(false !== ($file=readdir($dir))) {

				// Select package
				if (filetype("$base_path/$file") != "dir")  {
					if (substr($file, -(strlen($suffix)+1)) != ".".$suffix)
						continue;
				
					echo "\t<script type='text/javascript' charset='UTF-8' src='./$base_path/$file'></script>\n";
				}
				
				// Nested package directory
				if ((filetype("$base_path/$file") == "dir") && (substr($file, 0, 1) != ".")) {
					search_packages("$base_path/$file", $suffix);
				}
			}
		}

		// First all headers (*.js.h)
		search_packages("../packages", "js.h");		
		
		// Then all files (*.js)
		search_packages("../packages", "js");
?>

