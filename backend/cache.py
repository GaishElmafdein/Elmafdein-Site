"""Simple in-memory (process local) daily cache.

Key design:
 - Key includes (site|q|max_pages|max_follow|version)
 - TTL = 24h (can be tuned)
 - We don't cache empty lists to allow selector evolution.
"""
from __future__ import annotations

import time
from typing import Any, Dict, List, Optional, Tuple

DAILY_TTL = 24 * 60 * 60
_STORE: Dict[str, Tuple[float, List[Dict[str, Any]]]] = {}


def make_key(site: Optional[str], q: Optional[str], max_pages: int, max_follow: int, version: str) -> str:
    return f"v{version}|site={site or 'all'}|q={q or ''}|p={max_pages}|f={max_follow}".lower()


def get(key: str) -> Optional[List[Dict[str, Any]]]:
    rec = _STORE.get(key)
    if not rec:
        return None
    ts, data = rec
    if time.time() - ts > DAILY_TTL:
        _STORE.pop(key, None)
        return None
    if not data:
        return None
    return data


def set(key: str, data: List[Dict[str, Any]]):
    if not data:
        return
    _STORE[key] = (time.time(), data)


def purge():  # optional maintenance
    now = time.time()
    for k, (ts, _) in list(_STORE.items()):
        if now - ts > DAILY_TTL:
            _STORE.pop(k, None)
