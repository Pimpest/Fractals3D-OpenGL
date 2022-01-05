#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <glm/glm.hpp>
#include <glm/gtc/quaternion.hpp>


#include "application.hpp"
#include "window/window.hpp"
#include "camera/camera.hpp"
#include "window/input.hpp"
#include "shader/shader.hpp"

#define FOV 90

float verticies[]={
     1.0f, 1.0f,
    -1.0f, 1.0f,
    -1.0f,-1.0f,
     1.0f,-1.0f
};

unsigned int indicies[]={
    0, 1, 3,
    1, 2 ,3
};


int main()
{
    Input::fov = FOV;
    Input::cam->changeFov(FOV);

    glfwSetErrorCallback(glfwErrorCallback);
    if (!glfwInit())
    {
        std::cout << "[ERROR]: GLFW failed to intialize" << std::endl;
        exit(EXIT_FAILURE);
    }
    {
        Window* window=new Window(1280, 720, "RayMarcher",true);
        window->setMouseCallback(Input::cursorPosition);
        glfwSwapInterval(0);
        glEnable(GL_DEBUG_OUTPUT);
        glDebugMessageCallback(glErrorCallback, 0);

        unsigned int VBO, EBO, VAO;

        glGenBuffers(1, &VBO);
        

        glBindBuffer(GL_ARRAY_BUFFER, VBO);
       

        glBufferData(GL_ARRAY_BUFFER, sizeof(verticies), verticies, GL_STATIC_DRAW);
        
        glGenVertexArrays(1, &VAO);
        glBindVertexArray(VAO);

        glEnableVertexAttribArray(0);
        glVertexAttribPointer(0,2,GL_FLOAT,GL_FALSE,2*sizeof(float), (const void*) 0);

        glGenBuffers(1, &EBO);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indicies), indicies, GL_STATIC_DRAW);

        Shader shader;

        shader.addVshader("assets/vertex.vert");
        shader.addFshader("assets/main.frag");
        

        shader.linkProgram();

        shader.Bind();

        while(!window->shouldClose()){
            
            Input::checkKeyPress(window);

            Input::applyPendingChanges();
            
            glClearColor(0.0f, 0.0f, 1.0f, 1.0f);
            glClear(GL_COLOR_BUFFER_BIT);

            shader.SetUniformVec2(vec2(window->getWidth(),window->getHeight()), "iResolution");

            glDrawElements(GL_TRIANGLES, 6 , GL_UNSIGNED_INT, 0);

            window->swapBuffer();
            glfwPollEvents();
        }

        glDeleteBuffers(1, &VBO);
        glDeleteBuffers(1, &EBO);
        glDeleteVertexArrays(1, &VAO);


    }

    glfwTerminate();
    return 0;
}