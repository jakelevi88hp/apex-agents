"""
Enhanced Memory System for AGI

Advanced memory system with episodic, semantic, and working memory components
that support complex reasoning and learning.
"""

import sqlite3
import json
import hashlib
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import logging
from collections import defaultdict, deque
import pickle

logger = logging.getLogger("apex_orchestrator.agi.memory")


def _serialize_for_json(obj):
    """Helper to serialize datetime objects for JSON."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: _serialize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [_serialize_for_json(item) for item in obj]
    return obj


class EnhancedMemorySystem:
    """
    Advanced memory system with multiple memory types for AGI.
    
    Implements:
    - Episodic Memory: Personal experiences and events
    - Semantic Memory: Facts, concepts, and knowledge
    - Working Memory: Current context and active information
    - Procedural Memory: Skills and how-to knowledge
    - Emotional Memory: Emotionally charged experiences
    """
    
    def __init__(self, db_path: str = "logs/agi_memory.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Working memory (in-memory)
        self.working_memory = deque(maxlen=50)  # Last 50 items
        self.current_context = {}
        self.attention_buffer = deque(maxlen=10)
        
        # Memory caches
        self.semantic_cache = {}
        self.episodic_cache = {}
        self.procedural_cache = {}
        
        # Memory consolidation settings
        self.consolidation_threshold = 0.7
        self.forgetting_curve = 0.1  # Rate of forgetting
        
        self._init_database()
        logger.info("Enhanced memory system initialized")
    
    def _init_database(self):
        """Initialize the enhanced database schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Episodic memory - personal experiences
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS episodic_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                event_type TEXT NOT NULL,
                description TEXT NOT NULL,
                context TEXT,
                emotional_valence REAL,
                emotional_arousal REAL,
                importance_score REAL,
                participants TEXT,
                location TEXT,
                outcome TEXT,
                learned_lessons TEXT,
                created_at TEXT,
                last_accessed TEXT,
                access_count INTEGER DEFAULT 0
            )
        """)
        
        # Semantic memory - facts and concepts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS semantic_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                concept TEXT NOT NULL,
                definition TEXT,
                category TEXT,
                properties TEXT,
                relationships TEXT,
                confidence REAL,
                source TEXT,
                created_at TEXT,
                last_updated TEXT,
                access_count INTEGER DEFAULT 0,
                verification_status TEXT DEFAULT 'unverified'
            )
        """)
        
        # Procedural memory - skills and procedures
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS procedural_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_name TEXT NOT NULL,
                procedure_steps TEXT NOT NULL,
                skill_level REAL,
                success_rate REAL,
                last_practiced TEXT,
                practice_count INTEGER DEFAULT 0,
                domain TEXT,
                prerequisites TEXT,
                created_at TEXT,
                updated_at TEXT
            )
        """)
        
        # Working memory sessions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS working_memory_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT,
                context TEXT,
                goals TEXT,
                outcomes TEXT,
                memory_items TEXT
            )
        """)
        
        # Memory associations
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memory_associations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memory_type TEXT NOT NULL,
                memory_id INTEGER NOT NULL,
                associated_memory_type TEXT NOT NULL,
                associated_memory_id INTEGER NOT NULL,
                association_strength REAL,
                association_type TEXT,
                created_at TEXT
            )
        """)
        
        # Memory consolidation log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS consolidation_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memory_type TEXT NOT NULL,
                memory_id INTEGER NOT NULL,
                consolidation_level REAL,
                consolidation_method TEXT,
                timestamp TEXT NOT NULL
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("Enhanced memory database schema initialized")
    
    async def initialize(self):
        """Initialize the memory system."""
        # Load recent memories into caches
        await self._load_recent_memories()
        logger.info("Memory system initialized")
    
    async def store_episodic_memory(self, event_type: str, description: str,
                                  context: Dict = None, emotional_valence: float = 0.0,
                                  emotional_arousal: float = 0.0, importance_score: float = 0.5,
                                  participants: List[str] = None, location: str = None,
                                  outcome: str = None, learned_lessons: List[str] = None):
        """Store an episodic memory (personal experience)."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        memory_id = cursor.execute("""
            INSERT INTO episodic_memory 
            (timestamp, event_type, description, context, emotional_valence, 
             emotional_arousal, importance_score, participants, location, 
             outcome, learned_lessons, created_at, last_accessed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.utcnow().isoformat(),
            event_type,
            description,
            json.dumps(_serialize_for_json(context)) if context else None,
            emotional_valence,
            emotional_arousal,
            importance_score,
            json.dumps(participants) if participants else None,
            location,
            outcome,
            json.dumps(learned_lessons) if learned_lessons else None,
            datetime.utcnow().isoformat(),
            datetime.utcnow().isoformat()
        )).lastrowid
        
        conn.commit()
        conn.close()
        
        # Add to working memory
        self.working_memory.append({
            "type": "episodic",
            "id": memory_id,
            "content": description,
            "timestamp": datetime.utcnow(),
            "importance": importance_score
        })
        
        logger.info(f"Stored episodic memory: {event_type}")
        return memory_id
    
    async def store_semantic_memory(self, concept: str, definition: str = None,
                                  category: str = None, properties: Dict = None,
                                  relationships: Dict = None, confidence: float = 0.5,
                                  source: str = None):
        """Store semantic memory (factual knowledge)."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if concept already exists
        cursor.execute("SELECT id, confidence FROM semantic_memory WHERE concept = ?", (concept,))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing concept with higher confidence
            existing_id, existing_confidence = existing
            if confidence > existing_confidence:
                cursor.execute("""
                    UPDATE semantic_memory 
                    SET definition = ?, category = ?, properties = ?, 
                        relationships = ?, confidence = ?, last_updated = ?
                    WHERE id = ?
                """, (definition, category, json.dumps(properties) if properties else None,
                      json.dumps(relationships) if relationships else None, confidence,
                      datetime.utcnow().isoformat(), existing_id))
                memory_id = existing_id
            else:
                memory_id = existing_id
        else:
            # Insert new concept
            memory_id = cursor.execute("""
                INSERT INTO semantic_memory 
                (concept, definition, category, properties, relationships, 
                 confidence, source, created_at, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                concept, definition, category,
                json.dumps(properties) if properties else None,
                json.dumps(relationships) if relationships else None,
                confidence, source, datetime.utcnow().isoformat(),
                datetime.utcnow().isoformat()
            )).lastrowid
        
        conn.commit()
        conn.close()
        
        # Update semantic cache
        self.semantic_cache[concept] = {
            "definition": definition,
            "category": category,
            "confidence": confidence,
            "last_updated": datetime.utcnow()
        }
        
        logger.info(f"Stored semantic memory: {concept}")
        return memory_id
    
    async def store_procedural_memory(self, skill_name: str, procedure_steps: List[str],
                                    skill_level: float = 0.0, success_rate: float = 0.0,
                                    domain: str = None, prerequisites: List[str] = None):
        """Store procedural memory (skills and procedures)."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if skill already exists
        cursor.execute("SELECT id FROM procedural_memory WHERE skill_name = ?", (skill_name,))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing skill
            cursor.execute("""
                UPDATE procedural_memory 
                SET procedure_steps = ?, skill_level = ?, success_rate = ?, 
                    last_practiced = ?, practice_count = practice_count + 1,
                    updated_at = ?
                WHERE skill_name = ?
            """, (
                json.dumps(procedure_steps), skill_level, success_rate,
                datetime.utcnow().isoformat(), datetime.utcnow().isoformat(), skill_name
            ))
            memory_id = existing[0]
        else:
            # Insert new skill
            memory_id = cursor.execute("""
                INSERT INTO procedural_memory 
                (skill_name, procedure_steps, skill_level, success_rate, 
                 last_practiced, practice_count, domain, prerequisites, 
                 created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                skill_name, json.dumps(procedure_steps), skill_level, success_rate,
                datetime.utcnow().isoformat(), 1, domain,
                json.dumps(prerequisites) if prerequisites else None,
                datetime.utcnow().isoformat(), datetime.utcnow().isoformat()
            )).lastrowid
        
        conn.commit()
        conn.close()
        
        # Update procedural cache
        self.procedural_cache[skill_name] = {
            "steps": procedure_steps,
            "level": skill_level,
            "success_rate": success_rate,
            "last_practiced": datetime.utcnow()
        }
        
        logger.info(f"Stored procedural memory: {skill_name}")
        return memory_id
    
    async def retrieve_memories(self, query: str, memory_types: List[str] = None,
                              limit: int = 10, similarity_threshold: float = 0.5) -> List[Dict]:
        """Retrieve memories based on query and similarity."""
        if memory_types is None:
            memory_types = ["episodic", "semantic", "procedural"]
        
        results = []
        
        for memory_type in memory_types:
            if memory_type == "episodic":
                memories = await self._search_episodic_memories(query, limit, similarity_threshold)
            elif memory_type == "semantic":
                memories = await self._search_semantic_memories(query, limit, similarity_threshold)
            elif memory_type == "procedural":
                memories = await self._search_procedural_memories(query, limit, similarity_threshold)
            else:
                continue
            
            results.extend(memories)
        
        # Sort by relevance and importance
        results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
        return results[:limit]
    
    async def _search_episodic_memories(self, query: str, limit: int, 
                                      similarity_threshold: float) -> List[Dict]:
        """Search episodic memories."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Simple text search for now (could be enhanced with embeddings)
        cursor.execute("""
            SELECT * FROM episodic_memory 
            WHERE description LIKE ? OR event_type LIKE ? OR outcome LIKE ?
            ORDER BY importance_score DESC, last_accessed DESC
            LIMIT ?
        """, (f"%{query}%", f"%{query}%", f"%{query}%", limit))
        
        columns = [desc[0] for desc in cursor.description]
        memories = []
        
        for row in cursor.fetchall():
            memory = dict(zip(columns, row))
            memory["memory_type"] = "episodic"
            memory["relevance_score"] = self._calculate_relevance(query, memory["description"])
            
            if memory["relevance_score"] >= similarity_threshold:
                memories.append(memory)
        
        conn.close()
        return memories
    
    async def _search_semantic_memories(self, query: str, limit: int,
                                      similarity_threshold: float) -> List[Dict]:
        """Search semantic memories."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM semantic_memory 
            WHERE concept LIKE ? OR definition LIKE ? OR category LIKE ?
            ORDER BY confidence DESC, access_count DESC
            LIMIT ?
        """, (f"%{query}%", f"%{query}%", f"%{query}%", limit))
        
        columns = [desc[0] for desc in cursor.description]
        memories = []
        
        for row in cursor.fetchall():
            memory = dict(zip(columns, row))
            memory["memory_type"] = "semantic"
            memory["relevance_score"] = self._calculate_relevance(query, memory["concept"])
            
            if memory["relevance_score"] >= similarity_threshold:
                memories.append(memory)
        
        conn.close()
        return memories
    
    async def _search_procedural_memories(self, query: str, limit: int,
                                        similarity_threshold: float) -> List[Dict]:
        """Search procedural memories."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM procedural_memory 
            WHERE skill_name LIKE ? OR domain LIKE ?
            ORDER BY skill_level DESC, success_rate DESC
            LIMIT ?
        """, (f"%{query}%", f"%{query}%", limit))
        
        columns = [desc[0] for desc in cursor.description]
        memories = []
        
        for row in cursor.fetchall():
            memory = dict(zip(columns, row))
            memory["memory_type"] = "procedural"
            memory["relevance_score"] = self._calculate_relevance(query, memory["skill_name"])
            
            if memory["relevance_score"] >= similarity_threshold:
                memories.append(memory)
        
        conn.close()
        return memories
    
    def _calculate_relevance(self, query: str, text: str) -> float:
        """Calculate relevance score between query and text."""
        if not text:
            return 0.0
        
        query_words = set(query.lower().split())
        text_words = set(text.lower().split())
        
        if not query_words or not text_words:
            return 0.0
        
        # Simple Jaccard similarity
        intersection = query_words.intersection(text_words)
        union = query_words.union(text_words)
        
        return len(intersection) / len(union) if union else 0.0
    
    async def consolidate_memories(self):
        """Consolidate memories based on importance and recency."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get memories that need consolidation
        cursor.execute("""
            SELECT id, importance_score, created_at, access_count
            FROM episodic_memory 
            WHERE importance_score > ? AND created_at < datetime('now', '-1 hour')
        """, (self.consolidation_threshold,))
        
        memories_to_consolidate = cursor.fetchall()
        
        for memory_id, importance, created_at, access_count in memories_to_consolidate:
            # Calculate consolidation level
            consolidation_level = min(1.0, importance + (access_count * 0.1))
            
            # Log consolidation
            cursor.execute("""
                INSERT INTO consolidation_log 
                (memory_type, memory_id, consolidation_level, consolidation_method, timestamp)
                VALUES (?, ?, ?, ?, ?)
            """, ("episodic", memory_id, consolidation_level, "importance_based", 
                  datetime.utcnow().isoformat()))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Consolidated {len(memories_to_consolidate)} memories")
    
    async def forget_old_memories(self, days_old: int = 30):
        """Forget old, unimportant memories."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        # Delete old episodic memories with low importance
        cursor.execute("""
            DELETE FROM episodic_memory 
            WHERE created_at < ? AND importance_score < ?
        """, (cutoff_date.isoformat(), 0.3))
        
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        
        logger.info(f"Forgot {deleted_count} old memories")
    
    async def create_memory_association(self, memory_type: str, memory_id: int,
                                      associated_memory_type: str, associated_memory_id: int,
                                      association_strength: float, association_type: str = "related"):
        """Create association between memories."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO memory_associations 
            (memory_type, memory_id, associated_memory_type, associated_memory_id,
             association_strength, association_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (memory_type, memory_id, associated_memory_type, associated_memory_id,
              association_strength, association_type, datetime.utcnow().isoformat()))
        
        conn.commit()
        conn.close()
    
    async def get_working_memory(self) -> List[Dict]:
        """Get current working memory contents."""
        return list(self.working_memory)
    
    async def add_to_working_memory(self, item: Dict):
        """Add item to working memory."""
        self.working_memory.append({
            **item,
            "timestamp": datetime.utcnow(),
            "added_to_working": True
        })
    
    async def clear_working_memory(self):
        """Clear working memory."""
        self.working_memory.clear()
        logger.info("Working memory cleared")
    
    async def _load_recent_memories(self):
        """Load recent memories into caches."""
        # Load recent semantic memories
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT concept, definition, category, confidence, last_updated
            FROM semantic_memory 
            ORDER BY last_updated DESC 
            LIMIT 100
        """)
        
        for row in cursor.fetchall():
            concept, definition, category, confidence, last_updated = row
            self.semantic_cache[concept] = {
                "definition": definition,
                "category": category,
                "confidence": confidence,
                "last_updated": datetime.fromisoformat(last_updated)
            }
        
        conn.close()
    
    async def get_status(self) -> Dict[str, Any]:
        """Get memory system status."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get counts
        cursor.execute("SELECT COUNT(*) FROM episodic_memory")
        episodic_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM semantic_memory")
        semantic_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM procedural_memory")
        procedural_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "episodic_memories": episodic_count,
            "semantic_memories": semantic_count,
            "procedural_memories": procedural_count,
            "working_memory_items": len(self.working_memory),
            "cache_sizes": {
                "semantic": len(self.semantic_cache),
                "episodic": len(self.episodic_cache),
                "procedural": len(self.procedural_cache)
            }
        }
    
    async def save_state(self):
        """Save current memory state."""
        # This could save caches to disk for persistence
        logger.info("Memory state saved")