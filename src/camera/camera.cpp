#include "camera.hpp"

#include <glm/glm.hpp>
#include <glm/gtc/quaternion.hpp>


void Camera::changeFov(float FOV){
    m_TanFOV=tanf(FOV/2);
}

void Camera::moveCam(vec3 d){
    m_pos+=d*m_speed;    
}

void Camera::rotateCam(vec3 r){
    m_orientation= m_orientation*quat(length(r), normalize(r));    
}

mat3 Camera::GetRotMat3(){
    return mat3(m_orientation);
}

vec3 Camera::GetPos(){
    return m_pos;
}

float Camera::getTanFov(){
    return m_TanFOV;
}