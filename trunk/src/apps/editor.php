<html>
<head>
	<title>Edit: <? echo $_GET["hycms_content"] ?></title>

	<link rel="stylesheet" type="text/css" href="editor/editor.css">
	<link rel="stylesheet" type="text/css" href="nocache.css">

<? include "../services/setup.php" ?>	
<? include "../services/packages.php" ?>

	<script type='text/javascript' src='editor/main.js' charset='UTF-8'></script>
</head>
<body>
<div id='container'>
 Loading and rendering content...
</div>
</body>

<script type='text/javascript' charset='UTF-8'>
	function main(contentPath) 
	{
		var editor = new Editor(document.getElementById("container"));

		editor._showReference({contentPath: contentPath});
	}
	
	main('<?=$_GET['hycms_content']?>');
</script>

</html>

