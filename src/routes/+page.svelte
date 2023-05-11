<script>
	let files;
	let text;
</script>

<form action="?/upload" method="post" enctype="multipart/form-data">
	<input
		bind:files
		type="file"
		accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		name="file"
		required
	/>
	<br />
	<br />
	<textarea bind:value={text} name='msg' required/>
	<br />
	<br />
	<button type="submit"> Kirim </button>
</form>
