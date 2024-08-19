
const makeButton = (parent, options) => {
	const button = document.createElement('button');
	button.textContent = options.content ?? '?';
	button.title = options.title;
	button.classList.add(...options.classList, 'reader-auto-added');
	parent.appendChild(button);
	return button;
};

const makeInput = (parent, options) => {
	const input = document.createElement('input');
	input.type = options.type;
	input.value = options.value;
	input.setAttribute('placeHolder', options.placeholder);
	input.classList.add(...options.classList, 'reader-auto-added');
	parent.appendChild(input);
	return input;
};

let pageNumber = 0;
let cleanUpPagination = null;

const paginate = () => {
	if (cleanUpPagination) cleanUpPagination();

	const container = document.querySelector('#joplin-container-content');
	document.body.classList.add('paginate');

	const nextButton = makeButton(container, {
		content: '>',
		title: 'Next',
		classList: ['reader-button', '-right'],
	});

	const prevButton = makeButton(container, {
		content: '<',
		title: 'Previous',
		classList: ['reader-button', '-left'],
	});

	const pageNumberInput = makeInput(container, {
		placeholder: 'Page',
		type: 'number',
		classList: ['reader-page-number'],
	});

	const getPageSize = () => {
		return container.clientWidth;
	};

	const updatePage = () => {
		const maxPage = Math.ceil(container.scrollWidth / getPageSize()) - 1;
		pageNumber = Math.max(Math.min(maxPage, pageNumber), 0);
		container.style.setProperty('--page-number', pageNumber);
		pageNumberInput.value = pageNumber + 1;

		prevButton.disabled = pageNumber === 0;
		nextButton.disabled = pageNumber === maxPage;
	};

	const nextPage = () => {
		pageNumber++;
		updatePage();
	};

	const prevPage = () => {
		pageNumber--;
		updatePage();
	};

	const scrollToElement = (element) => {
		if (!container.contains(element)) return;

		const containerRect = container.getBoundingClientRect();
		const targetRect = element.getBoundingClientRect();

		// targetRect.left is relative to the current **viewport**. As such,
		// if the viewport is already scrolled, offset is relative to the current
		// **scroll*, and so we add to pageNumber.
		const offset = targetRect.left - containerRect.left;
		pageNumber += Math.floor(offset / getPageSize());
		updatePage();
	};

	nextButton.onclick = nextPage;
	prevButton.onclick = prevPage;
	pageNumberInput.oninput = () => {
		pageNumber = parseInt(pageNumberInput.value) - 1;
		updatePage();
	};

	requestAnimationFrame(updatePage);

	const onKeyDown = (event) => {
		if (event.defaultPrevented) return;

		let newPageNumber = pageNumber;
		if (event.code === 'ArrowRight') {
			newPageNumber ++;
		} else if (event.code === 'ArrowLeft') {
			newPageNumber --;
		}

		if (pageNumber !== newPageNumber) {
			event.preventDefault();
			pageNumber = newPageNumber;
			updatePage();
		}
	};
	document.addEventListener('keydown', onKeyDown);

	const onFocusChange = (event) => {
		scrollToElement(event.target);
	};
	document.addEventListener('focusin', onFocusChange);

	cleanUpPagination = () => {
		const autoAdded = document.querySelectorAll('.reader-auto-added');
		for (const element of autoAdded) {
			element.remove();
		}
		document.body.classList.remove('paginate');
		document.removeEventListener('keydown', onKeyDown);
		document.removeEventListener('focusin', onFocusChange);
	};
};

document.addEventListener('joplin-noteDidUpdate', () => {
	paginate();
});
paginate();

