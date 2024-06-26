#version 330

//#define MANDEL
#define TREES
//#define MUSL
//#define MENGER
//#define GRID
//#define CUBE

out vec4 fragColor;

uniform vec2 iResolution;
uniform vec3 iPosition;
uniform mat3 iDirection;
uniform float iFov;
uniform float iFractVar;

float dot2( vec3 v ) { return dot(v,v); }

float sdSphere(vec3 p,float r)
{
    return length(p)-r;
}

float sdCube(vec3 p, vec3 a){

    vec3 q = abs(p) - a;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdCube(vec2 p, vec2 a){
    vec2 q =abs(p) - a;
    return length(max(q,0.0)) + min (max(q.x,q.y),0.0);
}

float sdInfSide(vec3 p,float a){
    float pa = sdCube(p.xy, vec2(a));
    float pb = sdCube(p.yz, vec2(a));
    float pc = sdCube(p.zx, vec2(a));
    return min(pa,min(pb,pc) );
}
void planeFold(inout vec4 z, vec3 p, float n) {
    z.xyz -= 2.0 * min(0.0, dot(z.xyz, p) - n) * p;
}

void sierpinskiFold(inout vec4 z) {
	z.xy -= min(z.x + z.y, 0.0);
	z.xz -= min(z.x + z.z, 0.0);
	z.yz -= min(z.y + z.z, 0.0);
}

void mengerFold(inout vec4 z) {
	float a = min(z.x - z.y, 0.0);
	z.x -= a;
	z.y += a;
	a = min(z.x - z.z, 0.0);
	z.x -= a;
	z.z += a;
	a = min(z.y - z.z, 0.0);
	z.y -= a;
	z.z += a;
}
void scaleTranslateFold(inout vec4 z, in float s, in vec3 t) {
    z.xyz *= s;
    z.w *= abs(s);
    z.xyz += t;
}
void absFold(inout vec4 z, in vec3 c){
    z.xyz = abs(z.xyz-c)+c;
}
void sphereFold(inout vec4 z, float minR, float maxR) {
    float r2 = dot2(z.xyz);
    z *= max(maxR/ max(minR,r2), 1.0);
}
void inversionFold(inout vec4 z, float e){
    z *=  1/(dot2(z.xyz) + e);
}
void boxFold(inout vec4 z, vec3 r){
    z.xyz = clamp(z.xyz, -r, r) * 2.0 - z.xyz;
}
void rotX(inout vec4 z, float s, float c) {
	z.yz = vec2(c*z.y + s*z.z, c*z.z - s*z.y);
}
void rotY(inout vec4 z, float s, float c) {
	z.xz = vec2(c*z.x - s*z.z, c*z.z + s*z.x);
}
void rotZ(inout vec4 z, float s, float c) {
	z.xy = vec2(c*z.x + s*z.y, c*z.y - s*z.x);
}
void rotX(inout vec4 z, float a) {
	rotX(z, sin(a), cos(a));
}
void rotY(inout vec4 z, float a) {
	rotY(z, sin(a), cos(a));
}
void rotZ(inout vec4 z, float a) {
	rotZ(z, sin(a), cos(a));
}

//void rotx()


float udTriangle(vec3 p, vec3 v1, vec3 v2, vec3 v3 )
{
    vec3 v21 = v2 - v1; vec3 p1 = p - v1;
    vec3 v32 = v3 - v2; vec3 p2 = p - v2;
    vec3 v13 = v1 - v3; vec3 p3 = p - v3;
    vec3 nor = cross( v21, v13 );

    return sqrt( (sign(dot(cross(v21,nor),p1)) + 
                  sign(dot(cross(v32,nor),p2)) + 
                  sign(dot(cross(v13,nor),p3))<2.0) 
                  ?
                  min( min( 
                  dot2(v21*clamp(dot(v21,p1)/dot2(v21),0.0,1.0)-p1), 
                  dot2(v32*clamp(dot(v32,p2)/dot2(v32),0.0,1.0)-p2) ), 
                  dot2(v13*clamp(dot(v13,p3)/dot2(v13),0.0,1.0)-p3) )
                  :
                  dot(nor,p1)*dot(nor,p1)/dot2(nor) );
}



float DE_Menger(vec3 p){


    float base=4.0;

    float d = sdCube(p,vec3(base));

    float s = base;

    for(int i=0;i<3;i++){
        vec3  point = mod(p+s, 2.0*s) - s;
        s /= 3.0;
        float c = - sdInfSide(point,s);

        d = max(d,c);
    }

    return d;

}


float DE_Tetra(vec3 z)
{
    //z.y=abs(z.y);q    return DE(p);
    float base=5.0;
    int n=5;
    for(int i=0;i<n;i++){
        if(z.x+z.y<0) 
            z.xy=-z.yx;
        if(z.x+z.z<0) 
            z.xz=-z.zx;
        if(z.z+z.y<0) 
            z.zy=-z.yz;
        z = z*2.0 - base;
    }
    

    vec3 a1 = vec3( base, base, base);
    vec3 a2 = vec3(-base,-base, base);
    vec3 a3 = vec3( base,-base,-base);
    vec3 a4 = vec3(-base, base,-base);



    return pow(2.0, -float(n))*min(min(udTriangle(z,a2,a3,a1),udTriangle(z,a1,a2,a4)),min(udTriangle(z,a1,a4,a3),udTriangle(z,a4,a2,a3) ) );
}

float DE_Mandelbulb(vec3 pos,out vec3 color){

    float power =  iFractVar;//13.0;//(sin(0.1*mod(iTime,20.0*3.1414))*0.5+0.5)*6.0+2.0;
    vec3 w=pos;
    float dz = 1.0;
    float d = dot(w,w);

    //vec3 pol = vec3(dot(w,w), acos(w.y/wr), atan(w.x,w.z));

    vec4 trap = vec4(abs(w),d);

    for(int i=0;i<5;i++){
        dz = power * pow(d,(power-1.0)/2.0)*dz+1.0;

        float r = length(w);
        float theata = power * acos(w.y/r);
        float phi = power*atan(w.x,w.z);
        w = pos + pow(r,power) * vec3( sin(theata)*sin(phi), cos(theata), sin(theata)*cos(phi));

        d=dot(w,w);
        trap = min(trap, vec4(abs(w),d));
        if(d>256.0) break;


    }

    color = trap.yzw/max(max(trap.x,trap.y),max(trap.z,trap.w));

    vec3 col = vec3(0.01);
		col = mix( col, vec3(0.1569, 0.0667, 0.9412), clamp(trap.y,0.0,1.0) );
	 	col = mix( col, vec3(0.5961, 0.0902, 0.7529), clamp(trap.z*trap.z,0.0,1.0) );
        col = mix( col, vec3(0.702, 0.0196, 0.6471), clamp(pow(trap.w,6.0),0.0,1.0) );
        col *= 0.5;
    color = col;

    return 0.25*log(d)*sqrt(d)/dz;

}


vec4 map(vec3 pos){

    //vec3 p =mod(1 + pos,2.0 )-1.0;

    
    vec3 color=vec3(0.1529, 0.0275, 0.1412);
    #ifdef MANDEL
    float d = DE_Mandelbulb(pos,color);
    #elif defined(MENGER)
    float d = DE_Menger(pos);
    #elif defined(TREES)
    vec4 p = vec4(pos,1); // with scale
    
    color = vec3(1e20);
    for(int i=0;i<30;i++){
        rotY(p, iFractVar/2);
        absFold(p,vec3(0));
        mengerFold(p);
        scaleTranslateFold(p, 1.3, vec3(-2.0,-4.8,0) );
        color = min(color, abs((p.xyz)*vec3(0.24,2.28,7.6)));
        planeFold(p,vec3(0,0,-1),0);
    }
    color = normalize(color);
    color/=8;
    float d = sdCube(p.xyz, vec3(4.8))/p.w;
    
    #elif defined(MUSL)
    vec4 p = vec4(pos,1); // with scale
    
    color = vec3(1e20);
    for(int i=0;i<8;i++){
        boxFold(p,vec3(0.34));
        mengerFold(p);
        scaleTranslateFold(p, 3.28, vec3(-5.27,-0.34,0) );
        rotX(p, 1.57);
        
        color = min(color, abs((p.xyz)*vec3(0.24,2.28,7.6)));
    }
    color/=2.0;
    float d = sdCube(p.xyz, vec3(2))/p.w;
    #elif defined(GRID)
    vec4 p = vec4(pos,1); // with scale
    
    p.xyz = mod(p.xyz+1.5,3.0)-1.5;
    float d = sdCube(p.xyz, vec3(0.5))/p.w;
    #elif defined(CUBE)
    float d = sdCube(pos, vec3(0.5));
    #else
    float d = sdSphere(pos, 1);
    #endif

    
    return vec4(d,color);
}

vec3 calcNormal(vec3 pos)
{
    vec2 e=vec2(0.001,0.0);
    
    return normalize(vec3(
        map(pos+e.xyy).x-map(pos-e.xyy).x,
        map(pos+e.yxy).x-map(pos-e.yxy).x,
        map(pos+e.yyx).x-map(pos-e.yyx).x));
}

vec4 march(vec3 ro,vec3 rd){
    vec4 res=vec4(-1.0);
    
    float t=0.001;
    float tmax=20.0;
    vec4 h;
    for(int i=0;i<512&&t<tmax;i++){
        h=map(ro+t*rd);
        if(h.x<0.001){res=vec4(t,h.yzw);break;}
        t+=h.x;
    }
    //if(h.x<max(t*10,1)*0.001) res.x = t;
    return res;
}

float calcOcclusion(vec3 pos,vec3 nor )
{
	float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<5; i++ )
    {
        float h = 0.01 + 0.11*float(i)/4.0;
        vec3 opos = pos + h*nor;
        float d = map(opos).x;
        occ += (h-d)*sca;
        sca *= 0.95;
    }
    return clamp( 1.0 - 2.0*occ, 0.0, 1.0 );
}


float shadow(vec3 ro, vec3 rd){
    float t=0.0;
    float tmax=20.0;

    vec4 h=map(ro+t*rd);
    float m = 1.0;
    for(int i=0;i<128&&t<tmax;i++){
        h=map(ro+t*rd);
        if(h.x<0.001){m=0.001; break;}
        m=min(m,16.0*h.x/t);
        t+=h.x;
    }
    if(t>20.0) t=-1.0;
    return t;

}



void main(){
    
    
    
    vec3 tot=vec3(0.);
    for(int i=0;i<2;i++)
    for(int j=0;j<2;j++){

        vec2 offset = vec2(float(i),float(j)) / 2.0 - 0.5;

        vec2 p=(2.*(gl_FragCoord.xy + offset)-iResolution.xy)/iResolution.y;
    
        vec3 ro=iPosition;
        vec3 rd=iDirection*normalize(vec3(p,iFov));



        vec3 col=vec3(0.);
        
        vec4 tuvw=march(ro,rd);

        vec3 sun_dir=normalize(vec3(-0.8,0.4,-0.5));

        if(tuvw.x>-0.5){
            vec3 pos=tuvw.x*rd+ro;
            vec3 nor=calcNormal(pos);

            vec3 mate =vec3(0.05,0.15,0.02);
            mate = tuvw.yzw;

            float occ = calcOcclusion(pos,nor);

            float sun_dif = clamp(dot(nor,sun_dir),0.0,1.0);
            //float sun_sha = step(shadow( pos+nor*0.004,sun_dir),0.00);
            float sun_sha = 1.0;
            float sky_dif = clamp(0.5 + 0.5*dot(nor,vec3(0.0,1.0,0.0)), 0.0, 1.0);
            float bou_dif = clamp(0.5 + 0.5*dot(nor,vec3(0.0,-1.0,0.0)), 0.0, 1.0);

            
            col  = mate*  vec3(7.00, 5.00, 4.00)*sun_dif*sun_sha;
            col += mate*vec3(0.5,0.8,0.9)*sky_dif*occ;
            col += mate*vec3(0.3451, 0.2627, 0.1529)*bou_dif*occ;
            //col=vec3(occ*occ);

        }
        else{
            col=vec3(0.2627, 0.0118, 0.3608) * (0.6+rd.y*0.5);

            

            float sun_dif=clamp(clamp(dot(rd,sun_dir), 0.0, 1.0)*40.0 -38, 0, 1.0 );

            //col +=(vec3(1.0, 0.9333, 0.0275)-col)*sun_dif;

        }
        col = pow(col, vec3(0.4545));

        //col=pow(col,vec3(.45));
        tot+=col;
    }
    tot/= 4.0;

    tot += sin(gl_FragCoord.x*114.0)*sin(gl_FragCoord.y*211.1)/512.0;

    fragColor=vec4(tot,1.0);
}