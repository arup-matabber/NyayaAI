import unittest
import os
import asyncio
from engine.agents.orchestrator import PipelineOrchestrator

class TestOrchestrator(unittest.TestCase):
    def setUp(self):
        # We need an orchestrator instance.
        # This will spin up the TieredModelManager and sqliteDBs locally.
        # Ensure that no previous instances are locking the network/VRAM.
        self.orchestrator = PipelineOrchestrator()
    
    def test_e2e_bail_application(self):
        # We will do an E2E test for Bail under BNS 103 (IPC 302).
        # We test that:
        # 1. Routing intercepts IPC and converts to BNS
        # 2. Template is used
        # 3. Flaw pass validates it
        # 4. A4 PDF is eventually created
        
        prompt = (
            "I need a bail application for my client Rahul Sharma. "
            "He has been charged under IPC 302 in the Delhi High Court. "
            "He has no prior criminal record and is the sole breadwinner."
        )
        
        # In a test suite ran asynchronously or synchronously, orchestrator will process it.
        # process_request is synchronous, using an event loop inside if necessary.
        result = self.orchestrator.process_request(prompt, 1)
        
        # 1. BNS check (should output BNS 103 instead of IPC 302)
        raw_output = result.get('output', '')
        self.assertIn("BNS 103", raw_output, "Failed to map IPC 302 to BNS 103 in E2E generation")
        
        # 2. Flaw check
        flaw_log = result.get('flaw_log', {})
        if flaw_log:
            flaws = flaw_log.get('flaws', [])
            self.assertEqual(len(flaws), 0, "Generated draft contained flaws according to critique pass")
        
        # 3. PDF creation
        pdf_path = result.get('pdf_path')
        self.assertIsNotNone(pdf_path)
        self.assertTrue(os.path.exists(pdf_path))
        self.assertTrue(os.path.getsize(pdf_path) > 0)
        
        # Cleanup
        os.remove(pdf_path)

if __name__ == '__main__':
    unittest.main()
