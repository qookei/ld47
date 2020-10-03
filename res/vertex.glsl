attribute vec3 vtx_pos;
attribute vec3 tex_coords;
attribute vec4 rgba;

varying highp vec3 out_tex_coords;
varying highp vec4 out_rgba;

uniform mat4 projection;

void main(void) {
	gl_Position = projection * vec4(vtx_pos.xyz, 0.0);
	out_tex_coords = tex_coords;
	out_rgba = rgba;
}
