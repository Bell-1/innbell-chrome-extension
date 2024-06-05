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
	function downloadImages() {
		let imageName = 1
		const createImg = (url, name) => {
			const img = document.createElement("img");
			img.src = url;
			img.dataset.name = name || imageName++;
			return img
		}

		const createA = (url, name) => {
			const a = document.createElement("a");
			a.href = url;
			const extension = url.replace(/\?.*$/, '').split('.').pop();
			a.download = `${name || new Date().getTime()}.${extension}`;
			return a;
		}
		// sleep
		function sleep(ms = 100) {
			return new Promise(resolve => setTimeout(resolve, ms));
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

		async function downloadAllImages(imgs) {
			for (const img of imgs.flat()) {
				await downloadImage(img)
				console.log('sleep1')
				await sleep(300)
			}
		}

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
				// 下载全部
				downloadAllImages(images)
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
			if (window.downloadImageDialogCssIsInjected) return
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
			// 排除视频预览图
			const hasVideo = banner ? banner.querySelector('.video-icon') : null;
			return images.map(item => createImg(item.src)).slice(hasVideo ? 1 : 0, hasVideo ? 6 : 5)
		}

		// 获取背景图片
		const getElBackgroundImageUrl = (el, imgClass = '.prop-img', nameClass = '.prop-name') => {
			// 获取计算样式对象
			const imgEl = el.querySelector(imgClass)
			if (!imgEl) return
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
			if (!document.querySelector('.pc-sku-wrapper .sku-item-wrapper .sku-item-image')) return []
			const skus = document.querySelectorAll('.pc-sku-wrapper .sku-item-wrapper') || []

			return Array.from(skus).map((el) => getElBackgroundImageUrl(el, '.sku-item-image', '.sku-item-name')).filter(item => item)

		}

		// 详情图片
		const getDetailImages = () => {
			const detail = document.querySelector('.detail-desc-module');
			return Array.from(detail.querySelectorAll('img'))
				.filter(item => item && item.parentElement.tagName !== 'A') // 排除链接
				.map(el => createImg(el.dataset?.lazyloadSrc || el.src)) // 兼容懒加载图片
				.filter(item => item) // 过滤空值
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

		// sleep
		function sleep(ms = 100) {
			return new Promise(resolve => setTimeout(resolve, ms));
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

			title.addEventListener('click', async () => {
				let count = 1
				for (const image of images.flat()) {
					await downloadImage(image)
					console.log('sleep2')
					if (count++ === 10) {
						await sleep(1000)
						count = 1
					}
				}
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

			function newBlockTitle(_images) {
				const titleBlock = document.createElement('div')
				const titleH2 = document.createElement('h2')
				titleBlock.classList.add('group-title-block')
				titleBlock.appendChild(titleH2)
				titleH2.innerText = '图片列表,点击下载分组图片'
				titleH2.addEventListener('click', async () => {
					let count = 1
					for (const image of _images.flat()) {
						await downloadImage(image)
						console.log('sleep2')
						if (count++ === 10) {
							await sleep(1000)
							count = 1
						}
					}
				})
				return titleBlock
			}



			images.forEach(_images => {
				if(_images.length === 0) return
				const group = document.createElement('div')
				group.classList.add('group')

				// 标题 + 下载
				const titleEl = newBlockTitle(_images)
				group.appendChild(titleEl)

				// 图片列表
				const groupContent = document.createElement('div')
				groupContent.classList.add('group-content')
				group.appendChild(groupContent)
				_images.forEach(image => {
					const imgItem = document.createElement('div')
					imgItem.classList.add('img-item')
					const nameEl = document.createElement('span')
					nameEl.innerText = image.dataset.name
					imgItem.appendChild(image)
					imgItem.appendChild(nameEl)
					groupContent.appendChild(imgItem)
				})
				content.appendChild(group)
			})
			addClickListener(imageList)

			// append content
			imageList.appendChild(content)

		}

		function injectCustomCSS() {
			if (window.download1688ImageDialogCssIsInjected) return
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
					cursor: pointer;
					
				}

				#imageList_1688 .header:hover {
					color: ref;
				}

				#imageList_1688 .content {
					overflow-y: auto;
					max-height: 70vh;
				}
				#imageList_1688 .content .group .group-title-block {
					padding: 10px;
					background: #f5f5f5;
				}
				#imageList_1688 .content .group .group-title-block h2 {
					color: #00a115;
					cursor: pointer;
				}
				#imageList_1688 .content .group .group-content {
					margin-bottom: 12px;
					padding: 12px;
					display: flex;
					flex-wrap: wrap;
					align-items: flex-start;
					gap: 12px;
				}

				#imageList_1688 .content .group .group-content .img-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4px;
					font-size: 12px;
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


document.getElementById("saveTaobaoSearchWord").addEventListener("click", function () {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { action: "exportTable" });
	});
});

document.getElementById("ChangeTaobaoSearchWordCondition").addEventListener("click", function () {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { action: "ChangeTaobaoSearchWordCondition" });
	});
});

document.getElementById("lunWenRepeatContent").addEventListener("click", function () {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { action: "GetLunWenRepeatContent" });
	});
});
