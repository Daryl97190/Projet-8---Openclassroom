/*jshint eqeqeq:false */
(function (window) {
	'use strict';
	
	/**
	* Crée un nouvel objet de stockage côté client et créera un objet vide
	* collection si aucune collection n'existe déjà.
	* @param {string} name The name of our DB we want to use // Le nom de notre base de données que nous voulons utiliser
	* @param {function} callback Our fake DB uses callbacks because in
	* real life you probably would be making AJAX calls Notre fausse base de données utilise des rappels, car dans
	* la vraie vie, vous feriez probablement des appels AJAX
	*/
	function Store(name, callback) {
		this._compteur = 1; 
		callback = callback || function () {}; // fonction auto invoqué voir avec julien
		this._dbName = name;
		
		if (!localStorage[name]) {
			var data = {
				todos: []
			};
			
			localStorage[name] = JSON.stringify(data);
		}
		
		callback.call(this, JSON.parse(localStorage[name]));
	}
	/**
	* Finds items based on a query given as a JS object
	*
	* @param {object} query The query to match against (i.e. {foo: 'bar'})
	* @param {function} callback	 The callback to fire when the query has
	* completed running
	*
	* @example
	* db.find({foo: 'bar', hello: 'world'}, function (data) {
		*	 // data will return any items that have foo: bar and
		*	 // hello: world in their properties
		* });
		*/
		Store.prototype.find = function (query, callback) {
			if (!callback) {
				return;
			}
			
			var todos = JSON.parse(localStorage[this._dbName]).todos;
			
			callback.call(this, todos.filter(function (todo) {
				for (var q in query) {
					if (query[q] !== todo[q]) {
						return false;
					}
				}
				return true;
			}));
		};
		
		/**
		* Will retrieve all data from the collection
		*
		* @param {function} callback The callback to fire upon retrieving data
		*/
		Store.prototype.findAll = function (callback) {
			callback = callback || function () {};
			callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
		};
		
		/**
		* Will save the given data to the DB. If no item exists it will create a new
		* item, otherwise it'll simply update an existing item's properties
		*
		* @param {object} updateData The data to save back into the DB
		* @param {function} callback The callback to fire after saving
		* @param {number} id An optional param to enter an ID of an item to update
		*/
		Store.prototype.save = function (updateData, callback, id) {
			var data = JSON.parse(localStorage[this._dbName]);
			var todos = data.todos;
			callback = callback || function () {};
			// Generate an ID
			// CORRIGER LE BUG
			// Incrémenter le compteur.
			 var newId = this._compteur;
			 this._compteur++ 
			
			// Si un ID a été donné, trouve l'élément et met à jour les propriétés
			if (id) {
				for (var i = 0; i < todos.length; i++) {
					if (todos[i].id === id) {
						for (var key in updateData) {
							todos[i][key] = updateData[key];
						}
						break;
					}
				}
				localStorage[this._dbName] = JSON.stringify(data);
				callback.call(this, todos);
			} else {
				/**
				* Génére un identifiant unique
				* @voir https://forum.alsacreations.com/topic-5-26755-1-Resolu-Comment-creer-une-ID-unique-.html
				* @voir https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Date/now 
				*/
				updateData.id = newId; // Met à jour avec le compteur incrémentée 
				todos.push(updateData);
				localStorage[this._dbName] = JSON.stringify(data);
				callback.call(this, [updateData]);
			}
		};
		/**
		* Will remove an item from the Store based on its ID
		*
		* @param {number} id The ID of the item you want to remove
		* @param {function} callback The callback to fire after saving
		*/
		Store.prototype.remove = function (id, callback) {
			var data = JSON.parse(localStorage[this._dbName]);
			var todos = data.todos;
			//var todoId;
			// AMELIORATION
			// la premiere boucle for servant simplement à attribuer à todoId
			// la valeur de todos[i].id, celle-ci n'est pas nécessaire vu 
			// que la seconde boucle permet d'obtenir le meme resultat en utilisant directement l'id recu.
			
			for (var i = 0; i < todos.length; i++) {
				if (todos[i].id == id) { 
					todos.splice(i, 1);
				}
			}
			
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		};
		
		/**
		* Will drop all storage and start fresh
		*
		* @param {function} callback The callback to fire after dropping the data
		*/
		Store.prototype.drop = function (callback) {
			var data = {todos: []};
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, data.todos);
		};
		
		// Export to window
		window.app = window.app || {};
		window.app.Store = Store;
	})(window);