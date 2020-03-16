/*global NodeList */
(function (window) {
	'use strict';
	
	// Récupére les éléments par le sélecteur CSS: qs = querySelector
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};
	
	// addEventListener wrapper:
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};
	
	// Attach a handler to event for all elements that match the selector,
	// now or in the future, based on a root element
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target; // cible l'element
			var potentialElements = window.qsa(selector, target);
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0; // // est-ce que dans potentialElements il y a targetElement , si >= o il y a un index et ça match
			
			if (hasMatch) {
				/**
				* si on a un élément hasMatch on appel le gestionnaire sur l' élément cible.
				*/
				handler.call(targetElement, event);
			}
		}
		
		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === 'blur' || type === 'focus';
		
		window.$on(target, type, dispatchEvent, useCapture);
	};
	
	// Find the element's parent with the given tag name:
	// $parent(qs('a'), 'div');
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return; // si pas d' élément parent il ne se passe rien
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode; // on retourne notre élément parent
		}
		return window.$parent(element.parentNode, tagName);
	};
	
	//  Autorise les boucle sur les nœuds : qsa('.foo').forEach(function () {})
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
