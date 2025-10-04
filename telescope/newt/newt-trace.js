/*** newt-trace.js: Ray Tracing Code ***/

/* Newt-Web: A Newtonian Telescope CAD Program
				
Copyright (C) 2011 Kenneth H. Slater
				
This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License 
Version 2 as published by the Free Software Foundation.
				
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
				
You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA */// --------------------------------------------------------------------------
// ray trace on-center light cone, 100% illuminated area light cone,
//           and 70% illuminated area light cone
// --------------------------------------------------------------------------
function RayTrace( s )
{
    var angle_a, angle_b, angle_c, len_a, len_b, len_c;
    var x_coord, y_coord;
    var prim_edge_angle, prim_75_angle, ray_angle;
    var x_percent, y_percent, pass_x;
    var span_x, span_y;

    /* *** TRACE ON-CENTER LIGHT CONE *** */
    // calc where light from primary strikes diagonal - bottom side
    angle_a = Math.atan( (s.spec.primary_diam/2) / s.focal_len);
    angle_b = (180.0 / 57.296083) - angle_a - (135.0 / 57.296083);
    len_b = s.focal_len - s.focal_plane_height - (s.spec.primary_diam /2);
    len_a = ( len_b * Math.sin(angle_a) ) / Math.sin(angle_b);
    len_c = ( len_b * Math.sin(135.0 / 57.296083) ) / Math.sin(angle_b);

    // calc primary edge angle
    prim_edge_angle = angle_a / 2;

    // convert polar to rectangular
    x_coord = len_c * Math.cos(angle_a);
    y_coord = len_c * Math.sin(angle_a);

    // add offsets & invert y
    x_coord += s.spec.pri_fnt_tube_back;
    y_coord = (s.spec.primary_diam/2) - y_coord;

    // set coordinates for bottom incoming, reflected, & deflected ray
    s.ray[0][0] = s.tube_len + s.mirror_thick; // out front of tube
    s.ray[0][1] = s.spec.primary_diam/2;
    s.ray[0][2] = s.spec.pri_fnt_tube_back;
    s.ray[0][3] = s.spec.primary_diam/2;

    s.ray[1][0] = s.spec.pri_fnt_tube_back;
    s.ray[1][1] = s.spec.primary_diam/2;
    s.ray[1][2] = x_coord;
    s.ray[1][3] = y_coord;

    s.ray[2][0] = x_coord;
    s.ray[2][1] = y_coord;
    s.ray[2][2] = s.secondary_front;
    s.ray[2][3] = -s.focal_plane_height;

    // calc where light from primary strikes diagonal - top side
    angle_a = Math.atan( (s.spec.primary_diam/2) / s.focal_len);
    angle_b = (180.0 / 57.296083) - angle_a - (45.0 / 57.296083);
    len_b = s.focal_len - s.focal_plane_height + (s.spec.primary_diam /2);
    len_a = ( len_b * Math.sin(angle_a) ) / Math.sin(angle_b);
    len_c = ( len_b * Math.sin(45.0 / 57.296083) ) / Math.sin(angle_b);

    // convert polar to rectangular
    x_coord = len_c * Math.cos(angle_a);
    y_coord = len_c * Math.sin(angle_a);

    // add offsets & invert y
    x_coord += s.spec.pri_fnt_tube_back;
    y_coord = (s.spec.primary_diam/2) - y_coord;

    // trace top incoming, reflected, & deflected ray
    s.ray[3][0] = s.tube_len + s.mirror_thick;  // out front of tube
    s.ray[3][1] = -(s.spec.primary_diam/2);
    s.ray[3][2] = s.spec.pri_fnt_tube_back;
    s.ray[3][3] = -(s.spec.primary_diam/2);

    s.ray[4][0] = s.spec.pri_fnt_tube_back;
    s.ray[4][1] = -(s.spec.primary_diam/2);
    s.ray[4][2] = x_coord;
    s.ray[4][3] = -y_coord;

    s.ray[5][0] = x_coord;
    s.ray[5][1] = -y_coord;
    s.ray[5][2] = s.secondary_front;
    s.ray[5][3] = -s.focal_plane_height;


    /* *** TRACE lIGHT CONE AT EDGE OF 100% ILLUM AREA *** */
    // trace bottom incoming
    // calc angle of ray from diagonal to primary via rect-polar conversion
    ray_angle=Math.atan( ((s.spec.primary_diam/2) - ((s.spec.secondary_minor/2)+s.secondary_offset))
                   / (s.secondary_front-(s.spec.secondary_minor/2)-s.secondary_offset
                      - s.spec.pri_fnt_tube_back) );

    // calc reflection angle
    angle_a = (-(ray_angle - prim_edge_angle)) + prim_edge_angle;

    // calc polar coord for incoming ray
    angle_b = (180.0/57.296083) - angle_a - (90.0/57.296083);
    len_b = s.tube_len - s.spec.pri_fnt_tube_back + s.mirror_thick; // out front of tube
    len_c = (len_b * Math.sin(90.0/57.296083)) / Math.sin(angle_b);

    // convert polar to rect
    x_coord = len_c * Math.cos(angle_a);
    y_coord = len_c * Math.sin(angle_a);

    // trace bottom incoming ray
    s.ray[6][0] = s.spec.pri_fnt_tube_back;
    s.ray[6][1] = s.spec.primary_diam/2;
    s.ray[6][2] = s.spec.pri_fnt_tube_back+x_coord;
    s.ray[6][3] = (s.spec.primary_diam/2)-y_coord;

    // trace bottom reflected
    s.ray[7][0] = s.spec.pri_fnt_tube_back;
    s.ray[7][1] = s.spec.primary_diam/2;
    s.ray[7][2] = s.secondary_front-(s.spec.secondary_minor/2)-s.secondary_offset;
    s.ray[7][3] = (s.spec.secondary_minor/2)+s.secondary_offset;

    // trace bottom deflected
    s.ray[8][0] = s.secondary_front-(s.spec.secondary_minor/2)-s.secondary_offset;
    s.ray[8][1] = (s.spec.secondary_minor/2)+s.secondary_offset;
    s.ray[8][2] = s.secondary_front - (s.illum_wid_100/2);
    s.ray[8][3] = -s.focal_plane_height;

    // check for vignetting of 100% ray at focuser base
    y_percent = ( (s.spec.tube_id/2) + Math.abs(s.ray[8][1]) ) /
                ( Math.abs(s.ray[8][3]) + Math.abs(s.ray[8][1]) );
    y_percent = Math.abs(y_percent);            // in case it was negative
    x_percent = s.ray[8][2] - s.ray[8][0];
    pass_x = s.ray[8][0] + (y_percent * x_percent);
    if(pass_x < (s.secondary_front-(s.spec.focus_diam / 2.0)) ) {
    	s.vignetted_100 = true;
    } else {
    	s.vignetted_100 = false;
    }

    // trace top incoming ray (same as bottom, only higher)
    s.ray[9][0] = s.spec.pri_fnt_tube_back;
    s.ray[9][1] = -(s.spec.primary_diam/2);
    s.ray[9][2] = s.spec.pri_fnt_tube_back+x_coord;
    s.ray[9][3] = -((s.spec.primary_diam/2)+y_coord);

    // trace top reflected
    // calc angle of incoming ray
    ray_angle=Math.atan( y_coord / x_coord );

    // calc reflection angle of incoming ray
    angle_a = (-(ray_angle - (-prim_edge_angle))) + (-prim_edge_angle);

    // calc reflected ray to diagonal
    angle_c = (45.0 / 57.296083);
    angle_b = (180.0/57.296083) - (-angle_a) - angle_c;
    len_b = s.secondary_front + (s.spec.primary_diam/2) - s.spec.pri_fnt_tube_back;
    len_c = ( len_b * Math.sin(angle_c) ) / Math.sin(angle_b);

    // convert polar to rectangular
    x_coord = len_c * Math.cos(angle_a);
    y_coord = len_c * Math.sin(angle_a);

    // trace reflected ray to diagonal
    s.ray[10][0] = s.spec.pri_fnt_tube_back;
    s.ray[10][1] = -(s.spec.primary_diam/2);
    s.ray[10][2] = s.spec.pri_fnt_tube_back+x_coord;
    s.ray[10][3] = -((s.spec.primary_diam/2)+y_coord);

    // trace top deflected
    // calc angle of deflection from previous triangle
    angle_a = -angle_a;

    // calc triangle
    angle_b = 90.0 / 57.296083;
    angle_c = (180.0/57.296083) - angle_b - angle_a;
    len_c = s.focal_plane_height - ((s.spec.primary_diam/2)+y_coord);
    len_b = len_c / Math.cos(angle_a);
    len_a = len_b * Math.sin(angle_a);

    // calc coordinate of deflected-to-focal-plane
    x_coord = s.spec.pri_fnt_tube_back + x_coord - len_a;
    y_coord = -(((s.spec.primary_diam/2)+y_coord)+len_c);

    s.ray[11][0] = s.ray[10][2];
    s.ray[11][1] = s.ray[10][3];
    s.ray[11][2] = x_coord;
    s.ray[11][3] = y_coord;

    // average the focus point of the two deflected rays so they will meet
    s.ray[8][2] = ( s.ray[8][2] + s.ray[11][2] ) / 2;
    s.ray[11][2] = s.ray[8][2];
    s.ray[8][3] = ( s.ray[8][3] + s.ray[11][3] ) / 2;
    s.ray[11][3] = s.ray[8][3];


    /* *** TRACE LIGHT CONE AT EDGE OF 75% ILLUM AREA *** */
        // first, figure angle of primary at 75% zone
    ray_angle = Math.atan( -(s.spec.primary_diam/4) / s.focal_len);
    prim_75_angle = ray_angle / 2;

    // trace ray from primary at top 75% zone to top edge of diagonal
    s.ray[12][0] = s.spec.pri_fnt_tube_back;
    s.ray[12][1] = -(s.spec.primary_diam/4);
    s.ray[12][2] = s.secondary_front + (s.spec.secondary_minor/2) - s.secondary_offset;
    s.ray[12][3] = -((s.spec.secondary_minor/2) - s.secondary_offset);

    // trace ray from top edge of diagonal to focal plane
    // calc reflection angle
    ray_angle = Math.atan( (s.ray[12][1]-s.ray[12][3]) / (s.ray[12][2]-s.ray[12][0]) );

    // calc deflection angle
    angle_a = -ray_angle;

    // calc triangle
    angle_b = 90.0/57.296083;
    angle_c = (180.0/57.296083) - angle_b - angle_a;
    len_c = s.focal_plane_height - ((s.spec.secondary_minor/2) + s.secondary_offset);
    len_a = len_c * Math.tan(angle_a);

    // trace deflected ray
    s.ray[13][0] = s.ray[12][2];                // x of top corner of diagonal
    s.ray[13][1] = s.ray[12][3];                // y of top corner of diagonal
    s.ray[13][2] = s.ray[13][0] - len_a;        // x of edge of 75% zone
    s.ray[13][3] = -s.focal_plane_height; // y of edge of 75% zone

    // check for vignetting of 75% ray at focuser base
    y_percent = ( (s.spec.tube_id/2) - Math.abs(s.ray[13][1]) ) /
                ( Math.abs(s.ray[13][3]) - Math.abs(s.ray[13][1]) );
    y_percent = Math.abs(y_percent);            // in case it was negative
    x_percent = s.ray[13][0] - s.ray[13][2];
    pass_x = s.ray[13][0] - (y_percent * x_percent);
    if ( pass_x > (s.secondary_front+(s.spec.focus_diam / 2.0)) ) {
    	s.vignetted_75 = true;
    } else {
    	s.vignetted_75 = false;
    }

    // trace incoming ray to 75% zone of primary
    // first calc angle from primary for incoming ray
    angle_a = prim_75_angle - ray_angle + prim_75_angle;

    // save incoming ray angle for bottom ray reflection calcs
    ray_angle = angle_a;

    // then calc polar coord for incoming ray
    len_b = s.tube_len - s.spec.pri_fnt_tube_back + s.mirror_thick; // out front of tube
    len_c = len_b / Math.cos(-angle_a);

    // convert polar to rect
    x_coord = len_c * Math.cos(angle_a);
    y_coord = len_c * Math.sin(angle_a);

    // invert y coord to positive before adding offset
    y_coord = -y_coord;

    // add offset to 75% zone on surface of primary
    x_coord += s.spec.pri_fnt_tube_back;
    y_coord += -(s.spec.primary_diam/4);

    // trace incoming (top of 75% zone) ray
    s.ray[14][0] = s.spec.pri_fnt_tube_back;        // x of primary 75% zone
    s.ray[14][1] = -(s.spec.primary_diam/4);   // y of primary 75% zone
    s.ray[14][2] = x_coord;                   // x of incoming ray
    s.ray[14][3] = y_coord;                   // y of incoming ray

    // trace incoming (bottom of 75% zone) ray to bottom of mirror
    // copy top ray
    s.ray[15][0] = x_coord;                   // out front of tube
    s.ray[15][1] = y_coord + ((s.spec.primary_diam/4) * 3); // add 3/4 prim diam
    s.ray[15][2] = s.spec.pri_fnt_tube_back;
    s.ray[15][3] = s.spec.primary_diam/2;

    // calc front aperture diameter (for 75% zone)
    // find where ray intersects front of tube
    span_y = s.ray[15][1] - s.ray[15][3];
    span_x = s.ray[15][0] - s.ray[15][2];
    y_percent = ((span_x - s.mirror_thick) / span_x) * span_y;
    s.front_aper_diam = 2 * (s.ray[15][3] + y_percent); // 2 * y coord of ray

    // calc reflection angle
    angle_a = prim_edge_angle - ray_angle + prim_edge_angle;

    // save this angle for deflection calcs
    ray_angle = angle_a;

    // calc triangle
    angle_b = (180.0 / 57.296083) - angle_a - (135.0 / 57.296083);
    len_b = s.focal_len - s.focal_plane_height - (s.spec.primary_diam /2);
    len_a = ( len_b * Math.sin(angle_a) ) / Math.sin(angle_b);
    len_c = ( len_b * Math.sin(135.0 / 57.296083) ) / Math.sin(angle_b);

    // convert polar to rectangular
    x_coord = len_c * Math.cos(angle_a);
    y_coord = len_c * Math.sin(angle_a);

    // add offsets & invert y
    x_coord += s.spec.pri_fnt_tube_back;
    y_coord = (s.spec.primary_diam/2) - y_coord;

    // trace reflected ray from mirror to diagonal
    s.ray[16][0] = s.spec.pri_fnt_tube_back;
    s.ray[16][1] = s.spec.primary_diam/2;
    s.ray[16][2] = x_coord;
    s.ray[16][3] = y_coord;

    // trace deflected ray from diagonal to image plane
    // calc deflection angle
    angle_a = ray_angle;

    // calc triangle
    angle_b = 90.0/57.296083;
    angle_c = (180.0/57.296083) - angle_b - angle_a;
    len_c = s.focal_plane_height + y_coord;
    len_a = len_c * Math.tan(angle_a);

    // trace deflected ray
    s.ray[17][0] = x_coord;
    s.ray[17][1] = y_coord;
    s.ray[17][2] = x_coord + len_a;
    s.ray[17][3] = -s.focal_plane_height;

    // average the focus point of the two deflected rays so they will meet
    s.ray[13][2] = ( s.ray[13][2] + s.ray[17][2] ) / 2;
    s.ray[17][2] = s.ray[13][2];
    s.ray[13][3] = ( s.ray[13][3] + s.ray[17][3] ) / 2;
    s.ray[17][3] = s.ray[13][3];

    // memorize 75% zone width
    s.illum_wid_75 = 2.0 * (s.ray[13][2] - s.secondary_front);
    if ( s.illum_wid_75 <= 0 ) { s.illum_wid_75 = 0; } // Should not be less than zero
}


// --------------------------------------------------------------------------
// calc_baffles
// --------------------------------------------------------------------------
function CalcBaffles( s )
{
    // Note:
    // Algorithm from baflrefl.pas program which was derived from the
    // book "Telescope Optics: Eval & Design" by Ruttan and van VenRooij
    // and modified somewhat.

    var x;
    var KKm, KKb, Qx, Qy;
    var Vb, Um, Ub, Tm, Tb;
    var Wx, Wy, oWx, oWy;
    var QWm, QWb, Jx, Jy;
    var Major, Minor;
    var SM, QZm, QZb;
    var Px, Py, BD, Zx;

    // set default
    s.num_baffles = 0;

    // check for bad front aperture
    if(s.front_aper_diam >= s.spec.tube_id) return;  // no baffles

    // compute slope & y-intercept of KK' where K' is edge of mirror.
    // first check for fixed-size baffles - if so, all baffles will be the
    // same height as the front baffle.
    if( s.spec.fixed_baffles ) {
        KKm = 0.0001;                   // no slope (but canx div-by-0 errors)
        KKb = 0.5 * (s.spec.tube_id - s.front_aper_diam); // base is fixed size
    }
    else {
        KKm = 0.5 * (s.spec.primary_diam - s.front_aper_diam) /
                    (s.tube_len - s.spec.pri_fnt_tube_back);
        KKb = 0.5 * (s.spec.tube_id - s.spec.primary_diam);
    }

    // compute coordinates of Q
    Qx = s.focal_len;
    Qy = 0.5 * (s.spec.tube_id + s.spec.focus_diam);

    // compute J = intersection of KK' with line fron Q thru edge of diag(W)
    // Vm = -1.0
    // the surface of the diagonal
    Vb = 0.5 * s.spec.tube_id + s.mirror_to_focuser;

    // the line from P to the lower mirror edge
    Um = 0.5 * (s.spec.primary_diam - s.spec.focus_diam) / s.focal_len;
    Ub = 0.5 * (s.spec.tube_id - s.spec.primary_diam);

    // the line from Q to the upper mirror edge
    Tm = -Um;
    Tb = s.spec.tube_id - Ub;

    // the lower edge of the diagonal
    Wx = (Vb - Ub) / (Um + 1.0);
    Wy = Vb - Wx;

    // the upper edge of the diagonal
    oWx = (Vb - Tb) / (Tm + 1.0);
    oWy = Vb - oWx;

    QWm = (Qy - Wy) / (Qx - Wx);
    QWb = Wy - QWm * Wx;

    Jx = (QWb - KKb) / (KKm - QWm);
    Jy = QWm * Jx + QWb;

    // for debugging
    // compute the dimensions of the diagonal
    Major = Math.sqrt( (Wx-oWx)*(Wx-oWx) + (Wy-oWy)*(Wy-oWy) );
    Minor = Major / Math.sqrt(2.0);
    Minor = Minor;  // to shut compiler complaint up

    // let xmax = x-coordinate of J
    // let Z = A, where A = (0,0) by definition, ie fig. 19.4 is inverted
    Zx = 0.0;
    // Zy = 0.0

    SM = 0.0;                               // Safety Margin
    x = 0;

    do
    {
        // compute P = intersection of KK' and QZ

        QZm = (Qy) / (Qx - Zx);
        QZb = - QZm * Zx;

        Px = (QZb - KKb) / (KKm - QZm);
        if(Px > SM) Px -= SM;
        Py = KKm * Px + KKb;

        BD = s.spec.tube_id - 2.0 * Py;

        // set baffle variables
        if(Px < Jx) {
            s.baff_diam[x] = BD;
            s.baff_pos[x] = Px + s.spec.pri_fnt_tube_back;
            x++;
        }

        // let x = x-coordinate of P
        // let Z = (x,0)

        Zx = Px;

        // check for overflow
        if(x>37) {                          // only 40 elements in array and
            x=37;                           //   we need room for extras -
            break;                          //   calculated below
        }

        // until x > xmax
    } while (Zx <= Jx);                     // until (Zx > Jx)

    // output J
    BD = s.spec.tube_id - 2.0 * Jy;
    s.baff_diam[x] = BD;
    s.baff_pos[x] = Jx + s.spec.pri_fnt_tube_back;

    // set number of baffles (not including front one)
    s.num_baffles = x+1;


    // add 2 baffles around focuser --- not from book
    x++;
    s.baff_diam[x] = s.front_aper_diam;
    s.baff_pos[x] = s.secondary_front - (s.spec.focus_diam / 2) - 0.5;
    x++;
    s.baff_diam[x] = s.front_aper_diam;
    s.baff_pos[x] = s.secondary_front + (s.spec.focus_diam / 2) + 0.5;
    s.num_baffles = x+1;
}

