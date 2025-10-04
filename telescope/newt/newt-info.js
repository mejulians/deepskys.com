/*** info.js: functions for updating Title Box, Dimmensions, Performance and Baffles panes ***/

/* Newt-Web: A Newtonian Telescope CAD Program
				
Copyright (C) 2011 Kenneth H. Slater
				
This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License 
Version 2 as published by the Free Software Foundation.
				
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
				
You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA */

function setText( id, txt ) { document.getElementById( id ).innerHTML = txt; } //Utility function to save typing
function setRed( id, cond ) {
	var t_color = "black";
	if ( cond ) var t_color = "red";
	document.getElementById( id ).style.color = t_color;
}
function setTextOpt( id, cond, rtxt, btxt ) {
	if ( cond ) {
		setText( id, rtxt );
	} else {
		setText( id, btxt );
	}
	setRed( id, cond );
}

function UpdateTitleBox( s ) {
	setText("hdr_title", s.spec.title );
	setText("hdr_notes", s.spec.notes );
	setText("hdr_prime", s.spec.primary_diam + " " + s.spec.unit_meas + " f/" + s.spec.f_ratio );
	setText("hdr_fl", s.focal_len + " " + s.spec.unit_meas + " FL" );
}

function UpdateStatusBox( s ) {
	setTextOpt( "stat_dts",  s.illum_wid_100 <= 0.0, "Yes", "No" );
	setTextOpt( "stat_vfa",  s.front_aper_diam > s.spec.tube_id, "Yes", "None" );
	setTextOpt( "stat_v100", s.vignetted_100, "Yes", "None" );
	setTextOpt( "stat_v075", s.vignetted_75,  "Yes", "None" );
}

function UpdateDimensions( s ) {
	setText("dim_units", s.spec.unit_meas );
	setText("dim_pridia",  s.spec.primary_diam.toFixed(3) );
	setText("dim_fl",  s.focal_len.toFixed(3) );
	setText("dim_fr",  s.spec.f_ratio.toFixed(3) );
	setText("dim_tid", s.spec.tube_id.toFixed(3) );
	setText("dim_tth", s.spec.tube_thick.toFixed(3) );
	setText("dim_fh",  s.spec.focus_height.toFixed(3) );
	setText("dim_fid", s.spec.focus_diam.toFixed(3) );
	setText("dim_fet", s.spec.focus_extra.toFixed(3) );
	setText("dim_fct", s.spec.focus_camera.toFixed(3) );
	setText("dim_dma", s.spec.secondary_minor.toFixed(3) );
	setText("dim_dof", s.secondary_offset.toFixed(3) );
	setText("dim_100", s.illum_wid_100.toFixed(3) );
	setRed( "dim_100", s.illum_wid_100 <= 0.0 );
	setText("dim_075", s.illum_wid_75.toFixed(3) );
	setRed( "dim_075", s.illum_wid_75 <= 0.0 );
	setText("dim_fad", s.front_aper_diam.toFixed(3) );
	setRed( "dim_fad", s.front_aper_diam > s.spec.tube_id );
	setText("dim_m2f", s.mirror_to_focuser.toFixed(3));
	setText("dim_f2f", s.spec.focus_to_tubefront.toFixed(3)  );
	setText("dim_f2b", s.spec.pri_fnt_tube_back.toFixed(3) );
	setText("dim_tl",  s.tube_len.toFixed(3) );
}

function UpdatePerformancePane ( s ) {
	var pri_size = s.spec.primary_diam + " " + s.spec.unit_meas;
	var pri_in = s.spec.primary_diam;
	if ( s.spec.unit_meas == "cm" ) { pri_in = pri_in / 2.54; }
	if ( s.spec.unit_meas == "mm" ) { pri_in = pri_in / 25.4; }
	
	setText( "perf_ob1", pri_size );
	var lm = 8.8 + ( 5 * log10( pri_in ) );
	setText( "perf_tlm",  lm.toFixed(1) );
	
	var pri_surf = 3.1416 * (s.spec.primary_diam/2) * (s.spec.primary_diam/2);
    var sec_surf = 3.1416 * (s.spec.secondary_minor/2) * (s.spec.secondary_minor/2);
    var obs_surf = Math.floor((sec_surf / pri_surf * 100.0) + 0.5);
	setText( "perf_ops", obs_surf.toFixed(0) );
	
	setText( "perf_ob2", pri_size );
	var dl = 4.56 / pri_in;
	setText( "perf_dl", dl.toFixed(2) );
	
	setText( "perf_osp", Math.floor((s.spec.secondary_minor/s.spec.primary_diam * 100.0) + 0.5).toFixed(0) );
	setText( "spec_osp", Math.floor((s.spec.secondary_minor/s.spec.primary_diam * 100.0) + 0.5).toFixed(0) );

	setText( "perf_mxp", (50 * pri_in).toFixed(0) );
	
	setText( "perf_mnp", ((pri_in * 25.4)/7).toFixed(1) );
	
	setText( "perf_afv100", ((3456.0 * s.illum_wid_100 / s.focal_len) / 60.0 ).toFixed(4) );
	setText( "perf_dia100", s.illum_wid_100.toFixed(4) + ' ' + s.spec.unit_meas );
	setText( "spec_dia100", s.illum_wid_100.toFixed(2) + ' ' + s.spec.unit_meas );
	
	setText( "perf_afv75", ((3456.0 * s.illum_wid_75 / s.focal_len) / 60.0 ).toFixed(4) );
	setText( "perf_dia75", s.illum_wid_75.toFixed(4) + ' ' + s.spec.unit_meas );
}

function UpdateEyepieces( s ) {

    var f_primdiam, f_foclen, f_pwr, f_ep, f_tf;
   	var eye_fls = document.EyepForm.elements["eye_fl[]"];
	var eye_afs = document.EyepForm.elements["eye_af[]"];
    
    // convert primary diameter & focal length from inches/cm/mm to mm
    switch(s.spec.unit_meas) {
        case 'cm':  f_primdiam = s.spec.primary_diam * 10;
                    f_foclen = s.focal_len * 10;
                    break;
        case 'mm':  f_primdiam = s.spec.primary_diam;
                    f_foclen = s.focal_len;
                    break;
        case 'inch':
        default:    f_primdiam = s.spec.primary_diam * 25.4;
                    f_foclen = s.focal_len * 25.4;
                    break;
    }

    // calc power, exit pupil, true field
	for ( var i=0; i<10; i++ ) {
	    if ( eye_fls[i].value != 0) {               // avoid divide by zero error
	        f_pwr = f_foclen / eye_fls[i].value;    // power
	        f_ep  = f_primdiam / f_pwr;             // exit pupil
	        f_tf  = eye_afs[i].value / f_pwr;  	        // true field
	    }  else {
	        f_pwr = 0;
	        f_ep  = 0;
	        f_tf  = 0;
	    }
	    setText( "eyep_pw"+i, ( f_pwr == 0 ) ? "" : f_pwr.toFixed(1)+ "x" );
	    setText( "eyep_xp"+i, ( f_ep == 0 )  ? "" : f_ep.toFixed(2)+" mm" );
	    setText( "eyep_tf"+i, ( f_tf == 0 )  ? "" : f_tf.toFixed(3)+"&deg;" );
    }	
}

function UpdateBaffles( s ) {
	var baftxt ="";

	if ( s.front_aper_diam > s.spec.tube_id ) { //No Baffles, issue warning
		baftxt =  "<p>The 75% ray is vignetted by the inside of the tube at the front.</p>";
		baftxt += "<p>The tube inside diameter should be a little larger, or the diagonal minor axis could be made smaller to shrink the illuminated field.</p>"
		baftxt += "<p>The baffles can't be calculated until the vignetting at the front is corrected.</p>";
	} else { //List baffles Positions
		baftxt =  "<table id='baf_tbl'>"
		baftxt += "<tr><th>Position</th><th>Diameter</th></tr>";
		baftxt += "<tr><td colspan=2 class='baf_hdr'><i>Seen thru Diagonal</i></td></tr>";
		for( var i=0; i<s.num_baffles-2; i++ ) {
			baftxt += "<tr><td>" + s.baff_pos[i].toFixed(2) + "</td><td>" + s.baff_diam[i].toFixed(3) + "</td></tr>";
		}
		baftxt += "<tr><td colspan=2 class='baf_hdr'><i>Seen past Diagonal</i></td></tr>";
		for( var i=s.num_baffles-2; i<s.num_baffles; i++ ) {
			baftxt += "<tr><td>" + s.baff_pos[i].toFixed(2) + "</td><td>" + s.baff_diam[i].toFixed(3) + "</td></tr>";
		}
		baftxt += "<tr><td colspan=2 class='baf_hdr'><i>Front Baffle</i></td></tr>";
		baftxt += "<tr><td>Front</td><td>" + s.baff_diam[s.num_baffles-1].toFixed(3) + "</td></tr>";
		baftxt += "</table>";
		baftxt += "<p class='note'>All positions measured from the back of the tube.</p>"	
		baftxt += "<p class='note'>The \'Seen past Diagonal\' Baffles are on<br>either side of the Focuser Hole.</p>"	
	}
	document.getElementById("bafs").innerHTML = baftxt;
}

/* End of newt-info.js */