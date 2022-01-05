#pragma once

#include <glad/glad.h>
#include <GLFW/glfw3.h>

class Window
{
private:
    /* data */
    GLFWwindow *m_window;
    int m_width, m_height;

public:

    Window(int width, int height, const char *windowName, bool lockOnFocus);
    ~Window();

    void makeContextCurrent();

    void setSize(int w, int h);
    bool shouldClose();
    void swapBuffer();
    bool isKeyPressed(unsigned int);

    int getWidth();
    int getHeight();

    void lockMouse();
    void unlockMouse();

    void setMouseCallback(GLFWcursorposfun);

private:
    static void windowResizeCallback(GLFWwindow *w, int width, int height);
    static void windowFocusedCallback(GLFWwindow *, int);
};
