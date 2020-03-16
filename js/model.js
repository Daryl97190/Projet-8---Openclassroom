(function (window) {
	'use strict';

	/**
	 * Crée une nouvelle instance de model et raccorde store.
	 *
	 * @constructor
	 * @param {object} storage Une référence à la classe de stockage côté client 
	 */
	function Model(storage) {
		this.storage = storage;
	}

	/**
	 * Crée un nouveau model de todo
	 *
	 * @param {string} [title] Le titre de la tache
	 * @param {function} [callback] La fonction de rappelle après la création du modèle.
	 */
	Model.prototype.create = function (title, callback) {
		title = title || '';
		callback = callback || function () {};

		var newItem = {
			title: title.trim(),
			completed: false
		};

		this.storage.save(newItem, callback);
	};

	/**
	 * Finds and returns a model in storage. If no query is given it'll simply
	 * return everything. If you pass in a string or number it'll look that up as
	 * the ID of the model to find. Lastly, you can pass it an object to match
	 * against.
	 *
	 * @param {string|number|object} [query] Une requête pour faire correspondre les modèles
	 * @param {function} [callback]  La fonction de rappel après la découverte du modèle
	 *
	 * @example
	 * model.read(1, func); // Trouvera le model avec un ID de 1
	 * model.read('1'); // Comme ci-dessus
	 * //Below will find a model with foo equalling bar and hello equalling world.
	 * model.read({ foo: 'bar', hello: 'world' });
	 */
	Model.prototype.read = function (query, callback) {
		var queryType = typeof query;
		callback = callback || function () {};

		if (queryType === 'function') {
			callback = query;
			return this.storage.findAll(callback);
		} else if (queryType === 'string' || queryType === 'number') {
			query = parseInt(query, 10);
			this.storage.find({ id: query }, callback);
		} else {
			this.storage.find(query, callback);
		}
	};

	/**
	 * Met à jour un modèle en lui attribuant un ID, des données et un callback lorsque la mise à jour
	 * est terminée.
	 *
	 * @param {number} id  L' ID du model à mettre à jour.
	 * @param {object} data Les données à mettre à jour et leurs nouvelles valeurs.
	 * @param {function} callback La fonction de rappel quand la mise à jour est terminée.
	 */
	Model.prototype.update = function (id, data, callback) {
		this.storage.save(data, callback, id);
	};

	/**
	 * Supprime un modèle du stockage.
	 *
	 * @param {number} id L' ID du model à supprimer.
	 * @param {function} callback La fonction de rappel lorsque la suppression est terminée.
	 */
	Model.prototype.remove = function (id, callback) {
		this.storage.remove(id, callback);
	};

	/**
	 * AVERTISSEMENT: supprimera TOUTES les données du stockage.
	 *
	 * @param {function} callback La fonction de rappel quand le stockage est vider.
	 */
	Model.prototype.removeAll = function (callback) {
		this.storage.drop(callback);
	};

	/**
	 * Renvoie tous les todos
	 */
	Model.prototype.getCount = function (callback) {
		var todos = {
			active: 0,
			completed: 0,
			total: 0
		};

		this.storage.findAll(function (data) {
			data.forEach(function (todo) {
				if (todo.completed) {
					todos.completed++;
				} else {
					todos.active++;
				}

				todos.total++;
			});
			callback(todos);
		});
	};

	// Exporte vers window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
