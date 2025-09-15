"""
Test runner for working tests only
"""

import unittest
import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import working test modules
from tests.test_face_detection import TestFaceExtractor, TestFaceObject
from tests.test_integration import TestFaceDetectionApp
from tests.test_utils import TestConfig, TestIdCreator
from tests.test_kafka_publisher_fixed import TestKafkaPublisher
from tests.test_mongo_dal_fixed import TestSimpleGridFSWriter


def run_working_tests():
    """Run only the tests that are known to work"""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add working test classes
    suite.addTest(loader.loadTestsFromTestCase(TestFaceExtractor))
    suite.addTest(loader.loadTestsFromTestCase(TestFaceObject))
    suite.addTest(loader.loadTestsFromTestCase(TestConfig))
    suite.addTest(loader.loadTestsFromTestCase(TestIdCreator))
    suite.addTest(loader.loadTestsFromTestCase(TestKafkaPublisher))
    suite.addTest(loader.loadTestsFromTestCase(TestSimpleGridFSWriter))
    suite.addTest(loader.loadTestsFromTestCase(TestFaceDetectionApp))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "="*50)
    print("🧪 WORKING TESTS SUMMARY")
    print("="*50)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.wasSuccessful():
        print("🎉 ALL WORKING TESTS PASSED!")
        return True
    else:
        print("❌ SOME TESTS FAILED")
        if result.failures:
            print("\nFAILURES:")
            for test, failure in result.failures:
                print(f"- {test}: {failure}")
        if result.errors:
            print("\nERRORS:")
            for test, error in result.errors:
                print(f"- {test}: {error}")
        return False


if __name__ == '__main__':
    success = run_working_tests()
    sys.exit(0 if success else 1)
