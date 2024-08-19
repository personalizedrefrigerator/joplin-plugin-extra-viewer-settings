import { makeButton } from "./utils/makeButton";
import { makeInput } from "./utils/makeInput";

const showSettingsDialog = () => {
	const settingsDialog = document.createElement('dialog');

	const textSizeInput = makeInput(settingsDialog, {
		label: 'Text size:',
		type: 'range',
		value: '10',
		classList: [],
	});
	textSizeInput.min = '1';
	textSizeInput.max = '24';
	textSizeInput.oninput = () => {
		document.body.style.fontSize = `${textSizeInput.value}px`;
	};

	const closeButton = makeButton(settingsDialog, {
		content: 'Close',
		classList: [ 'button' ]
	});

	closeButton.onclick = () => {
		settingsDialog.close();
	};

	document.body.appendChild(settingsDialog);
	settingsDialog.showModal();

	settingsDialog.onclose = () => {
		settingsDialog.remove();
	};
};

export const setUpToolbar = () => {
	const toolbar = document.createElement('div');
	toolbar.classList.add('viewer-toolbar');

	const settingsButton = makeButton(toolbar, {
		title: 'Settings',
		content: '⚙️',
		classList: [ 'settings-button' ],
	});
	settingsButton.onclick = () => {
		showSettingsDialog();
	};

	document.body.appendChild(toolbar);
};
