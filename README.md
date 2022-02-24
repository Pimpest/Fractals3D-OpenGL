# Fractals3D-OpenGL

Implements a shader for raymarching.

Currently has the ability to render: 
> 1. Mandelbolt set
> 1. Mengers sponge
> 1. Sierpinski pyramid
> 1. A demo for reflections

Current Controls:

```
W/A/S/D     -- Classical x,z plane movement
Space/Shift -- Up/Down
Q/E         -- Roll Left/Right
```
**IMPORTANT:** Requires a decent GPU with at least OpenGl 4.3 suport  

## ToDo
- Add a custom fractal(a modifiable fractal using space folding)
- Add the ability to set settings(whether through defines or through console)
- Organize code/make it more consistent
- Import the shader source using string litterals(removes the need for copying the shader files to the bin folder)

## Building

The project requires Cmake and GCC/MinGW(you can probably use other compilers too, but you might run into issues when debugging)
For compiling on linux X11 development(or xkbcommon for wayland) packages are also required
  
