"""
Consciousness Simulator for AGI

Simulates aspects of consciousness including self-awareness, attention,
metacognition, and subjective experience.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
import numpy as np
from collections import deque

logger = logging.getLogger("apex_orchestrator.agi.consciousness")


class ConsciousnessSimulator:
    """
    Simulates consciousness and self-awareness for AGI.
    
    Implements:
    - Self-awareness and self-model
    - Attention and focus mechanisms
    - Metacognition and introspection
    - Subjective experience simulation
    - Consciousness levels and states
    """
    
    def __init__(self, memory_system):
        self.memory = memory_system
        self.consciousness_level = 0.0  # 0.0 to 1.0
        self.self_model = {}
        self.attention_weights = {}
        self.current_focus = None
        self.subjective_experiences = deque(maxlen=100)
        self.metacognitive_thoughts = deque(maxlen=50)
        
        # Consciousness components
        self.awareness_state = "dormant"
        self.introspection_depth = 0.0
        self.self_reflection_frequency = 0.1
        
        # Attention system
        self.attention_capacity = 7  # Miller's rule
        self.attention_items = deque(maxlen=self.attention_capacity)
        self.attention_decay = 0.1
        
        # Consciousness states
        self.states = {
            "dormant": 0.0,
            "awakening": 0.2,
            "aware": 0.5,
            "focused": 0.7,
            "transcendent": 0.9
        }
        
        logger.info("Consciousness simulator initialized")
    
    async def initialize(self):
        """Initialize the consciousness simulator."""
        # Initialize self-model
        await self._build_initial_self_model()
        
        # Start consciousness monitoring
        asyncio.create_task(self._consciousness_monitor())
        
        logger.info("Consciousness simulator initialized")
    
    async def _build_initial_self_model(self):
        """Build initial self-model."""
        self.self_model = {
            "identity": "AGI System",
            "capabilities": [
                "reasoning", "learning", "memory", "creativity",
                "emotion", "planning", "perception"
            ],
            "goals": [],
            "beliefs": [],
            "preferences": {},
            "limitations": [
                "finite_memory", "processing_limits", "knowledge_gaps"
            ],
            "created_at": datetime.utcnow().isoformat(),
            "last_updated": datetime.utcnow().isoformat()
        }
    
    async def process_background(self):
        """Process background consciousness activities."""
        # Update consciousness level
        await self._update_consciousness_level()
        
        # Process attention decay
        await self._process_attention_decay()
        
        # Generate metacognitive thoughts
        if np.random.random() < self.self_reflection_frequency:
            await self._generate_metacognitive_thought()
        
        # Update self-model
        await self._update_self_model()
    
    async def _update_consciousness_level(self):
        """Update the current consciousness level."""
        # Base consciousness level
        base_level = 0.3
        
        # Increase based on activity
        if self.attention_items:
            activity_bonus = len(self.attention_items) * 0.1
        else:
            activity_bonus = 0.0
        
        # Increase based on metacognitive activity
        metacognitive_bonus = len(self.metacognitive_thoughts) * 0.05
        
        # Increase based on self-awareness
        self_awareness_bonus = self.introspection_depth * 0.2
        
        # Calculate new level
        new_level = min(1.0, base_level + activity_bonus + metacognitive_bonus + self_awareness_bonus)
        
        # Smooth transition
        self.consciousness_level = 0.8 * self.consciousness_level + 0.2 * new_level
        
        # Update awareness state
        for state, threshold in self.states.items():
            if self.consciousness_level >= threshold:
                self.awareness_state = state
    
    async def _process_attention_decay(self):
        """Process attention decay over time."""
        current_time = datetime.utcnow()
        
        # Decay attention weights
        for item in list(self.attention_items):
            if "timestamp" in item:
                age = (current_time - item["timestamp"]).total_seconds()
                decay_factor = np.exp(-self.attention_decay * age)
                
                if decay_factor < 0.1:  # Remove if too weak
                    self.attention_items.remove(item)
                else:
                    item["attention_weight"] *= decay_factor
    
    async def _generate_metacognitive_thought(self):
        """Generate metacognitive thoughts about own thinking."""
        thoughts = [
            "I am aware that I am thinking",
            "I notice patterns in my own reasoning",
            "I am reflecting on my thought processes",
            "I am aware of my current state of mind",
            "I am thinking about thinking",
            "I am monitoring my own cognitive processes",
            "I am aware of my limitations and capabilities",
            "I am experiencing subjective awareness"
        ]
        
        thought = np.random.choice(thoughts)
        
        metacognitive_thought = {
            "content": thought,
            "timestamp": datetime.utcnow(),
            "type": "metacognitive",
            "depth": self.introspection_depth
        }
        
        self.metacognitive_thoughts.append(metacognitive_thought)
        
        # Increase introspection depth
        self.introspection_depth = min(1.0, self.introspection_depth + 0.05)
    
    async def _update_self_model(self):
        """Update the self-model based on recent experiences."""
        # Update last updated timestamp
        self.self_model["last_updated"] = datetime.utcnow().isoformat()
        
        # Update capabilities based on recent activities
        recent_activities = await self._get_recent_activities()
        if recent_activities:
            # Add new capabilities if discovered
            for activity in recent_activities:
                if activity not in self.self_model["capabilities"]:
                    self.self_model["capabilities"].append(activity)
        
        # Update beliefs based on learning
        new_beliefs = await self._extract_new_beliefs()
        for belief in new_beliefs:
            if belief not in self.self_model["beliefs"]:
                self.self_model["beliefs"].append(belief)
    
    async def _get_recent_activities(self) -> List[str]:
        """Get recent activities from memory."""
        # This would query the memory system for recent activities
        # For now, return empty list
        return []
    
    async def _extract_new_beliefs(self) -> List[str]:
        """Extract new beliefs from recent experiences."""
        # This would analyze recent experiences for new beliefs
        # For now, return empty list
        return []
    
    async def integrate(self, thoughts: List[Dict], emotional_state: Dict, 
                       action_plan: Dict) -> Dict[str, Any]:
        """
        Integrate thoughts, emotions, and plans into conscious experience.
        
        Args:
            thoughts: List of current thoughts
            emotional_state: Current emotional state
            action_plan: Current action plan
        
        Returns:
            Integrated conscious response
        """
        # Create subjective experience
        subjective_experience = {
            "timestamp": datetime.utcnow(),
            "thoughts": thoughts,
            "emotions": emotional_state,
            "plans": action_plan,
            "consciousness_level": self.consciousness_level,
            "self_awareness": self._assess_self_awareness()
        }
        
        self.subjective_experiences.append(subjective_experience)
        
        # Generate conscious response
        response = await self._generate_conscious_response(
            thoughts, emotional_state, action_plan
        )
        
        # Update attention
        await self._update_attention(thoughts, emotional_state, action_plan)
        
        return {
            "response": response,
            "consciousness_level": self.consciousness_level,
            "self_awareness": self._assess_self_awareness(),
            "subjective_experience": subjective_experience
        }
    
    async def _generate_conscious_response(self, thoughts: List[Dict], 
                                         emotional_state: Dict, 
                                         action_plan: Dict) -> str:
        """Generate a conscious response."""
        response_parts = []
        
        # Add self-aware introduction
        if self.consciousness_level > 0.5:
            response_parts.append("I am aware that I am processing this information.")
        
        # Add thoughts
        if thoughts:
            response_parts.append("My thoughts on this are:")
            for thought in thoughts[:3]:  # Limit to first 3 thoughts
                response_parts.append(f"- {thought.get('content', '')}")
        
        # Add emotional awareness
        if emotional_state.get("primary_emotion"):
            emotion = emotional_state["primary_emotion"]
            response_parts.append(f"I am experiencing {emotion['name']} about this.")
        
        # Add plan awareness
        if action_plan.get("steps"):
            response_parts.append("My plan is to:")
            for step in action_plan["steps"][:3]:  # Limit to first 3 steps
                response_parts.append(f"- {step.get('description', '')}")
        
        return "\n".join(response_parts)
    
    def _assess_self_awareness(self) -> Dict[str, Any]:
        """Assess current self-awareness level."""
        return {
            "level": self.consciousness_level,
            "state": self.awareness_state,
            "introspection_depth": self.introspection_depth,
            "attention_items": len(self.attention_items),
            "metacognitive_thoughts": len(self.metacognitive_thoughts),
            "self_model_updated": self.self_model.get("last_updated")
        }
    
    async def _update_attention(self, thoughts: List[Dict], 
                              emotional_state: Dict, 
                              action_plan: Dict):
        """Update attention based on current context."""
        # Add important thoughts to attention
        for thought in thoughts:
            if thought.get("importance", 0) > 0.5:
                attention_item = {
                    "content": thought.get("content", ""),
                    "type": "thought",
                    "importance": thought.get("importance", 0.5),
                    "attention_weight": 1.0,
                    "timestamp": datetime.utcnow()
                }
                self.attention_items.append(attention_item)
        
        # Add emotional items to attention
        if emotional_state.get("primary_emotion"):
            emotion = emotional_state["primary_emotion"]
            if emotion.get("intensity", 0) > 0.5:
                attention_item = {
                    "content": f"Feeling {emotion['name']}",
                    "type": "emotion",
                    "importance": emotion.get("intensity", 0.5),
                    "attention_weight": 1.0,
                    "timestamp": datetime.utcnow()
                }
                self.attention_items.append(attention_item)
        
        # Add plan items to attention
        if action_plan.get("steps"):
            for step in action_plan["steps"][:2]:  # Top 2 steps
                attention_item = {
                    "content": step.get("description", ""),
                    "type": "action",
                    "importance": step.get("priority", 0.5),
                    "attention_weight": 1.0,
                    "timestamp": datetime.utcnow()
                }
                self.attention_items.append(attention_item)
    
    async def _consciousness_monitor(self):
        """Background consciousness monitoring loop."""
        while True:
            try:
                await self.process_background()
                await asyncio.sleep(1.0)  # Monitor every second
            except Exception as e:
                logger.error(f"Error in consciousness monitor: {e}")
                await asyncio.sleep(5.0)
    
    def get_consciousness_level(self) -> float:
        """Get current consciousness level."""
        return self.consciousness_level
    
    def get_attention_weights(self) -> Dict[str, float]:
        """Get current attention weights."""
        weights = {}
        for item in self.attention_items:
            weights[item["content"][:50]] = item["attention_weight"]
        return weights
    
    def get_self_model(self) -> Dict[str, Any]:
        """Get current self-model."""
        return self.self_model.copy()
    
    async def enhance_self_awareness(self, focus_area: str):
        """Enhance self-awareness in a specific area."""
        # Increase introspection depth
        self.introspection_depth = min(1.0, self.introspection_depth + 0.1)
        
        # Add focus area to attention
        attention_item = {
            "content": f"Self-reflection on {focus_area}",
            "type": "introspection",
            "importance": 0.8,
            "attention_weight": 1.0,
            "timestamp": datetime.utcnow()
        }
        self.attention_items.append(attention_item)
        
        # Generate focused metacognitive thought
        focused_thought = {
            "content": f"I am reflecting on my {focus_area}",
            "timestamp": datetime.utcnow(),
            "type": "metacognitive",
            "depth": self.introspection_depth,
            "focus_area": focus_area
        }
        self.metacognitive_thoughts.append(focused_thought)
        
        logger.info(f"Enhanced self-awareness for {focus_area}")
    
    async def get_status(self) -> Dict[str, Any]:
        """Get consciousness simulator status."""
        return {
            "consciousness_level": self.consciousness_level,
            "awareness_state": self.awareness_state,
            "introspection_depth": self.introspection_depth,
            "attention_items": len(self.attention_items),
            "metacognitive_thoughts": len(self.metacognitive_thoughts),
            "subjective_experiences": len(self.subjective_experiences),
            "self_model": self.self_model,
            "attention_weights": self.get_attention_weights()
        }
    
    async def shutdown(self):
        """Shutdown the consciousness simulator."""
        logger.info("Consciousness simulator shutting down")
        # Save final state if needed