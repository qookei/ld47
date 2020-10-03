export function load_file_contents(url) {
	return new Promise(resolve => {
		const file = new XMLHttpRequest();

		file.onreadystatechange = () => {
			if (file.readyState == 4) {
				resolve({
					status: file.status,
					content: file.responseText
				});
			}
		}

		file.open("GET", url, true);
		file.send();
	});
}
