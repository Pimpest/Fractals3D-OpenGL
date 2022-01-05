#version 330

#define MAX_STEPS 100f
#define MAX_DIST 1000f

out vec4 FragColor;

uniform vec2 iResolution;
uniform vec3 iPosition;
uniform mat3 iDirection;


float DE_sphere(vec3 p){
    return length(p) - .5;
}

float map2world(vec3 p){

    return min (DE_sphere(p),DE_sphere(p-vec3(0,0.4,0)));
}

vec4 march(vec3 rd,vec3 ro){
    float d0=0;
    for(float i=0;i<MAX_STEPS;i++){
        float d=map2world(d0*rd+ro);
        if(d<0.0001){
            return vec4(0. , 1. - i/MAX_STEPS , i/MAX_STEPS ,1.);
        }
        d0+=d;
        if(d0 > MAX_DIST) return vec4(0. , 0. , 0. ,1.);
    
    }
    return vec4(0. , 0. , 0. ,1.);

}


void main(){
    vec2 pos = gl_FragCoord.xy;
    
    vec2 uv=(gl_FragCoord.xy-0.5*iResolution);

    vec3 ro = iPosition;
    vec3 rd = iDirection * normalize(vec3(uv,iResolution.y));

    vec4 Color= march(rd,ro); 

    FragColor = Color;
}