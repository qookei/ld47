varying highp vec2 vtx_tex;
varying highp vec4 vtx_rgba;

uniform sampler2D tex;

void main() {
	gl_FragColor = texture2D(tex, vtx_tex) * vtx_rgba;
}
