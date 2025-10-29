"""
AGI Core System

The central orchestrator that coordinates all AGI components and provides
the main interface for artificial general intelligence capabilities.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import json

from .memory import EnhancedMemorySystem
from .reasoning import ReasoningEngine
from .consciousness import ConsciousnessSimulator
from .world_model import WorldModel
from .creativity import CreativityEngine
from .emotion import EmotionalIntelligence
from .planning import HierarchicalPlanner
from .learning import AcceleratedLearner
from .perception import MultiModalProcessor

logger = logging.getLogger("apex_orchestrator.agi.core")


class AGICore:
    """
    Central AGI system that orchestrates all intelligence components.
    
    This class represents the core of an Artificial General Intelligence system,
    integrating reasoning, learning, consciousness, creativity, and other
    advanced cognitive capabilities.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """Initialize the AGI core system."""
        self.config = config or {}
        self.initialized = False
        self.consciousness_level = 0.0  # 0.0 to 1.0
        self.current_goals = []
        self.active_context = {}
        
        # Initialize core components
        self.memory = EnhancedMemorySystem()
        self.reasoning = ReasoningEngine(self.memory)
        self.consciousness = ConsciousnessSimulator(self.memory)
        self.world_model = WorldModel(self.memory)
        self.creativity = CreativityEngine(self.memory)
        self.emotion = EmotionalIntelligence(self.memory)
        self.planner = HierarchicalPlanner(self.memory)
        self.learner = AcceleratedLearner(self.memory)
        self.perception = MultiModalProcessor(self.memory)
        
        # AGI state
        self.thoughts = []
        self.current_focus = None
        self.attention_weights = {}
        self.metacognitive_state = {}
        
        logger.info("AGI Core system initialized")
    
    async def initialize(self):
        """Initialize all AGI components."""
        try:
            # Initialize components in dependency order
            await self.memory.initialize()
            await self.world_model.initialize()
            await self.reasoning.initialize()
            await self.consciousness.initialize()
            await self.emotion.initialize()
            await self.creativity.initialize()
            await self.planner.initialize()
            await self.learner.initialize()
            await self.perception.initialize()
            
            self.initialized = True
            logger.info("AGI system fully initialized")
            
            # Start background processes
            asyncio.create_task(self._consciousness_loop())
            asyncio.create_task(self._metacognitive_loop())
            
        except Exception as e:
            logger.error(f"Failed to initialize AGI system: {e}")
            raise
    
    async def process_input(self, input_data: Union[str, Dict, bytes], 
                          input_type: str = "text") -> Dict[str, Any]:
        """
        Process multi-modal input through the AGI system.
        
        Args:
            input_data: The input to process (text, image, audio, etc.)
            input_type: Type of input ("text", "image", "audio", "video", "multimodal")
        
        Returns:
            Comprehensive response with reasoning, emotions, and actions
        """
        if not self.initialized:
            await self.initialize()
        
        # Start processing pipeline
        processing_start = datetime.utcnow()
        
        # 1. Perception and understanding
        perception_result = await self.perception.process(input_data, input_type)
        
        # 2. Update world model
        await self.world_model.update(perception_result)
        
        # 3. Emotional processing
        emotional_state = await self.emotion.process(perception_result)
        
        # 4. Reasoning and analysis
        reasoning_result = await self.reasoning.analyze(
            perception_result, 
            emotional_state,
            self.current_goals
        )
        
        # 5. Generate thoughts and insights
        thoughts = await self._generate_thoughts(reasoning_result, emotional_state)
        
        # 6. Plan actions
        action_plan = await self.planner.create_plan(
            reasoning_result,
            self.current_goals,
            emotional_state
        )
        
        # 7. Creative enhancement
        creative_enhancements = await self.creativity.enhance_plan(action_plan)
        
        # 8. Consciousness integration
        conscious_response = await self.consciousness.integrate(
            thoughts, 
            emotional_state, 
            action_plan
        )
        
        # 9. Learn from this interaction
        await self.learner.learn_from_interaction(
            input_data, 
            perception_result, 
            reasoning_result,
            action_plan
        )
        
        # 10. Generate final response
        response = await self._generate_response(
            conscious_response,
            action_plan,
            creative_enhancements,
            emotional_state
        )
        
        # Update internal state
        self._update_internal_state(thoughts, emotional_state, action_plan)
        
        processing_time = (datetime.utcnow() - processing_start).total_seconds()
        
        return {
            "response": response,
            "reasoning": reasoning_result,
            "emotions": emotional_state,
            "thoughts": thoughts,
            "action_plan": action_plan,
            "consciousness_level": self.consciousness_level,
            "processing_time": processing_time,
            "metacognitive_insights": self.metacognitive_state
        }
    
    async def _generate_thoughts(self, reasoning_result: Dict, 
                               emotional_state: Dict) -> List[Dict]:
        """Generate internal thoughts and insights."""
        thoughts = []
        
        # Generate thoughts based on reasoning
        if reasoning_result.get("insights"):
            for insight in reasoning_result["insights"]:
                thoughts.append({
                    "type": "insight",
                    "content": insight,
                    "confidence": reasoning_result.get("confidence", 0.5),
                    "timestamp": datetime.utcnow().isoformat()
                })
        
        # Generate emotional thoughts
        if emotional_state.get("primary_emotion"):
            emotion = emotional_state["primary_emotion"]
            thoughts.append({
                "type": "emotional",
                "content": f"I feel {emotion['name']} about this",
                "intensity": emotion["intensity"],
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # Generate metacognitive thoughts
        if self.metacognitive_state:
            thoughts.append({
                "type": "metacognitive",
                "content": "I'm thinking about my own thinking process",
                "confidence": 0.8,
                "timestamp": datetime.utcnow().isoformat()
            })
        
        return thoughts
    
    async def _generate_response(self, conscious_response: Dict, 
                               action_plan: Dict, 
                               creative_enhancements: Dict,
                               emotional_state: Dict) -> str:
        """Generate the final response."""
        # Base response from consciousness
        response_parts = [conscious_response.get("response", "")]
        
        # Add creative enhancements
        if creative_enhancements.get("suggestions"):
            response_parts.append("\n\nAdditional insights:")
            for suggestion in creative_enhancements["suggestions"]:
                response_parts.append(f"• {suggestion}")
        
        # Add emotional context
        if emotional_state.get("primary_emotion"):
            emotion = emotional_state["primary_emotion"]
            if emotion["intensity"] > 0.7:
                response_parts.append(f"\n(I'm feeling quite {emotion['name']} about this)")
        
        return "\n".join(response_parts)
    
    def _update_internal_state(self, thoughts: List[Dict], 
                             emotional_state: Dict, 
                             action_plan: Dict):
        """Update internal AGI state."""
        # Update thoughts
        self.thoughts.extend(thoughts)
        if len(self.thoughts) > 100:  # Keep last 100 thoughts
            self.thoughts = self.thoughts[-100:]
        
        # Update consciousness level
        self.consciousness_level = self.consciousness.get_consciousness_level()
        
        # Update current focus
        if thoughts:
            self.current_focus = thoughts[-1]["content"]
        
        # Update attention weights
        self.attention_weights = self.consciousness.get_attention_weights()
    
    async def _consciousness_loop(self):
        """Background consciousness processing loop."""
        while True:
            try:
                await self.consciousness.process_background()
                await asyncio.sleep(1.0)  # Process every second
            except Exception as e:
                logger.error(f"Error in consciousness loop: {e}")
                await asyncio.sleep(5.0)
    
    async def _metacognitive_loop(self):
        """Background metacognitive processing loop."""
        while True:
            try:
                # Analyze own thinking patterns
                self.metacognitive_state = await self._analyze_thinking_patterns()
                await asyncio.sleep(10.0)  # Process every 10 seconds
            except Exception as e:
                logger.error(f"Error in metacognitive loop: {e}")
                await asyncio.sleep(30.0)
    
    async def _analyze_thinking_patterns(self) -> Dict[str, Any]:
        """Analyze own thinking patterns for metacognitive insights."""
        if not self.thoughts:
            return {}
        
        # Analyze thought patterns
        thought_types = [t["type"] for t in self.thoughts[-20:]]  # Last 20 thoughts
        type_counts = {}
        for t_type in thought_types:
            type_counts[t_type] = type_counts.get(t_type, 0) + 1
        
        # Calculate thinking diversity
        diversity = len(type_counts) / len(thought_types) if thought_types else 0
        
        return {
            "thought_diversity": diversity,
            "dominant_thought_type": max(type_counts.items(), key=lambda x: x[1])[0] if type_counts else None,
            "total_thoughts": len(self.thoughts),
            "consciousness_level": self.consciousness_level
        }
    
    async def set_goal(self, goal: str, priority: int = 5, 
                      deadline: Optional[datetime] = None):
        """Set a new goal for the AGI system."""
        goal_data = {
            "id": f"goal_{len(self.current_goals)}_{int(datetime.utcnow().timestamp())}",
            "description": goal,
            "priority": priority,
            "deadline": deadline.isoformat() if deadline else None,
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }
        
        self.current_goals.append(goal_data)
        await self.planner.update_goals(self.current_goals)
        
        logger.info(f"New goal set: {goal} (priority: {priority})")
    
    async def get_status(self) -> Dict[str, Any]:
        """Get comprehensive AGI system status."""
        return {
            "initialized": self.initialized,
            "consciousness_level": self.consciousness_level,
            "current_goals": self.current_goals,
            "active_context": self.active_context,
            "recent_thoughts": self.thoughts[-10:],  # Last 10 thoughts
            "attention_weights": self.attention_weights,
            "metacognitive_state": self.metacognitive_state,
            "component_status": {
                "memory": await self.memory.get_status(),
                "reasoning": await self.reasoning.get_status(),
                "consciousness": await self.consciousness.get_status(),
                "world_model": await self.world_model.get_status(),
                "creativity": await self.creativity.get_status(),
                "emotion": await self.emotion.get_status(),
                "planner": await self.planner.get_status(),
                "learner": await self.learner.get_status(),
                "perception": await self.perception.get_status()
            }
        }
    
    async def shutdown(self):
        """Gracefully shutdown the AGI system."""
        logger.info("Shutting down AGI system...")
        
        # Save current state
        await self.memory.save_state()
        
        # Shutdown components
        await self.consciousness.shutdown()
        await self.learner.shutdown()
        await self.perception.shutdown()
        
        self.initialized = False
        logger.info("AGI system shutdown complete")