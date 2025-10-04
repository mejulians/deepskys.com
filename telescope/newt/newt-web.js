/*** newt-web.js: main JavaScript file ***/

/* Newt-Web: A Newtonian Telescope CAD Program
				
Copyright (C) 2011 Kenneth H. Slater
				
This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License 
Version 2 as published by the Free Software Foundation.
				
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
				
You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA */

/* Globals */
//--- Version Information ---
var version = {
	major: 1,
	minor: 2, 
	edit: 85,
	date: "2012-Apr-08",
	string: '',
	file: 1.0
};
version.string = "Newt-Web V" + version.major + "." + version.minor + "-" + lz( version.edit, 4 ) + " Built on " + version.date;

//-- Scope Data Structure --
var scope = {
	spec: { // This is what the user specifies, and what is saved in a file
		// This is the White sample design
		file_type: "Newt-Web Save File",	// Make sure we are reading the correct file type
		file_ver: 1.0, 						// Used in case we add stuff in a later version.
		save_date: '',						// Date this data was last saved
	    title: "Julian's Newtonian",
	    notes: "8.5 Inch F5",
	    unit_meas: "mm",	//inch, cm, mm
	    primary_diam: 215,
	    f_ratio: 5,
    	secondary_minor: 60,
	    tube_id: 255,
	    tube_thick: 5,
	    focus_to_tubefront: 70,	
	    pri_fnt_tube_back: 147,		// Primary Front to Back of Tube (was 'mirror_front')
	    fixed_baffles: true,
	    focus_height: 130,
	    focus_extra: 30,
	    focus_camera: 0.0,
	    focus_diam: 50,
	    eye_fl: new Array(7,12,18,25,0,0,0,0,0,0), //[10]
        eye_af: new Array(35,60,44,43,0,0,0,0,0,0)  //[10]
	},
    front_aper_diam: null,
    secondary_offset: null,
    tube_od: null,
    focal_len: null,
    mirror_thick: null,
    mirror_to_focuser: null,
    focal_plane_height: null,
    tube_len: null,
    secondary_front: null,
    illum_wid_100: null,
    illum_wid_75: null,
    baff_diam: new Array, //[40]
    baff_pos: new Array,  //[40]
    num_baffles: null,
    ray: new Array, //[18][4]
    show_axis: true,
    show_rays_center: true,
    show_rays_100: true,
    show_rays_75: true,
    show_baffles: true,
    vignetted_100: false,
    vignetted_75: false,
    savename: "",
    modified: false				// flag
};

	var LSselected = '';	// Local Storage, name of selected item, or ''

/* Startup Actions */
function startup_app() {
	document.getElementById( "Abt_Ver").innerHTML = version.string; // Stuff version into about pane
	initScope( scope );			// Add second demension to 'ray' array
	CheckBrowser();				// Check the user's browser type

	// Setup the Drag and Drop event listeners.
	var dropZone = document.getElementById('osl');
	if ( dropZone.addEventListener ) {
		dropZone.addEventListener( 'dragenter', handleDragEnter,  false );
		dropZone.addEventListener( 'dragleave', handleDragLeave,  false );
		dropZone.addEventListener( 'dragover',  handleDragOver,   false );
		dropZone.addEventListener( 'drop',      handleFileSelect, false );
	}
    ResetOnLoad( scope );		// Called whenever the page reloads or a design is loaded
	checkCapabilities();		// Checks browser capabilities and alerts the user to deficiences
	UpdateAll();				// Calculate Scope and update all data
}

function startup_help() { // Called from body onload event
	// Fill in program and file version info in header
	document.getElementById("help-pver").innerHTML = version.string;
	document.getElementById("help-fver").innerHTML = version.file.toFixed(1);
}

function initScope( s ) {		// Add second demension to 'ray' array
	for ( var i=0; i<18; i++ ){ s.ray[i] = new Array(); }
}

function ResetOnLoad( s ) {		// Things to be done when a new design is loaded or the page is reloaded
	scope.modified = false;
	clearDiagCalc();
	resetZoom();
    Scope2Specs( s );
    UpdateAll( s );
}

function checkCapabilities() {	// Checks browser capabilities and alerts the user to deficiences
	// <canvas> check done on Ray Trace pane with <canvas> tag
	
	// <input type="file"> check
	var inel = document.createElement( "input" );
  	inel.setAttribute( "type", "file" );
  	if ( inel.type == "text" ) {
		alert( "This browser does not support the file input element, therefore reading files won't work. " +
				"Subject to other missing features, the application should run without this facility. " +
				"See the Help Application page for information about upgrading to supported browsers." );  }
	// JSON check
	if ( !JSON ) { alert( "This browser does not support JSON, therefore files and local storage won't work. " +
				"Subject to other missing features, the application should run without this facility. " +
				"See the Help Application page for information about upgrading to supported browsers." );  }
}

function UpdateAll() {
	CalcScope( scope );				// Calculate Scope based on user input
	RayTrace( scope );				// Ray Trace the Scope
	CalcBaffles( scope );			// Calculate Baffle Positions
	Scope2Specs( scope );			// Copy Scope data to Specs Pane.
	UpdateTitleBox( scope );		// Update data in the title box
	UpdateStatusBox( scope );		// Update data in the header's status box
	UpdateEyepieces( scope );		// Update Eyepiece Pane
	UpdateDraw( scope );			// Update the Ray Trace Pane
	UpdateDimensions( scope );		// Update the Dimensions
	UpdateBaffles( scope )			// Update the Baffles
	UpdatePerformancePane( scope );	// Update the Performance Pane
	UpdateFiles();					// Update the File Pane
	//DrawScope( scope );
}

/* Utility Functions */
function timeStamp() { // Create a time stamp in YYYY-MM-DD HH:MM:SS format
	var dt = new Date();
	var ts  = dt.getFullYear() + '-' + lz( dt.getMonth()+1, 2 ) + '-' + lz( dt.getDate(), 2 ) + ' '; 
	ts += lz( dt.getHours(), 2 ) + ':' + lz( dt.getMinutes(), 2 ) + ':' + lz( dt.getSeconds(), 2 );
	return( ts );
}	

function log10 ( n ) { return( Math.log( n ) / Math.log(10) ) }

function lz ( number, length) { //Pad number with leading zeros to length
	var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

//Add a trim function to the String class
String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

/* Tab Stuff */
var current_tab = "About";

function changetab( new_tab ) {
	if ( current_tab == new_tab ) { return; } // No-op if no change needed
	// Deselect current tab
	document.getElementById("tab_" + current_tab).setAttribute("class", "tab");
	// Select new tab
	document.getElementById("tab_" + new_tab).setAttribute("class", "tab tab-selected");
	// Visible new pane
	document.getElementById("display_" + new_tab).style.visibility = "visible";
	// Hidden current pane
	document.getElementById("display_" + current_tab).style.visibility = "hidden";
	// Update current tab
	current_tab = new_tab;
}

// Browser Detection, Checking and Warnings
function CheckBrowser() {
	var ua = navigator.userAgent;
	var bname = '?';
	var bver = '?';
	// alert( 'Browser identifies itself as:\n' + ua ); // For debugging
	if ( /Firefox[\/\s](\d+\.\d+)/.test( ua ) ) {
		bname = 'Firefox';
		bver = new Number(RegExp.$1);
	}
	if ( /MSIE (\d+\.\d+);/.test( ua ) ){
		bname = 'Internet Explorer';
		bver = new Number(RegExp.$1);
	}
	if ( /Safari[\/\s](\d+\.\d+)/.test( ua ) ) { //Chrome has the 'Safari' in its UA string :-(
		if ( /Chrome[\/\s](\d+\.\d+)/.test( ua ) ) {
			bname = 'Chrome';
			bver = new Number(RegExp.$1);		
		} else {
			bname = 'Safari';
			/Version[\/\s](\d+\.\d+)/.test( ua );
			bver = new Number(RegExp.$1);
		}
	}
	var bboth = bname + ' Version ' + bver;
	switch ( bname ) {
		case 'Firefox': 
			if( bver == 3.6 ) { alert( 'This browser is ' + bboth + 
				'.\nNewt-Web runs best in Version 4 or higher.\nNewt-Web should run but the User Interface is degraded in Version 3.6.\Please upgrade.' ); 
				return;
			}
			if( bver < 4 ) alert( 'This browser is ' + bboth + '.\nNewt-Web needs at least Version 4 to run.\nPlease upgrade.' ); 
			break;
		case 'Internet Explorer': 
			if( bver < 9 ) alert( 'This browser is ' + bboth + '.\nNewt-Web needs at least Version 9 to run.\nPlease upgrade.' ); 
			break;
		case 'Safari':
			if( bver < 4 ) alert( 'This browser is ' + bboth + '.\nNewt-Web needs at least Version 4 to run.\nPlease upgrade.' ); 
			break;
		case 'Chrome': 
			if( bver < 9 ) alert( 'This browser is ' + bboth + '.\nNewt-Web needs at least Version 9 to run.\nPlease upgrade.' ); 
			break;
		default:
			alert( 'Could not identify your browser.\nNewt-Web requires HTML 5 technology to run.\nSee Help Application: Browsers if you have problems.');
			break;
	}
}
