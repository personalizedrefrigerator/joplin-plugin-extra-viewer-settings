

export const debounce = <T extends (...args: any)=>void> (callback: T, timeout: number): T => {
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

