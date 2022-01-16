#pragma once

#include <glm/glm.hpp>
#include <string>
#include <list>


using namespace glm;

class Shader{
private:
    unsigned int m_ID;
    std::list<unsigned int> m_shaders;

public:
    Shader();
    ~Shader();

    void addFshader(const char* source);
    void addVshader(const char* source);

    void linkProgram();

    void Bind() const;
    void Unbind() const;

    void SetUniformMat3(mat3, const char* uniform);
    void SetUniformVec3(vec3, const char* uniform);
    void SetUniformVec2(vec2, const char* uniform);
    void SetUniform1f(float, const char* uniform);



private:    

    std::string readFromFile(const char* source);
    unsigned int CompileShader(unsigned int type, const char* source);
    void CheckForErrors(unsigned int tag, const char* type);

};

