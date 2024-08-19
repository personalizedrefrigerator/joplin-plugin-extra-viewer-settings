
export interface PluginSettings {
	// null => default
	fontFamily: string|null;
	fontSize: number|null;
	paginate: boolean;
}

export interface ContentScriptControl {
	setLastLocation(noteId: string, location: number): Promise<void>;
	getNoteAndLocation(): Promise<{ noteId: string; location: number; }>;
	getSettings(): Promise<PluginSettings>;
	addOnSettingsChangeListener(listener: ()=>void): { remove: ()=>void };
	updateSettings(settings: PluginSettings): Promise<void>;
}
