attribute vec2 vtx_pos;
attribute vec2 tex_pos;
attribute vec4 rgba;

uniform mat4 model;
uniform mat4 projection;

varying highp vec2 vtx_tex;
varying highp vec4 vtx_rgba;

void main() {
	vtx_tex = tex_pos;
	vtx_rgba = rgba;
	gl_Position = projection * model * vec4(vtx_pos.xy, 0.0, 1.0);
}
