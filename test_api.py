import requests

import os
API_KEY = os.getenv("OPENROUTER_API_KEY")
url = "https://openrouter.ai/api/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "model": "openrouter/auto",
    "temperature": 0.3,
    "messages": [
        {
            "role": "user",
            "content": """
Generate 10 QA test cases in JSON only.

Fields:
title, type, steps, expected_result, priority

Feature: login, checkout
"""
        }
    ]
}

response = requests.post(url, headers=headers, json=data)

print(response.json())