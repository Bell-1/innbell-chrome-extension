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

	const NationalMemorialDayEl = document.getElementById("NationalMemorialDay");

	NationalMemorialDayEl.addEventListener("click", async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: () => {
				if (!document) return;
				const filterPrefix = ["filter", "-webkit-filter", "-moz-filter", "-ms-filter"];
				const has = filterPrefix.filter((item) => {
					return document.documentElement.style[item] || document.body.style[item];
				});

				if (has) {
					filterPrefix.forEach((item) => {
						document.documentElement.style[item] = "";
						document.body.style[item] = "";
					});
				} else {
					filterPrefix.forEach((item) => {
						document.documentElement.style[item] = "grayscale(1)";
					});
				}
			},
		});
	});

	// 点击图片下载
	const downloadImage = document.getElementById("downloadImage");

	downloadImage.addEventListener("click", async () => {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: downloadImages,
		})
	});

	function downloadImages() {

		const createImg = (url, name = Math.random() * 1000000 >> 1) => {
			const img = document.createElement("img");
			img.src = url;
			img.dataset.name = name;
			return img
		}

		// 获取轮播图片
		const getBannerImages = () => {
			const banner = document.querySelector('.gallery-fix-wrapper .detail-gallery-turn-outter-wrapper');
			const images = banner ? Array.from(banner.querySelectorAll('img.detail-gallery-img')) : [];
			return images.map(item => createImg(item.src))
		}

		// 获取背景图片
		const getElBackgroundImageUrl = (el) => {
			// 获取计算样式对象
			const computedStyle = window.getComputedStyle(el.querySelector('.prop-img'));
			const name = el.querySelector('.prop-name')?.innerText

			// 获取背景图像 URL
			const backgroundImage = computedStyle.getPropertyValue('background-image')

			// 解析 URL
			const backgroundImageURL = backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');

			return createImg(backgroundImageURL, name)
		}

		// 获取sku图片
		const getSkuImages = () => {
			const skus = document.querySelectorAll('.pc-sku-wrapper .prop-item');
			return Array.from(skus).map(getElBackgroundImageUrl)
		}

		const getDetailImages = () => {
			const detail = document.querySelector('.detail-desc-module');
			return Array.from(detail.querySelectorAll('img')).map(el => createImg(el.dataset?.lazyloadSrc || el.src))
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
			const images = [getBannerImages(), getSkuImages(), getDetailImages()]
			let imageList = document.getElementById('imageList')
			if (imageList) imageList.parentElement.removeChild(imageList)
			imageList = document.createElement('div');
			imageList.id = 'imageList'
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
				}

				#imageList .group-content {
					margin-bottom: 12px;
					padding: 12px;
					display: flex;
					flex-wrap: wrap;
					align-items: flex-start;
					gap: 12px;
				}

				#imageList .group-content .img-item {
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
})