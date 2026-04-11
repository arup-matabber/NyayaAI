import unittest
import os
from engine.memory.conversation import ConversationMemory

class TestConversationMemory(unittest.TestCase):
    def setUp(self):
        self.test_path = "test_memory.json"
        if os.path.exists(self.test_path):
            os.remove(self.test_path)
            
        self.memory = ConversationMemory(memory_path=self.test_path, max_turns=2)

    def tearDown(self):
        if os.path.exists(self.test_path):
            os.remove(self.test_path)

    def test_fifo_ring_buffer(self):
        # max_turns=2 means 4 messages total (user + assistant = 1 turn)
        self.memory.add("user", "1")
        self.memory.add("assistant", "2")
        self.memory.add("user", "3")
        self.memory.add("assistant", "4")
        
        self.assertEqual(len(self.memory.turns), 4)
        
        # Add a 5th message
        self.memory.add("user", "5")
        
        # Should push out the 1st
        self.assertEqual(len(self.memory.turns), 4)
        self.assertEqual(self.memory.turns[0]["content"], "2")
        self.assertEqual(self.memory.turns[-1]["content"], "5")

    def test_context_string_builder(self):
        self.memory.add("user", "Hello")
        self.memory.add("assistant", "Hi there")
        
        ctx = self.memory.get_context_string()
        self.assertIn("User: Hello", ctx)
        self.assertIn("Assistant: Hi there", ctx)

    def test_clear_session(self):
        self.memory.add("user", "Hello")
        self.memory.clear()
        
        self.assertEqual(len(self.memory.turns), 0)
        self.assertEqual(self.memory.get_context_string(), "")
        
if __name__ == '__main__':
    unittest.main()
