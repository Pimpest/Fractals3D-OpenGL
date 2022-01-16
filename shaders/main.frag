#version 330

#define MAX_STEPS 512
#define MAX_DIST 50.f

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

    vec3 a = vec3(0,1.5,1);
    vec3 b = vec3(10.0,1.5,2.0);

    vec3 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - r;
}

float DE_plane(vec3 p){
    return abs(p.y+5.0);
}

float map2world(vec3 p){
    
    return min(DE_plane(p),min(DE_sphere(p),DE_sphere(p-vec3(5.f,0.f,0.f))));

}



vec3 surface_normal(vec3 p){
    float eps = 0.001f;
    float centerDistance = map2world(p);
    float sx = map2world(p+vec3(eps,0,0));
    float sy = map2world(p+vec3(0,eps,0));
    float sz = map2world(p+vec3(0,0,eps));

    return normalize((vec3(sx,sy,sz) - centerDistance)/eps);
}

float checkers(vec2 p){
    vec2 q = floor(p);
    return mod(q.x+q.y,2.);
}




vec4 march(vec3 rd,vec3 ro){

    vec3 col = vec3(0.7, 0.7, 0.9) - max(rd.y,0.0)*0.3;
    vec3 up = normalize(vec3(1.0,0.8,0.2));
    vec3 clor = vec3(0.0);
    float d0=0;
    float dist=0;
    float strength = 1.0;
    for(int i=0;i<MAX_STEPS;i++){
        vec3 p = d0*rd+ro;
        float d=map2world(p);
        if(d<0.001f){

            if(DE_plane(p)<0.001f){
                return vec4(clor + strength*vec3( checkers(p.xz)*clamp(3./dist,0.,1.) ), 1.f);
            }

            vec3 sn = surface_normal(p);

            if(DE_sphere(p-vec3(5.f,0.f,0.f))<0.001f){
                return vec4( clor + strength*vec3(0.0 , 0.0, 0.8)*(clamp( dot(sn,up), -4.f, 4.f) + 1.f)/2.f , 1.f);
            }
            

            
            clor += strength*(0.2 * vec3(0.7 , 0.75, 0.7)*(clamp( dot(sn,up), -4.f, 4.f) + 1.f)/2.f);
            //strength-=0.2;

            rd = rd - 2.*dot(rd,sn)*sn;
            ro = p;
            d0 = 0.1f;

        }
        d0+=d;
        dist+=d;
        if(dist > MAX_DIST) return vec4(strength*col+clor ,1.);
    
    }
    return vec4(strength*col+clor ,1.);

}


void main(){
    vec2 pos = gl_FragCoord.xy;
    
    vec2 uv=(gl_FragCoord.xy-0.5f*iResolution);

    vec3 ro = iPosition;
    vec3 rd = iDirection * normalize(vec3(uv,iResolution.y));

    vec4 Color= march(rd,ro); 

    FragColor = Color;
}