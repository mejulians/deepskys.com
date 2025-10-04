/*** newt-draw.js: Draws the telescope and rays ***/

/* Newt-Web: A Newtonian Telescope CAD Program
				
Copyright (C) 2011 Kenneth H. Slater
				
This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License 
Version 2 as published by the Free Software Foundation.
				
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
				
You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA */

function UpdateDraw(s) { // Overall drawing pane update
	UpdateScreenSizes();
	DrawScope( s );
}

function UpdateScreenSizes() { // Updates the screen sizes info
	// In the About tab
	document.getElementById('abt_screen').innerHTML = screen.width + "&times;" + screen.height; 
	document.getElementById('abt_window').innerHTML = window.outerWidth + "&times;" + window.outerHeight; 
}

//Draw scope globals
var xyscale;	// Scale factor for drawing
var zoom = 1;	// Zoom factor 

function DrawScope( s ) { // Draws  the telescope and rays
	var scope_canvas = document.getElementById( 'scope-canvas' );
	scope_canvas.width =  scope_canvas.offsetWidth;
	scope_canvas.height = scope_canvas.offsetHeight; 
	var ctx  = scope_canvas.getContext( '2d' );
	
	//Set up scaling and origins
	 // Note: The origin is near right edge of screen in the center vertically and the DrawScaleRect() and DrawScaleLine()
     //       functions reverse all X coordinates to draw everything to the left of origin.  This is so the light rays enter
     //       from the left as in common convention.
	var xImagePixels = 0.95 * scope_canvas.width; 	// Use 95% of horizontal window space
	xyscale = zoom * xImagePixels / s.tube_len ;	// Scale to length of tube

	// Adjust height as necessary
	var yImagePixels = xyscale * ( scope.focal_plane_height + scope.tube_od );
	document.getElementById('scope-canvas').style.height = yImagePixels + 'px';
	scope_canvas.height = scope_canvas.offsetHeight; 

	//Set up drawing origin
	var offsetImageX = ( scope_canvas.width - xImagePixels ) / 2;	// Center horizontally in window
	var offsetImageY = xyscale * 0.8 * ( scope.focal_plane_height + ( scope.tube_od / 2 ) );// Center vertically in window
	ctx.translate( (scope_canvas.offsetWidth - offsetImageX) * (zoom==1 ? 1 : zoom*.95), offsetImageY );		// set origins (reversed)
	
	DrawTube( ctx, s );
	DrawPrimary( ctx, s );
	DrawSecondary( ctx, s );
	DrawFocuser( ctx, s );
	DrawFocalPlane( ctx, s );
	if( document.getElementById('drw_axis').checked )  { DrawAxis( ctx, s ) }
	if( document.getElementById('drw_onctr').checked ) { DrawOnCenterRays( ctx, s ) }
	if( document.getElementById('drw_100zn').checked ) { Draw100Rays( ctx, s ) }
	if( document.getElementById('drw_75zn').checked )  { Draw75Rays( ctx, s ) }
	if( document.getElementById('drw_bafl').checked )  { DrawBaffles( ctx, s ) }
}

function doZoom() { //Action routine for zoom radio buttons
	// Scan radio buttons to find the selected one
	var radio_array = document.getElementsByClassName('zf');
	for ( var i=0; i<radio_array.length; i++ ) {
		if ( radio_array[i].checked ) { zoom = radio_array[i].value; break; }
	}
	DrawScope( scope );
}

function resetZoom() { // Resets Zoom to one
	zoom = 1;
	var radio_array = document.getElementsByClassName('zf');
	for ( var i=0; i<radio_array.length; i++ ) { radio_array[i].checked = false; }
	document.getElementById('zf1').checked = true;
}

function DrawTube( ctx, s ) { // Draw the Telescope Tubs

    // draw inner shades
    if ( s.tube_od > 0 ) {
	    var lingrad = ctx.createLinearGradient( 0, s.tube_od*xyscale/2, 0, -s.tube_od*xyscale/2 );
	    lingrad.addColorStop( 0, "#b0b0b0" );
	    lingrad.addColorStop( 1, "#202020" );
		ctx.fillStyle = lingrad; 	
	    DrawScaleRect( ctx, 0, s.tube_len, s.tube_od/2, -s.tube_od/2 );
    }
  
	// Tube wall color & focuser color
	ctx.fillStyle   = "#996600"; //Tan
	ctx.strokeStyle = "#996600"; //Tan

    // draw top edge (left of focuser)
    DrawScaleRect( ctx, 0, s.secondary_front - (s.spec.focus_diam/2) - 0.25, -s.tube_od/2, -s.spec.tube_id/2 );
    // draw line to insure visibility
    DrawScaleLine( ctx, 0, -s.tube_od/2, s.secondary_front - (s.spec.focus_diam/2) - 0.25, -s.tube_od/2 );
    DrawScaleLine( ctx, 0, -s.spec.tube_id/2, s.secondary_front - (s.spec.focus_diam/2) - 0.25, -s.spec.tube_id/2 );
    
    // draw top edge (right of focuser)
    DrawScaleRect( ctx, s.secondary_front + (s.spec.focus_diam/2) + 0.25, s.tube_len, -s.tube_od/2, -s.spec.tube_id/2 );
    // draw line to insure visibility
    DrawScaleLine( ctx, s.secondary_front + (s.spec.focus_diam/2) + 0.25, -s.tube_od/2, s.tube_len, -s.tube_od/2 );
    DrawScaleLine( ctx, s.secondary_front + (s.spec.focus_diam/2) + 0.25, -s.spec.tube_id/2, s.tube_len, -s.spec.tube_id/2 );

    // draw bottom edge
    DrawScaleRect( ctx, 0, s.tube_len, s.spec.tube_id/2, s.tube_od/2 );   
	// draw line to insure visibility
    DrawScaleLine( ctx, 0, s.spec.tube_id/2, s.tube_len, s.spec.tube_id/2 );
    DrawScaleLine( ctx, 0, s.tube_od/2, s.tube_len, s.tube_od/2 );
}

// draw primary mirror & holder
function DrawPrimary( ctx, s ) {

    // draw mirror
    ctx.fillStyle = "#EFFFF3"; // Cream White
    DrawScaleRect( ctx, s.spec.pri_fnt_tube_back - s.mirror_thick, s.spec.pri_fnt_tube_back, s.spec.primary_diam/2, -s.spec.primary_diam/2 );

    // draw holder bolts first (so plates cover them)
    ctx.fillStyle = "#B0B0B0"; // light gray
    DrawScaleRect( ctx, s.spec.pri_fnt_tube_back - s.mirror_thick - (s.mirror_thick*2), s.spec.pri_fnt_tube_back - s.mirror_thick - (s.mirror_thick/2),
    				-s.spec.primary_diam/4, -((s.spec.primary_diam/4) + (s.spec.primary_diam/32)) );
    DrawScaleRect( ctx, s.spec.pri_fnt_tube_back - s.mirror_thick - (s.mirror_thick*2), s.spec.pri_fnt_tube_back - s.mirror_thick - (s.mirror_thick/2), 
    				s.spec.primary_diam/4, (s.spec.primary_diam/4) + (s.spec.primary_diam/32) );


    // draw primary mirror mount
    ctx.fillStyle = "black";
    
    	// draw primary mirror holder
    DrawScaleRect( ctx, s.spec.pri_fnt_tube_back - s.mirror_thick - (s.mirror_thick/2), s.spec.pri_fnt_tube_back - s.mirror_thick,
    				-s.spec.primary_diam/2, s.spec.primary_diam/2 );
		// draw primary main plate
    DrawScaleRect( ctx, s.spec.pri_fnt_tube_back - (s.mirror_thick*2) - (s.mirror_thick/2), s.spec.pri_fnt_tube_back - (s.mirror_thick*2),
        			-s.spec.tube_id/2, s.spec.tube_id/2 );
}

// draw secondary mirror & holder
function DrawSecondary( ctx, s ) {

    // draw secondary mirror
    ctx.fillStyle = "#EFFFF3"; // Cream White
    DrawScalePoly( ctx, [
    	s.secondary_front + (s.spec.secondary_minor/2) - s.secondary_offset,
    	-( (s.spec.secondary_minor/2) - s.secondary_offset ),
    	
    	s.secondary_front + (s.spec.secondary_minor/2) - s.secondary_offset + (s.spec.secondary_minor/6), // 1/6 thickness ratio
    	-( (s.spec.secondary_minor/2) - s.secondary_offset ),
    	
    	s.secondary_front - (s.spec.secondary_minor/2) - s.secondary_offset + (s.spec.secondary_minor/6),
    	(s.spec.secondary_minor/2) + s.secondary_offset,
    	
    	s.secondary_front - (s.spec.secondary_minor/2) - s.secondary_offset + (s.spec.secondary_minor/6) - (s.spec.secondary_minor/6), 
    	(s.spec.secondary_minor/2) + s.secondary_offset ] );


    // draw central mount bolt (first, so mount plate covers)
    ctx.fillStyle = "#B0B0B0"; // Light gray
    DrawScaleRect( ctx, ( s.secondary_front - s.secondary_offset + (s.spec.secondary_minor/2) + ( 4 * (s.spec.secondary_minor/6) ) ),
    				    ( s.secondary_front - s.secondary_offset + (s.spec.secondary_minor/2) + (12 * (s.spec.secondary_minor/6) ) ),
    					( s.secondary_offset - (s.spec.secondary_minor/16) ),
						( s.secondary_offset + (s.spec.secondary_minor/16) ) );

    // draw adjusting screws (first, so mount plate covers)
    ctx.fillStyle = "#B0B0B0"; // light gray
    DrawScaleRect( ctx, ( s.secondary_front + (s.spec.secondary_minor/2) - s.secondary_offset + (s.spec.secondary_minor/3) ),
    					( s.secondary_front - s.secondary_offset + (s.spec.secondary_minor/2) + (5 * (s.spec.secondary_minor/6) ) ),
    					( -(s.spec.secondary_minor/4) + s.secondary_offset ),
    					( -((s.spec.secondary_minor/4) + (s.spec.secondary_minor/32)) + s.secondary_offset ) );
    DrawScaleRect( ctx, ( s.secondary_front + (s.spec.secondary_minor/2) - s.secondary_offset + (s.spec.secondary_minor/3) ),
    					( s.secondary_front - s.secondary_offset + (s.spec.secondary_minor/2) + (5 * (s.spec.secondary_minor/6) ) ),
    					( (s.spec.secondary_minor/4) + s.secondary_offset ),
    					( ((s.spec.secondary_minor/4) + (s.spec.secondary_minor/32)) + s.secondary_offset ) );
  

    // draw secondary holder
    ctx.fillStyle = "black";
    DrawScalePoly( ctx, [
			( s.secondary_front + (s.spec.secondary_minor/2) - s.secondary_offset + (s.spec.secondary_minor/6) ),
    		( - ((s.spec.secondary_minor/2) - s.secondary_offset) ),
			( s.secondary_front + (s.spec.secondary_minor/2) - s.secondary_offset + (s.spec.secondary_minor/6) ) + (s.spec.secondary_minor/6),
    		( - ((s.spec.secondary_minor/2) - s.secondary_offset) ),
			( s.secondary_front + (s.spec.secondary_minor/2) - s.secondary_offset + (s.spec.secondary_minor/6) ) + (s.spec.secondary_minor/6),
   			( (s.spec.secondary_minor/2) + s.secondary_offset ),
    		( s.secondary_front - (s.spec.secondary_minor/2) - s.secondary_offset + (s.spec.secondary_minor/6) ),
    		( (s.spec.secondary_minor/2) + s.secondary_offset ) ] );

    // draw mount plate
    ctx.fillStyle = "black";
    DrawScaleRect( ctx, ( s.secondary_front - s.secondary_offset + (s.spec.secondary_minor/2) + (3 * (s.spec.secondary_minor/6) ) ),
    					( s.secondary_front - s.secondary_offset + (s.spec.secondary_minor/2) + (4 * (s.spec.secondary_minor/6) ) ),
    					( -((s.spec.secondary_minor/2) - s.secondary_offset) ),
    					(   (s.spec.secondary_minor/2) + s.secondary_offset) );
}

// draw_focuser
function DrawFocuser( ctx, s ) {

    // --- draw drawtube ---
	var l = s.secondary_front - (s.spec.focus_diam/2);
	var r = s.secondary_front + (s.spec.focus_diam/2);
	var t = -(s.spec.tube_id/2) - s.spec.focus_height;
	var b = -(s.spec.tube_id/2);
	if ( s.spec.focus_diam > 0 ) {
	    var lingrad = ctx.createLinearGradient( -l*xyscale, 0,  -r*xyscale, 0 );
	    lingrad.addColorStop( 0, "#b0b0b0" );
	    lingrad.addColorStop( 1, "#303030" );
		ctx.fillStyle = lingrad; 	    
		DrawScaleRect( ctx, l, r, t, b );
	}

    // draw edges
    ctx.fillStyle = "black";
    DrawScaleRect( ctx, l - 0.125, l, t, b );
    DrawScaleRect( ctx, r, r + 0.125, t, b );

    // draw upper outer sides
    DrawScaleRect( ctx, l - 0.375, l - 0.12, t, -((s.tube_od/2.0) + (s.spec.focus_height/2.0) + 0.125) );
    DrawScaleRect( ctx, r + 0.12, r + 0.375, t, -((s.tube_od/2.0) + (s.spec.focus_height/2.0) + 0.125) );

    // --- draw holder ---
    ctx.fillStyle = "black";
    DrawScalePoly( ctx, [
		    l - 0.25,
		    -s.tube_od/2.0,		    
		    l - 0.25,
		    -((s.tube_od/2.0) + (s.spec.focus_height/2.0)),		    
		    (l - 0.25) - 0.4,
		    -((s.tube_od/2.0) + (s.spec.focus_height/2.0)),		    
		    (l - 0.25) - 0.6,
		    -((s.tube_od/2.0) + (s.spec.focus_height/3.0)),		    
		    (l - 0.25) - 0.6,
		    -s.tube_od/2.0 ] );
    DrawScalePoly( ctx, [		   
		    r + 0.25,
		    -(s.tube_od/2.0),
		    r + 0.25,
		    -((s.tube_od/2.0) + (s.spec.focus_height/2.0)),		    
		    (r + 0.25) + 0.4,
		    -((s.tube_od/2.0) + (s.spec.focus_height/2.0)),		    
		    (r + 0.25) + 0.6,
		    -((s.tube_od/2.0) + (s.spec.focus_height/3.0)),
		    (r + 0.25) + 0.6,
		    -s.tube_od/2.0 ] ); 
}

    // --- draw focal plane ---
function DrawFocalPlane( ctx, s ) {
	ctx.save();
	ctx.lineWidth = 3;
    ctx.strokeStyle = "#606060"; // dark gray
    DrawScaleLine( ctx, s.secondary_front - (s.illum_wid_75 / 2), -s.focal_plane_height, s.secondary_front + (s.illum_wid_75 / 2), -s.focal_plane_height );

   	if ( s.illum_wid_100 > 0.0 ) {  // Don't draw 100% focal plane if diagonal is too small  
	    ctx.strokeStyle = "#CCCC00"; //gold
	    DrawScaleLine( ctx, s.secondary_front - (s.illum_wid_100 / 2), -s.focal_plane_height, s.secondary_front + (s.illum_wid_100 / 2), -s.focal_plane_height );
	}
	ctx.restore()
}

    // --- draw optical axis ---
function DrawAxis( ctx, s ) {
		ctx.strokeStyle = "blue";
        DrawScaleLine( ctx, s.spec.pri_fnt_tube_back, 0, s.secondary_front, 0 );
        DrawScaleLine( ctx, s.secondary_front, 0, s.secondary_front, -s.focal_plane_height );
}

   // --- draw on-center light cone ---
function DrawOnCenterRays( ctx, s ) {
    ctx.strokeStyle = "lime";
    for( var i=0; i<=5; i++ ) {
    	if ( s.illum_wid_100 <= 0.0 && ( i == 2  ||  i == 5 ) ) {  // Don't draw deflected rays if diagonal is too small
			RayWarning( ctx, s );
    		continue;
    	}
    	DrawScaleLine( ctx, s.ray[i][0], s.ray[i][1], s.ray[i][2], s.ray[i][3] );
    }
}

    // --- draw light cone at edge of 100% illum area ---
function Draw100Rays( ctx, s ) {
    ctx.strokeStyle = "red";
    for( var i=6; i<=11; i++ ) {
    	if ( s.illum_wid_100 <= 0.0 && ( i == 8  ||  i == 11 ) ) { // Don't draw deflected rays if diagonal is too small
			RayWarning( ctx, s );
    		continue;
    	}
    	DrawScaleLine( ctx, s.ray[i][0], s.ray[i][1], s.ray[i][2], s.ray[i][3] );
    }
}

    // --- draw light cone at edge of 75% illum area ---
function Draw75Rays( ctx, s ) {
    ctx.strokeStyle = "yellow";
    for( var i=12; i<=17; i++ ) {
    	if ( s.illum_wid_75 <= 0.0 && ( i == 13  ||  i == 17 ) ) { // Don't draw deflected rays if diagonal is too small
			RayWarning( ctx, s );
    		continue;
    	}
    	DrawScaleLine( ctx, s.ray[i][0], s.ray[i][1], s.ray[i][2], s.ray[i][3] );
    }
}

function RayWarning( ctx, s ) {
		ctx.save();
    	ctx.font = "bold 24px sans-serif";
    	ctx.textAlign = "center";
    	ctx.fillStyle = "red";
		ctx.fillText( "Some Rays miss Diagonal (and are stopped there)", -xyscale * .9 * ( s.tube_len / 2 ), - xyscale * 1.5 * ( s.tube_od / 2 ) );
		ctx.restore();
}

// draw_baffles
function DrawBaffles( ctx, s ) {

    var thick = s.mirror_thick / 4.0;
    var tube_rad = s.spec.tube_id / 2.0;

    // draw baffle at front of tube
    var tall = ( (s.spec.tube_id - s.front_aper_diam) / 2.0 );
    if ( tall <= 0 ) { // Baffle is outside of tube, give up
    	ctx.font = "bold 24px sans-serif";
    	ctx.textAlign = "center";
    	ctx.fillStyle = "red";
		ctx.fillText( "Baffles Disabled due to Telescope Design Problems", -xyscale * .9 * ( s.tube_len / 2 ), - xyscale * 1.2 * ( s.tube_od / 2 ) );
    	return;  
    }
    ctx.fillStyle = "#996600"; //Tan

	// Draw Front baffle
    DrawScaleRect( ctx, s.tube_len-thick, s.tube_len, -tube_rad, -(tube_rad - tall) );
    DrawScaleRect( ctx, s.tube_len-thick, s.tube_len,  tube_rad,  (tube_rad - tall) );

    // draw other baffles
    for( var x=0; x<s.num_baffles; x++ ) {
        tall = ( ( s.spec.tube_id - s.baff_diam[x] ) / 2.0 );
    	DrawScaleRect( ctx, s.baff_pos[x] - (thick / 2), s.baff_pos[x] + (thick / 2), -tube_rad, -(tube_rad - tall) );
    	DrawScaleRect( ctx, s.baff_pos[x] - (thick / 2), s.baff_pos[x] + (thick / 2),  tube_rad,  (tube_rad - tall) );
    }
}

//------------------------------------------------------------------------------
// Draw a scaled, filled rectangle w/o border (reversing left/right polarity)
function DrawScaleRect( ctx, l, r, t, b ) { // Left, Right, Top, Bottom

	// Scale and translate to x, y, w, h
    var x = -(r * xyscale );	// was right, but with reversal is now left edge
    var w = -( l - r ) * xyscale; 	// width
    var y = t * xyscale;	// was top, now y
    var h = ( b - t ) * xyscale;	// height  
	ctx.fillRect( x, y, w, h );
}
	
// Draw a scaled line (reversing left/right polarity)
function DrawScaleLine( ctx, x1, y1, x2, y2 ) {
	ctx.beginPath();
	ctx.moveTo( -x1 * xyscale, y1 * xyscale );
	ctx.lineTo( -x2 * xyscale, y2 * xyscale );
	ctx.stroke();
}

// Draw a scaled polygon (reversing left/right polarity)
function DrawScalePoly( ctx, pnt ) {
	// pnt is an array of points [ x0, y0, x1, y1, ... ]
	ctx.beginPath();
	ctx.moveTo( -xyscale*pnt.shift(), xyscale*pnt.shift() );
	while( pnt.length > 0 ) {
		ctx.lineTo( -xyscale*pnt.shift(), xyscale*pnt.shift() );
	}
	ctx.closePath();
	ctx.fill();
}