import { ContentScriptControl } from "src/types";
import { debounce } from "./utils/debounce";
import { makePaginated, PaginationController } from "./utils/makePaginated";


interface ExtendedWindow {
	paginationController: PaginationController|undefined;
}
declare const window: ExtendedWindow;

let lastNoteId = '';

const paginate = debounce((control: ContentScriptControl) => {
	let noteId = '';

	window.paginationController?.cleanUp();

	const container = document.querySelector<HTMLElement>('#rendered-md');
	container.classList.add('-loading');

	const sendPageChange = debounce(() => {
		if (!noteId) return;

		void control.setLastLocation(noteId, paginationController.getLocation());
	}, 1000);
	const lastPageNumber = window.paginationController?.getPageNumber() ?? 0;

	window.paginationController = makePaginated(
		container, container, sendPageChange,
	);
	const paginationController = window.paginationController;
	paginationController.setPageNumber(lastPageNumber);

	(async () => {
		const data = await control.getNoteAndLocation();
		const location = data.location;

		if (data.noteId !== lastNoteId) {
			paginationController.scrollToCurrentPage();
			// Delay -- give time to render.
			requestAnimationFrame(() => {
				if (location) {
					paginationController.setLocation(location);
				}
				paginationController.scrollToCurrentPage();
				container.classList.remove('-loading');

				noteId = data.noteId;
				lastNoteId = noteId;
			});
		} else {
			container.classList.remove('-loading');
			noteId = lastNoteId;
		}
	})();
}, 100);

export const setUpPagination = async (control: ContentScriptControl) => {
	let paginateEnabled = (await control.getSettings()).paginate;
	const updatePaginated = () => {
		if (paginateEnabled) {
			document.body.classList.add('paginate');
			paginate(control);
		} else {
			document.body.classList.remove('paginate');
		}
	};

	const settingsChangeListener = control.addOnSettingsChangeListener(async () => {
		const settings = await control.getSettings();
		if (!settings.paginate) {
			settingsChangeListener.remove();

			window.paginationController?.cleanUp();
			window.paginationController = null;
			paginateEnabled = false;
		} else if (!paginateEnabled) {
			paginateEnabled = true;
			updatePaginated();
		}
	});

	document.addEventListener('joplin-noteDidUpdate', () => {
		updatePaginated();
	});

	updatePaginated();
};
