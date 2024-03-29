document.addEventListener("DOMContentLoaded", async () => {

	const unlockCopy = document.getElementById("unlockCopy");

	unlockCopy.addEventListener("click", async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: () => {
				if (!document) return;
				document.body.style.userSelect = "unset";
				const styleEl = document.createElement("style");
				styleEl.innerText = "*{user-select: unset !important;}";
				document.head.appendChild(styleEl);
			},
		});
	});



	// 点击图片下载
	const downloadImageMenuItemEL = document.getElementById("downloadImage");
	downloadImageMenuItemEL.addEventListener("click", async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: downloadImages,
		})
	})

	

	// 下载图片
	function downloadImages(){
		const createImg = (url, name = Math.random() * 1000000 >> 1) => {
			const img = document.createElement("img");
			img.src = url;
			img.dataset.name = name;
			return img
		}
	
		const createA = (url, name) => {
			const a = document.createElement("a");
			a.href = url;
			const extension = url.replace(/\?.*$/, '').split('.').pop();
			a.download = `${name || new Date().getTime()}.${extension}`;
			return a;
		}
	
		function downloadImage(img) {
			const url = img.src
			return fetch(url).then(res => res.blob()).then(blob => {
				const a = createA(url, img.dataset.name);
				a.href = URL.createObjectURL(blob);
				a.click();
			})
		}
	
		function addClickListener(el) {
			el.addEventListener('click', e => {
				if (e.target.tagName === 'IMG') {
					downloadImage(e.target)
				}
				e.stopPropagation();
				e.preventDefault();
			})
		}
		
		const images = Array.from(document.querySelectorAll('img')).map(item => createImg(item.src));

		console.log(images)

		function appendImageDialog() {
			let imageListEl = document.getElementById('imageList')
			if (imageListEl) imageListEl.parentElement.removeChild(imageListEl)
			imageListEl = document.createElement('div');
			imageListEl.id = 'imageList'
			document.documentElement.appendChild(imageListEl)

			// 头部 
			const header = document.createElement('div')
			header.classList.add('header')

			const title = document.createElement('h1')
			title.innerHTML = '图片列表'
			header.appendChild(title)

			title.addEventListener('click', () => {
				images.flat().forEach( async image => {
					await downloadImage(image)
				})
			})

			const closeIcon = document.createElement('span')
			closeIcon.classList.add('close-icon')
			closeIcon.innerText = 'x'
			closeIcon.addEventListener('click', () => document.documentElement.removeChild(imageListEl))
			header.appendChild(closeIcon)

			// append header
			imageListEl.appendChild(header)

			// 内容
			const content = document.createElement('div')
			content.classList.add('content')

			images.forEach(image => {
				const imgItem = document.createElement('div')
				imgItem.classList.add('img-item')
				const nameEl = document.createElement('span')
				nameEl.innerText = image.dataset.name
				imgItem.appendChild(image)
				imgItem.appendChild(nameEl)
				content.appendChild(imgItem)
			})
			addClickListener(imageListEl)

			// append content
			imageListEl.appendChild(content)

		}

		function injectCustomCSS() {
			if(window.downloadImageDialogCssIsInjected) return
			window.downloadImageDialogCssIsInjected = true
			const customStyle = document.createElement('style');
			customStyle.textContent = `
				/* 在这里添加你的 CSS 样式规则 */
				#imageList {
					position: fixed;
					z-index: 9999999;
					top: 50%;
					left: 50%;
					width: 70vw;
					max-height: 80%;
					font-size: 14px;
					transform: translate(-50%, -50%);
					padding: 0 12px;
					background: white;
					border: 1px solid black;
					border-radius: 8px;
					box-shadow: 0 0 0 1000px rgba(0,0,0,0.5);
				}

				#imageList .header {
					position: sticky;
					top: 0;
					height: 50px;
					width: 100%;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				#imageList .content {
					overflow-y: auto;
					max-height: 70vh;
					margin-bottom: 12px;
					padding: 12px;
					display: flex;
					flex-wrap: wrap;
					align-items: flex-start;
					gap: 12px;
				}

				#imageList .img-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4px;
					font-size: 12px;
				}

				#imageList .group-content:nth-child(2n) {
					background: #eee;
				}

				#imageList img {
					width: 100px;
					border-radius: 4px;
					cursor: pointer;
					transition: transform 0.3s;
				}

				#imageList img:hover {
					transform: scale(1.3);
				}

				#imageList .close-icon {
					cursor: pointer;
					font-size: 30px;
				}
				#imageList .close-icon:hover {
					color: red;
				}
			`;
			document.head.appendChild(customStyle);
		}

		injectCustomCSS()

		appendImageDialog()


	}

	
	// 点击1688图片下载
	const download1688ImageMenuItemEl = document.getElementById("download1688Image");

	download1688ImageMenuItemEl.addEventListener("click", async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: download1688Images,
		})
	});

	// 下载1688图片
	function download1688Images() {

		let imageName = 1

		const createImg = (url, name) => {
			const img = document.createElement("img");
			img.src = url;
			img.dataset.name = name || imageName++;
			return img
		}

		// 获取轮播图片
		const getBannerImages = () => {
			const banner = document.querySelector('.gallery-fix-wrapper .detail-gallery-turn-outter-wrapper');
			const images = banner ? Array.from(banner.querySelectorAll('img.detail-gallery-img')) : [];
			return images.map(item => createImg(item.src))
		}

		// 获取背景图片
		const getElBackgroundImageUrl = (el, imgClass = '.prop-img', nameClass='.prop-name') => {
			// 获取计算样式对象
			const imgEl = el.querySelector(imgClass)
			if(!imgEl) return
			const computedStyle = window.getComputedStyle(imgEl);
			const name = el.querySelector(nameClass)?.innerText

			// 获取背景图像 URL
			const backgroundImage = computedStyle.getPropertyValue('background-image')

			// 解析 URL
			const backgroundImageURL = backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');

			return createImg(backgroundImageURL, name)
		}

		// 获取sku图片
		const getSkuPropImages = () => {
			const skus = document.querySelectorAll('.pc-sku-wrapper .prop-item');
			return Array.from(skus).map(el => getElBackgroundImageUrl(el)).filter(item => item)
		}

		const getSkuImages = () => {
			if(!document.querySelector('.pc-sku-wrapper .sku-item-wrapper .sku-item-image')) return []
			const skus = document.querySelectorAll('.pc-sku-wrapper .sku-item-wrapper') || []

			return Array.from(skus).map((el) => getElBackgroundImageUrl(el, '.sku-item-image', '.sku-item-name')).filter(item => item)

		}

		const getDetailImages = () => {
			const detail = document.querySelector('.detail-desc-module');
			return Array.from(detail.querySelectorAll('img')).map(el => createImg(el.dataset?.lazyloadSrc || el.src)).filter(item => item)
		}

		const createA = (url, name) => {
			const a = document.createElement("a");
			a.href = url;
			const extension = url.replace(/\?.*$/, '').split('.').pop();
			a.download = `${name || new Date().getTime()}.${extension}`;
			return a;
		}

		function downloadImage(img) {
			const url = img.src
			return fetch(url).then(res => res.blob()).then(blob => {
				const a = createA(url, img.dataset.name);
				a.href = URL.createObjectURL(blob);
				a.click();
			})
		}

		function addClickListener(el) {
			el.addEventListener('click', e => {
				if (e.target.tagName === 'IMG') {
					downloadImage(e.target)
				}
				e.stopPropagation();
				e.preventDefault();
			})
		}

		
		function appendImageDialog() {
			const images = [getBannerImages(), getSkuImages(), getSkuPropImages(), getDetailImages()]
			let imageList = document.getElementById('imageList_1688')
			if (imageList) imageList.parentElement.removeChild(imageList)
			imageList = document.createElement('div');
			imageList.id = 'imageList_1688'
			document.documentElement.appendChild(imageList)

			// 头部 
			const header = document.createElement('div')
			header.classList.add('header')

			const title = document.createElement('h1')
			title.innerHTML = '图片列表-全部下载'
			header.appendChild(title)

			title.addEventListener('click', () => {
				images.flat().forEach( async image => {
					await downloadImage(image)
				})
			})

			const closeIcon = document.createElement('span')
			closeIcon.classList.add('close-icon')
			closeIcon.innerText = 'x'
			closeIcon.addEventListener('click', () => document.documentElement.removeChild(imageList))
			header.appendChild(closeIcon)

			// append header
			imageList.appendChild(header)

			// 内容
			const content = document.createElement('div')
			content.classList.add('content')


			images.forEach(group => {
				const groupContent = document.createElement('div')
				groupContent.classList.add('group-content')
				group.forEach(image => {
					const imgItem = document.createElement('div')
					imgItem.classList.add('img-item')
					const nameEl = document.createElement('span')
					nameEl.innerText = image.dataset.name
					imgItem.appendChild(image)
					imgItem.appendChild(nameEl)
					groupContent.appendChild(imgItem)
				})
				content.appendChild(groupContent)
			})
			addClickListener(imageList)

			// append content
			imageList.appendChild(content)

		}

		function injectCustomCSS() {
			if(window.download1688ImageDialogCssIsInjected) return
			window.download1688ImageDialogCssIsInjected = true
			const customStyle = document.createElement('style');
			customStyle.textContent = `
				/* 在这里添加你的 CSS 样式规则 */
				#imageList_1688 {
					position: fixed;
					z-index: 9999999;
					top: 50%;
					left: 50%;
					width: 70vw;
					max-height: 80%;
					font-size: 14px;
					transform: translate(-50%, -50%);
					padding: 0 12px;
					background: white;
					border: 1px solid black;
					border-radius: 8px;
					box-shadow: 0 0 0 1000px rgba(0,0,0,0.5);
				}

				#imageList_1688 .header {
					position: sticky;
					top: 0;
					height: 50px;
					width: 100%;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				#imageList_1688 .content {
					overflow-y: auto;
					max-height: 70vh;
				}

				#imageList_1688 .group-content {
					margin-bottom: 12px;
					padding: 12px;
					display: flex;
					flex-wrap: wrap;
					align-items: flex-start;
					gap: 12px;
				}

				#imageList_1688 .group-content .img-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4px;
					font-size: 12px;
				}

				#imageList_1688 .group-content:nth-child(2n) {
					background: #eee;
				}

				#imageList_1688 img {
					width: 100px;
					border-radius: 4px;
					cursor: pointer;
					transition: transform 0.3s;
				}

				#imageList_1688 img:hover {
					transform: scale(1.3);
				}

				#imageList_1688 .close-icon {
					cursor: pointer;
					font-size: 30px;
				}
				#imageList_1688 .close-icon:hover {
					color: red;
				}
			`;
			document.head.appendChild(customStyle);
		}

		injectCustomCSS()

		appendImageDialog()

	}
})


document.getElementById("saveTaobaoSearchWord").addEventListener("click", function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "exportTable" });
  });
});

document.getElementById("ChangeTaobaoSearchWordCondition").addEventListener("click", function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "ChangeTaobaoSearchWordCondition" });
  });
});
