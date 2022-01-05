#pragma once

#include <glm/glm.hpp>
#include <glm/gtc/quaternion.hpp>

#define GLM_FORCE_RADIANS

using namespace glm;

class Camera{
private:
    vec3 m_pos;
    quat m_orientation=quat(cosf(0)  ,sinf(0) * vec3(0. , 1.0 ,0.0));
    float m_speed=0.5;
    float m_TanFOV;
    
public:
    Camera(float x,float y, float z) : m_pos(vec3(x,y,z)) {}
    Camera(vec3 a) : m_pos(a) {}
    
    mat3 GetRotMat3();
    vec3 GetPos();
    void rotateCam(vec3);
    void moveCam(vec3);
    void changeFov(float);
    float getTanFov(); 

};