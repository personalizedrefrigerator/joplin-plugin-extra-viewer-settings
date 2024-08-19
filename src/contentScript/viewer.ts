import { contentScriptId } from "../constants";
import { debounce } from "./utils/debounce";
import { makePaginated, PaginationController } from "./utils/makePaginated";

interface ExtendedWindow {
	paginationController: PaginationController|undefined;
}
declare const window: ExtendedWindow;

declare const webviewApi: {
	postMessage(contentScriptId: string, arg: unknown): Promise<any>;
};

let lastNoteId = '';
let lastPage = 0;

const paginate = () => {
	let noteId = '';

	window.paginationController?.cleanUp();

	const container = document.querySelector<HTMLElement>('#rendered-md');
	container.classList.add('-loading');
	document.body.classList.add('paginate');

	const sendPageChange = debounce(() => {
		if (!noteId) return;
	
		void webviewApi.postMessage(contentScriptId, {
			location: window.paginationController.getLocation(),
			noteId,
		});
	}, 1000);
	const lastPageNumber = window.paginationController?.getPageNumber() ?? 0;

	window.paginationController = makePaginated(
		container, container, sendPageChange,
	);
	const paginationController = window.paginationController;
	paginationController.setPageNumber(lastPageNumber);

	(async () => {
		const data = await webviewApi.postMessage(contentScriptId, 'getLocation');
		const location = data.location;

		if (data.noteId !== lastNoteId) {
			paginationController.scrollToCurrentPage();
			// Delay -- give time to render.
			setTimeout(() => {
				if (location) {
					paginationController.setLocation(location);
				}
				paginationController.scrollToCurrentPage();
				container.classList.remove('-loading');

				noteId = data.noteId;
				lastNoteId = noteId;
			}, 500);
		} else {
			container.classList.remove('-loading');
			noteId = lastNoteId;
		}
	})();
};

document.addEventListener('joplin-noteDidUpdate', () => {
	paginate();
});
paginate();

