import unittest
import os
import secrets
from cryptography.fernet import Fernet
from engine.tools.filesystem import SecureFileSystem, FilePathManager

class TestEncryption(unittest.TestCase):
    def setUp(self):
        self.fs = SecureFileSystem()
        self.pm = FilePathManager()
        self.test_dir = os.path.join(self.pm.base_dir, "test_crypto")
        os.makedirs(self.test_dir, exist_ok=True)
        self.test_file = os.path.join(self.test_dir, "secret_draft.pdf.enc")
        
    def tearDown(self):
        if os.path.exists(self.test_file):
            os.remove(self.test_file)
        if os.path.exists(self.test_dir):
            os.rmdir(self.test_dir)

    def test_key_derivation_deterministic(self):
        salt = b'secure_salt_123'
        key1 = self.fs._derive_key("UserPassword123!", salt)
        key2 = self.fs._derive_key("UserPassword123!", salt)
        self.assertEqual(key1, key2)
        
        key3 = self.fs._derive_key("WrongPassword123!", salt)
        self.assertNotEqual(key1, key3)

    def test_encrypt_decrypt_roundtrip(self):
        raw_data = b"CONFIDENTIAL BNS 103 DRAFT. DO NOT LEAK."
        salt, enc_data = self.fs.encrypt_file_data(raw_data, "MySuperSecretKey")
        
        # Ensure it's encrypted
        self.assertNotEqual(raw_data, enc_data)
        self.assertFalse(b"CONFIDENTIAL" in enc_data)
        
        # Test Decrypt
        dec_data = self.fs.decrypt_file_data(salt, enc_data, "MySuperSecretKey")
        self.assertEqual(raw_data, dec_data)
        
    def test_wrong_password_decrypt(self):
        raw_data = b"CONFIDENTIAL BNS 103 DRAFT. DO NOT LEAK."
        salt, enc_data = self.fs.encrypt_file_data(raw_data, "MySuperSecretKey")
        
        with self.assertRaises(Exception):
            self.fs.decrypt_file_data(salt, enc_data, "WrongKey")
            
if __name__ == '__main__':
    unittest.main()
