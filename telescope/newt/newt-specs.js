/*** newt-specs.js: Copies data to and from Specs pane and ScopeClass data structure ***/

/* Newt-Web: A Newtonian Telescope CAD Program
				
Copyright (C) 2011 Kenneth H. Slater
				
This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License 
Version 2 as published by the Free Software Foundation.
				
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
				
You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA */

function specmod() {	// Action routine called when specifications or eyepieces change
	scope.modified = true;	// Set design as modified
	clearDiagCalc();		// Clear diagonal calculation
	Specs2Scope( scope );  	// Copy new specs to data structure
	UpdateAll();		   	// Update calculations and displays
}

function Scope2Specs( s ) {
	// Copy data from an instance of a ScopeClass (parameter s) to the Specifications Pane Form Fields
	document.SpecForm.title.value  = s.spec.title;
	document.SpecForm.notes.value  = s.spec.notes;
	document.SpecForm.PriDia.value = s.spec.primary_diam;
	document.SpecForm.FocRat.value = s.spec.f_ratio;
	document.SpecForm.DiaAxs.value = s.spec.secondary_minor;
	document.SpecForm.TubeID.value = s.spec.tube_id;
	document.SpecForm.TubThk.value = s.spec.tube_thick;
	document.SpecForm.FocFrt.value = s.spec.focus_to_tubefront;
	document.SpecForm.PriBck.value = s.spec.pri_fnt_tube_back;
	document.SpecForm.FocHgt.value = s.spec.focus_height;
	document.SpecForm.SparIn.value = s.spec.focus_extra;
	document.SpecForm.CamHgt.value = s.spec.focus_camera;
	document.SpecForm.FocID.value  = s.spec.focus_diam;
	document.SpecForm.FixBaf.checked = s.spec.fixed_baffles;
	for ( var i=0; i < document.SpecForm.units.length; i++ ) {
		document.SpecForm.units[i].selected = ( document.SpecForm.units[i].value == s.spec.unit_meas );
	}
	// Eyepiece Data Below
	var eye_fls = document.EyepForm.elements["eye_fl[]"];
	for ( var i=0; i<eye_fls.length; i++ ) {
		eye_fls[i].value = ( s.spec.eye_fl[i] == 0 ) ? "" : s.spec.eye_fl[i];
	}
	var eye_afs = document.EyepForm.elements["eye_af[]"];
	for ( var i=0; i<eye_afs.length; i++ ) {
		eye_afs[i].value = ( s.spec.eye_af[i] == 0 ) ? "" : s.spec.eye_af[i];
	}
}

function Specs2Scope( s ) {
	// Copy data from the Specifications Pane Form Fields to an instance of a ScopeClass (parameter s)
	s.spec.title = document.SpecForm.title.value;
	s.spec.notes = document.SpecForm.notes.value;
	s.spec.primary_diam			= parseFloat( document.SpecForm.PriDia.value );
	s.spec.f_ratio				= parseFloat( document.SpecForm.FocRat.value );
	s.spec.secondary_minor		= parseFloat( document.SpecForm.DiaAxs.value );
	if ( s.spec.primary_diam > s.spec.tube_id ) {
		document.SpecForm.TubeID.value = document.SpecForm.PriDia.value;
		alert( "Tube Inside Diameter increased to be equal to Primary Mirror Diameter." );
	}
	s.spec.tube_id				= parseFloat( document.SpecForm.TubeID.value );
	s.spec.tube_thick 			= parseFloat( document.SpecForm.TubThk.value );
	s.spec.focus_to_tubefront	= parseFloat( document.SpecForm.FocFrt.value );
	s.spec.pri_fnt_tube_back	= parseFloat( document.SpecForm.PriBck.value );
	s.spec.focus_height			= parseFloat( document.SpecForm.FocHgt.value );
	s.spec.focus_extra			= parseFloat( document.SpecForm.SparIn.value );
	s.spec.focus_camera			= parseFloat( document.SpecForm.CamHgt.value );
	s.spec.focus_diam			= parseFloat( document.SpecForm.FocID.value  );
	s.spec.fixed_baffles = document.SpecForm.FixBaf.checked;
	for ( var i=0; i < document.SpecForm.units.length; i++ ) {
		if( document.SpecForm.units[i].selected ) { s.spec.unit_meas = document.SpecForm.units[i].value };
	}
	// Eyepiece Data Below
	var eye_fls = document.EyepForm.elements["eye_fl[]"];
	for ( var i=0; i<eye_fls.length; i++ ) {
		s.spec.eye_fl[i] = ( eye_fls[i].value == '' ) ? 0 : eye_fls[i].value;
	}
	var eye_afs = document.EyepForm.elements["eye_af[]"];
	for ( var i=0; i<eye_afs.length; i++ ) {
		s.spec.eye_af[i] = ( eye_afs[i].value == '' ) ? 0 : eye_afs[i].value;
	}
}

function CalcDiagonal( s ) {
	// Setup iteration control
	var step = 0.01; var rnd = 100;
	if ( s.spec.unit_meas == 'cm' ) { step = 0.1; rnd = 10; }
	if ( s.spec.unit_meas == 'mm' ) { step = 1;   rnd =  1; }
	// Save current value
	var cur_diag = s.spec.secondary_minor;
	// Now set the diagonal to 0 and step up until we find the 100% ray point
	s.spec.secondary_minor = 0;
	UpdateAll( s );
	while( s.illum_wid_100 <= 0.0 ) {
		s.spec.secondary_minor = ( s.spec.secondary_minor + step );
		s.spec.secondary_minor = Math.round( s.spec.secondary_minor * rnd ) / rnd;
		UpdateAll( s );
	}
	// Record value needed to admit 100% ray
	var diag_min = s.spec.secondary_minor;
	// Report partial result
	document.getElementById('diag_range').innerHTML = "Diagonal Min=" + diag_min;
	// Now increase size more until we are vignetted
		while( !IsVignetted( s ) ) {
		s.spec.secondary_minor = ( s.spec.secondary_minor + step );
		s.spec.secondary_minor = Math.round( s.spec.secondary_minor * rnd ) / rnd;
		UpdateAll( s );
	}
	// Now decrease the size until we are not vignetted
	while( IsVignetted( s ) ) {
		s.spec.secondary_minor = ( s.spec.secondary_minor - step );
		s.spec.secondary_minor = Math.round( s.spec.secondary_minor * rnd ) / rnd;
		UpdateAll( s );
	}
	// Save and report answer	
	var diag_max = s.spec.secondary_minor;
	document.getElementById('diag_range').innerHTML = "Diagonal Range = " + diag_min + ' - ' + diag_max;
	document.getElementById('diag_range').style.color = ( diag_min > diag_max ) ? 'red' : 'navy';
	//Restore Original value
	s.spec.secondary_minor = cur_diag;
	Scope2Specs( s );
	UpdateAll( s );
}

function IsVignetted( s ) { // Returns true if scope is vignetted, false otherwise
	if ( s.front_aper_diam > s.spec.tube_id ) { return ( true ) }
	if ( s.vignetted_100 ) { return( true ) }
	if ( s.vignetted_75  ) { return( true ) }
	return( false );
}

function clearDiagCalc() { //Clears the diagonal caculation field
	document.getElementById('diag_range').innerHTML = "";
}