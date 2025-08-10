from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel

class Book(BaseModel):
    title: str
    author: str | None = None
    source: str
    details_url: str | None = None
    download_url: str | None = None
    cover_image: str | None = None
    pages: int | None = None
    year: int | None = None
    category: str | None = None
    lang: str | None = None

class LibraryResponse(BaseModel):
    items: List[Book]
    count: int
    took_ms: int
    cached: bool
    hint: Optional[str] = None
