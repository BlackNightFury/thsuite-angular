//This patch allows select 2 dropdowns to recieve focus when inside jquery-ui dropdowns (https://github.com/select2/select2/issues/1246#issuecomment-71710835)
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
	if ($.ui && $.ui.dialog && $.ui.dialog.prototype._allowInteraction) {
		var ui_dialog_interaction = $.ui.dialog.prototype._allowInteraction;
		$.ui.dialog.prototype._allowInteraction = function(e) {
			if ($(e.target).closest('.select2-dropdown').length) return true;
			return ui_dialog_interaction.apply(this, arguments);
		};
	}
}));