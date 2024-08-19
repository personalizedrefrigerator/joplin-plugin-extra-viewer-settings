import { createScrollDetector } from "./createScrollDetector";
import { debounce } from "./debounce";
import { makeButton } from "./makeButton";
import { makeInput } from "./makeInput";

const autoAddedClassName = 'reader-auto-added';

export const makePaginated = (
	container: HTMLElement,
	contentWrapper: HTMLElement,
	onPageNumberChange: (page: number)=>void,
) => {
	container.classList.add('paginated-element');

	const nextButton = makeButton(container, {
		content: '>',
		title: 'Next',
		classList: ['reader-button', '-right', autoAddedClassName],
	});

	const prevButton = makeButton(container, {
		content: '<',
		title: 'Previous',
		classList: ['reader-button', '-left', autoAddedClassName],
	});

	const pageNumberInput = makeInput(container, {
		placeholder: 'Page',
		type: 'number',
		classList: ['reader-page-number', autoAddedClassName],
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
		console.log('scrolling by', offset, 'page size', getPageSize());
		setPageNumber(pageNumber + Math.floor(offset / getPageSize()));
	};

	const setCurrentLocation = (location: number) => {
		location = Math.min(location, contentWrapper.children.length - 1);
		const target = contentWrapper.children.item(location);
		if (target) {
			scrollToElement(target);
			return target;
		}
		return null;
	};

	const getCurrentLocation = () => {
		const containerBox = container.getBoundingClientRect();

		let i = 0;
		for (const child of contentWrapper.children) {
			const childRect = child.getBoundingClientRect();
			if (
				getComputedStyle(child).position !== 'fixed' &&
				!child.classList.contains(autoAddedClassName) &&
				childRect.left >= containerBox.left
			) {
				return i;
			}

			i++;
		}
		return i;
	};

	nextButton.onclick = nextPage;
	prevButton.onclick = prevPage;
	pageNumberInput.oninput = debounce(() => {
		setPageNumber(parseInt(pageNumberInput.value) - 1);
	}, 250);

	requestAnimationFrame(updateControls);

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.defaultPrevented) return;
		const allowIfFocused: Element[] = [ container, document.body, document.documentElement ];
		const canExcludeActiveElement = document.activeElement && !allowIfFocused.includes(document.activeElement);

		if (canExcludeActiveElement && (!container.contains(document.activeElement) || document.activeElement.tagName === 'INPUT')) {
			return;
		}

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

	let lastLocation = 0;
	const scrollEndDetector = createScrollDetector(() => container.scrollLeft, () => {
		setPageNumber(pageNumberFromCurrentScroll());
		scrollToCurrentPage();
		lastLocation = getCurrentLocation();
	});

	const onScroll = () => {
		scrollEndDetector.onScrollUpdate();
		updateControls();
	};
	container.addEventListener('scroll', onScroll);

	const onResize = debounce(() => {
		// Prevent the reading location from being lost
		setCurrentLocation(lastLocation)?.scrollIntoView();
	}, 100);
	window.addEventListener('resize', onResize);

	let destroyed = false;
	const cleanUp = () => {
		if (destroyed) return;

		const autoAdded = document.querySelectorAll(`.${autoAddedClassName}`);
		for (const element of autoAdded) {
			element.remove();
		}
		container.classList.remove('paginated-element');
		window.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('resize', onResize);
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

		setLocation: setCurrentLocation,
		getLocation: getCurrentLocation,
	};
};

export type PaginationController = ReturnType<typeof makePaginated>;
