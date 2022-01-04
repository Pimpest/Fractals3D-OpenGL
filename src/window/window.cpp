#include "window.hpp"
#include <iostream>

#ifdef _DEBUG
#define D(X) X
#else
#define D(X)
#endif

Window::Window(int width, int height, const char *windowName, bool focusOnLock)
{
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 6);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    m_window = glfwCreateWindow(width, height, windowName, NULL, NULL);
    glfwMakeContextCurrent(m_window);
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
    {
        std::cout << "[ERROR]: GLAD not inited correcty" << std::endl;
        exit(EXIT_FAILURE);
    }
    glViewport(0, 0, width, height);
    m_height = height;
    m_width = width;
    glfwSetWindowUserPointer(m_window, this);


    glfwSetWindowSizeCallback(m_window, Window::windowResizeCallback);
    if(focusOnLock){
        glfwSetWindowFocusCallback(m_window,windowFocusedCallback);
    }
}

Window::~Window()
{
    glfwDestroyWindow(m_window);
}

void Window::makeContextCurrent()
{
    glfwMakeContextCurrent(m_window);
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
    {
        std::cout << "[ERROR]: GLAD not inited correcty" << std::endl;
        exit(EXIT_FAILURE);
    }
}

void Window::setSize(int w, int h)
{
    glViewport(0, 0, w, h);
}

bool Window::shouldClose()
{
    return glfwWindowShouldClose(m_window);
}

void Window::swapBuffer()
{
    glfwSwapBuffers(m_window);
}

void Window::windowResizeCallback(GLFWwindow *w, int width, int height)
{
    static_cast<Window *>(glfwGetWindowUserPointer(w))->setSize(width, height);
}

void Window::windowFocusedCallback(GLFWwindow* w, int focused) 
{
    if(focused){
        static_cast<Window*>(glfwGetWindowUserPointer(w))->lockMouse();
    }
    else
        static_cast<Window*>(glfwGetWindowUserPointer(w))->unlockMouse();
}

int Window::getWidth()
{
    return m_width;
}

int Window::getHeight()
{
    return m_height;
}

void Window::lockMouse()
{
    glfwSetCursorPos(m_window,0,0);
    glfwSetInputMode(m_window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
}

void Window::unlockMouse()
{
    glfwSetInputMode(m_window, GLFW_CURSOR, GLFW_CURSOR_NORMAL);
}

void Window::setMouseCallback(GLFWcursorposfun func)
{
    glfwSetCursorPosCallback(m_window, func);
}

bool Window::isKeyPressed(unsigned int key)
{
    return glfwGetKey(m_window, key) == GLFW_PRESS;
}