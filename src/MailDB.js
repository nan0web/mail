import DB from "@nan0web/db-fs"

class MailDB extends DB {
	/**
	 * Asynchronously transforms an object based on a configuration object. The transformation can include
	 * modifying values, applying functions, and resolving file paths based on a provided directory.
	 *
	 * @async
	 * @param {Object} source - The source object to be transformed.
	 * @param {Object} config - The configuration object that defines how to transform the source object.
	 *                          Keys in the config object correspond to keys in the source object, and values
	 *                          define how the transformation occurs.
	 *                          - If the value is a string starting with '.', it is treated as a file path
	 *                            relative to the `dir` option and is required.
	 *                          - If the value is an array, the first element must be a function or a file path
	 *                            (resolved as a module if it starts with '.'). The rest are passed as arguments to the function.
	 *                          - If the value is an object with a `$input` property, it selects a value from the source object
	 *                            or generated object by the key specified in `$input`.
	 *                          - If the value is an object with a `$ref` property, it selects a reference from the source object
	 *                            or generated object using the key specified in `$ref`.
	 *                          - If the value is an object with a `$ref` property starting with '.', it treats it as a file path
	 *                            relative to the `dir` option and loads the file content as the value.
	 * @param {Object} [opts] - Optional settings for the transformation process.
	 * @param {string|null} [opts.dir=null] - The base directory for resolving file paths.
	 * @param {Object} [opts.formats={}] - Format handlers for different file extensions.
	 * @param {Function} [opts.onError=(err, item) => {}] - Error handler for handling transformation errors.
	 *                          It receives the error message and the current item being processed.
	 * @returns {Promise<Object>} - The transformed object.
	 */
	async transform(
		source,
		config,
		opts = { dir: null, formats: {}, onError: (err, item) => {} }
	) {
		const dir = opts.dir || null
		const onError = opts.onError || (() => {})
		const formats = opts.formats || {}

		// Resolve module references in config
		for (const key in config) {
			const value = config[key]
			if (null !== dir) {
				if ('string' === typeof value && value.startsWith('.')) {
					const arr = value.split(':')
					const file = await this.resolve(dir, arr[0])
					const module = await import(/* @vite-ignore */ file)
					config[key] = [module.default || module, arr.slice(1)]
				}
				else if (Array.isArray(value) && 'string' === typeof value[0] && value[0].startsWith('.')) {
					const file = await this.resolve(dir, value[0])
					const module = await import(/* @vite-ignore */ file)
					config[key] = [module.default || module, value.slice(1)]
				}
			}
		}

		let item = {}
		const keys = config.$keep ? [...Object.keys(source), ...Object.keys(config)] : Object.keys(config)
		const values = config.$keep ? { ...source, ...config } : { ...config }

		for (const key of keys) {
			if ('$keep' === key) {
				continue
			}
			let value = values[key]
			let found = false

			if ('object' === typeof value && value && value.$ref) {
				item[key] = await this.loadFromReference(item, value, source, dir, formats)
				if ('undefined' === typeof item[key]) {
					onError('Unable to load $ref', value)
				} else {
					value = item[key]
					found = true
				}
			}

			if ('object' === typeof value) {
				if (Array.isArray(value)) {
					if ('function' === typeof value[0]) {
						/**
						 * Calling the function to receive a field value.
						 * @param {object} item - The item (resulting) object.
						 * @param {string} key - The name of the field.
						 * @param {object} source - The source object with the data.
						 * @param {...any} args - The extra arguments to be passed to the function.
						 */
						if (Array.isArray(value[1])) {
							item[key] = value[0](item, key, source, ...value.slice(1))
						} else if ('undefined' === typeof value[1]) {
							item[key] = value[0](item, key, source)
						} else {
							item[key] = value[0](item, key, source, value[1])
						}
					} else {
						item[key] = value
					}
				} else if (value.$input) {
					const o = 'undefined' === typeof source[value.$input] ? item[value.$input] : source[value.$input]
					item[key] = value[o]
				} else {
					item[key] = value
				}
				found = true
			} else if ('function' === typeof value) {
				item[key] = value(item, key, source)
				found = true
			} else {
				const o = 'undefined' === typeof source[value] ? item[value] : source[value]
				item[key] = 'undefined' === typeof o ? value : o
				found = true
			}

			if (!found) {
				onError('Incorrect format in transform/object', item)
			}
		}

		return item
	}

	/**
	 * Loads value from reference
	 * @private
	 * @param {object} item - Target object
	 * @param {object} value - Configuration value with $ref property
	 * @param {object} source - Source object
	 * @param {string|null} dir - Base directory
	 * @param {object} formats - Format handlers for different file extensions
	 * @returns {Promise<any>} - Referenced value
	 */
	async loadFromReference(item, value, source, dir, formats) {
		const ref = value.$ref
		if (ref.startsWith('.')) {
			const path = await this.resolve(dir ?? "", ref)
			const ext = path.split('.').pop()?.toLowerCase() || ''
			if (formats[ext]) {
				return formats[ext](path)
			}
			return await this.loadDocument(path)
		}
		// Find reference inside the source object using MailDB.find
		return MailDB.findNestedElement(ref, source) ?? MailDB.findNestedElement(ref, item)
	}

	/**
	 * Finds a value in an object by key or nested key path.
	 * @param {string} key - The key or nested key path (e.g. "user.name").
	 * @param {Object} obj - The object to search in.
	 * @returns {*} The found value or undefined.
	 */
	static findNestedElement(key, obj) {
		if (!key || !obj) return undefined
		const keys = key.split('.')
		let current = obj
		for (const k of keys) {
			if (current && typeof current === 'object' && k in current) {
				current = current[k]
			} else {
				return undefined
			}
		}
		return current
	}

}

export default MailDB