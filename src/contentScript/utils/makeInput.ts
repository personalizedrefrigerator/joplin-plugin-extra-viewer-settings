interface InputOptions {
	type: string;
	value?: string;
	placeholder: string;
	classList: string[];
}

export const makeInput = (parent: HTMLElement, options: InputOptions) => {
	const input = document.createElement('input');
	input.type = options.type;
	input.value = options.value;
	input.setAttribute('placeHolder', options.placeholder);
	input.classList.add(...options.classList, 'reader-auto-added');
	parent.appendChild(input);
	return input;
};
