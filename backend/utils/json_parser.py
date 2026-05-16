import re
import json


def extract_json(text):

    text = re.sub(r"```json", "", text)

    text = re.sub(r"```", "", text).strip()

    match = re.search(r"\[.*\]", text, re.DOTALL)

    if not match:
        raise ValueError("JSON non trouvé")

    json_text = match.group()

    return json.loads(json_text)