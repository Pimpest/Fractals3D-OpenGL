#pragma once

#include <iostream>
#include <glad/glad.h>

#ifdef _DEBUG
    #define D(X) X
    #define ASSERT(X) if(X) __asm("int3");
#else
    #define D(X)
    #define ASSERT(X)
#endif

void glfwErrorCallback(int error, const char* desc){
    std::cout<<"[ERROR]: "<<desc<<std::endl;
    exit(EXIT_FAILURE);
}
void glErrorCallback(GLenum source, GLenum type, GLuint id, GLenum severity, GLsizei length, const GLchar* desc, const void* userParam){
    std::cout<<((type == GL_DEBUG_TYPE_ERROR)? "[Error]: ":"[WARNING]; ")<< "TYPE = 0x"<<" SEVERITY = 0x" << severity << "\n" << desc << std::endl;

    if(type == GL_DEBUG_TYPE_ERROR){
        ASSERT(true)
        exit(EXIT_FAILURE);
    }
    
}