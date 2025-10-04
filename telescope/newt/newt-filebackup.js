/*** newt-file.js: File and Sample Design Functions ***/

/* Newt-Web: A Newtonian Telescope CAD Program
				
Copyright (C) 2011 Kenneth H. Slater
				
This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License 
Version 2 as published by the Free Software Foundation.
				
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
				
You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA */

function UpdateFiles() { // Refreshes data on the file pane
	document.getElementById( "modified" ).innerHTML = scope.modified ? 'Modified - Save if Necessary' : 'Not Modified';
	document.getElementById( "modstatus" ).style.backgroundColor = scope.modified ? '#FF99CC' : '#99FF66';
	UpdateLocalStorage();
	CheckFileReader();	// test if this browser can read files
}


function UpdateLocalStorage() {
	if ( !supports_local_storage() ) {
		document.getElementById('ls_list').innerHTML = '<p class="lswarn">This browser does not support Local Storage. You will not be able to save and restore your designs.</p>' +
		'<p class="lswarn">See <a href="newt-help-ap.html#Browsers" target="_blank">Help on Browsers</a> for information about upgrading to a modern browser that supports this facility.</p>';
		disableLScontrols( 'all', true );
		return;
	}
	ListLS();		// Builds the saved design list, resets selections
	UpdateSave();	// Updates the design name & Save button
}

function ListLS() { //Lists Local Storage
	var LS = window.localStorage;
	var List = document.getElementById('ls_list');
	var Cnt  = document.getElementById('save_count');
	if ( LS.length == 0 ) {
		List.innerHTML = '<p>(<i>No Stored Designs Found</i>)</p>';
		Cnt.innerHTML = 'No';
	} else {
		Cnt.innerHTML = LS.length; // Display number of saved designs
		// Get key names in an array for sorting
		var SortAry = new Array();
		for ( i=0; i<LS.length; i++ ) {
			SortAry.push( LS.key(i) );
		}
		// Sort the array
		SortAry.sort( sortAlpha );
		// Now list the stored designs using the sort order in the array
		var list_string = '<table id="dtbl"><tr><th id="c0"></th><th id="c1">Design Name</th><th id="c2">Save Date</th></tr>';
		var tmpJSON;
		for ( i=0; i<SortAry.length; i++ ) {
			tmpJSON = LS.getItem( SortAry[i] );
			try {
				var tmpScope = JSON.parse( tmpJSON );
			} catch( err ) {
				alert( 'Saved Design data error in design: ' + LS.key(i) + '\n' + err );
				tmpScope = new Object();
				tmpScope.save_date = '(Unknown)';
				tmpScope.title = '(Unknown)';
			}
			list_string += '<tr><td id="dsel"><input type=radio name="ds" class="ds" onClick="doSelect()" value="' + SortAry[i] + '"></td><td title="' +
							tmpScope.title + '">' + SortAry[i] + 
						   '</td><td>' + tmpScope.save_date  + '</td></tr>';
		}
		list_string += '<tr id="note"><td colspan=3 style="text-align:center"><i>Hover over Design Name to see Design Title</i></td></tr>'
		list_string += '</table>';
		List.innerHTML = list_string;
	}
	doSelect();
}

function sortAlpha( a, b ) {
	var al = a.toLowerCase();
	var bl = b.toLowerCase();
	if ( al > bl ) return (  1 );
	if ( al < bl ) return ( -1 );
	return( 0 );
}

function UpdateSave() { // Updates the design name & Save button
	document.getElementById('save_name').innerHTML = ( scope.savename == '' ) ? '(<i>Not Saved</>)' : scope.savename ;
	disableLScontrols( 'save', scope.savename == '' );
}

function supports_local_storage() { //Returns true or false
  try {
    return 'localStorage' in window && window['localStorage'] !== null && window['localStorage'] !== undefined;
  } catch (e) {
    return false;
  }
}

function isInvalid( str, invalids ) { //Checks str for presense of invalid characters
	for( i=0; i<invalids.length; i++ ) {
		if( str.indexOf( invalids.charAt(i)) >= 0 ) { return( true ) }
	}
	return( false );
}

function OverwriteOK( name ) {
	// Check to see if name already exists
	// If so, ask user if it is OK to overwrite
	// Returns true if OK to (over)write, false to abort
	if ( window.localStorage.getItem( name ) == null ) { return( true ) } //name does not exist
	return( confirm( 'Replace design "' + name + '"?' ) );
}

function doSelect() { //Action routine when a radio select button is pressed. Also can be called just to update slection things.
	// First, set up everything as if there is no selection
	LSselected = '';
	disableLScontrols( 'selection', true );
	document.getElementById('selected').innerHTML = '<i>Nothing Selected</i>';	
	// Now, scan radio buttons to see if something is selected
	var radio_array = document.getElementsByClassName('ds');
	for ( i=0; i<radio_array.length; i++ ) {
		if ( radio_array[i].checked ) { LSselected = radio_array[i].value; break; }
	}
    if ( LSselected != '' ) { //Something was selected, so update local storage area controls
		document.getElementById('selected').innerHTML = LSselected;
		disableLScontrols( 'selection', false );		
	}	
}

function LSopen() { // Action routine for the local storage open button
	var tmpJSON = window.localStorage.getItem( LSselected );
	var tmpSpec = JSON.parse( tmpJSON );
	delete tmpSpec["file_type"]; //Prevent overwrite of this item.
	delete tmpSpec["file_ver"];  //Prevent overwrite of this item.
	for( var key in tmpSpec ) { scope.spec[key] = tmpSpec[key] } // Copy data into globals
	scope.savename = LSselected;
	ResetOnLoad( scope );
}

function LSdelete() { // Action routine for the local storage delete button
	if ( confirm( 'Realy delete "' + LSselected + '"?' ) ) {
		window.localStorage.removeItem( LSselected );
		UpdateLocalStorage();
	}
}

var invalidChars = '/?\\*:|"<>'; // Characters not allowed in Design Names

function LSrename() { // Action routine for the local storage rename button
	//insure valid name present
	var theName = document.getElementById('txt_name').value.trim();
	if ( theName.length == 0 ) {
		alert( 'Please specify a non-blank Design Name before clicking the Rename Selected button.' );
		return( false );
	}
	if ( isInvalid( theName, invalidChars ) ) {
		alert( 'A Design Name may not contain tany of these characters:\n' + invalidChars );
		return( false );	
	}		
	if ( !OverwriteOK( theName ) ) { return( false ) }
	// Copy the stored data to the new item name
	var tmpJSON = window.localStorage.getItem( LSselected );
	try {
		window.localStorage.setItem( theName, tmpJSON );
	} catch( err) {
		alert( 'Save Error: ' + err );
	}
	// Delete the previous item
	window.localStorage.removeItem( LSselected );
	scope.savename = theName;
	document.getElementById('txt_name').value = '';
	UpdateFiles();
}

function LSsave() { //Action routine for the Save button
	scope.spec.save_date = timeStamp();
	try {
		window.localStorage.setItem( scope.savename, JSON.stringify( scope.spec ) );
	} catch( err) {
		alert( 'Save Error: ' + err );
	}
	scope.modified = false;
	UpdateFiles();
}

function SaveAs() { //Action rountine for the Save As button
	//insure valid name present
	var theName = document.getElementById('txt_name').value.trim();
	if ( theName.length == 0 ) {
		alert( 'Please specify a non-blank Design Name before clicking the Save As button.' );
		return( false );
	}
	if ( isInvalid( theName, invalidChars ) ) {
		alert( 'A Design Name may not contain tany of these characters:\n' + invalidChars );
		return( false );	
	}		
	if ( !OverwriteOK( theName ) ) { return( false ) }
	scope.spec.save_date = timeStamp();
	try { 
			window.localStorage.setItem( theName, JSON.stringify( scope.spec ) );
	} catch( err) {
		alert( 'Save Error: ' + err );
	}
	scope.savename = theName;
	document.getElementById('txt_name').value = '';
	scope.modified = false;
	UpdateFiles();
}

function disableLScontrols( what, tf ) { // Enables or disables Local Storage controls
	switch (what) {
		case 'all':
			document.getElementById('btn_open').disabled = tf;
			document.getElementById('btn_del').disabled  = tf;
			document.getElementById('txt_name').disabled = tf;
			document.getElementById('btn_svas').disabled = tf;
			document.getElementById('btn_ren').disabled  = tf;
			document.getElementById('btn_save').disabled = tf;
			document.getElementById('btn_save').disabled = tf;
			break;
		case 'selection':
			document.getElementById('btn_open').disabled = tf;
			document.getElementById('btn_del').disabled  = tf;
			document.getElementById('btn_ren').disabled  = tf;
			break;
		case 'save':
			document.getElementById('btn_save').disabled = tf;
			break;
		default:
	}
}


function Load_Red( s ) {
	s.spec.title = "Red Sample Telescope 6-inch f/11";
	s.spec.notes = "High power, high contrast planetary scope.";
	s.spec.unit_meas =  "inch";
	s.spec.primary_diam = 6.0;
	s.spec.f_ratio = 11;
    s.spec.secondary_minor = 1;
	s.spec.tube_id = 8.0;
	s.spec.tube_thick = 0.125;
	s.spec.focus_to_tubefront = 8.125;
	s.spec.pri_fnt_tube_back = 4.375;
	s.spec.fixed_baffles = false;
	s.spec.focus_height = 1.75;
	s.spec.focus_extra = 0.875;
	s.spec.focus_camera = 0.0;
	s.spec.focus_diam = 1.25;
	s.spec.eye_fl = [40,25,15,15,12,0,0,0,0,0];
    s.spec.eye_af = [38.5,39.7,44.6,39.6,37.5,0,0,0,0,0];
	s.spec.save_date = '';
	s.savename = "My Red Scope";
	s.modified = false;
	Scope2Specs( scope );
	resetZoom();
	clearDiagCalc();
	UpdateAll();
}
function Load_White( s ) {
	s.spec.title = "White Sample Telescope 6-inch f/8";
	s.spec.notes = "Not Optimized classic all purpose small scope.";
	s.spec.unit_meas =  "inch";
	s.spec.primary_diam = 6.0;
	s.spec.f_ratio = 8;
    s.spec.secondary_minor = 1.5;
	s.spec.tube_id = 7.0;
	s.spec.tube_thick = 0.125;
	s.spec.focus_to_tubefront = 6;
	s.spec.pri_fnt_tube_back = 3.5;
	s.spec.fixed_baffles = true;
	s.spec.focus_height = 3;
	s.spec.focus_extra = 0.25;
	s.spec.focus_camera = 0.0;
	s.spec.focus_diam = 1.25;
	s.spec.eye_fl = [32,25, 9,0,0,0,0,0,0,0];
    s.spec.eye_af = [35,68,40,0,0,0,0,0,0,0];
	s.spec.save_date = '';
	s.savename = "My White Scope";
	ResetOnLoad( scope );
}
function Load_Blue( s ) {
	s.spec.title = "Blue Sample Telescope 10-inch f/5.6";
	s.spec.notes = "Good Deep-Sky Scope.";
	s.spec.unit_meas =  "inch";
	s.spec.primary_diam = 10.0;
	s.spec.f_ratio = 5.6;
    s.spec.secondary_minor = 1.83;
	s.spec.tube_id = 12.0;
	s.spec.tube_thick = 0.25;
	s.spec.focus_to_tubefront = 8.75;
	s.spec.pri_fnt_tube_back = 6;
	s.spec.fixed_baffles = true;
	s.spec.focus_height = 1.75;
	s.spec.focus_extra = 0.675;
	s.spec.focus_camera = 0.0;
	s.spec.focus_diam = 2;
	s.spec.eye_fl = [40,32,25,15,12,6,0,0,0,0];
    s.spec.eye_af = [38.5,65,39.7,44.6,39.6,37.5,0,0,0,0];
	s.spec.save_date = '';
	s.modified = false;
	s.savename = "My Blue Scope";
	Scope2Specs( scope );
	resetZoom();
	clearDiagCalc();
	UpdateAll();
}
function Load_Black( s ) {
	s.spec.title = "Black Sample Telescope 4&frac14;-inch f/4";
	s.spec.notes = "Not Optimized Small Wide Field Scope.";
	s.spec.unit_meas =  "inch";
	s.spec.primary_diam = 4.25;
	s.spec.f_ratio = 4;
    s.spec.secondary_minor = 1.25;
	s.spec.tube_id = 4.75;
	s.spec.tube_thick = 0.125;
	s.spec.focus_to_tubefront = 2.875;
	s.spec.pri_fnt_tube_back = 2.4375;
	s.spec.fixed_baffles = false;
	s.spec.focus_height = 1.625;
	s.spec.focus_extra = 0.44;
	s.spec.focus_camera = 0.0;
	s.spec.focus_diam = 1.25;
	s.spec.eye_fl = [40,25,15,12,6,0,0,0,0,0];
    s.spec.eye_af = [38.5,39.7,44.6,39.6,37.5,0,0,0,0,0];
	s.spec.save_date = '';
	s.savename = "My Black Scope";
	ResetOnLoad( scope );
}
function Load_Yellow( s ) {
	s.spec.title = "Stellafane Yellow Dob 6 inch f/7.5";
	s.spec.notes = "Instructions to build this on <a href='http://stellafane.org/tm/dob/index.html' target='_blank'>Stellafane.org</a>";
	s.spec.unit_meas =  "inch";
	s.spec.primary_diam = 6;
	s.spec.f_ratio = 7.5;
    s.spec.secondary_minor = 1.3;
	s.spec.tube_id = 8;
	s.spec.tube_thick = 0.125;
	s.spec.focus_to_tubefront = 4.5;
	s.spec.pri_fnt_tube_back = 4.5;
	s.spec.fixed_baffles = false;
	s.spec.focus_height = 2.52;
	s.spec.focus_extra = 0.25;
	s.spec.focus_camera = 0.0;
	s.spec.focus_diam = 2;
	s.spec.eye_fl = [32,25,20,15,10,07,0,0,0,0];
    s.spec.eye_af = [55,55,55,55,55,86,0,0,0,0];
	s.spec.save_date = '';
	s.savename = "My Yellow Scope";
	ResetOnLoad( scope );
}
function Load_NewDesign( s ) {
	s.spec.title = "(New Design)";
	s.spec.notes = "";
	s.spec.unit_meas =  "inch";
	s.spec.primary_diam = 0;
	s.spec.f_ratio = 0;
    s.spec.secondary_minor = 0;
	s.spec.tube_id = 0;
	s.spec.tube_thick = 0;
	s.spec.focus_to_tubefront = 0;
	s.spec.pri_fnt_tube_back = 0;
	s.spec.fixed_baffles = false;
	s.spec.focus_height = 0;
	s.spec.focus_extra = 0;
	s.spec.focus_camera = 0;
	s.spec.focus_diam = 0;
	s.spec.eye_fl = [0,0,0,0,0,0,0,0,0,0];
    s.spec.eye_af = [0,0,0,0,0,0,0,0,0,0];
	s.spec.save_date = '';
	s.savename = "";
	ResetOnLoad( scope );
}

function CheckFileReader() { // Check if this browser supports file reading
    if ( typeof window.FileReader == "function" ) { return } // OK, nothing to do here
    var warn = document.getElementById('filereadwarn');
    warn.innerHTML = "This Browser does not support File Reading";
    warn.style.fontWeight = "bold";
    warn.style.color = "red";
	document.getElementById('file_sel').disabled = true;
	document.getElementById('file_load').disabled = true;
}

var freader;
function ReadFile() { // Reads the selected file into the browser
	var fileselector;

    if ( typeof window.FileReader !== "function" ) {
        alert( "File reading is not supported on this browser.\nRead the About tab to learn which browsers support this function." );
        return;
    }

    fileselector = document.getElementById( "file_sel" );
    if ( !fileselector ) {
        alert( "Internal Error: Could not find the file seletor element.\nPlease report this as a bug (Contact on About tab)." );
    }
    else if ( !fileselector.files ) {
        alert( "This browser does not support the `files` property of file input selectors.\nRead the About tab to learn which browsers support this feature." );
    }
    else if ( !fileselector.files[0] ) {
        alert(  "Please select a file before clicking 'Load'" );
    }
    else {
        freader = new FileReader();
        freader.onload = gotText;
        freader.readAsText( fileselector.files[0] );
    }
}

function gotText() {
	var jsondata = freader.result;
	try { var thespec = JSON.parse( jsondata ); }
	catch( err ) {
		alert( "File Read Error - Invalid File Format or Empty File.\n" + err );
		return;
	}
	if ( !thespec.file_type ) {
		alert( "File Type not found - file cannot be read in." );
		return;
	}
	if ( thespec.file_type !== scope.spec.file_type ) {
		alert( "Wrong file type.\nFile type is '" + thespec.file_type + "'\nIt must be '" + scope.spec.file_type + "' - File not Loaded." );
		return;
	}
	if ( !thespec.file_ver ) {
		alert( "File version not found - file cannot be read in." );
		return;
	}
	if ( thespec.file_ver !== 1.0 ) {
		alert( "Wrong file version.\nFile version is " + thespec.file_ver.toFixed(1) + "\nIt must be 1.0 - File not Loaded." );
		return;
	}
	delete thespec["file_type"]; //Prevent overwrite of this item.
	delete thespec["file_ver"];  //Prevent overwrite of this item.
	for( var key in thespec ) { scope.spec[key] = thespec[key] } // Copy data into globals
	scope.modified = false;
	Scope2Specs( scope );
	resetZoom();
	clearDiagCalc();
	UpdateAll( scope );
}

function handleFileSelect( evt ) { // Drag and Drop
    evt.stopPropagation();
    evt.preventDefault();

    document.getElementById('osl').style.backgroundColor = 'white';   
    freader = new FileReader();
    freader.onload = gotText;
    freader.readAsText( evt.dataTransfer.files[0] );
}

function handleDragEnter( evt ) { //Drag and Drop
	evt.stopPropagation();
    evt.preventDefault();
    document.getElementById('osl').style.backgroundColor = '#D7E1EF';
}

function handleDragLeave( evt ) { //Drag and Drop
	evt.stopPropagation();
    evt.preventDefault();
    document.getElementById('osl').style.backgroundColor = 'white';   
}

function handleDragOver( evt ) {  // Drag and Drop
	evt.stopPropagation();
    evt.preventDefault();
    document.getElementById('osl').style.backgroundColor = '#D7E1EF';
}

function saveViaDownload() {
	var theName = document.saveForm.fileName.value.trim();
	if ( theName.length == 0 ) {
		alert( 'Please specify a non-blank Design Name before clicking the Save File button.' );
		return( false );
	}
	if ( isInvalid( theName, invalidChars ) ) {
		alert( 'A File Name may not contain any of these characters:\n' + invalidChars );
		return( false );	
	}
	scope.spec.save_date = timeStamp();
	document.saveForm.saveData.value = JSONstring( scope );
	scope.modified = false;		
	UpdateFiles();
	document.saveForm.submit();
}

function JSONstring( s ) { // Returns JSON string
	var jsontxt = "{ ";
	var first = true;
	for ( key in s.spec ) {
		if ( first ) { first = false } else { jsontxt += ', \n'; }
		jsontxt +=  '"' + key + '": ';
		switch ( typeof( s.spec[key] ) ) {
			case "string":
				jsontxt += '"' + s.spec[key] + '"';
				break;
			case "number":
			case "boolean":
				jsontxt += s.spec[key];
				break;
			case "object": // Not an arbitrary object, expect it to be a numerical array
				jsontxt += "[" + s.spec[key].toString() + "]";
				break;
			default:
				alert( "Internal Error: Unexpected data type in JSON conversion\n" + typeof( s.spec[key] ) );
				return;
				break;
		}
	}
	jsontxt += " }";
	return( jsontxt );
}

/* End */