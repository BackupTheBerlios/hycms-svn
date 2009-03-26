<?
	$hycSetup = array();

	$hySetup["base_url"] = "localhost/hycms/";
	$hySetup["service_url"] = "localhost/hycms/php/";
?>

	<script type='text/javascript' charset='UTF-8'>
		var hySetup = <? echo json_encode($hySetup)."\n"; ?>
	</script>
