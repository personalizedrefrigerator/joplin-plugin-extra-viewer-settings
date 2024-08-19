import { ContentScriptControl, PluginSettings } from "../types";
import { debounce } from "./utils/debounce";
import { makeButton } from "./utils/makeButton";
import { makeInput } from "./utils/makeInput";

const showSettingsDialog = async (control: ContentScriptControl) => {
	const settingsDialog = document.createElement('dialog');
	settingsDialog.classList.add('viewer-settings-dialog');

	let settings = await control.getSettings();
	const setSettings = (newSettings: Partial<PluginSettings>) => {
		settings = {
			...settings,
			...newSettings,
		};
		control.updateSettings(settings);
	};

	const textSizeInput = makeInput(settingsDialog, {
		label: 'Text size:',
		type: 'number',
		classList: [],
	});
	textSizeInput.min = '5';
	textSizeInput.max = '24';
	textSizeInput.oninput = () => {
		setSettings({
			fontSize: Number(textSizeInput.value),
		});
	};

	const viewerMaxWidth = makeInput(settingsDialog, {
		label: 'Maximum width:',
		type: 'number',
		classList: [],
	});
	viewerMaxWidth.oninput = () => {
		setSettings({
			maxWidth: Number(viewerMaxWidth.value),
		});
	};

	const showReaderCheckbox = makeInput(settingsDialog, {
		label: 'Paginate:',
		type: 'checkbox',
		classList: [],
	});
	showReaderCheckbox.oninput = () => {
		setSettings({
			paginate: !!showReaderCheckbox.checked,
		});
	};

	const closeButton = makeButton(settingsDialog, {
		content: 'Close',
		classList: [ 'button' ]
	});

	const updateControlValues = () => {
		textSizeInput.value = `${settings.fontSize ?? 10}`;
		showReaderCheckbox.checked = settings.paginate;
		viewerMaxWidth.value = `${settings.maxWidth}`;
	};

	const settingsOnChange = control.addOnSettingsChangeListener(async () => {
		settings = await control.getSettings();
		updateControlValues();
	});
	updateControlValues();

	closeButton.onclick = () => {
		settingsDialog.close();
	};

	document.body.appendChild(settingsDialog);
	settingsDialog.showModal();

	settingsDialog.onclose = () => {
		settingsOnChange.remove();

		// Delay -- give time for a closing animation
		setTimeout(() => {
			settingsDialog.remove();
		}, 1000);
	};
};

export const setUpToolbar = (control: ContentScriptControl) => {
	const toolbar = document.createElement('div');
	toolbar.classList.add('viewer-toolbar');

	const settingsButton = makeButton(toolbar, {
		title: 'Settings',
		content: '⚙️',
		classList: [ 'settings-button' ],
	});
	settingsButton.onclick = () => {
		showSettingsDialog(control);
	};

	const applyViewerSettings = async () => {
		const savedScroll = control.cacheScroll();
		const settings = await control.getSettings();
		document.documentElement.style.setProperty('--user-font-family', settings.fontFamily);
		document.documentElement.style.setProperty('--user-font-size', settings.fontSize ? `${settings.fontSize}pt` : '');

		if (settings.maxWidth) {
			document.documentElement.classList.add('-custom-max-width');
			document.documentElement.style.setProperty('--user-max-width', `${settings.maxWidth}pt`);
		} else {
			document.documentElement.classList.remove('-custom-max-width');
			document.documentElement.style.removeProperty('--user-max-width');
		}

		control.restoreScroll(savedScroll);
	};

	control.addOnSettingsChangeListener(debounce(applyViewerSettings, 500));
	applyViewerSettings();

	document.body.appendChild(toolbar);
};
