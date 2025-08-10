"""
Disk cache store for Orthodox books with TTL support.
Provides JSON-based caching with automatic expiration.
"""

import json
import os
import time
import logging
from typing import Any, Optional, Dict
from pathlib import Path

logger = logging.getLogger(__name__)

class CacheStore:
    """
    Simple disk-based cache with TTL (Time To Live) support.
    Stores data as JSON files with metadata.
    """
    
    def __init__(self, cache_dir: str = "cache_data", default_ttl_hours: int = 12):
        """
        Initialize cache store.
        
        Args:
            cache_dir: Directory to store cache files
            default_ttl_hours: Default time-to-live in hours
        """
        self.cache_dir = Path(cache_dir)
        self.default_ttl_hours = default_ttl_hours
        
        # Create cache directory if it doesn't exist
        self.cache_dir.mkdir(exist_ok=True)
        
        logger.info(f"📦 Cache store initialized: {self.cache_dir.absolute()}")
    
    def _get_cache_file_path(self, key: str) -> Path:
        """
        Get the file path for a cache key.
        
        Args:
            key: Cache key
            
        Returns:
            Path to cache file
        """
        # Sanitize key for filesystem
        safe_key = "".join(c for c in key if c.isalnum() or c in '-_').strip()
        if not safe_key:
            safe_key = "default"
        
        return self.cache_dir / f"{safe_key}.json"
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get data from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached data or None if not found/expired
        """
        try:
            cache_file = self._get_cache_file_path(key)
            
            if not cache_file.exists():
                return None
            
            # Read cache file
            with open(cache_file, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            
            # Check expiration
            expires_at = cache_data.get('expires_at', 0)
            if time.time() > expires_at:
                logger.debug(f"🗑️ Cache expired for key: {key}")
                # Remove expired file
                try:
                    cache_file.unlink()
                except OSError:
                    pass
                return None
            
            logger.debug(f"📦 Cache hit for key: {key}")
            return cache_data.get('data')
            
        except Exception as e:
            logger.warning(f"⚠️ Error reading cache for key {key}: {e}")
            return None
    
    def set(self, key: str, data: Any, ttl_hours: Optional[int] = None) -> bool:
        """
        Store data in cache.
        
        Args:
            key: Cache key
            data: Data to store (must be JSON serializable)
            ttl_hours: Time-to-live in hours (uses default if not specified)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            ttl_hours = ttl_hours or self.default_ttl_hours
            expires_at = time.time() + (ttl_hours * 3600)
            
            cache_data = {
                'data': data,
                'created_at': time.time(),
                'expires_at': expires_at,
                'ttl_hours': ttl_hours
            }
            
            cache_file = self._get_cache_file_path(key)
            
            # Write cache file
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2, default=self._json_serializer)
            
            logger.debug(f"💾 Cached data for key: {key} (TTL: {ttl_hours}h)")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error writing cache for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """
        Delete data from cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            cache_file = self._get_cache_file_path(key)
            
            if cache_file.exists():
                cache_file.unlink()
                logger.debug(f"🗑️ Deleted cache for key: {key}")
                return True
            
            return False
            
        except Exception as e:
            logger.warning(f"⚠️ Error deleting cache for key {key}: {e}")
            return False
    
    def clear(self) -> int:
        """
        Clear all cache files.
        
        Returns:
            Number of files deleted
        """
        try:
            count = 0
            for cache_file in self.cache_dir.glob("*.json"):
                try:
                    cache_file.unlink()
                    count += 1
                except OSError:
                    pass
            
            logger.info(f"🧹 Cleared {count} cache files")
            return count
            
        except Exception as e:
            logger.error(f"❌ Error clearing cache: {e}")
            return 0
    
    def cleanup_expired(self) -> int:
        """
        Remove all expired cache files.
        
        Returns:
            Number of expired files removed
        """
        try:
            count = 0
            current_time = time.time()
            
            for cache_file in self.cache_dir.glob("*.json"):
                try:
                    with open(cache_file, 'r', encoding='utf-8') as f:
                        cache_data = json.load(f)
                    
                    expires_at = cache_data.get('expires_at', 0)
                    if current_time > expires_at:
                        cache_file.unlink()
                        count += 1
                        
                except (OSError, json.JSONDecodeError):
                    # Invalid cache file, remove it
                    try:
                        cache_file.unlink()
                        count += 1
                    except OSError:
                        pass
            
            if count > 0:
                logger.info(f"🧹 Cleaned up {count} expired cache files")
            
            return count
            
        except Exception as e:
            logger.error(f"❌ Error cleaning up cache: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        try:
            cache_files = list(self.cache_dir.glob("*.json"))
            total_files = len(cache_files)
            total_size = 0
            valid_files = 0
            expired_files = 0
            current_time = time.time()
            
            for cache_file in cache_files:
                try:
                    total_size += cache_file.stat().st_size
                    
                    with open(cache_file, 'r', encoding='utf-8') as f:
                        cache_data = json.load(f)
                    
                    expires_at = cache_data.get('expires_at', 0)
                    if current_time > expires_at:
                        expired_files += 1
                    else:
                        valid_files += 1
                        
                except (OSError, json.JSONDecodeError):
                    expired_files += 1
            
            return {
                'total_files': total_files,
                'valid_files': valid_files,
                'expired_files': expired_files,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'cache_dir': str(self.cache_dir.absolute())
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting cache stats: {e}")
            return {}
    
    def _json_serializer(self, obj):
        """
        Custom JSON serializer for non-standard types.
        
        Args:
            obj: Object to serialize
            
        Returns:
            JSON-serializable representation
        """
        # Handle common non-serializable types
        if hasattr(obj, 'dict'):
            # Pydantic models
            return obj.dict()
        elif hasattr(obj, '__dict__'):
            # Generic objects
            return obj.__dict__
        else:
            # Fallback to string representation
            return str(obj)
