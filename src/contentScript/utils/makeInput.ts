interface InputOptions {
	type: string;
	value?: string;
	placeholder?: string;
	label?: string;
	classList: string[];
}

let idCounter = 0;

export const makeInput = (parent: HTMLElement, options: InputOptions) => {
	const input = document.createElement('input');
	input.type = options.type;
	input.value = options.value;
	input.setAttribute('placeHolder', options.placeholder);
	input.classList.add(...options.classList);

	if (options.label) {
		const labelElement = document.createElement('label');
		input.id = `input-${idCounter++}`;
		labelElement.htmlFor = input.id;
		labelElement.textContent = options.label;

		const container = document.createElement('div');
		container.replaceChildren(labelElement, input);
		parent.appendChild(container);
	} else {
		parent.appendChild(input);
	}

	return input;
};
