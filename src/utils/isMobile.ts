import joplin from "api"

export const isMobile = async () => {
	return (await joplin.versionInfo()).platform === 'mobile';
}