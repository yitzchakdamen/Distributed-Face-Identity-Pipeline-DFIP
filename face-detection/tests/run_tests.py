#!/usr/bin/env python3
"""
Test runner script for Face Detection Service

This script runs all tests and provides a comprehensive test report.
Run individual test suites or all tests together.

Usage:
    python run_tests.py                    # Run all tests
    python run_tests.py --unit             # Run only unit tests
    python run_tests.py --integration      # Run only integration tests
    python run_tests.py --coverage         # Run tests with coverage report
    python run_tests.py --verbose          # Run tests with verbose output
"""

import unittest
import sys
import os
import argparse
from io import StringIO

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import test modules
from tests.test_face_detection import TestFaceExtractor, TestFaceObject
from tests.test_mongo_dal import TestSimpleGridFSWriter
from tests.test_kafka_publisher import TestKafkaPublisher
from tests.test_integration import TestFaceDetectionApp
from tests.test_utils import TestConfig, TestIdCreator


class ColoredTextTestResult(unittest.TextTestResult):
    """Custom test result class with colored output"""
    
    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self.success_count = 0
    
    def addSuccess(self, test):
        super().addSuccess(test)
        self.success_count += 1
        if self.verbosity > 1:
            self.stream.write(f"\033[92m✓ {test._testMethodName}\033[0m\n")
    
    def addError(self, test, err):
        super().addError(test, err)
        if self.verbosity > 1:
            self.stream.write(f"\033[91m✗ {test._testMethodName} (ERROR)\033[0m\n")
    
    def addFailure(self, test, err):
        super().addFailure(test, err)
        if self.verbosity > 1:
            self.stream.write(f"\033[91m✗ {test._testMethodName} (FAIL)\033[0m\n")
    
    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        if self.verbosity > 1:
            self.stream.write(f"\033[93m⚠ {test._testMethodName} (SKIPPED)\033[0m\n")


def create_test_suite(test_type='all'):
    """Create a test suite based on the specified type"""
    suite = unittest.TestSuite()
    
    if test_type in ['all', 'unit']:
        # Unit tests for individual components
        suite.addTest(unittest.makeSuite(TestFaceExtractor))
        suite.addTest(unittest.makeSuite(TestFaceObject))
        suite.addTest(unittest.makeSuite(TestSimpleGridFSWriter))
        suite.addTest(unittest.makeSuite(TestKafkaPublisher))
        suite.addTest(unittest.makeSuite(TestConfig))
        suite.addTest(unittest.makeSuite(TestIdCreator))
    
    if test_type in ['all', 'integration']:
        # Integration tests
        suite.addTest(unittest.makeSuite(TestFaceDetectionApp))
    
    return suite


def run_tests_with_coverage(test_suite):
    """Run tests with coverage reporting"""
    try:
        import coverage
    except ImportError:
        print("\033[93mWarning: coverage module not installed. Run: pip install coverage\033[0m")
        return run_tests_without_coverage(test_suite)
    
    cov = coverage.Coverage(source=['src', 'app', 'utils'])
    cov.start()
    
    # Run tests
    runner = unittest.TextTestRunner(
        verbosity=2,
        resultclass=ColoredTextTestResult,
        stream=sys.stdout
    )
    result = runner.run(test_suite)
    
    cov.stop()
    cov.save()
    
    print("\n" + "="*70)
    print("COVERAGE REPORT")
    print("="*70)
    cov.report()
    
    return result


def run_tests_without_coverage(test_suite, verbosity=2):
    """Run tests without coverage reporting"""
    runner = unittest.TextTestRunner(
        verbosity=verbosity,
        resultclass=ColoredTextTestResult,
        stream=sys.stdout
    )
    return runner.run(test_suite)


def print_test_summary(result):
    """Print a colored summary of test results"""
    total_tests = result.testsRun
    errors = len(result.errors)
    failures = len(result.failures)
    skipped = len(result.skipped)
    success = total_tests - errors - failures - skipped
    
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    print(f"\033[94mTotal Tests Run: {total_tests}\033[0m")
    print(f"\033[92mPassed: {success}\033[0m")
    
    if failures > 0:
        print(f"\033[91mFailed: {failures}\033[0m")
    
    if errors > 0:
        print(f"\033[91mErrors: {errors}\033[0m")
    
    if skipped > 0:
        print(f"\033[93mSkipped: {skipped}\033[0m")
    
    if errors == 0 and failures == 0:
        print(f"\n\033[92m🎉 ALL TESTS PASSED! 🎉\033[0m")
    else:
        print(f"\n\033[91m❌ SOME TESTS FAILED\033[0m")
        
        if result.errors:
            print("\nERRORS:")
            for test, error in result.errors:
                print(f"\033[91m{test}: {error}\033[0m")
        
        if result.failures:
            print("\nFAILURES:")
            for test, failure in result.failures:
                print(f"\033[91m{test}: {failure}\033[0m")


def main():
    """Main test runner function"""
    parser = argparse.ArgumentParser(description='Face Detection Service Test Runner')
    parser.add_argument('--unit', action='store_true', help='Run only unit tests')
    parser.add_argument('--integration', action='store_true', help='Run only integration tests')
    parser.add_argument('--coverage', action='store_true', help='Run tests with coverage report')
    parser.add_argument('--verbose', action='store_true', help='Verbose test output')
    parser.add_argument('--quiet', action='store_true', help='Minimal test output')
    
    args = parser.parse_args()
    
    # Determine test type
    if args.unit:
        test_type = 'unit'
        print("\033[94m🧪 Running Unit Tests Only\033[0m")
    elif args.integration:
        test_type = 'integration'
        print("\033[94m🔗 Running Integration Tests Only\033[0m")
    else:
        test_type = 'all'
        print("\033[94m🚀 Running All Tests\033[0m")
    
    # Create test suite
    test_suite = create_test_suite(test_type)
    
    print(f"\033[94mTest Suite Created: {test_suite.countTestCases()} tests\033[0m")
    print("="*70)
    
    # Determine verbosity
    if args.quiet:
        verbosity = 0
    elif args.verbose:
        verbosity = 2
    else:
        verbosity = 1
    
    # Run tests
    if args.coverage:
        result = run_tests_with_coverage(test_suite)
    else:
        result = run_tests_without_coverage(test_suite, verbosity)
    
    # Print summary
    print_test_summary(result)
    
    # Exit with appropriate code
    if result.errors or result.failures:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == '__main__':
    main()
