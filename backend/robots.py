"""robots.txt fetch + allow/deny evaluation (minimal).

We only need to confirm disallow rules for the user-agent '*'. A polite UA string
with contact email should be used by the Playwright context.
"""
from __future__ import annotations

import httpx
from functools import lru_cache
from typing import List


@lru_cache(maxsize=32)
def fetch_robots(base: str) -> List[str]:
    url = base.rstrip('/') + '/robots.txt'
    try:
        r = httpx.get(url, timeout=8.0)
        if r.status_code != 200 or 'Disallow' not in r.text:
            return []
        lines = []
        active = False
        for line in r.text.splitlines():
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if line.lower().startswith('user-agent:'):
                ua = line.split(':',1)[1].strip()
                active = ua == '*'  # only track wildcard
            elif active and line.lower().startswith('disallow:'):
                path = line.split(':',1)[1].strip()
                if path:
                    lines.append(path)
        return lines
    except Exception:
        return []


def is_allowed(base: str, path: str) -> bool:
    disallows = fetch_robots(base)
    if not disallows:
        return True
    for rule in disallows:
        # simple prefix match
        if path.startswith(rule):
            return False
    return True
