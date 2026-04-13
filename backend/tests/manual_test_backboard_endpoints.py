#!/usr/bin/env python3
"""
Test script for Backboard API endpoints.
Run this after starting the backend server to verify Backboard integration.
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
# You'll need to replace this with a valid JWT token from your login
TOKEN = "YOUR_JWT_TOKEN_HERE"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}


def test_add_preference():
    """Test adding a user preference."""
    print("\n1. Testing: Add User Preference")
    print("=" * 50)
    
    url = f"{BASE_URL}/memory/preferences"
    data = {
        "content": "I prefer morning meetings before 10 AM"
    }
    
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200


def test_get_preferences():
    """Test getting all user preferences."""
    print("\n2. Testing: Get User Preferences")
    print("=" * 50)
    
    url = f"{BASE_URL}/memory/preferences"
    
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200


def test_get_daily_briefing():
    """Test getting a daily briefing (creates a thread)."""
    print("\n3. Testing: Get Daily Briefing (creates thread)")
    print("=" * 50)
    
    url = f"{BASE_URL}/agent/briefing/daily"
    
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        briefing = data.get("briefing", {})
        thread_id = briefing.get("thread_id")
        
        print(f"Thread ID: {thread_id}")
        print(f"Briefing (first 200 chars): {briefing.get('analysis', '')[:200]}...")
        
        return thread_id
    else:
        print(f"Error: {response.text}")
        return None


def test_list_threads():
    """Test listing all threads."""
    print("\n4. Testing: List Threads")
    print("=" * 50)
    
    url = f"{BASE_URL}/threads"
    
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200


def test_get_thread_history(thread_id):
    """Test getting thread history."""
    print("\n5. Testing: Get Thread History")
    print("=" * 50)
    
    if not thread_id:
        print("Skipping: No thread_id available")
        return False
    
    url = f"{BASE_URL}/threads/{thread_id}"
    
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200


def test_ask_followup(thread_id):
    """Test asking a follow-up question."""
    print("\n6. Testing: Ask Follow-up Question")
    print("=" * 50)
    
    if not thread_id:
        print("Skipping: No thread_id available")
        return False
    
    url = f"{BASE_URL}/threads/{thread_id}/messages"
    data = {
        "question": "Can you tell me more about the urgent items?"
    }
    
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Response (first 200 chars): {data.get('response', '')[:200]}...")
        return True
    else:
        print(f"Error: {response.text}")
        return False


def main():
    """Run all tests."""
    print("=" * 50)
    print("Backboard API Endpoints Test Suite")
    print("=" * 50)
    print(f"Base URL: {BASE_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    
    if TOKEN == "YOUR_JWT_TOKEN_HERE":
        print("\n❌ ERROR: Please set a valid JWT token in the script")
        print("   1. Login to the application")
        print("   2. Get your JWT token from localStorage or the login response")
        print("   3. Update the TOKEN variable in this script")
        return
    
    results = []
    
    # Test memory endpoints
    results.append(("Add Preference", test_add_preference()))
    results.append(("Get Preferences", test_get_preferences()))
    
    # Test briefing (creates thread)
    thread_id = test_get_daily_briefing()
    results.append(("Get Daily Briefing", thread_id is not None))
    
    # Test thread endpoints
    results.append(("List Threads", test_list_threads()))
    results.append(("Get Thread History", test_get_thread_history(thread_id)))
    results.append(("Ask Follow-up", test_ask_followup(thread_id)))
    
    # Print summary
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {passed}/{total} tests passed")


if __name__ == "__main__":
    main()
