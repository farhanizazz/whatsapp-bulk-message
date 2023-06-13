<script>
	let files;
	let text;
</script>

<form action="?/upload" method="post" enctype="multipart/form-data">
	<label for="file">List nomor telepon (xls/xlsx)<br/></label>
	<input
		bind:files
		type="file"
		accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		name="file"
		id="file"
		required
	/>
	<br/>
	<br/>
	<label for="file">Gambar (opsional)<br/></label>
	<input
		bind:files
		type="file"
		accept="image/bmp, image/jpeg, image/x-png, image/png, image/gif"
		name="image"
		id="image"
	/>
	<br />
	<br />
	<label for="msg">Pesan<br/></label>
	<textarea id="msg" bind:value={text} name='msg' required/>
	<br />
	<br />
	<button type="submit"> Kirim </button>
</form>
