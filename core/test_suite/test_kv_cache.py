import unittest
import numpy as np

# We'll use the imported SparseKVCache from where it's defined
from test_suite.test_config import TestConfig
from engine.inference.kv_cache import SparseKVCache, SparseAttentionKVCache, TINYGRAD_AVAILABLE

class TestKVCache(unittest.TestCase):
    def test_cache_allocation(self):
        # 4 layers, 8 heads, 128 max tokens, 32 dim
        cache = SparseKVCache(n_layers=4, n_heads=8, max_tokens=128, d_head=32)
        
        # Data should be np.int8
        self.assertEqual(cache.k.dtype, np.int8)
        self.assertEqual(cache.v.dtype, np.int8)
        
        # Check memory usage mb matches calculation:
        # 4 * 8 * 32 * 2 (k+v) = 2048 bytes per token.
        # Since tokens = 0 initially, memory_used_mb should be 0
        self.assertEqual(cache.memory_used_mb(), 0.0)

    def test_write_and_read(self):
        cache = SparseKVCache(n_layers=1, n_heads=2, max_tokens=10, d_head=4)
        
        k = np.array([[[100, -100, 50, 0], [10, 20, 30, 40]]]) # Shape: (1, 2, 4) ? Wait, write signature:
        # cache.write expects keys for `layer`, so keys shape should match `[:, self.pos]` 
        # so k shape should be (n_heads, d_head) => (2, 4)
        k = np.array([[100, -100, 50, 0], [10, 20, 30, 40]])
        v = np.array([[1, 2, 3, 4], [5, 6, 7, 8]])
        
        cache.write(0, k, v)
        cache.advance()
        
        keys_read, vals_read = cache.read(0)
        self.assertEqual(keys_read.shape, (2, 1, 4))
        self.assertEqual(vals_read.shape, (2, 1, 4))
        
        # Validate clipping and retrieval
        self.assertEqual(keys_read[0, 0, 0], 100)
        self.assertEqual(keys_read[0, 0, 1], -100)

    def test_ring_buffer_overflow(self):
        cache = SparseKVCache(n_layers=1, n_heads=1, max_tokens=2, d_head=1)
        
        k1 = np.array([[10]])
        v1 = np.array([[1]])
        cache.write(0, k1, v1)
        cache.advance()
        
        k2 = np.array([[20]])
        v2 = np.array([[2]])
        cache.write(0, k2, v2)
        cache.advance()
        
        k3 = np.array([[30]])
        v3 = np.array([[3]])
        cache.write(0, k3, v3) # This should overwrite index 0 since pos = 2 % 2 = 0
        cache.advance()
        
        self.assertEqual(cache.n_tokens, 2) # max_tokens reached
        
        keys_read, _ = cache.read(0)
        # 1st index (overwritten) -> 30, 2nd index -> 20. But read reads up to max limit.
        # Wait, the structure keeps k as shape (n_heads, max_tokens, d_head)
        # keys_read[0, 0, 0] must be 30, keys_read[0, 1, 0] must be 20.
        self.assertEqual(keys_read[0, 0, 0], 30)
        self.assertEqual(keys_read[0, 1, 0], 20)

    def test_over_clipping(self):
        cache = SparseKVCache(n_layers=1, n_heads=1, max_tokens=1, d_head=1)
        k1 = np.array([[500]])
        v1 = np.array([[-500]])
        cache.write(0, k1, v1)
        cache.advance()
        
        keys_read, vals_read = cache.read(0)
        self.assertEqual(keys_read[0, 0, 0], 127) # Clipped to max int8
        self.assertEqual(vals_read[0, 0, 0], -127) # Clipped to min int8

if __name__ == '__main__':
    unittest.main()
