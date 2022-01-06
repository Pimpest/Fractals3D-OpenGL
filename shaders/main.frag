#version 330

#define MAX_STEPS 256
#define MAX_DIST 1000.f

out vec4 FragColor;

uniform vec2 iResolution;
uniform vec3 iPosition;
uniform mat3 iDirection;

vec3 modd(vec3 a, float b){
    return mod(a+b/2,b)-b/2;
}

float DE_sphere(vec3 p){
    return length(p) - 2.f;
}


float DE_segment(vec3 p)
{
    float r = 1.5f;

    vec3 a = vec3(0,0.75,1);
    vec3 b = vec3(10.0,0.75,0.0);

    vec3 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - r;
}


float map2world(vec3 p){
    
    return min(DE_sphere(p),DE_sphere(p-vec3(0.f,1.5f,0.f)));

}

vec3 surface_normal(vec3 p){
    float eps = 0.00001f;
    float centerDistance = map2world(p);
    float sx = map2world(p+vec3(eps,0,0));
    float sy = map2world(p+vec3(0,eps,0));
    float sz = map2world(p+vec3(0,0,eps));

    return normalize((vec3(sx,sy,sz) - centerDistance)/eps);
}

vec4 march(vec3 rd,vec3 ro){
    vec3 up = normalize(vec3(1.0,0.8,1.5));
    float d0=0;
    for(float i=0;i<MAX_STEPS;i++){
        vec3 p = d0*rd+ro;
        float d=map2world(p);
        if(d<0.0001f){

            vec3 sn = surface_normal(p);
            return vec4((cross(sn,up) + 1.f)/2.f ,1.f);
        }
        d0+=d;
        if(d0 > MAX_DIST) return vec4(0. , .75 , 1. ,1.);
    
    }
    return vec4(0. , 0.75 , 1. ,1.);

}


void main(){
    vec2 pos = gl_FragCoord.xy;
    
    vec2 uv=(gl_FragCoord.xy-0.5f*iResolution);

    vec3 ro = iPosition;
    vec3 rd = iDirection * normalize(vec3(uv,iResolution.y));

    vec4 Color= march(rd,ro); 

    FragColor = Color;
}