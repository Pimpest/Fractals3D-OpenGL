#pragma once

#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/quaternion.hpp>

#include "camera/camera.hpp"
#include "window.hpp"

#define FOWARD  GLFW_KEY_W
#define BACK    GLFW_KEY_S
#define LEFT    GLFW_KEY_A
#define RIGHT   GLFW_KEY_D
#define UP      GLFW_KEY_SPACE
#define DOWN    GLFW_KEY_LEFT_SHIFT
#define ROLL_L  GLFW_KEY_Q
#define ROLL_R  GLFW_KEY_E
#define UNLOCK  GLFW_KEY_ESCAPE

#ifdef _DEBUG
#define D(X) X
#else
#define D(X)
#endif


namespace Input
{

    Camera *cam = new Camera(0., 0., -5.);
    vec3 rotation = vec3(0,0,0);
    vec3 movement = vec3(0,0,0);
    double time=0;
    double xp=0,yp=0;
    float sensitivity=1.0;
    float fov=90;
    
    int w,h;
    

    void checkKeyPress(Window* win)
    {
        if(win->isKeyPressed(UNLOCK)){
            win->unlockMouse();
        }

        if(win->isKeyPressed(FOWARD)){
            movement.z+=1.;
        }
        if(win->isKeyPressed(BACK)){
            movement.z-=1.;
        }
        if(win->isKeyPressed(LEFT)){
            movement.x-=1.;
        }
        if(win->isKeyPressed(RIGHT)){
            movement.x+=1.;
        }
        if(win->isKeyPressed(UP)){
            movement.y+=1.;
        }
        if(win->isKeyPressed(DOWN)){
            movement.y-=1.;
        }

        if(win->isKeyPressed(ROLL_L)){
            rotation.z+=1;
        }
        if(win->isKeyPressed(ROLL_R)){
            rotation.z-=1;
        }
    }

    void cursorPosition(GLFWwindow *win, double x, double y){
        if(glfwGetInputMode(win,GLFW_CURSOR)==GLFW_CURSOR_DISABLED){

            double sens;
            glfwGetWindowSize(win,&w,&h);
            sens=sensitivity * radians(((float)fov))/w;
            rotation+= vec3((y),(x),0) * (float)sens;
            glfwSetCursorPos(win, 0, 0);
        }
    }

    void applyPendingChanges(){
        double timeDelta=glfwGetTime()-time;
        time += timeDelta;
        cam->moveCam(cam->GetRotMat3() * movement * (float)timeDelta);
        
        rotation.z *= timeDelta;

        cam->rotateCam(rotation);

        rotation = vec3(0);
        movement = vec3(0);
    }


}