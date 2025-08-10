"""
Data models for Orthodox Books API.
Defines the strict data contract for book objects.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field

class Book(BaseModel):
    """
    Orthodox book data model with strict schema compliance.
    """
    title: str = Field(..., description="Book title in UTF-8")
    author: Optional[str] = Field(None, description="Book author")
    source: Literal["coptic-treasures.com", "christianlib.com"] = Field(..., description="Source website")
    details_url: str = Field(..., description="Canonical URL to book page")
    download_url: Optional[str] = Field(None, description="Direct PDF download URL")
    cover_image: Optional[str] = Field(None, description="Cover image URL")
    lang: Literal["ar", "en", "unknown"] = Field("unknown", description="Book language")
    pages: Optional[int] = Field(None, description="Number of pages")
    size_mb: Optional[float] = Field(None, description="File size in MB")

class LibraryResponse(BaseModel):
    """
    API response model for library endpoints.
    """
    items: list[Book]
    count: int
    took_ms: int
    cached: bool

class HealthResponse(BaseModel):
    """
    Health check response model.
    """
    status: str
    timestamp: str
