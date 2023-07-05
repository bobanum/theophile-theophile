/**
 * Description
 * @export
 * @class Theophile
 */
export default class Theophile {
	static loaded = false;
	static plugins = {};
	static hooks = {
		beforeCreate: [],
		created: [],
		beforeMount: [],
		mounted: [],
		beforeUpdate: [],
		updated: [],
		beforeUnmount: [],
		unmounted: [],
	};
	static addHook(name, hook) {
		if (!this.hooks[name]) {
			throw new Error(`Unknown hook ${name}`);
		}
		this.hooks[name].push(hook);
		return this;
	}
	static beforeCreate(hook) {
		return this.addHook("beforeCreate", hook);
	}
	static created(hook) {
		return this.addHook("created", hook);
	}
	static beforeMount(hook) {
		return this.addHook("beforeMount", hook);
	}
	static mounted(hook) {
		return this.addHook("mounted", hook);
	}
	static beforeUpdate(hook) {
		return this.addHook("beforeUpdate", hook);
	}
	static updated(hook) {
		return this.addHook("updated", hook);
	}
	static beforeUnmount(hook) {
		return this.addHook("beforeUnmount", hook);
	}
	static unmounted(hook) {
		return this.addHook("unmounted", hook);
	}
	static execHook(name, ...args) {
		if (!this.hooks[name]) {
			throw new Error(`Unknown hook ${name}`);
		}
		return Promise.all(this.hooks[name].map((hook) => hook(...args)));
	}
	static async exec(root) {
		this.trace("Theophile BEGIN");
		await this.execHook("beforeCreate", root);
		await this.execHook("created", root);
		await this.execHook("beforeMount", root);
		await this.execHook("mounted", root);
		await this.execHook("beforeUpdate", root);
		await this.execHook("updated", root);
		await this.execHook("beforeUnmount", root);
		await this.execHook("unmounted", root);
		this.trace("Theophile END");
	}
	/**
	 * Description
	 * @param {string} [root="."]
	 * @returns Promise
	 * @memberof Theophile
	 */
	static async init(root = ".") {
	}
	static get root() {
		return this._root;
	}
	static set root(val) {
		if (val.match(/^[a-zA-Z0-9]+:\/\//)) {
			return (this._root = new URL(val));
		}
		var result = new URL(location);
		if (val[0] === "/") {
			result.pathname = val.replace(/\/*$/, "/");
		} else {
			var path = result.pathname.split("/").slice(0, -1);
			path.push(val);
			result.pathname = path.join("/");
		}
		return (this._root = result);
	}
	static siteURL(url) {
		if (url && url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*?:\/\//)) {
			return new URL(url);
		}
		var result = new URL(this.root);
		if (!url) return result;
		if (url[0] === "/") {
			result.pathname = url;
			return result;
		}
		result.pathname += url;
		return result;
	}
	static appURL(file) {
		if (file && file.match(/^[a-zA-Z][a-zA-Z0-9+.-]*?:\/\//)) {
			return file;
		}
		var url = new URL(import.meta.url);
		var path = url.pathname.split("/").slice(0, -2);
		if (file) {
			path.push(file);
		}
		url.pathname = path.join("/");
		return url;
	}
	static normalizeString(str) {
		var result = str
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.replace(/[^a-z0-9_\.\-]/g, "_")
			.replace(/_+/g, "_");
		return result;
	}
	static loadJson(url) {
		return new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest();
			xhr.open("get", url);
			xhr.responseType = "json";
			xhr.addEventListener("load", e => {
				if (e.target.status === 404) {
					return reject(e.target.statusText);
				}
				return resolve(e.target.response);
			});
			xhr.addEventListener("error", e => {
				reject(e.target);
			});
			xhr.onerror = function () {
				console.error("XHR error " + xhr.status);
			};
			xhr.upload.onloadstart = function () {
				console.log("onloadstart" + xhr.status);
			};
			xhr.upload.onloadend = function () {
				console.log("onloadend" + xhr.status);
			};
			xhr.upload.onerror = function () {
				console.log("error" + xhr.status);
			};
			try {
				xhr.send(null);
			} catch (err) {
				reject(err);
			}
		});
	}
	static loadDataSet(element, to) {
		var dataset = element.dataset;
		to = to || {};
		for (let property in dataset) {
			if (property === "th") {
				this.parseConfigString(dataset[property], to);
			} else if (property.match(/^th[A-Z]/) !== null) {
				this.setCompoundProperty(property.slice(2), dataset[property], to);
			}
		}
		return to;
	}
	static setCompoundProperty(property, value, to) {
		const properties = property.replace(/[A-Z]/g, x => "-" + x).replace(/^-/, "").toLowerCase().split("-");
		// properties.push(property.match())
		// [...property.matchAll(/^[a-z0-9]*|[A-Z][a-z0-9]*/g), ...property.matchAll(/-[a-z][a-zA-Z0-9]*/g)];
		to = to || {};
		let destination = to;
		properties.slice(0, -1).forEach(p => {
			if (!destination[p]) {
				destination[p] = {};
			}
			destination = destination[p];
		});
		destination[properties.slice(-1)[0]] = this.parseConfigString(value, destination[properties.slice(-1)[0]]);
	}
	static parseConfigString(data, to) {
		if (!data) return {};
		if (data.indexOf(":") < 0)
			return data;
		to = to || {};
		data.replace(/\s*;\s*$/, "").split(/;/).forEach(property => {
			var parts = property.match(/\s*([a-zA-z_-][a-zA-z0-9_-]*)\s*:\s*(.*)\s*/);
			if (parts) {
				this.setCompoundProperty(parts[1], parts[2], to);
			}
		});
		//TODO Normalize
		// if (!to) return data;
		// for (const property in data) {
		// 	if (Object.hasOwnProperty.call(data, property)) {
		// 		to[property] = data[property];
		// 	}
		// }
		return to;
	}
}
var debug = false;
Theophile.trace = debug ? console.log : () => {};