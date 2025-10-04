/*** cal.js: calculates variables based on users input ***/

/* Newt-Web: A Newtonian Telescope CAD Program
				
Copyright (C) 2011 Kenneth H. Slater
				
This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License 
Version 2 as published by the Free Software Foundation.
				
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
				
You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA */

function CalcScope( s ) {
// calculate variables based on users input
    s.focal_len = s.spec.primary_diam * s.spec.f_ratio;

    s.focal_plane_height = ( s.spec.tube_id / 2.0 ) + s.spec.tube_thick + s.spec.focus_height + s.spec.focus_extra + s.spec.focus_camera;

    s.illum_wid_100 = ( ( s.spec.secondary_minor * s.focal_len ) - ( s.spec.primary_diam * s.focal_plane_height ) ) /
                      ( s.focal_len - s.focal_plane_height );
	if ( s.illum_wid_100 < 0 ) { s.illum_wid_100 = 0; } // Should not be less than zero

    s.mirror_thick = s.spec.primary_diam / 6;

    if ( !s.spec.focus_to_tubefront ) { s.spec.focus_to_tubefront = s.spec.primary_diam; }

    s.tube_od = s.spec.tube_id + ( s.spec.tube_thick * 2 );

    // pri_fnt_tube_back is measured from back of tube to front surface of primary
    if ( !scope.spec.pri_fnt_tube_back ) { s.spec.pri_fnt_tube_back = s.mirror_thick + ( s.mirror_thick * 2.5 ); }

    // overall tube length
    s.tube_len = s.focal_len + s.spec.pri_fnt_tube_back - s.focal_plane_height + s.spec.focus_to_tubefront;

    // secondary_front is measured from back of tube to surface of secondary
    s.secondary_front = s.focal_len - s.focal_plane_height + s.spec.pri_fnt_tube_back;

    // mirror_to_focuser is measured from face of primary to face of secondary
    s.mirror_to_focuser = s.secondary_front - s.spec.pri_fnt_tube_back;

    s.secondary_offset = ( s.spec.primary_diam * s.spec.secondary_minor ) / ( 4 * s.focal_len );
}