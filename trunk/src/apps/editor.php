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
<div id='menuBar'>
	<div style="margin: auto; verical-align: middle; height:1em; font-size:10px;font-weight:bold" id="semantics"> </div>
</div>

<div id='container'>
 Loading and rendering content...
</div>
</body>

<script type='text/javascript' charset='UTF-8'>
	main('<?=$_GET['hycms_content']?>');
</script>

</html>

