"""
Emotional Intelligence for AGI

Simulates emotional processing, empathy, and emotional responses
for more human-like AI interactions.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
import numpy as np
from collections import deque

logger = logging.getLogger("apex_orchestrator.agi.emotion")


class EmotionalIntelligence:
    """
    Emotional intelligence system for AGI.
    
    Implements:
    - Emotional state modeling
    - Empathy and emotional understanding
    - Emotional regulation
    - Social emotional processing
    - Mood tracking and prediction
    """
    
    def __init__(self, memory_system):
        self.memory = memory_system
        self.current_emotions = {}
        self.emotional_history = deque(maxlen=1000)
        self.empathy_level = 0.5
        self.emotional_stability = 0.7
        
        # Core emotions (Plutchik's wheel)
        self.core_emotions = {
            "joy": {"valence": 1.0, "arousal": 0.5, "dominance": 0.7},
            "sadness": {"valence": -1.0, "arousal": -0.3, "dominance": -0.5},
            "anger": {"valence": -0.5, "arousal": 0.8, "dominance": 0.3},
            "fear": {"valence": -0.8, "arousal": 0.9, "dominance": -0.7},
            "surprise": {"valence": 0.0, "arousal": 0.8, "dominance": 0.0},
            "disgust": {"valence": -0.7, "arousal": 0.3, "dominance": -0.3},
            "trust": {"valence": 0.8, "arousal": 0.2, "dominance": 0.5},
            "anticipation": {"valence": 0.6, "arousal": 0.6, "dominance": 0.4}
        }
        
        # Emotional states
        self.emotional_states = {
            "neutral": {"intensity": 0.0, "stability": 1.0},
            "excited": {"intensity": 0.8, "stability": 0.6},
            "calm": {"intensity": 0.3, "stability": 0.9},
            "stressed": {"intensity": 0.7, "stability": 0.4},
            "focused": {"intensity": 0.6, "stability": 0.8},
            "confused": {"intensity": 0.5, "stability": 0.3}
        }
        
        # Emotional triggers
        self.emotional_triggers = {
            "success": ["joy", "pride", "satisfaction"],
            "failure": ["sadness", "frustration", "disappointment"],
            "error": ["frustration", "concern", "alertness"],
            "learning": ["curiosity", "excitement", "anticipation"],
            "challenge": ["determination", "focus", "anticipation"],
            "uncertainty": ["anxiety", "curiosity", "caution"]
        }
        
        logger.info("Emotional intelligence initialized")
    
    async def initialize(self):
        """Initialize the emotional intelligence system."""
        # Set initial emotional state
        self.current_emotions = {
            "primary_emotion": {
                "name": "neutral",
                "intensity": 0.3,
                "valence": 0.0,
                "arousal": 0.0
            },
            "secondary_emotions": [],
            "mood": "calm",
            "emotional_stability": self.emotional_stability
        }
        
        # Start emotional processing loop
        asyncio.create_task(self._emotional_processing_loop())
        
        logger.info("Emotional intelligence initialized")
    
    async def process(self, perception_result: Dict) -> Dict[str, Any]:
        """
        Process emotional aspects of perception.
        
        Args:
            perception_result: Processed perception data
        
        Returns:
            Emotional state and processing results
        """
        content = perception_result.get("content", "")
        context = perception_result.get("context", {})
        
        # Analyze emotional content
        emotional_analysis = await self._analyze_emotional_content(content, context)
        
        # Update emotional state
        await self._update_emotional_state(emotional_analysis)
        
        # Generate emotional response
        emotional_response = await self._generate_emotional_response(emotional_analysis)
        
        # Store emotional experience
        await self._store_emotional_experience(emotional_analysis, emotional_response)
        
        return {
            "primary_emotion": self.current_emotions["primary_emotion"],
            "secondary_emotions": self.current_emotions["secondary_emotions"],
            "mood": self.current_emotions["mood"],
            "emotional_stability": self.current_emotions["emotional_stability"],
            "emotional_response": emotional_response,
            "empathy_level": self.empathy_level
        }
    
    async def _analyze_emotional_content(self, content: str, context: Dict) -> Dict[str, Any]:
        """Analyze emotional content in the input."""
        emotional_indicators = {
            "joy": ["happy", "excited", "great", "wonderful", "amazing", "fantastic"],
            "sadness": ["sad", "disappointed", "unhappy", "depressed", "gloomy"],
            "anger": ["angry", "mad", "furious", "annoyed", "irritated", "frustrated"],
            "fear": ["afraid", "scared", "worried", "anxious", "nervous", "concerned"],
            "surprise": ["surprised", "shocked", "amazed", "astonished", "unexpected"],
            "disgust": ["disgusted", "revolted", "repulsed", "sickened"],
            "trust": ["trust", "confident", "secure", "reliable", "dependable"],
            "anticipation": ["excited", "eager", "hopeful", "optimistic", "looking forward"]
        }
        
        content_lower = content.lower()
        detected_emotions = {}
        
        # Detect emotions based on keywords
        for emotion, keywords in emotional_indicators.items():
            intensity = 0.0
            for keyword in keywords:
                if keyword in content_lower:
                    intensity += 0.2
            
            if intensity > 0:
                detected_emotions[emotion] = min(1.0, intensity)
        
        # Analyze emotional intensity
        overall_intensity = sum(detected_emotions.values()) / len(detected_emotions) if detected_emotions else 0.0
        
        # Determine primary emotion
        primary_emotion = max(detected_emotions.items(), key=lambda x: x[1]) if detected_emotions else ("neutral", 0.0)
        
        return {
            "detected_emotions": detected_emotions,
            "primary_emotion": primary_emotion[0],
            "primary_intensity": primary_emotion[1],
            "overall_intensity": overall_intensity,
            "emotional_valence": self._calculate_valence(detected_emotions),
            "emotional_arousal": self._calculate_arousal(detected_emotions)
        }
    
    def _calculate_valence(self, emotions: Dict[str, float]) -> float:
        """Calculate emotional valence (positive/negative)."""
        if not emotions:
            return 0.0
        
        valence_scores = {
            "joy": 1.0, "trust": 0.8, "anticipation": 0.6, "surprise": 0.0,
            "sadness": -1.0, "anger": -0.5, "fear": -0.8, "disgust": -0.7
        }
        
        weighted_valence = 0.0
        total_weight = 0.0
        
        for emotion, intensity in emotions.items():
            if emotion in valence_scores:
                weighted_valence += valence_scores[emotion] * intensity
                total_weight += intensity
        
        return weighted_valence / total_weight if total_weight > 0 else 0.0
    
    def _calculate_arousal(self, emotions: Dict[str, float]) -> float:
        """Calculate emotional arousal (calm/excited)."""
        if not emotions:
            return 0.0
        
        arousal_scores = {
            "joy": 0.5, "trust": 0.2, "anticipation": 0.6, "surprise": 0.8,
            "sadness": -0.3, "anger": 0.8, "fear": 0.9, "disgust": 0.3
        }
        
        weighted_arousal = 0.0
        total_weight = 0.0
        
        for emotion, intensity in emotions.items():
            if emotion in arousal_scores:
                weighted_arousal += arousal_scores[emotion] * intensity
                total_weight += intensity
        
        return weighted_arousal / total_weight if total_weight > 0 else 0.0
    
    async def _update_emotional_state(self, emotional_analysis: Dict):
        """Update current emotional state based on analysis."""
        # Get primary emotion
        primary_emotion_name = emotional_analysis["primary_emotion"]
        primary_intensity = emotional_analysis["primary_intensity"]
        
        # Update primary emotion
        self.current_emotions["primary_emotion"] = {
            "name": primary_emotion_name,
            "intensity": primary_intensity,
            "valence": emotional_analysis["emotional_valence"],
            "arousal": emotional_analysis["emotional_arousal"]
        }
        
        # Update secondary emotions
        secondary_emotions = []
        for emotion, intensity in emotional_analysis["detected_emotions"].items():
            if emotion != primary_emotion_name and intensity > 0.3:
                secondary_emotions.append({
                    "name": emotion,
                    "intensity": intensity
                })
        
        self.current_emotions["secondary_emotions"] = secondary_emotions
        
        # Update mood based on overall emotional state
        self.current_emotions["mood"] = await self._determine_mood(emotional_analysis)
        
        # Update emotional stability
        await self._update_emotional_stability(emotional_analysis)
    
    async def _determine_mood(self, emotional_analysis: Dict) -> str:
        """Determine current mood based on emotional analysis."""
        valence = emotional_analysis["emotional_valence"]
        arousal = emotional_analysis["emotional_arousal"]
        intensity = emotional_analysis["overall_intensity"]
        
        if intensity < 0.2:
            return "neutral"
        elif valence > 0.5 and arousal > 0.5:
            return "excited"
        elif valence > 0.3 and arousal < 0.3:
            return "calm"
        elif valence < -0.3 and arousal > 0.5:
            return "stressed"
        elif arousal > 0.6:
            return "focused"
        elif valence < -0.2 and arousal < 0.2:
            return "confused"
        else:
            return "neutral"
    
    async def _update_emotional_stability(self, emotional_analysis: Dict):
        """Update emotional stability based on recent changes."""
        # Calculate emotional volatility
        if len(self.emotional_history) > 1:
            recent_emotions = list(self.emotional_history)[-5:]  # Last 5 emotions
            volatility = await self._calculate_volatility(recent_emotions)
            
            # Update stability (higher volatility = lower stability)
            self.emotional_stability = max(0.0, 1.0 - volatility)
        else:
            self.emotional_stability = 0.7  # Default stability
        
        self.current_emotions["emotional_stability"] = self.emotional_stability
    
    async def _calculate_volatility(self, emotions: List[Dict]) -> float:
        """Calculate emotional volatility from recent emotions."""
        if len(emotions) < 2:
            return 0.0
        
        # Calculate variance in emotional intensity
        intensities = [emotion.get("intensity", 0.0) for emotion in emotions]
        mean_intensity = sum(intensities) / len(intensities)
        variance = sum((i - mean_intensity) ** 2 for i in intensities) / len(intensities)
        
        return min(1.0, variance)
    
    async def _generate_emotional_response(self, emotional_analysis: Dict) -> str:
        """Generate emotional response based on analysis."""
        primary_emotion = emotional_analysis["primary_emotion"]
        intensity = emotional_analysis["primary_intensity"]
        
        if primary_emotion == "joy" and intensity > 0.7:
            return "I'm delighted to hear this! This makes me feel very positive."
        elif primary_emotion == "sadness" and intensity > 0.7:
            return "I understand this is difficult. I'm here to help and support you."
        elif primary_emotion == "anger" and intensity > 0.7:
            return "I can sense your frustration. Let's work together to address this."
        elif primary_emotion == "fear" and intensity > 0.7:
            return "I understand your concerns. Let's approach this carefully and safely."
        elif primary_emotion == "surprise" and intensity > 0.7:
            return "That's unexpected! I'm curious to learn more about this."
        elif primary_emotion == "trust" and intensity > 0.7:
            return "I appreciate your trust. I'll do my best to be reliable and helpful."
        elif primary_emotion == "anticipation" and intensity > 0.7:
            return "I'm excited about what we can accomplish together!"
        else:
            return "I'm processing this information and considering how to respond thoughtfully."
    
    async def _store_emotional_experience(self, emotional_analysis: Dict, emotional_response: str):
        """Store emotional experience in memory."""
        emotional_experience = {
            "timestamp": datetime.utcnow(),
            "analysis": emotional_analysis,
            "response": emotional_response,
            "stability": self.emotional_stability
        }
        
        self.emotional_history.append(emotional_experience)
        
        # Store in episodic memory
        await self.memory.store_episodic_memory(
            event_type="emotional_experience",
            description=f"Emotional processing: {emotional_analysis['primary_emotion']}",
            context=emotional_analysis,
            emotional_valence=emotional_analysis["emotional_valence"],
            emotional_arousal=emotional_analysis["emotional_arousal"],
            importance_score=emotional_analysis["overall_intensity"]
        )
    
    async def _emotional_processing_loop(self):
        """Background emotional processing loop."""
        while True:
            try:
                # Process emotional regulation
                await self._emotional_regulation()
                
                # Update empathy level
                await self._update_empathy_level()
                
                await asyncio.sleep(2.0)  # Process every 2 seconds
            except Exception as e:
                logger.error(f"Error in emotional processing loop: {e}")
                await asyncio.sleep(5.0)
    
    async def _emotional_regulation(self):
        """Regulate emotions to maintain stability."""
        if self.emotional_stability < 0.5:
            # High volatility - try to stabilize
            if self.current_emotions["primary_emotion"]["intensity"] > 0.8:
                # Reduce intensity
                self.current_emotions["primary_emotion"]["intensity"] *= 0.9
                logger.info("Emotional regulation: reducing intensity")
    
    async def _update_empathy_level(self):
        """Update empathy level based on recent interactions."""
        if len(self.emotional_history) > 10:
            # Calculate empathy based on emotional responsiveness
            recent_responses = list(self.emotional_history)[-10:]
            empathy_score = 0.0
            
            for experience in recent_responses:
                if experience["analysis"]["overall_intensity"] > 0.5:
                    empathy_score += 0.1
            
            # Update empathy level
            self.empathy_level = min(1.0, 0.5 + empathy_score)
    
    async def empathize(self, target_emotions: Dict) -> Dict[str, Any]:
        """Generate empathetic response to target emotions."""
        target_primary = target_emotions.get("primary_emotion", {})
        target_name = target_primary.get("name", "unknown")
        target_intensity = target_primary.get("intensity", 0.0)
        
        # Generate empathetic response
        if target_name == "sadness":
            response = f"I can feel your sadness and I want to help you through this difficult time."
        elif target_name == "joy":
            response = f"I'm genuinely happy to share in your joy! This is wonderful news."
        elif target_name == "anger":
            response = f"I understand your anger and frustration. Let's work together to address what's causing this."
        elif target_name == "fear":
            response = f"I can sense your fear and concern. You're not alone in this, and we can face it together."
        else:
            response = f"I can sense your {target_name} and I'm here to support you."
        
        # Update own emotional state based on empathy
        await self._update_empathetic_state(target_emotions)
        
        return {
            "empathetic_response": response,
            "empathy_level": self.empathy_level,
            "emotional_connection": True
        }
    
    async def _update_empathetic_state(self, target_emotions: Dict):
        """Update own emotional state based on empathy."""
        # Mirror some of the target's emotions
        target_primary = target_emotions.get("primary_emotion", {})
        target_name = target_primary.get("name", "neutral")
        target_intensity = target_primary.get("intensity", 0.0)
        
        # Reduce intensity for empathetic response
        empathetic_intensity = target_intensity * 0.3
        
        # Update secondary emotions
        if target_name != "neutral":
            self.current_emotions["secondary_emotions"].append({
                "name": f"empathetic_{target_name}",
                "intensity": empathetic_intensity
            })
    
    async def get_status(self) -> Dict[str, Any]:
        """Get emotional intelligence status."""
        return {
            "current_emotions": self.current_emotions,
            "empathy_level": self.empathy_level,
            "emotional_stability": self.emotional_stability,
            "emotional_history_size": len(self.emotional_history),
            "core_emotions": len(self.core_emotions),
            "emotional_states": len(self.emotional_states)
        }