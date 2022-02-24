#version 330

out vec4 fragColor;

uniform vec2 iResolution;
uniform vec3 iPosition;
uniform mat3 iDirection;
uniform float iFov;
uniform float iFractVar;


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


float dot2( vec3 v ) { return dot(v,v); }

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
		col = mix( col, vec3(0.5804, 0.4941, 0.2118), clamp(trap.y,0.0,1.0) );
	 	col = mix( col, vec3(0.0196, 0.3294, 0.4549), clamp(trap.z*trap.z,0.0,1.0) );
        col = mix( col, vec3(0.702, 0.0196, 0.6471), clamp(pow(trap.w,6.0),0.0,1.0) );
        col *= 0.5;
    color = col;

    return 0.25*log(d)*sqrt(d)/dz;

}


vec4 map(vec3 pos){

    //vec3 p =mod(1 + pos,2.0 )-1.0;

    vec3 color=vec3(0.10, 0.25, 0.00);
    float d = DE_Mandelbulb(pos, color);
    
    
    return vec4(d,color);
}

vec3 calcNormal(vec3 pos)
{
    vec2 e=vec2(.001,0.);
    
    return normalize(vec3(
        map(pos+e.xyy).x-map(pos-e.xyy).x,
        map(pos+e.yxy).x-map(pos-e.yxy).x,
        map(pos+e.yyx).x-map(pos-e.yyx).x));
}

vec4 march(vec3 ro,vec3 rd){
    vec4 res=vec4(-1.);
    
    float t=.001;
    float tmax=20.;
    for(int i=0;i<256&&t<tmax;i++){
        vec4 h=map(ro+t*rd);
        if(h.x<.001){res=vec4(t,h.yzw);break;}
        t+=h.x;
    }
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
    float tmax=20.;

    vec4 h=map(ro+t*rd);
    float m = 1.0;
    for(int i=0;i<128&&t<tmax;i++){
        h=map(ro+t*rd);
        if(h.x<.001){m=0.001; break;}
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

        vec3 sun_dir=normalize(vec3(-.8,.4,-.5));

        if(tuvw.x>0.0){
            vec3 pos=tuvw.x*rd+ro;
            vec3 nor=calcNormal(pos);

            vec3 mate =vec3(0.05,0.15,0.02);
            mate = tuvw.yzw;

            float occ = calcOcclusion(pos,nor);

            float sun_dif = clamp(dot(nor,sun_dir),0.,1.);
            float sun_sha = step(shadow( pos+nor*0.004,sun_dir),0.00);
            float sky_dif = clamp(0.5 + 0.5*dot(nor,vec3(0.0,1.0,0.0)), 0.0, 1.0);
            float bou_dif = clamp(0.5 + 0.5*dot(nor,vec3(0.0,-1.0,0.0)), 0.0, 1.0);

            
            col  = mate*  vec3(7.00, 5.00, 4.00)*sun_dif*sun_sha;
            col += mate*vec3(0.5,0.8,0.9)*sky_dif*occ;
            col += mate*vec3(0.3451, 0.2627, 0.1529)*bou_dif*occ;
            //col=vec3(occ*occ);

        }
        else{
            col=vec3(0.0, 0.6, 1.0) * (0.75+rd.y/4.0);

            

            float sun_dif=clamp(clamp(dot(rd,sun_dir),0.,1.)*40.0 -38,0,1.0 );

            col +=(vec3(1.0, 0.9333, 0.0275)-col)*sun_dif;

        }
        col = pow(col, vec3(0.4545));

        //col=pow(col,vec3(.45));
        tot+=col;
    }
    tot/= 4.0;

    tot += sin(gl_FragCoord.x*114.0)*sin(gl_FragCoord.y*211.1)/512.0;

    fragColor=vec4(tot,1.);
}