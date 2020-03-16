(function (window) {
	'use strict';
	
	/**
	* Takes a model and view and acts as the controller between them
	*
	* @constructor
	* @param {object} model The model instance
	* @param {object} view The view instance
	*/
	function Controller(model, view) {
		var self = this;
		self.model = model;
		self.view = view;
		
		self.view.bind('newTodo', function (title) {
			self.addItem(title);
		});
		
		self.view.bind('itemEdit', function (item) {
			self.editItem(item.id);
		});
		
		self.view.bind('itemEditDone', function (item) {
			self.editItemSave(item.id, item.title);
		});
		
		self.view.bind('itemEditCancel', function (item) {
			self.editItemCancel(item.id);
		});
		
		self.view.bind('itemRemove', function (item) {
			self.removeItem(item.id);
		});
		
		self.view.bind('itemToggle', function (item) {
			self.toggleComplete(item.id, item.completed);
		});
		
		self.view.bind('removeCompleted', function () {
			self.removeCompletedItems();
		});
		
		self.view.bind('toggleAll', function (status) {
			self.toggleAll(status.completed);
		});
	}
	
	/**
	* Charge et initialise la vue
	*
	* @param {string} '' | 'active' | 'completed'
	*/
	Controller.prototype.setView = function (locationHash) {
		var route = locationHash.split('/')[1];
		var page = route || '';
		this._updateFilterState(page);
	};
	
	/**
	* Un événement est déclenché au chargement. Obtient tous les éléments 
	* et les affiche dans la todoList
	*/
	Controller.prototype.showAll = function () {
		var self = this;
		self.model.read(function (data) {
			self.view.render('showEntries', data);
		});
	};
	
	/**
	*  Rend toutes les tâches actives.
	*/
	Controller.prototype.showActive = function () {
		var self = this;
		self.model.read({ completed: false }, function (data) {
			self.view.render('showEntries', data);
		});
	};
	
	/**
	* Rend toutes les tâches terminées
	*/
	Controller.prototype.showCompleted = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			self.view.render('showEntries', data);
		});
	};
	
	/**
	* Un événement à déclencher chaque fois que vous souhaitez ajouter un élément. Passez simplement l'événement
	* objet et il gérera l'insertion DOM et l'enregistrement du nouvel élément.
	*/
	// CORRIGER BUG 1
	Controller.prototype.addItem = function (title) {  
		var self = this;
		
		if (title.trim() === '') {
			return;
		}
		
		self.model.create(title, function () {
			self.view.render('clearNewTodo');
			self._filter(true);
		});
	};
	
	/*
	* Déclenche le mode d'édition des éléments.
	*/
	Controller.prototype.editItem = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItem', {
				id: id, 
				title: data[0].title
			});
		});
	};
	
	/*
	* Termine l'edition d'élement avec succes.
	*/
	Controller.prototype.editItemSave = function (id, title) {
		var self = this;
		// AMELIORATION
		//La boucle while sur title[0] et title[title.length-1] permet de supprimer les espaces avant et après le titre
		// la propriété trim permet de faire ca directement. Le code est plus performant.
		// les deux boucles ne sont pas assez performante.Les blancs considérés sont les caractères d'espacement
		title = title.trim();
		
		if (title.length !== 0) {
			self.model.update(id, {title: title}, function () {
				self.view.render('editItemDone', {id: id, title: title});
			});
		} else {
			self.removeItem(id);
		}
	};
	
	/*
	* Annule le mode d'édition d'élément..
	*/
	Controller.prototype.editItemCancel = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItemDone', {id: id, title: data[0].title});
		});
	};
	
	/**
	* En lui donnant un ID, il trouvera l'élément DOM correspondant à cet ID,
	* supprimez-le du DOM et supprimez-le également du stockage.
	* @param {number} id L'ID de l'élément à supprimer du DOM et
	* espace de stockage 
	* 
	*/
	Controller.prototype.removeItem = function (id) {
		var self = this;
		var items;
		self.model.read(function(data) {
			items = data;
		});
		// AMELIORATION
		// un console.log est utile uniquement en production et pas en phase d'exploitation
		
		// items.forEach(function(item) {
		// 	if (item.id === id) {
		// 		console.log("Element with ID: " + id + " has been removed.");
		// 	}
		// });
		
		self.model.remove(id, function () {
			self.view.render('removeItem', id);
		});
		
		self._filter();
	};
	
	/**
	* Supprime tous les éléments terminés du DOM et du stockage.
	*/
	Controller.prototype.removeCompletedItems = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			data.forEach(function (item) {
				self.removeItem(item.id);
			});
		});
		
		self._filter();
	};
	
	/**
	* Si on lui donne un identifiant et une case à cocher, il mettra à jour 
	* l'élément en stockage dans le modele sur l'état de la case à cocher.
	*
	* @param {number} id L'ID de l'élément complet ou incomplet
	* @param {object} checkbox La case à cocher pour vérifier l'état complet ou imcomplet                     
	* @param {boolean|undefined} silent Empêcher le re-filtrage des éléments de la liste
	*/
	Controller.prototype.toggleComplete = function (id, completed, silent) {
		var self = this;
		self.model.update(id, { completed: completed }, function () {
			self.view.render('elementComplete', {
				id: id,
				completed: completed
			});
		});
		
		if (!silent) {
			self._filter();
		}
	};
	
	/**
	* Bascule l'état d'activation / désactivation de TOUTES les cases à cocher et l'exhaustivité des modèles.
	* Passez simplement l'objet événement.
	*/
	Controller.prototype.toggleAll = function (completed) {
		var self = this;
		self.model.read({ completed: !completed }, function (data) {
			data.forEach(function (item) {
				self.toggleComplete(item.id, completed, true);
			});
		});
		
		self._filter();
	};
	
	/**
	* Met à jour les parties de la page qui change en fonction du reste
	* nombre restant de todos.
	*/
	Controller.prototype._updateCount = function () {
		var self = this;
		self.model.getCount(function (todos) {
			self.view.render('updateElementCount', todos.active);
			self.view.render('clearCompletedButton', {
				completed: todos.completed,
				visible: todos.completed > 0
			});
			
			self.view.render('toggleAll', {checked: todos.completed === todos.total});
			self.view.render('contentBlockVisibility', {visible: todos.total > 0});
		});
	};
	
	/**
	* Re-Filtre les éléments de la todo en fonction de la route active.
	* @param {boolean|undefined} force  Refiltre les items.
	*/
	Controller.prototype._filter = function (force) {
		var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);
		
		// Met à jour les élément de la page qui change à chaque tache complete
		this._updateCount();
		
		// Si la dernière route active n'est pas "All", ou si nous changeons de route,nous recréons
		// les éléments de l'élément todo, en appelant:
		//   this.show[All|Active|Completed]();
		if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
			this['show' + activeRoute](); 
		}
		
		this._lastActiveRoute = activeRoute;
	};
	
	/**
	* Simply updates the filter nav's selected states
	*/
	Controller.prototype._updateFilterState = function (currentPage) {
		
		//Stockez une référence à la route active, ce qui nous permet de filtrer à nouveau
		// les éléments de tâche tels qu'ils sont marqués comme complets ou incomplets.
		this._activeRoute = currentPage;
		
		if (currentPage === '') {
			this._activeRoute = 'All';
		}
		
		this._filter();
		
		this.view.render('setFilter', currentPage);
	};
	
	// Exporte vers window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);