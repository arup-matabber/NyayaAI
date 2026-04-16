/*
 * backend/native/token_pipe.cpp
 * ===============================
 * Nyaya AI — Zero-Copy Token Pipeline (C++ Extension)
 *
 * Shared-memory buffer for passing token streams between the
 * model server and orchestrator without Python-level serialization.
 *
 * Uses mmap-backed shared memory for zero-copy IPC.
 * Ring buffer design with configurable capacity.
 *
 * Build:
 *   g++ -O2 -shared -fPIC -std=c++17 \
 *       $(python3 -m pybind11 --includes) \
 *       token_pipe.cpp -o token_pipe$(python3-config --extension-suffix)
 */

#include <atomic>
#include <cstring>
#include <cstdint>
#include <cstdio>
#include <string>
#include <vector>

#ifdef _WIN32
#include <windows.h>
#else
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#endif

// ── Ring Buffer Configuration ────────────────────────────────────────────────

static constexpr size_t MAX_TOKEN_LEN  = 256;      // max bytes per token
static constexpr size_t RING_CAPACITY  = 4096;      // number of token slots
static constexpr size_t SHM_SIZE       = RING_CAPACITY * MAX_TOKEN_LEN + 4096;  // total shared memory

// ── Ring Buffer Structure ────────────────────────────────────────────────────

struct TokenSlot {
    uint16_t length;                     // actual token length
    char     data[MAX_TOKEN_LEN - 2];    // token bytes
};

struct RingBuffer {
    std::atomic<uint64_t> write_pos;     // writer's position
    std::atomic<uint64_t> read_pos;      // reader's position
    std::atomic<bool>     done;          // writer signals completion
    uint64_t              capacity;
    TokenSlot             slots[RING_CAPACITY];
};

// ── Token Pipe ───────────────────────────────────────────────────────────────

class TokenPipe {
public:
    TokenPipe(const std::string& name = "/nyaya_token_pipe")
        : shm_name_(name), buffer_(nullptr), is_owner_(false) {}

    ~TokenPipe() {
        close();
    }

    /**
     * Create a new shared memory region (writer side).
     */
    bool create() {
#ifdef _WIN32
        hMapFile_ = CreateFileMappingA(
            INVALID_HANDLE_VALUE, NULL, PAGE_READWRITE,
            0, sizeof(RingBuffer), shm_name_.c_str());
        if (!hMapFile_) return false;
        buffer_ = static_cast<RingBuffer*>(
            MapViewOfFile(hMapFile_, FILE_MAP_ALL_ACCESS, 0, 0, sizeof(RingBuffer)));
#else
        int fd = shm_open(shm_name_.c_str(), O_CREAT | O_RDWR, 0666);
        if (fd < 0) return false;
        ftruncate(fd, sizeof(RingBuffer));
        buffer_ = static_cast<RingBuffer*>(
            mmap(nullptr, sizeof(RingBuffer), PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0));
        ::close(fd);
#endif
        if (!buffer_) return false;

        // Initialize
        buffer_->write_pos.store(0, std::memory_order_relaxed);
        buffer_->read_pos.store(0, std::memory_order_relaxed);
        buffer_->done.store(false, std::memory_order_relaxed);
        buffer_->capacity = RING_CAPACITY;
        is_owner_ = true;

        fprintf(stderr, "[TokenPipe] Created shared memory: %s (%zu bytes)\n",
                shm_name_.c_str(), sizeof(RingBuffer));
        return true;
    }

    /**
     * Attach to an existing shared memory region (reader side).
     */
    bool attach() {
#ifdef _WIN32
        hMapFile_ = OpenFileMappingA(FILE_MAP_ALL_ACCESS, FALSE, shm_name_.c_str());
        if (!hMapFile_) return false;
        buffer_ = static_cast<RingBuffer*>(
            MapViewOfFile(hMapFile_, FILE_MAP_ALL_ACCESS, 0, 0, sizeof(RingBuffer)));
#else
        int fd = shm_open(shm_name_.c_str(), O_RDWR, 0666);
        if (fd < 0) return false;
        buffer_ = static_cast<RingBuffer*>(
            mmap(nullptr, sizeof(RingBuffer), PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0));
        ::close(fd);
#endif
        return buffer_ != nullptr;
    }

    /**
     * Write a token to the ring buffer (zero-copy).
     */
    bool write_token(const char* data, size_t length) {
        if (!buffer_ || length >= MAX_TOKEN_LEN - 2) return false;

        uint64_t wp = buffer_->write_pos.load(std::memory_order_relaxed);
        uint64_t rp = buffer_->read_pos.load(std::memory_order_acquire);

        // Check if buffer is full
        if (wp - rp >= RING_CAPACITY) {
            return false;  // buffer full, reader hasn't caught up
        }

        uint64_t slot_idx = wp % RING_CAPACITY;
        TokenSlot& slot = buffer_->slots[slot_idx];
        slot.length = static_cast<uint16_t>(length);
        std::memcpy(slot.data, data, length);
        slot.data[length] = '\0';

        buffer_->write_pos.store(wp + 1, std::memory_order_release);
        return true;
    }

    /**
     * Read a token from the ring buffer (zero-copy).
     * Returns empty string if no tokens available.
     */
    std::string read_token() {
        if (!buffer_) return "";

        uint64_t rp = buffer_->read_pos.load(std::memory_order_relaxed);
        uint64_t wp = buffer_->write_pos.load(std::memory_order_acquire);

        if (rp >= wp) {
            return "";  // no new tokens
        }

        uint64_t slot_idx = rp % RING_CAPACITY;
        const TokenSlot& slot = buffer_->slots[slot_idx];
        std::string token(slot.data, slot.length);

        buffer_->read_pos.store(rp + 1, std::memory_order_release);
        return token;
    }

    /**
     * Signal that writing is complete.
     */
    void signal_done() {
        if (buffer_) {
            buffer_->done.store(true, std::memory_order_release);
        }
    }

    /**
     * Check if writing is complete.
     */
    bool is_done() const {
        return buffer_ ? buffer_->done.load(std::memory_order_acquire) : true;
    }

    /**
     * Get number of tokens available to read.
     */
    uint64_t available() const {
        if (!buffer_) return 0;
        uint64_t wp = buffer_->write_pos.load(std::memory_order_acquire);
        uint64_t rp = buffer_->read_pos.load(std::memory_order_relaxed);
        return wp > rp ? wp - rp : 0;
    }

    /**
     * Reset the pipe for reuse.
     */
    void reset() {
        if (buffer_) {
            buffer_->write_pos.store(0, std::memory_order_relaxed);
            buffer_->read_pos.store(0, std::memory_order_relaxed);
            buffer_->done.store(false, std::memory_order_relaxed);
        }
    }

    /**
     * Close and cleanup shared memory.
     */
    void close() {
        if (buffer_) {
#ifdef _WIN32
            UnmapViewOfFile(buffer_);
            if (hMapFile_) CloseHandle(hMapFile_);
#else
            munmap(buffer_, sizeof(RingBuffer));
            if (is_owner_) {
                shm_unlink(shm_name_.c_str());
            }
#endif
            buffer_ = nullptr;
        }
    }

private:
    std::string  shm_name_;
    RingBuffer*  buffer_;
    bool         is_owner_;
#ifdef _WIN32
    HANDLE       hMapFile_ = nullptr;
#endif
};


// ── pybind11 module ──────────────────────────────────────────────────────────

#ifdef USE_PYBIND11
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
namespace py = pybind11;

PYBIND11_MODULE(token_pipe, m) {
    m.doc() = "Nyaya AI Zero-Copy Token Pipeline — shared memory IPC";

    py::class_<TokenPipe>(m, "TokenPipe")
        .def(py::init<const std::string&>(), py::arg("name") = "/nyaya_token_pipe")
        .def("create", &TokenPipe::create, "Create shared memory (writer side)")
        .def("attach", &TokenPipe::attach, "Attach to shared memory (reader side)")
        .def("write_token", &TokenPipe::write_token,
             py::arg("data"), py::arg("length"),
             "Write a token to the ring buffer")
        .def("read_token", &TokenPipe::read_token,
             "Read a token from the ring buffer")
        .def("signal_done", &TokenPipe::signal_done,
             "Signal that writing is complete")
        .def("is_done", &TokenPipe::is_done,
             "Check if writing is complete")
        .def("available", &TokenPipe::available,
             "Get number of tokens available to read")
        .def("reset", &TokenPipe::reset, "Reset pipe for reuse")
        .def("close", &TokenPipe::close, "Close and cleanup shared memory");

    m.attr("MAX_TOKEN_LEN") = MAX_TOKEN_LEN;
    m.attr("RING_CAPACITY") = RING_CAPACITY;
}
#endif
