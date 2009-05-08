<script type='text/javascript' charset='UTF-8'>
	function reload()
	{
		window.location="test.php?suite="+document.getElementById('testSel').value;
	}
</script>

<div id='testBox'>
	<span id='testIdentifier'>Test suite:</span>

	<select id='testSel' onchange='reload()'>		
	<?

		function search_packages($base_path, $suffix, $depth) 
		{
			$dir = opendir($base_path);
			$actions = array();
			
			while(false !== ($file=readdir($dir))) {
				$path_depth = str_replace("\t", "&nbsp;&nbsp;&nbsp;", $depth);

				// Select package
				if (filetype("$base_path/$file") != "dir")  {
					$selected = "";
				
					if (substr($file, -(strlen($suffix))) != $suffix)
						continue;
				
					$file_data = file("$base_path/$file");
				
					if ($_GET['suite'] == "$base_path/$file")
						$selected = 'selected="true"';
				
					echo "$depth\t<option value='$base_path/$file' $selected>$path_depth".substr($file_data[0], 3)."</option>\n";
				}
				
				// Nested package directory
				if ((filetype("$base_path/$file") == "dir") && (substr($file, 0, 1) != ".")) {
					echo "$depth<optgroup label='$path_depth".$file."'>\n";
				
					search_packages("$base_path/$file", $suffix, $depth."\t");
					
					echo "$depth</optgroup>\n";
				}
			}
		}		
		
		search_packages("./suites", ".test.js", "");
	?>
	</select>
	
	<a href="javascript:reload()" id='testLink'><img border=0 src="./internal/reload.png" /></a>
</div>

