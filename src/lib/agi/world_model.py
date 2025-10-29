"""
World Model for AGI

Maintains a comprehensive model of the world including physics, social dynamics,
domain knowledge, and causal relationships.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
import numpy as np
from collections import defaultdict

logger = logging.getLogger("apex_orchestrator.agi.world_model")


class WorldModel:
    """
    Comprehensive world model for AGI.
    
    Maintains:
    - Physics and natural laws
    - Social dynamics and relationships
    - Domain-specific knowledge
    - Causal relationships
    - Temporal dynamics
    - Spatial relationships
    """
    
    def __init__(self, memory_system):
        self.memory = memory_system
        self.knowledge_graph = {}
        self.causal_relationships = {}
        self.temporal_model = {}
        self.spatial_model = {}
        self.social_model = {}
        self.domain_knowledge = {}
        
        # World state
        self.current_time = datetime.utcnow()
        self.world_state = {}
        self.uncertainty_level = 0.0
        
        # Model parameters
        self.update_frequency = 1.0  # seconds
        self.decay_rate = 0.01
        self.confidence_threshold = 0.5
        
        logger.info("World model initialized")
    
    async def initialize(self):
        """Initialize the world model."""
        # Load initial knowledge
        await self._load_initial_knowledge()
        
        # Initialize model components
        await self._initialize_physics_model()
        await self._initialize_social_model()
        await self._initialize_temporal_model()
        await self._initialize_spatial_model()
        
        # Start background updates
        asyncio.create_task(self._world_update_loop())
        
        logger.info("World model initialized")
    
    async def _load_initial_knowledge(self):
        """Load initial world knowledge."""
        # Basic physics laws
        self.domain_knowledge["physics"] = {
            "gravity": {"value": 9.81, "unit": "m/s²", "confidence": 0.99},
            "speed_of_light": {"value": 299792458, "unit": "m/s", "confidence": 0.99},
            "conservation_of_energy": {"description": "Energy cannot be created or destroyed", "confidence": 0.95},
            "conservation_of_momentum": {"description": "Momentum is conserved in closed systems", "confidence": 0.95}
        }
        
        # Basic social dynamics
        self.domain_knowledge["social"] = {
            "cooperation": {"description": "People often cooperate for mutual benefit", "confidence": 0.8},
            "competition": {"description": "People compete for resources and status", "confidence": 0.8},
            "communication": {"description": "Communication is essential for social interaction", "confidence": 0.9},
            "trust": {"description": "Trust is built through consistent behavior", "confidence": 0.7}
        }
        
        # Basic temporal concepts
        self.domain_knowledge["temporal"] = {
            "causality": {"description": "Cause precedes effect in time", "confidence": 0.9},
            "irreversibility": {"description": "Time flows in one direction", "confidence": 0.8},
            "memory": {"description": "Past events influence present behavior", "confidence": 0.9}
        }
    
    async def _initialize_physics_model(self):
        """Initialize physics model."""
        self.knowledge_graph["physics"] = {
            "forces": ["gravity", "electromagnetic", "strong_nuclear", "weak_nuclear"],
            "matter_states": ["solid", "liquid", "gas", "plasma"],
            "energy_forms": ["kinetic", "potential", "thermal", "electromagnetic"]
        }
    
    async def _initialize_social_model(self):
        """Initialize social dynamics model."""
        self.social_model = {
            "relationships": {},
            "groups": {},
            "norms": {},
            "power_structures": {}
        }
    
    async def _initialize_temporal_model(self):
        """Initialize temporal dynamics model."""
        self.temporal_model = {
            "events": [],
            "sequences": {},
            "patterns": {},
            "predictions": {}
        }
    
    async def _initialize_spatial_model(self):
        """Initialize spatial relationships model."""
        self.spatial_model = {
            "locations": {},
            "distances": {},
            "containment": {},
            "adjacency": {}
        }
    
    async def update(self, perception_result: Dict):
        """Update world model based on new perception."""
        # Extract information from perception
        content = perception_result.get("content", "")
        context = perception_result.get("context", {})
        timestamp = datetime.utcnow()
        
        # Update temporal model
        await self._update_temporal_model(content, context, timestamp)
        
        # Update causal relationships
        await self._update_causal_relationships(content, context)
        
        # Update social model
        await self._update_social_model(content, context)
        
        # Update spatial model
        await self._update_spatial_model(content, context)
        
        # Update uncertainty
        await self._update_uncertainty(content, context)
        
        # Store in memory
        await self._store_world_update(content, context, timestamp)
    
    async def _update_temporal_model(self, content: str, context: Dict, timestamp: datetime):
        """Update temporal model with new information."""
        # Add new event
        event = {
            "content": content,
            "timestamp": timestamp,
            "context": context,
            "type": self._classify_event_type(content)
        }
        
        self.temporal_model["events"].append(event)
        
        # Keep only recent events (last 1000)
        if len(self.temporal_model["events"]) > 1000:
            self.temporal_model["events"] = self.temporal_model["events"][-1000:]
        
        # Update sequences
        await self._update_event_sequences(event)
        
        # Update patterns
        await self._update_temporal_patterns()
    
    async def _update_causal_relationships(self, content: str, context: Dict):
        """Update causal relationships based on new information."""
        # Extract potential causal relationships
        causal_relationships = await self._extract_causal_relationships(content)
        
        for relationship in causal_relationships:
            cause = relationship["cause"]
            effect = relationship["effect"]
            strength = relationship["strength"]
            
            # Update or create relationship
            if cause not in self.causal_relationships:
                self.causal_relationships[cause] = {}
            
            if effect not in self.causal_relationships[cause]:
                self.causal_relationships[cause][effect] = {
                    "strength": strength,
                    "confidence": 0.5,
                    "evidence_count": 1,
                    "last_updated": datetime.utcnow()
                }
            else:
                # Update existing relationship
                rel = self.causal_relationships[cause][effect]
                rel["strength"] = 0.7 * rel["strength"] + 0.3 * strength
                rel["evidence_count"] += 1
                rel["confidence"] = min(1.0, rel["confidence"] + 0.1)
                rel["last_updated"] = datetime.utcnow()
    
    async def _update_social_model(self, content: str, context: Dict):
        """Update social model with new information."""
        # Extract social entities
        social_entities = await self._extract_social_entities(content)
        
        for entity in social_entities:
            entity_type = entity["type"]
            entity_name = entity["name"]
            
            if entity_type not in self.social_model:
                self.social_model[entity_type] = {}
            
            if entity_name not in self.social_model[entity_type]:
                self.social_model[entity_type][entity_name] = {
                    "properties": entity.get("properties", {}),
                    "relationships": {},
                    "last_seen": datetime.utcnow()
                }
            else:
                # Update existing entity
                self.social_model[entity_type][entity_name]["last_seen"] = datetime.utcnow()
                self.social_model[entity_type][entity_name]["properties"].update(
                    entity.get("properties", {})
                )
    
    async def _update_spatial_model(self, content: str, context: Dict):
        """Update spatial model with new information."""
        # Extract spatial information
        spatial_info = await self._extract_spatial_information(content)
        
        for location in spatial_info:
            loc_name = location["name"]
            loc_properties = location["properties"]
            
            if loc_name not in self.spatial_model["locations"]:
                self.spatial_model["locations"][loc_name] = {
                    "properties": loc_properties,
                    "last_updated": datetime.utcnow()
                }
            else:
                # Update existing location
                self.spatial_model["locations"][loc_name]["properties"].update(loc_properties)
                self.spatial_model["locations"][loc_name]["last_updated"] = datetime.utcnow()
    
    async def _update_uncertainty(self, content: str, context: Dict):
        """Update uncertainty level based on new information."""
        # Calculate uncertainty based on information quality
        quality_indicators = [
            "uncertain" in content.lower(),
            "maybe" in content.lower(),
            "possibly" in content.lower(),
            "might" in content.lower(),
            "could" in content.lower()
        ]
        
        uncertainty_indicators = sum(quality_indicators)
        uncertainty_increase = uncertainty_indicators * 0.1
        
        # Update uncertainty level
        self.uncertainty_level = min(1.0, self.uncertainty_level + uncertainty_increase)
        
        # Decay uncertainty over time
        self.uncertainty_level = max(0.0, self.uncertainty_level - self.decay_rate)
    
    async def _classify_event_type(self, content: str) -> str:
        """Classify the type of event."""
        content_lower = content.lower()
        
        if any(word in content_lower for word in ["error", "problem", "issue", "failed"]):
            return "problem"
        elif any(word in content_lower for word in ["success", "achieved", "completed", "solved"]):
            return "success"
        elif any(word in content_lower for word in ["learned", "discovered", "found", "realized"]):
            return "learning"
        elif any(word in content_lower for word in ["created", "built", "made", "generated"]):
            return "creation"
        else:
            return "general"
    
    async def _extract_causal_relationships(self, content: str) -> List[Dict]:
        """Extract causal relationships from content."""
        relationships = []
        
        # Simple pattern matching for causal relationships
        causal_patterns = [
            r"([^,]+)\s+causes\s+([^,.]+)",
            r"([^,]+)\s+leads\s+to\s+([^,.]+)",
            r"([^,]+)\s+results\s+in\s+([^,.]+)",
            r"because\s+of\s+([^,]+),\s+([^,.]+)",
            r"due\s+to\s+([^,]+),\s+([^,.]+)"
        ]
        
        import re
        for pattern in causal_patterns:
            matches = re.findall(pattern, content.lower())
            for cause, effect in matches:
                relationships.append({
                    "cause": cause.strip(),
                    "effect": effect.strip(),
                    "strength": 0.7  # Default strength
                })
        
        return relationships
    
    async def _extract_social_entities(self, content: str) -> List[Dict]:
        """Extract social entities from content."""
        entities = []
        
        # Simple entity extraction (could be enhanced with NLP)
        if "user" in content.lower():
            entities.append({
                "type": "person",
                "name": "user",
                "properties": {"role": "interactor"}
            })
        
        if "system" in content.lower():
            entities.append({
                "type": "system",
                "name": "system",
                "properties": {"role": "processor"}
            })
        
        return entities
    
    async def _extract_spatial_information(self, content: str) -> List[Dict]:
        """Extract spatial information from content."""
        locations = []
        
        # Simple location extraction
        if "here" in content.lower():
            locations.append({
                "name": "current_location",
                "properties": {"type": "immediate", "description": "current position"}
            })
        
        return locations
    
    async def _update_event_sequences(self, event: Dict):
        """Update event sequences."""
        # Group events by type
        event_type = event["type"]
        
        if event_type not in self.temporal_model["sequences"]:
            self.temporal_model["sequences"][event_type] = []
        
        self.temporal_model["sequences"][event_type].append(event)
        
        # Keep only recent sequences
        if len(self.temporal_model["sequences"][event_type]) > 100:
            self.temporal_model["sequences"][event_type] = \
                self.temporal_model["sequences"][event_type][-100:]
    
    async def _update_temporal_patterns(self):
        """Update temporal patterns."""
        # Analyze sequences for patterns
        for event_type, sequence in self.temporal_model["sequences"].items():
            if len(sequence) > 5:  # Need enough data
                pattern = await self._analyze_sequence_pattern(sequence)
                if pattern:
                    self.temporal_model["patterns"][event_type] = pattern
    
    async def _analyze_sequence_pattern(self, sequence: List[Dict]) -> Optional[Dict]:
        """Analyze a sequence for patterns."""
        if len(sequence) < 3:
            return None
        
        # Simple pattern analysis
        time_intervals = []
        for i in range(1, len(sequence)):
            interval = (sequence[i]["timestamp"] - sequence[i-1]["timestamp"]).total_seconds()
            time_intervals.append(interval)
        
        if time_intervals:
            avg_interval = np.mean(time_intervals)
            return {
                "type": "temporal",
                "average_interval": avg_interval,
                "frequency": 1.0 / avg_interval if avg_interval > 0 else 0,
                "confidence": 0.7
            }
        
        return None
    
    async def _store_world_update(self, content: str, context: Dict, timestamp: datetime):
        """Store world model update in memory."""
        await self.memory.store_episodic_memory(
            event_type="world_update",
            description=f"World model updated: {content[:100]}",
            context=context,
            importance_score=0.3
        )
    
    async def _world_update_loop(self):
        """Background world model update loop."""
        while True:
            try:
                # Decay old information
                await self._decay_old_information()
                
                # Update predictions
                await self._update_predictions()
                
                await asyncio.sleep(self.update_frequency)
            except Exception as e:
                logger.error(f"Error in world update loop: {e}")
                await asyncio.sleep(5.0)
    
    async def _decay_old_information(self):
        """Decay old information in the world model."""
        current_time = datetime.utcnow()
        decay_threshold = timedelta(hours=24)
        
        # Decay causal relationships
        for cause in list(self.causal_relationships.keys()):
            for effect in list(self.causal_relationships[cause].keys()):
                rel = self.causal_relationships[cause][effect]
                age = current_time - rel["last_updated"]
                
                if age > decay_threshold:
                    rel["confidence"] *= 0.9  # Decay confidence
                    if rel["confidence"] < 0.1:
                        del self.causal_relationships[cause][effect]
            
            # Remove empty causes
            if not self.causal_relationships[cause]:
                del self.causal_relationships[cause]
    
    async def _update_predictions(self):
        """Update predictions based on current model."""
        # Simple prediction based on patterns
        for event_type, pattern in self.temporal_model["patterns"].items():
            if pattern["type"] == "temporal":
                next_occurrence = datetime.utcnow() + timedelta(seconds=pattern["average_interval"])
                self.temporal_model["predictions"][event_type] = {
                    "next_occurrence": next_occurrence,
                    "confidence": pattern["confidence"]
                }
    
    async def query(self, query: str) -> Dict[str, Any]:
        """Query the world model."""
        results = {
            "causal_relationships": [],
            "temporal_patterns": [],
            "spatial_information": [],
            "social_entities": [],
            "domain_knowledge": []
        }
        
        query_lower = query.lower()
        
        # Search causal relationships
        for cause, effects in self.causal_relationships.items():
            if query_lower in cause.lower():
                for effect, rel in effects.items():
                    results["causal_relationships"].append({
                        "cause": cause,
                        "effect": effect,
                        "strength": rel["strength"],
                        "confidence": rel["confidence"]
                    })
        
        # Search temporal patterns
        for event_type, pattern in self.temporal_model["patterns"].items():
            if query_lower in event_type.lower():
                results["temporal_patterns"].append({
                    "event_type": event_type,
                    "pattern": pattern
                })
        
        # Search spatial information
        for location, info in self.spatial_model["locations"].items():
            if query_lower in location.lower():
                results["spatial_information"].append({
                    "location": location,
                    "properties": info["properties"]
                })
        
        # Search social entities
        for entity_type, entities in self.social_model.items():
            for entity_name, info in entities.items():
                if query_lower in entity_name.lower() or query_lower in entity_type.lower():
                    results["social_entities"].append({
                        "type": entity_type,
                        "name": entity_name,
                        "properties": info["properties"]
                    })
        
        # Search domain knowledge
        for domain, knowledge in self.domain_knowledge.items():
            if query_lower in domain.lower():
                results["domain_knowledge"].append({
                    "domain": domain,
                    "knowledge": knowledge
                })
        
        return results
    
    async def get_status(self) -> Dict[str, Any]:
        """Get world model status."""
        return {
            "causal_relationships": len(self.causal_relationships),
            "temporal_events": len(self.temporal_model["events"]),
            "temporal_patterns": len(self.temporal_model["patterns"]),
            "spatial_locations": len(self.spatial_model["locations"]),
            "social_entities": sum(len(entities) for entities in self.social_model.values()),
            "domain_knowledge": len(self.domain_knowledge),
            "uncertainty_level": self.uncertainty_level,
            "current_time": self.current_time.isoformat()
        }