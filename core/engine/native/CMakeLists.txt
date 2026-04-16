cmake_minimum_required(VERSION 3.14)
project(nyaya_native LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# ── Find pybind11 ────────────────────────────────────────────────────────────
find_package(pybind11 QUIET)
if(NOT pybind11_FOUND)
    # Fallback: try to find via pip-installed pybind11
    execute_process(
        COMMAND python3 -m pybind11 --cmakedir
        OUTPUT_VARIABLE pybind11_DIR
        OUTPUT_STRIP_TRAILING_WHITESPACE
        ERROR_QUIET
    )
    if(pybind11_DIR)
        find_package(pybind11 REQUIRED PATHS ${pybind11_DIR})
    else()
        message(WARNING "pybind11 not found — building standalone binaries only")
    endif()
endif()

# ── VRAM Guard ────────────────────────────────────────────────────────────────
if(pybind11_FOUND)
    pybind11_add_module(vram_guard vram_guard.cpp)
    target_compile_definitions(vram_guard PRIVATE USE_PYBIND11)
    target_compile_options(vram_guard PRIVATE -O2)

    pybind11_add_module(token_pipe token_pipe.cpp)
    target_compile_definitions(token_pipe PRIVATE USE_PYBIND11)
    target_compile_options(token_pipe PRIVATE -O2)

    # Link pthread on Linux
    if(UNIX)
        target_link_libraries(vram_guard PRIVATE pthread)
        target_link_libraries(token_pipe PRIVATE pthread rt)
    endif()

    message(STATUS "Nyaya AI native extensions will be built with pybind11")
else()
    # Standalone test binaries
    add_executable(vram_guard_test vram_guard.cpp)
    target_compile_options(vram_guard_test PRIVATE -O2)
    if(UNIX)
        target_link_libraries(vram_guard_test pthread)
    endif()

    message(STATUS "Building standalone test binaries (no pybind11)")
endif()
