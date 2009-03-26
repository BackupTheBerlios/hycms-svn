<html>
<head>
	<title>View: <? echo $_GET["hycms_content"] ?></title>

	<link rel="stylesheet" type="text/css" href="nocache.css">

<? include "../services/setup.php" ?>	
<? include "../services/packages.php" ?>

	<script type='text/javascript' src='editor.js' charset='UTF-8'></script>

	<script type='text/javascript' charset='UTF-8'>
		function main(contentPath) 
		{
			var editor = new Editor(document.body);
		
			editor.show(contentPath);
		}
	</script>

</head>
<body onload="main('<?=$_GET['hycms_content']?>')">
 Loading and rendering content...
</body>
</html>

