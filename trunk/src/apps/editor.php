<html>
<head>
	<title>Edit: <? echo $_GET["hycms_content"] ?></title>

	<link rel="stylesheet" type="text/css" href="editor.css">
	<link rel="stylesheet" type="text/css" href="nocache.css">

<? include "../services/setup.php" ?>	
<? include "../services/packages.php" ?>

	<script type='text/javascript' src='editor.js' charset='UTF-8'></script>

	<script type='text/javascript' charset='UTF-8'>
		function main(contentPath) 
		{
			var editor = new Editor(document.getElementById("container"));
		
			editor._showReference(contentPath);
		}
	</script>

</head>
<body onload="main('<?=$_GET['hycms_content']?>')">
<div id='container'>
 Loading and rendering content...
</div>
</body>
</html>

