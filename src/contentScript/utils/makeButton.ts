interface ButtonOptions {
	content: string;
	title?: string;
	classList: string[];
}

export const makeButton = (parent: HTMLElement, options: ButtonOptions) => {
	const button = document.createElement('button');
	button.textContent = options.content ?? '?';
	button.title = options.title;
	button.classList.add(...options.classList);
	parent.appendChild(button);
	return button;
};
