import { debounce } from "./debounce";

type GetScrollCallback = ()=>number;
type OnScrollEnd = ()=>void;

export const createScrollDetector = (getScroll: GetScrollCallback, onScrollEnd: OnScrollEnd) => {
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