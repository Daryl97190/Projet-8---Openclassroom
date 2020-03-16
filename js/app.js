/*global app, $on */
/** Fonction anonyme auto invoquée */
(function () {
	/** Utilisation du mode strict */
	'use strict';
	
	/**
	* Crée une nouvelle Todo-list.
	*
	* @param {string} name Le nom de la nouvelle Todo-list.
	*/
	function Todo(name) { // une classe en version ES5
	this.storage = new app.Store(name);
	
	this.model = new app.Model(this.storage);
	
	this.template = new app.Template();
	
	this.view = new app.View(this.template);
	
	this.controller = new app.Controller(this.model, this.view);
	
}
/** On donne en argument le nom de la Todo-list que l'on veut créer */
var todo = new Todo('todos-vanillajs');

function setView() {
	todo.controller.setView(document.location.hash);
}
$on(window, 'load', setView);
$on(window, 'hashchange', setView);
})();

