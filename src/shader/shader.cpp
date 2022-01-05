#include "shader.hpp"
#include <glad/glad.h>
#include <glm/gtc/type_ptr.hpp>
#include <sstream>
#include <fstream>
#include <string>
#include <iostream>

#ifdef _DEBUG
#define D(X) X
#define ASSERT(X)      \
    if (X)             \
    {                  \
        __asm("int3"); \
    }
#else
#define D(X)
#define ASSERT(X)
#endif

std::string Shader::readFromFile(const char *source)
{
    std::string code;
    std::ifstream file;

    file.exceptions(std::ifstream::failbit | std::ifstream::badbit);
    try
    {
        file.open(source);
        std::stringstream shaderStream;
        shaderStream << file.rdbuf();
        code = shaderStream.str();
    }
    catch (const std::ifstream::failure &e)
    {
        std::cout << "[ERROR]: File not found on specified path" << std::endl;
        ASSERT(1)
        exit(EXIT_FAILURE);
    }
    
    return code;
}

unsigned int Shader::CompileShader(unsigned int type, const char *source)
{
    unsigned int id;
    id = glCreateShader(type);
    glShaderSource(id, 1, &source, NULL);
    glCompileShader(id);

    CheckForErrors(id, (type == GL_VERTEX_SHADER) ? "VERTEX" : "FRAGMENT");
    return id;
}

void Shader::CheckForErrors(unsigned int id, const char *type)
{
    int succes;
    char infoLog[1024];
    if (type != "PROGRAM")
    {
        glGetShaderiv(id, GL_COMPILE_STATUS, &succes);
        if (!succes)
        {
            glGetShaderInfoLog(id, 1024, NULL, infoLog);
            std::cout << "[Error]: failed to compile shader (" << type << ")\n"
                      << infoLog << std::endl;
            ASSERT(1)
            exit(EXIT_FAILURE);
        }
    }
    else
    {
        glGetProgramiv(id, GL_LINK_STATUS, &succes);
        if (!succes)
        {
            glGetProgramInfoLog(id, 1024, NULL, infoLog);
            std::cout << "[Error]: failed to link shader program\n"
                      << infoLog << std::endl;
            ASSERT(1)
            exit(EXIT_FAILURE);
        }
    }
}

Shader::Shader()
{
    m_ID = glCreateProgram();
}

Shader::~Shader() 
{
    glDeleteProgram(m_ID);
}

void Shader::addFshader(const char *source)
{
    int id = CompileShader(GL_FRAGMENT_SHADER, readFromFile(source).c_str());
    m_shaders.push_back(id);
    glAttachShader(m_ID, id);
}

void Shader::addVshader(const char *source)
{
    int id = CompileShader(GL_VERTEX_SHADER, readFromFile(source).c_str());
    m_shaders.push_back(id);
    glAttachShader(m_ID, id);
}

void Shader::linkProgram()
{
    glLinkProgram(m_ID);
    for (const auto &x : m_shaders)
    {
        glDeleteShader(x);
    }
    m_shaders.clear();
}

void Shader::Bind() const
{
    glUseProgram(m_ID);
}

void Shader::Unbind() const
{
    glUseProgram(0);
}

void Shader::SetUniformVec2(vec2 a, const char* uniform) 
{
    int loc=glGetUniformLocation(m_ID, uniform);
    if(loc!=-1)
        glUniform2fv(loc,1,value_ptr(a));
}