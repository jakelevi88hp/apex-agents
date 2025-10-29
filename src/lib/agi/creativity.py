"""
Creativity Engine for AGI

Generates novel ideas, solutions, and creative outputs through various
creativity techniques and pattern combination.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import json
import random
import itertools
from collections import defaultdict

logger = logging.getLogger("apex_orchestrator.agi.creativity")


class CreativityEngine:
    """
    Advanced creativity engine for AGI.
    
    Implements:
    - Divergent thinking
    - Pattern combination
    - Analogical reasoning
    - Random idea generation
    - Constraint-based creativity
    - Collaborative creativity
    """
    
    def __init__(self, memory_system):
        self.memory = memory_system
        self.creative_patterns = {}
        self.idea_pool = []
        self.creative_constraints = {}
        self.innovation_history = []
        
        # Creativity parameters
        self.divergence_threshold = 0.7
        self.novelty_threshold = 0.6
        self.utility_threshold = 0.5
        self.max_ideas_per_session = 50
        
        # Creative techniques
        self.techniques = {
            "brainstorming": self._brainstorming,
            "scamper": self._scamper,
            "morphological_analysis": self._morphological_analysis,
            "random_word": self._random_word_technique,
            "analogical_transfer": self._analogical_transfer,
            "constraint_relaxation": self._constraint_relaxation
        }
        
        logger.info("Creativity engine initialized")
    
    async def initialize(self):
        """Initialize the creativity engine."""
        # Load creative patterns
        await self._load_creative_patterns()
        
        # Initialize idea generation
        await self._initialize_idea_generation()
        
        logger.info("Creativity engine initialized")
    
    async def _load_creative_patterns(self):
        """Load creative thinking patterns."""
        self.creative_patterns = {
            "combination": {
                "description": "Combine existing elements in new ways",
                "techniques": ["mashup", "hybrid", "fusion"]
            },
            "transformation": {
                "description": "Transform existing elements",
                "techniques": ["scale", "rotate", "invert", "simplify", "complexify"]
            },
            "elimination": {
                "description": "Remove elements to create new forms",
                "techniques": ["subtract", "minimize", "essentialize"]
            },
            "reversal": {
                "description": "Reverse or invert assumptions",
                "techniques": ["opposite", "backwards", "inside_out"]
            },
            "analogy": {
                "description": "Use analogies from other domains",
                "techniques": ["metaphor", "simile", "cross_domain"]
            }
        }
    
    async def _initialize_idea_generation(self):
        """Initialize idea generation capabilities."""
        # Load seed ideas from memory
        seed_ideas = await self._load_seed_ideas()
        self.idea_pool.extend(seed_ideas)
        
        # Initialize creative constraints
        self.creative_constraints = {
            "time": {"min": 1, "max": 1000, "unit": "minutes"},
            "resources": {"min": 1, "max": 100, "unit": "units"},
            "complexity": {"min": 1, "max": 10, "unit": "scale"},
            "novelty": {"min": 0.0, "max": 1.0, "unit": "score"}
        }
    
    async def _load_seed_ideas(self) -> List[Dict]:
        """Load seed ideas from memory."""
        # This would query the memory system for existing ideas
        # For now, return some basic seed ideas
        return [
            {"content": "AI-powered personal assistant", "category": "technology", "novelty": 0.6},
            {"content": "Self-healing materials", "category": "materials", "novelty": 0.8},
            {"content": "Virtual reality education", "category": "education", "novelty": 0.7}
        ]
    
    async def generate_ideas(self, prompt: str, technique: str = "brainstorming", 
                           num_ideas: int = 10, constraints: Dict = None) -> List[Dict]:
        """
        Generate creative ideas based on a prompt.
        
        Args:
            prompt: The prompt or problem to generate ideas for
            technique: The creativity technique to use
            num_ideas: Number of ideas to generate
            constraints: Creative constraints to apply
        
        Returns:
            List of generated ideas with metadata
        """
        if technique not in self.techniques:
            technique = "brainstorming"
        
        # Apply constraints
        if constraints:
            self.creative_constraints.update(constraints)
        
        # Generate ideas using selected technique
        ideas = await self.techniques[technique](prompt, num_ideas)
        
        # Evaluate and filter ideas
        evaluated_ideas = []
        for idea in ideas:
            evaluation = await self._evaluate_idea(idea, prompt)
            if evaluation["overall_score"] > 0.3:  # Minimum threshold
                evaluated_ideas.append({
                    **idea,
                    "evaluation": evaluation,
                    "generated_at": datetime.utcnow().isoformat()
                })
        
        # Sort by overall score
        evaluated_ideas.sort(key=lambda x: x["evaluation"]["overall_score"], reverse=True)
        
        # Add to idea pool
        self.idea_pool.extend(evaluated_ideas[:num_ideas])
        
        # Store in memory
        await self._store_ideas(evaluated_ideas[:num_ideas])
        
        return evaluated_ideas[:num_ideas]
    
    async def _brainstorming(self, prompt: str, num_ideas: int) -> List[Dict]:
        """Generate ideas using brainstorming technique."""
        ideas = []
        
        # Extract key concepts from prompt
        concepts = await self._extract_concepts(prompt)
        
        # Generate ideas by combining concepts
        for i in range(num_ideas):
            # Random combination of concepts
            if concepts:
                selected_concepts = random.sample(concepts, min(3, len(concepts)))
                idea_content = await self._combine_concepts(selected_concepts)
            else:
                idea_content = f"Creative solution for: {prompt}"
            
            ideas.append({
                "content": idea_content,
                "technique": "brainstorming",
                "source_concepts": concepts[:3] if concepts else []
            })
        
        return ideas
    
    async def _scamper(self, prompt: str, num_ideas: int) -> List[Dict]:
        """Generate ideas using SCAMPER technique."""
        ideas = []
        scamper_questions = [
            "Substitute: What can be substituted?",
            "Combine: What can be combined?",
            "Adapt: What can be adapted?",
            "Modify: What can be modified?",
            "Put to other uses: What other uses are there?",
            "Eliminate: What can be eliminated?",
            "Reverse: What can be reversed?"
        ]
        
        for i in range(num_ideas):
            question = random.choice(scamper_questions)
            idea_content = await self._apply_scamper_question(prompt, question)
            
            ideas.append({
                "content": idea_content,
                "technique": "scamper",
                "question": question
            })
        
        return ideas
    
    async def _morphological_analysis(self, prompt: str, num_ideas: int) -> List[Dict]:
        """Generate ideas using morphological analysis."""
        ideas = []
        
        # Define dimensions for analysis
        dimensions = await self._define_dimensions(prompt)
        
        # Generate combinations
        combinations = list(itertools.product(*dimensions.values()))
        
        # Select random combinations
        selected_combinations = random.sample(combinations, min(num_ideas, len(combinations)))
        
        for combination in selected_combinations:
            idea_content = await self._combine_dimensions(dimensions, combination)
            
            ideas.append({
                "content": idea_content,
                "technique": "morphological_analysis",
                "dimensions": dict(zip(dimensions.keys(), combination))
            })
        
        return ideas
    
    async def _random_word_technique(self, prompt: str, num_ideas: int) -> List[Dict]:
        """Generate ideas using random word technique."""
        ideas = []
        
        # Random words for inspiration
        random_words = [
            "butterfly", "mountain", "ocean", "forest", "city", "desert",
            "music", "painting", "dance", "story", "dream", "adventure"
        ]
        
        for i in range(num_ideas):
            word = random.choice(random_words)
            idea_content = await self._connect_word_to_prompt(prompt, word)
            
            ideas.append({
                "content": idea_content,
                "technique": "random_word",
                "inspiration_word": word
            })
        
        return ideas
    
    async def _analogical_transfer(self, prompt: str, num_ideas: int) -> List[Dict]:
        """Generate ideas using analogical transfer."""
        ideas = []
        
        # Find analogies from memory
        analogies = await self._find_analogies(prompt)
        
        for i in range(num_ideas):
            if analogies:
                analogy = random.choice(analogies)
                idea_content = await self._transfer_analogy(prompt, analogy)
            else:
                idea_content = f"Analogical solution for: {prompt}"
            
            ideas.append({
                "content": idea_content,
                "technique": "analogical_transfer",
                "source_analogy": analogy if analogies else None
            })
        
        return ideas
    
    async def _constraint_relaxation(self, prompt: str, num_ideas: int) -> List[Dict]:
        """Generate ideas by relaxing constraints."""
        ideas = []
        
        # Identify constraints in prompt
        constraints = await self._identify_constraints(prompt)
        
        for i in range(num_ideas):
            # Relax a random constraint
            if constraints:
                constraint = random.choice(constraints)
                idea_content = await self._relax_constraint(prompt, constraint)
            else:
                idea_content = f"Constraint-free solution for: {prompt}"
            
            ideas.append({
                "content": idea_content,
                "technique": "constraint_relaxation",
                "relaxed_constraint": constraint if constraints else None
            })
        
        return ideas
    
    async def _extract_concepts(self, prompt: str) -> List[str]:
        """Extract key concepts from prompt."""
        # Simple concept extraction (could be enhanced with NLP)
        words = prompt.lower().split()
        concepts = []
        
        # Filter out common words
        stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        concepts = [word for word in words if word not in stop_words and len(word) > 3]
        
        return concepts
    
    async def _combine_concepts(self, concepts: List[str]) -> str:
        """Combine concepts into an idea."""
        if not concepts:
            return "Creative solution"
        
        # Simple combination
        if len(concepts) == 1:
            return f"Enhanced {concepts[0]} system"
        elif len(concepts) == 2:
            return f"{concepts[0]}-{concepts[1]} integration"
        else:
            return f"Multi-dimensional {concepts[0]} solution"
    
    async def _apply_scamper_question(self, prompt: str, question: str) -> str:
        """Apply SCAMPER question to prompt."""
        if "Substitute" in question:
            return f"Alternative approach to: {prompt}"
        elif "Combine" in question:
            return f"Integrated solution combining: {prompt}"
        elif "Adapt" in question:
            return f"Adapted version of: {prompt}"
        elif "Modify" in question:
            return f"Modified approach to: {prompt}"
        elif "Put to other uses" in question:
            return f"Alternative application of: {prompt}"
        elif "Eliminate" in question:
            return f"Simplified version of: {prompt}"
        elif "Reverse" in question:
            return f"Reversed approach to: {prompt}"
        else:
            return f"SCAMPER-inspired solution for: {prompt}"
    
    async def _define_dimensions(self, prompt: str) -> Dict[str, List[str]]:
        """Define dimensions for morphological analysis."""
        # Simple dimension definition
        return {
            "approach": ["technical", "social", "creative", "analytical"],
            "scale": ["individual", "team", "organization", "global"],
            "timeframe": ["immediate", "short-term", "medium-term", "long-term"],
            "focus": ["efficiency", "innovation", "sustainability", "user_experience"]
        }
    
    async def _combine_dimensions(self, dimensions: Dict, combination: Tuple) -> str:
        """Combine dimensions into an idea."""
        dim_names = list(dimensions.keys())
        dim_values = list(combination)
        
        idea_parts = []
        for name, value in zip(dim_names, dim_values):
            idea_parts.append(f"{name}: {value}")
        
        return f"Solution with {', '.join(idea_parts)}"
    
    async def _connect_word_to_prompt(self, prompt: str, word: str) -> str:
        """Connect a random word to the prompt."""
        return f"Inspired by {word}: {prompt}"
    
    async def _find_analogies(self, prompt: str) -> List[Dict]:
        """Find analogies from memory."""
        # This would query the memory system for analogies
        # For now, return some basic analogies
        return [
            {"source": "nature", "target": "technology", "relationship": "adaptation"},
            {"source": "music", "target": "mathematics", "relationship": "patterns"},
            {"source": "cooking", "target": "programming", "relationship": "recipes"}
        ]
    
    async def _transfer_analogy(self, prompt: str, analogy: Dict) -> str:
        """Transfer analogy to prompt."""
        source = analogy["source"]
        target = analogy["target"]
        return f"Applying {source} principles to {prompt} (inspired by {target})"
    
    async def _identify_constraints(self, prompt: str) -> List[str]:
        """Identify constraints in prompt."""
        constraints = []
        
        # Simple constraint identification
        constraint_words = ["must", "cannot", "limited", "restricted", "only", "never"]
        words = prompt.lower().split()
        
        for word in words:
            if word in constraint_words:
                constraints.append(word)
        
        return constraints
    
    async def _relax_constraint(self, prompt: str, constraint: str) -> str:
        """Relax a constraint in prompt."""
        return f"Solution without {constraint} constraint: {prompt}"
    
    async def _evaluate_idea(self, idea: Dict, prompt: str) -> Dict[str, float]:
        """Evaluate an idea on multiple criteria."""
        content = idea["content"]
        
        # Novelty (how new/unique is the idea)
        novelty = await self._calculate_novelty(content)
        
        # Utility (how useful/practical is the idea)
        utility = await self._calculate_utility(content, prompt)
        
        # Feasibility (how feasible is the idea)
        feasibility = await self._calculate_feasibility(content)
        
        # Originality (how original is the idea)
        originality = await self._calculate_originality(content)
        
        # Overall score (weighted average)
        overall_score = (
            novelty * 0.3 +
            utility * 0.3 +
            feasibility * 0.2 +
            originality * 0.2
        )
        
        return {
            "novelty": novelty,
            "utility": utility,
            "feasibility": feasibility,
            "originality": originality,
            "overall_score": overall_score
        }
    
    async def _calculate_novelty(self, content: str) -> float:
        """Calculate novelty score for an idea."""
        # Simple novelty calculation based on word uniqueness
        words = content.lower().split()
        unique_words = set(words)
        
        if not words:
            return 0.0
        
        novelty = len(unique_words) / len(words)
        return min(1.0, novelty)
    
    async def _calculate_utility(self, content: str, prompt: str) -> float:
        """Calculate utility score for an idea."""
        # Simple utility calculation based on relevance to prompt
        prompt_words = set(prompt.lower().split())
        content_words = set(content.lower().split())
        
        if not prompt_words:
            return 0.5
        
        overlap = len(prompt_words.intersection(content_words))
        utility = overlap / len(prompt_words)
        
        return min(1.0, utility)
    
    async def _calculate_feasibility(self, content: str) -> float:
        """Calculate feasibility score for an idea."""
        # Simple feasibility calculation
        feasibility_indicators = [
            "simple", "easy", "practical", "implementable", "realistic"
        ]
        
        content_lower = content.lower()
        positive_indicators = sum(1 for indicator in feasibility_indicators if indicator in content_lower)
        
        # Base feasibility
        feasibility = 0.5
        
        # Adjust based on indicators
        feasibility += positive_indicators * 0.1
        
        return min(1.0, feasibility)
    
    async def _calculate_originality(self, content: str) -> float:
        """Calculate originality score for an idea."""
        # Simple originality calculation based on idea pool comparison
        if not self.idea_pool:
            return 0.5
        
        # Check similarity to existing ideas
        similarities = []
        for existing_idea in self.idea_pool[-10:]:  # Check last 10 ideas
            similarity = await self._calculate_similarity(content, existing_idea["content"])
            similarities.append(similarity)
        
        if similarities:
            avg_similarity = sum(similarities) / len(similarities)
            originality = 1.0 - avg_similarity
        else:
            originality = 0.5
        
        return max(0.0, originality)
    
    async def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts."""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    async def _store_ideas(self, ideas: List[Dict]):
        """Store generated ideas in memory."""
        for idea in ideas:
            await self.memory.store_episodic_memory(
                event_type="creative_idea",
                description=idea["content"],
                context={"technique": idea["technique"]},
                importance_score=idea["evaluation"]["overall_score"]
            )
    
    async def enhance_plan(self, plan: Dict) -> Dict[str, Any]:
        """Enhance an existing plan with creative improvements."""
        enhanced_plan = plan.copy()
        suggestions = []
        
        # Generate creative suggestions for each step
        for step in plan.get("steps", []):
            step_suggestions = await self._enhance_step(step)
            suggestions.extend(step_suggestions)
        
        # Add creative alternatives
        alternatives = await self._generate_alternatives(plan)
        
        enhanced_plan["creative_enhancements"] = {
            "suggestions": suggestions,
            "alternatives": alternatives,
            "enhancement_techniques": list(self.techniques.keys())
        }
        
        return enhanced_plan
    
    async def _enhance_step(self, step: Dict) -> List[str]:
        """Enhance a single step with creative suggestions."""
        suggestions = []
        
        description = step.get("description", "")
        
        # Generate suggestions using different techniques
        for technique_name in ["scamper", "random_word", "constraint_relaxation"]:
            technique = self.techniques[technique_name]
            ideas = await technique(description, 2)
            
            for idea in ideas:
                suggestions.append(f"Creative enhancement: {idea['content']}")
        
        return suggestions
    
    async def _generate_alternatives(self, plan: Dict) -> List[Dict]:
        """Generate alternative approaches to the plan."""
        alternatives = []
        
        # Generate alternatives using different techniques
        for technique_name in ["brainstorming", "analogical_transfer", "morphological_analysis"]:
            technique = self.techniques[technique_name]
            ideas = await technique(f"Alternative approach to: {plan.get('intent', '')}", 3)
            
            for idea in ideas:
                alternatives.append({
                    "description": idea["content"],
                    "technique": technique_name,
                    "confidence": idea.get("evaluation", {}).get("overall_score", 0.5)
                })
        
        return alternatives
    
    async def get_status(self) -> Dict[str, Any]:
        """Get creativity engine status."""
        return {
            "techniques_available": len(self.techniques),
            "idea_pool_size": len(self.idea_pool),
            "creative_patterns": len(self.creative_patterns),
            "innovation_history": len(self.innovation_history),
            "constraints": self.creative_constraints
        }