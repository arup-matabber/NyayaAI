/*
 * backend/native/vram_guard.cpp
 * ===============================
 * Nyaya AI — VRAM Guard (C++ Extension)
 *
 * Prevents concurrent GPU memory access by multiple agents.
 * Uses std::atomic_flag spinlock to ensure only one agent
 * can access VRAM at a time, preventing OOM crashes.
 *
 * VRAM Budget:
 *   Total:  4096 MB (4 GB)
 *   Safety: 200 MB buffer
 *   Usable: 3896 MB max
 *
 * Build:
 *   g++ -O2 -shared -fPIC -std=c++17 \
 *       $(python3 -m pybind11 --includes) \
 *       vram_guard.cpp -o vram_guard$(python3-config --extension-suffix)
 */

#include <atomic>
#include <chrono>
#include <thread>
#include <cstdint>
#include <cstdio>

#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#endif

// ── VRAM Budget Constants ────────────────────────────────────────────────────

static constexpr uint64_t VRAM_TOTAL_MB     = 4096;   // 4 GB total
static constexpr uint64_t VRAM_SAFETY_MB    = 200;    // 200 MB safety buffer
static constexpr uint64_t VRAM_USABLE_MB    = VRAM_TOTAL_MB - VRAM_SAFETY_MB;  // 3896 MB
static constexpr uint64_t VRAM_HARD_CEIL_MB = VRAM_TOTAL_MB - 50;  // absolute hard ceiling

// ── Spinlock VRAM Guard ──────────────────────────────────────────────────────

static std::atomic_flag vram_lock = ATOMIC_FLAG_INIT;
static std::atomic<uint64_t> vram_allocated_mb{0};
static std::atomic<int> active_agents{0};

// Maximum time to wait for VRAM lock (10 seconds)
static constexpr int MAX_SPIN_MS = 10000;
static constexpr int SPIN_SLEEP_MS = 5;

/**
 * Acquire exclusive VRAM access.
 *
 * Spins until the lock is available or timeout is reached.
 * Returns true if acquired, false if timed out.
 */
bool acquire_vram(uint64_t requested_mb) {
    auto start = std::chrono::steady_clock::now();

    while (vram_lock.test_and_set(std::memory_order_acquire)) {
        auto now = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(now - start).count();

        if (elapsed > MAX_SPIN_MS) {
            fprintf(stderr, "[VRAMGuard] TIMEOUT: Could not acquire VRAM lock in %d ms\n", MAX_SPIN_MS);
            return false;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(SPIN_SLEEP_MS));
    }

    // Check VRAM budget before allowing access
    uint64_t current = vram_allocated_mb.load(std::memory_order_relaxed);
    if (current + requested_mb > VRAM_USABLE_MB) {
        fprintf(stderr, "[VRAMGuard] DENIED: Request %lu MB would exceed budget "
                "(current: %lu MB, max: %lu MB)\n",
                (unsigned long)requested_mb,
                (unsigned long)current,
                (unsigned long)VRAM_USABLE_MB);
        vram_lock.clear(std::memory_order_release);
        return false;
    }

    vram_allocated_mb.fetch_add(requested_mb, std::memory_order_relaxed);
    active_agents.fetch_add(1, std::memory_order_relaxed);

    fprintf(stderr, "[VRAMGuard] ACQUIRED: %lu MB (total: %lu / %lu MB)\n",
            (unsigned long)requested_mb,
            (unsigned long)vram_allocated_mb.load(),
            (unsigned long)VRAM_USABLE_MB);

    return true;
}

/**
 * Release VRAM access and free budget.
 */
void release_vram(uint64_t released_mb) {
    uint64_t current = vram_allocated_mb.load(std::memory_order_relaxed);
    if (released_mb > current) {
        released_mb = current;  // prevent underflow
    }

    vram_allocated_mb.fetch_sub(released_mb, std::memory_order_relaxed);
    active_agents.fetch_sub(1, std::memory_order_relaxed);

    fprintf(stderr, "[VRAMGuard] RELEASED: %lu MB (total: %lu / %lu MB)\n",
            (unsigned long)released_mb,
            (unsigned long)vram_allocated_mb.load(),
            (unsigned long)VRAM_USABLE_MB);

    vram_lock.clear(std::memory_order_release);
}

/**
 * Check if VRAM access is currently held.
 */
bool is_vram_locked() {
    return active_agents.load(std::memory_order_relaxed) > 0;
}

/**
 * Get current VRAM usage stats.
 */
uint64_t get_vram_allocated() {
    return vram_allocated_mb.load(std::memory_order_relaxed);
}

uint64_t get_vram_available() {
    return VRAM_USABLE_MB - vram_allocated_mb.load(std::memory_order_relaxed);
}

uint64_t get_vram_total() {
    return VRAM_TOTAL_MB;
}

uint64_t get_vram_safety_buffer() {
    return VRAM_SAFETY_MB;
}

int get_active_agents() {
    return active_agents.load(std::memory_order_relaxed);
}

/**
 * Emergency VRAM reset — use only if system is in a bad state.
 * Clears all tracking and releases the lock.
 */
void emergency_reset() {
    fprintf(stderr, "[VRAMGuard] EMERGENCY RESET — clearing all VRAM tracking\n");
    vram_allocated_mb.store(0, std::memory_order_relaxed);
    active_agents.store(0, std::memory_order_relaxed);
    vram_lock.clear(std::memory_order_release);
}


// ── pybind11 module ──────────────────────────────────────────────────────────

#ifdef USE_PYBIND11
#include <pybind11/pybind11.h>
namespace py = pybind11;

PYBIND11_MODULE(vram_guard, m) {
    m.doc() = "Nyaya AI VRAM Guard — prevents concurrent GPU memory access";

    m.def("acquire_vram", &acquire_vram,
          py::arg("requested_mb"),
          "Acquire exclusive VRAM access. Returns True if acquired.");

    m.def("release_vram", &release_vram,
          py::arg("released_mb"),
          "Release VRAM access and free budget.");

    m.def("is_vram_locked", &is_vram_locked,
          "Check if VRAM access is currently held.");

    m.def("get_vram_allocated", &get_vram_allocated,
          "Get current VRAM allocation in MB.");

    m.def("get_vram_available", &get_vram_available,
          "Get available VRAM budget in MB.");

    m.def("get_vram_total", &get_vram_total,
          "Get total VRAM capacity in MB.");

    m.def("get_vram_safety_buffer", &get_vram_safety_buffer,
          "Get VRAM safety buffer size in MB.");

    m.def("get_active_agents", &get_active_agents,
          "Get number of agents currently using VRAM.");

    m.def("emergency_reset", &emergency_reset,
          "Emergency reset — clears all VRAM tracking.");

    // Constants
    m.attr("VRAM_TOTAL_MB") = VRAM_TOTAL_MB;
    m.attr("VRAM_SAFETY_MB") = VRAM_SAFETY_MB;
    m.attr("VRAM_USABLE_MB") = VRAM_USABLE_MB;
}
#endif
