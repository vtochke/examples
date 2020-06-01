<?require_once($_SERVER["DOCUMENT_ROOT"]."/admin/prolog.php");?>
<?
$APP->initTemplate('main');
?>
<canvas></canvas>
<script type="module" src="js/main.js?time=<?=time()?>"></script>