<html>
<script type='text/javascript' charset='UTF-8'>
	function reload()
	{
		parent.frames[1].location="test-body.php?suite="+document.getElementById('test_sel').value;
	}
</script>

<body style='text-align:center; vertical-align:middle; background:black; color: white; font-family: sans serif; font-size: 0.9em; font-weight: bold'>
<div style="vertical-align:middle;">
	<span style='vertical-align:middle'>Test suite:</span>

	<select id='test_sel' style='width:30em; vertical-align:middle' onchange='reload()'>		
	<?

		function search_packages($base_path, $suffix, $depth) 
		{
			$dir = opendir($base_path);
			$actions = array();
			
			while(false !== ($file=readdir($dir))) {
				$path_depth = str_replace("\t", "&nbsp;&nbsp;&nbsp;", $depth);

				// Select package
				if (filetype("$base_path/$file") != "dir")  {
					if (substr($file, -(strlen($suffix))) != $suffix)
						continue;
				
					$file_data = file("$base_path/$file");
				
					echo "$depth\t<option value='$base_path/$file'>$path_depth".substr($file_data[0], 3)."</option>\n";
				}
				
				// Nested package directory
				if ((filetype("$base_path/$file") == "dir") && (substr($file, 0, 1) != ".")) {
					echo "$depth<optgroup label='$path_depth".$file."'>\n";
				
					search_packages("$base_path/$file", $suffix, $depth."\t");
					
					echo "$depth</optgroup>\n";
				}
			}
		}		
		
		search_packages("../suites", ".test.js", "");
	?>
	</select>
	
	<a href="javascript:reload()" style="vertical-align:middle"><img border=0 src="./reload.png" /></a>
</div>
</body>
</html>

