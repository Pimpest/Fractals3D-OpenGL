#version 330

out vec4 FragColor;

uniform vec2 iResolution;

void main(){
    vec2 pos = gl_FragCoord.xy;
    

    FragColor = vec4(pos.x/iResolution.x , 0, 0 ,1.0);
}