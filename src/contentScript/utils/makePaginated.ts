import { createScrollDetector } from "./createScrollDetector";
import { makeButton } from "./makeButton";
import { makeInput } from "./makeInput";


export const makePaginated = (
	container: HTMLElement,
	contentWrapper: HTMLElement,
	onPageNumberChange: (page: number)=>void,
) => {
	container.classList.add('paginated-element');

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

	let pageNumber = 0;
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

	const setPageNumber = (newPageNumber: number) => {
		const maxPage = convertScrollPositionToPageNumber(container.scrollWidth);
		newPageNumber = Math.max(0, Math.min(newPageNumber, maxPage));

		if (newPageNumber !== pageNumber && isFinite(newPageNumber)) {
			console.log(' setPage', newPageNumber);
			pageNumber = newPageNumber;
			onPageNumberChange?.(pageNumber);
			scrollToCurrentPage();
		} else {
			console.log(' skip set page', newPageNumber, 'compares to current', pageNumber);
		}
	};

	const nextPage = () => {
		setPageNumber(pageNumber + 1);
	};

	const prevPage = () => {
		setPageNumber(pageNumber - 1);
	};

	const scrollToElement = (element: Element) => {
		if (!container.contains(element)) {
			console.log('can\'t scroll to element -- not in container')
			return;
		}

		const containerRect = container.getBoundingClientRect();
		const targetRect = element.getBoundingClientRect();

		// targetRect.left is relative to the current **viewport**. As such,
		// if the viewport is already scrolled, offset is relative to the current
		// **scroll*, and so we add to pageNumber.
		const offset = targetRect.left - containerRect.left;
		console.log('scrolling by', offset);
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

	const onResize = () => {
		setPageNumber(pageNumberFromCurrentScroll());
	};
	document.addEventListener('resize', onResize);

	let destroyed = false;
	const cleanUp = () => {
		if (destroyed) return;

		const autoAdded = document.querySelectorAll('.reader-auto-added');
		for (const element of autoAdded) {
			element.remove();
		}
		container.classList.remove('paginated-element');
		window.removeEventListener('keydown', onKeyDown);
		document.removeEventListener('resize', onResize);
		container.removeEventListener('focusin', onFocusChange);
		container.removeEventListener('scroll', onScroll);
		destroyed = true;
	};

	return {
		cleanUp,
		setPageNumber: (newPageNumber: number) => {
			if (destroyed) return;
			setPageNumber(newPageNumber);
		},
		getPageNumber: () => pageNumber,
		scrollToCurrentPage,

		setLocation: (location: number) => {
			location = Math.min(location, contentWrapper.children.length - 1);
			const target = contentWrapper.children.item(location);
			console.log('jump to location', location, target);
			if (target) {
				console.log('prepare scroll to element', target);
				scrollToElement(target);
			}
		},
		getLocation: () => {
			const containerBox = container.getBoundingClientRect();

			let i = 0;
			for (const child of contentWrapper.children) {
				const childRect = child.getBoundingClientRect();
				if (
					getComputedStyle(child).position === 'static' &&
					childRect.left >= containerBox.left
				) {
					return i;
				}

				i++;
			}
			return i;
		},
	};
};

export type PaginationController = ReturnType<typeof makePaginated>;
