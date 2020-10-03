varying highp vec3 out_tex_coords;
varying highp vec4 out_rgba;

void main() {
	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * out_tex_coords.xyxy * out_rgba;
}
