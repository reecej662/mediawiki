( function ( mw ) {
	/**
	 * Wrapper for the RC form with hide/show links
	 * Must be constructed after the model is initialized.
	 *
	 * @extends OO.ui.Widget
	 *
	 * @constructor
	 * @param {mw.rcfilters.dm.FiltersViewModel} filtersModel Changes list view model
	 * @param {mw.rcfilters.dm.ChangesListViewModel} changeListModel Changes list view model
	 * @param {mw.rcfilters.Controller} controller RCfilters controller
	 * @param {jQuery} $formRoot Root element of the form to attach to
	 * @param {Object} config Configuration object
	 */
	mw.rcfilters.ui.FormWrapperWidget = function MwRcfiltersUiFormWrapperWidget( filtersModel, changeListModel, controller, $formRoot, config ) {
		config = config || {};

		// Parent
		mw.rcfilters.ui.FormWrapperWidget.parent.call( this, $.extend( {}, config, {
			$element: $formRoot
		} ) );

		this.changeListModel = changeListModel;
		this.filtersModel = filtersModel;
		this.controller = controller;
		this.$submitButton = this.$element.find( 'form input[type=submit]' );

		this.$element
			.on( 'click', 'a[data-params]', this.onLinkClick.bind( this ) );

		this.$element
			.on( 'submit', 'form', this.onFormSubmit.bind( this ) );

		// Events
		this.changeListModel.connect( this, {
			invalidate: 'onChangesModelInvalidate',
			update: 'onChangesModelUpdate'
		} );

		// Initialize
		this.cleanUpFieldset();
		this.$element
			.addClass( 'mw-rcfilters-ui-FormWrapperWidget' );
	};

	/* Initialization */

	OO.inheritClass( mw.rcfilters.ui.FormWrapperWidget, OO.ui.Widget );

	/**
	 * Respond to link click
	 *
	 * @param {jQuery.Event} e Event
	 * @return {boolean} false
	 */
	mw.rcfilters.ui.FormWrapperWidget.prototype.onLinkClick = function ( e ) {
		this.controller.updateChangesList( $( e.target ).data( 'params' ) );
		return false;
	};

	/**
	 * Respond to form submit event
	 *
	 * @param {jQuery.Event} e Event
	 * @return {boolean} false
	 */
	mw.rcfilters.ui.FormWrapperWidget.prototype.onFormSubmit = function ( e ) {
		var data = {};

		// Collect all data from form
		$( e.target ).find( 'input:not([type="hidden"],[type="submit"]), select' ).each( function () {
			var value = '';

			if ( !$( this ).is( ':checkbox' ) || $( this ).is( ':checked' ) ) {
				value = $( this ).val();
			}

			data[ $( this ).prop( 'name' ) ] = value;
		} );

		this.controller.updateChangesList( data );
		return false;
	};

	/**
	 * Respond to model invalidate
	 */
	mw.rcfilters.ui.FormWrapperWidget.prototype.onChangesModelInvalidate = function () {
		this.$submitButton.prop( 'disabled', true );
		this.$element.removeClass( 'mw-rcfilters-ui-ready' );
	};

	/**
	 * Respond to model update, replace the show/hide links with the ones from the
	 * server so they feature the correct state.
	 *
	 * @param {jQuery|string} $changesList Updated changes list
	 * @param {jQuery} $fieldset Updated fieldset
	 * @param {boolean} isInitialDOM Whether $changesListContent is the existing (already attached) DOM
	 */
	mw.rcfilters.ui.FormWrapperWidget.prototype.onChangesModelUpdate = function ( $changesList, $fieldset, isInitialDOM ) {
		this.$submitButton.prop( 'disabled', false );
		this.$element.removeClass( 'mw-rcfilters-ui-ready' );

		// Replace the entire fieldset
		this.$element.empty().append( $fieldset.contents() );

		if ( !isInitialDOM ) {
			// Make sure enhanced RC re-initializes correctly
			mw.hook( 'wikipage.content' ).fire( this.$element );
		}

		this.cleanUpFieldset();
	};

	/**
	 * Clean up the old-style show/hide that we have implemented in the filter list
	 */
	mw.rcfilters.ui.FormWrapperWidget.prototype.cleanUpFieldset = function () {
		var $namespaceSelect = this.$element.find( '#namespace' );

		this.$element.find( '.rcshowhideoption[data-feature-in-structured-ui=1]' ).each( function () {
			// HACK: Remove the text node after the span.
			// If there isn't one, we're at the end, so remove the text node before the span.
			// This would be unnecessary if we added separators with CSS.
			if ( this.nextSibling && this.nextSibling.nodeType === Node.TEXT_NODE ) {
				this.parentNode.removeChild( this.nextSibling );
			} else if ( this.previousSibling && this.previousSibling.nodeType === Node.TEXT_NODE ) {
				this.parentNode.removeChild( this.previousSibling );
			}
			// Remove the span itself
			this.parentNode.removeChild( this );
		} );

		// Hide namespaces and tags
		$namespaceSelect.closest( 'tr' ).detach();
		this.$element.find( '.mw-tagfilter-label' ).closest( 'tr' ).detach();

		// Hide limit and days
		this.$element.find( '.rclinks' ).detach();

		if ( !this.$element.find( '.mw-recentchanges-table tr' ).length ) {
			this.$element.find( '.mw-recentchanges-table' ).detach();
			this.$element.find( 'hr' ).detach();
		}

		if ( !this.$element.find( '.rcshowhide' ).contents().length ) {
			this.$element.find( '.rcshowhide' ).detach();
			// If we're hiding rcshowhide, the '<br>'s are around it,
			// there's no need for them either.
			this.$element.find( 'br' ).detach();
		}

		this.$element.find(
			'legend, .rclistfrom, .rcnotefrom, .rcoptions-listfromreset'
		).detach();

		if ( this.$element.text().trim() === '' ) {
			this.$element.detach();
		}
	};
}( mediaWiki ) );
