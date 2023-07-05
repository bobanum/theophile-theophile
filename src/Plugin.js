export default class Plugin {
	static async init(Theophile) {
		this.Theophile = Theophile;
		this.loadConfig();
		this.linkPromises = this.loadStyles();
	}
	static async prepare() {
		await this.linkPromises;
		console.trace("Plugin " + this.name + " ready");
		return Promise.resolve();
	}
	static async process() {
		console.trace("Plugin " + this.name + " processed");
		return Promise.resolve();
	}
	static async beforeMount() {
		console.trace("Plugin " + this.name + " before mount");
		return Promise.resolve();
	}
	static async mount() {
		console.trace("Plugin " + this.name + " mounted");
		return Promise.resolve();
	}
	static async afterMount() {
		console.trace("Plugin " + this.name + " after mount");
		return Promise.resolve();
	}
	static async clean() {
		console.trace("Plugin " + this.name + " cleaned");
		return Promise.resolve();
	}
	static async loadConfig() {
		var config = this.Theophile[this.name.toLowerCase()] || {};
		for (let property in config) {
			this[property] = config[property];
		}
		return config;
	}
	static loadStyles() {
		return new Promise(resolve => {
			var url = this.Theophile.appURL(`src/plugins/${this.name}/style.css`);
	
			const link = document.head.appendChild(document.createElement("link"));
			link.id = `th-${this.name}-style`;
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("href", url);
			link.addEventListener("load", e => {
				resolve(e.currentTarget);
			});
		});
	}
	static parseStyle(style = {}) {
		if (style === null) {
			return {};
		}
		if (typeof style === "object") {
			return style;
		}
		if (typeof style === "string") {
			style = style.replace(/\s*;\s*$/, "").split(/\s*;\s*/);
		}
		if (style instanceof Array) {
			style = style.reduce((compil, property) => {
				if (typeof property === "string") {
					property = property.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
					if (!property) return compil;
					property = property.slice(1);
				}
				compil[property[0]] = property[1];
				return compil;
			}, {});
		}
		return style;
	}
	static applyStyle(style, element) {
		style = this.parseStyle(style);
		for (const property in style) {
			if (Object.hasOwnProperty.call(style, property)) {
				element.style.setProperty(property, style[property]);
			}
		}
		return this;
	}
}
