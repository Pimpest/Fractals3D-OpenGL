cmake_minimum_required(VERSION 3.0.0)
project(Fractals3D VERSION 0.1.0)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(GLFW_BUILD_DOCS FALSE)
set(GLFW_BUILD_EXAMPLES FALSE)
set(GLFW_BUILD_TESTS FALSE)


add_subdirectory(include/glfw)
add_subdirectory(include/glad)
add_subdirectory(include/glm)



include_directories(src)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/out)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/out/lib)

file(GLOB_RECURSE SOURCE CMAKE_CONFIGURE_DEPENDS "src/*.cpp")

if(NOT CMAKE_BUILD_TYPE STREQUAL Release)
    set_directory_properties(PROPERTIES COMPILE_DEFINITIONS "_DEBUG")
endif()


add_executable(${PROJECT_NAME} ${SOURCE})

add_custom_target(
    copy-shaders ALL
    COMMENT "Copying shaders"
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_CURRENT_SOURCE_DIR}/shaders ${CMAKE_BINARY_DIR}/out/assets
)

target_link_libraries(${PROJECT_NAME} -static -static-libgcc -static-libstdc++ glm glad glfw ${GLFW_LIBRARIES} )