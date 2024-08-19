
interface ButtonOptions {
	content: string;
	title: string;
	classList: string[];
}

const makeButton = (parent: HTMLElement, options: ButtonOptions) => {
	const button = document.createElement('button');
	button.textContent = options.content ?? '?';
	button.title = options.title;
	button.classList.add(...options.classList, 'reader-auto-added');
	parent.appendChild(button);
	return button;
};

interface InputOptions {
	type: string;
	value?: string;
	placeholder: string;
	classList: string[];
}

const makeInput = (parent: HTMLElement, options: InputOptions) => {
	const input = document.createElement('input');
	input.type = options.type;
	input.value = options.value;
	input.setAttribute('placeHolder', options.placeholder);
	input.classList.add(...options.classList, 'reader-auto-added');
	parent.appendChild(input);
	return input;
};

type GetScrollCallback = ()=>number;
type OnScrollEnd = ()=>void;

const createScrollDetector = (getScroll: GetScrollCallback, onScrollEnd: OnScrollEnd) => {
	let lastScroll = getScroll();
	let lastTime = performance.now();
	let velocity = 0;

	const updateState = () => {
		const nowTime = performance.now();
		if (nowTime > lastTime + 50) {
			velocity = (getScroll() - lastScroll) / (nowTime - lastTime);
			if (Math.abs(velocity) < 1e-8) {
				velocity = 0;
			}

			lastTime = nowTime;
			lastScroll = getScroll();
			return true;
		}
		return false;
	};

	const checkScrollEnd = debounce(() => {
		if (updateState() && velocity === 0) {
			onScrollEnd();
		} else {
			checkScrollEnd();
		}
	}, 100);

	return {
		onScrollUpdate: async () => {
			checkScrollEnd();
		},
		getVelocity: () => velocity,
	};
};

const debounce = <T extends (...args: any)=>void> (callback: T, timeout: number): T => {
	let timeoutId: ReturnType<typeof setTimeout> = null;
	const result = (...args: Parameters<T>) => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			timeoutId = null;
			callback(...args);
		}, timeout);
	};
	return result as T;
};

let pageNumber = 0;
let cleanUpPagination: (()=>void)|null = null;

const paginate = () => {
	if (cleanUpPagination) cleanUpPagination();

	const container = document.querySelector<HTMLElement>('#joplin-container-content');
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

	const convertScrollPositionToPageNumber = (position: number) => {
		return Math.ceil(position / getPageSize()) - 1;
	};

	const scrollToCurrentPage = () => {
		const target = pageNumber * getPageSize();
		if (Math.floor(container.scrollLeft) !== Math.floor(target)) {
			container.scrollTo(target, 0);
		}
	};

	const pageNumberFromCurrentScroll = () => {
		return convertScrollPositionToPageNumber(
			container.scrollLeft + getPageSize() / 2
		);
	};

	const updateControls = () => {
		const currentPageNumber = pageNumberFromCurrentScroll();
		pageNumberInput.value = `${currentPageNumber + 1}`;

		const maxPage = convertScrollPositionToPageNumber(container.scrollWidth);
		prevButton.disabled = currentPageNumber === 0;
		nextButton.disabled = currentPageNumber === maxPage;
	};

	const setPageNumber = (page: number) => {
		const maxPage = convertScrollPositionToPageNumber(container.scrollWidth);
		page = Math.max(0, Math.min(page, maxPage));

		if (page !== pageNumber && isFinite(page)) {
			pageNumber = page;
			scrollToCurrentPage();
		}
	};

	const nextPage = () => {
		setPageNumber(pageNumber + 1);
	};

	const prevPage = () => {
		setPageNumber(pageNumber - 1);
	};

	const scrollToElement = (element: HTMLElement) => {
		if (!container.contains(element)) return;

		const containerRect = container.getBoundingClientRect();
		const targetRect = element.getBoundingClientRect();

		// targetRect.left is relative to the current **viewport**. As such,
		// if the viewport is already scrolled, offset is relative to the current
		// **scroll*, and so we add to pageNumber.
		const offset = targetRect.left - containerRect.left;
		setPageNumber(pageNumber + Math.floor(offset / getPageSize()));
	};

	nextButton.onclick = nextPage;
	prevButton.onclick = prevPage;
	pageNumberInput.oninput = () => {
		setPageNumber(parseInt(pageNumberInput.value) - 1);
	};

	requestAnimationFrame(updateControls);

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.defaultPrevented) return;

		let newPageNumber = pageNumber;
		if (event.code === 'ArrowRight') {
			newPageNumber ++;
		} else if (event.code === 'ArrowLeft') {
			newPageNumber --;
		}

		if (pageNumber !== newPageNumber) {
			event.preventDefault();
			setPageNumber(newPageNumber);
		}
	};
	window.addEventListener('keydown', onKeyDown);

	const scrollEndDetector = createScrollDetector(() => container.scrollLeft, () => {
		setPageNumber(pageNumberFromCurrentScroll());
		scrollToCurrentPage();
	});

	const onScroll = () => {
		scrollEndDetector.onScrollUpdate();
		updateControls();
	};
	container.addEventListener('scroll', onScroll);

	const onFocusChange = (event: Event) => {
		scrollToElement(event.target as HTMLElement);
	};
	container.addEventListener('focusin', onFocusChange);

	cleanUpPagination = () => {
		const autoAdded = document.querySelectorAll('.reader-auto-added');
		for (const element of autoAdded) {
			element.remove();
		}
		document.body.classList.remove('paginate');
		window.removeEventListener('keydown', onKeyDown);
		container.removeEventListener('focusin', onFocusChange);
		container.removeEventListener('scroll', onScroll);
	};
};

document.addEventListener('joplin-noteDidUpdate', () => {
	paginate();
});
paginate();

