<?
	$content_base_path = "../storage/persistent";	 

	/*
	 * cleanup_path(basepath, path)
	 *
	 * Make sure, that a path doesn't contain any ".." and
	 * make the path relative to "basepath"
	 *
	 */
	function cleanup_path($basepath, $path)
	{
		$path = trim($path, "/");
		
		$elemented_path = explode("/", $path);
				
		if (in_array(array("..", ""), $elemented_path))
			return null;
			
		return $basepath."/".$path.".json";		
	}

	/*
	 * load_json(path)
	 *
	 * Loads a file and returns it
	 *
	 */
	function load_json($path)
	{
		global $content_base_path;

		$clean_path = cleanup_path($content_base_path, $path);
		
		echo file_get_contents($clean_path);
	}
	

	/*
	 * AJAX content provider
	 *
	 */
	switch ($_GET["hycms_cmd"]) {
		case "get_content":
			load_json($_GET["hycms_path"]);
			break;
			
		case "set_content":
			write_json($_GET["hycms_path"], $_POST["hycms_data"]);
			break;
	}

?>

