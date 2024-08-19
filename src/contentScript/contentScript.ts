import { ContentScriptContext, MarkdownItContentScriptModule } from "api/types";

export default (_context: ContentScriptContext): MarkdownItContentScriptModule => {
	return {
		plugin: async (_markdownIt) => {
		},

		assets: () => ([
			{ name: './viewer.css' },
			{ name: './viewer.js' },
		]),
	}
}