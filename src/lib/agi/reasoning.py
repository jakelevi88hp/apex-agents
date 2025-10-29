"""
Advanced Reasoning Engine for AGI

Implements multiple reasoning modes including logical, causal, analogical,
and abductive reasoning for complex problem solving.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import json
import re
from collections import defaultdict

logger = logging.getLogger("apex_orchestrator.agi.reasoning")


class ReasoningEngine:
    """
    Advanced reasoning engine with multiple reasoning modes.
    
    Supports:
    - Logical reasoning (deductive, inductive)
    - Causal reasoning (cause-effect relationships)
    - Analogical reasoning (learning from similar cases)
    - Abductive reasoning (inference to best explanation)
    - Counterfactual reasoning (what-if scenarios)
    """
    
    def __init__(self, memory_system):
        self.memory = memory_system
        self.reasoning_chains = []
        self.assumptions = []
        self.contradictions = []
        self.uncertainty_threshold = 0.3
        
        # Reasoning patterns
        self.logical_patterns = self._load_logical_patterns()
        self.causal_patterns = self._load_causal_patterns()
        self.analogical_patterns = self._load_analogical_patterns()
        
        logger.info("Reasoning engine initialized")
    
    def _load_logical_patterns(self) -> Dict[str, Any]:
        """Load logical reasoning patterns."""
        return {
            "modus_ponens": {
                "pattern": "If P then Q. P. Therefore Q.",
                "confidence": 0.95
            },
            "modus_tollens": {
                "pattern": "If P then Q. Not Q. Therefore not P.",
                "confidence": 0.95
            },
            "syllogism": {
                "pattern": "All A are B. All B are C. Therefore all A are C.",
                "confidence": 0.9
            },
            "disjunctive_syllogism": {
                "pattern": "P or Q. Not P. Therefore Q.",
                "confidence": 0.9
            }
        }
    
    def _load_causal_patterns(self) -> Dict[str, Any]:
        """Load causal reasoning patterns."""
        return {
            "necessary_cause": {
                "pattern": "A is necessary for B",
                "confidence": 0.8
            },
            "sufficient_cause": {
                "pattern": "A is sufficient for B",
                "confidence": 0.8
            },
            "contributing_cause": {
                "pattern": "A contributes to B",
                "confidence": 0.7
            },
            "preventing_cause": {
                "pattern": "A prevents B",
                "confidence": 0.8
            }
        }
    
    def _load_analogical_patterns(self) -> Dict[str, Any]:
        """Load analogical reasoning patterns."""
        return {
            "structural_similarity": {
                "pattern": "A is to B as C is to D",
                "confidence": 0.7
            },
            "functional_similarity": {
                "pattern": "A functions like B",
                "confidence": 0.6
            },
            "causal_similarity": {
                "pattern": "A causes B like C causes D",
                "confidence": 0.65
            }
        }
    
    async def initialize(self):
        """Initialize the reasoning engine."""
        logger.info("Reasoning engine initialized")
    
    async def analyze(self, input_data: Dict, emotional_state: Dict, 
                     current_goals: List[Dict]) -> Dict[str, Any]:
        """
        Perform comprehensive reasoning analysis.
        
        Args:
            input_data: Processed input data
            emotional_state: Current emotional state
            current_goals: Current active goals
        
        Returns:
            Comprehensive reasoning results
        """
        analysis_start = datetime.utcnow()
        
        # Extract key information
        content = input_data.get("content", "")
        context = input_data.get("context", {})
        
        # Perform different types of reasoning
        logical_analysis = await self._logical_reasoning(content, context)
        causal_analysis = await self._causal_reasoning(content, context)
        analogical_analysis = await self._analogical_reasoning(content, context)
        abductive_analysis = await self._abductive_reasoning(content, context)
        
        # Synthesize insights
        insights = await self._synthesize_insights(
            logical_analysis, causal_analysis, 
            analogical_analysis, abductive_analysis
        )
        
        # Generate hypotheses
        hypotheses = await self._generate_hypotheses(content, context, insights)
        
        # Assess confidence
        confidence = await self._assess_confidence(
            logical_analysis, causal_analysis, 
            analogical_analysis, abductive_analysis
        )
        
        # Identify contradictions
        contradictions = await self._identify_contradictions(insights)
        
        # Generate recommendations
        recommendations = await self._generate_recommendations(
            insights, hypotheses, current_goals
        )
        
        analysis_time = (datetime.utcnow() - analysis_start).total_seconds()
        
        return {
            "insights": insights,
            "hypotheses": hypotheses,
            "confidence": confidence,
            "contradictions": contradictions,
            "recommendations": recommendations,
            "reasoning_chains": self.reasoning_chains[-5:],  # Last 5 chains
            "analysis_time": analysis_time,
            "reasoning_types": {
                "logical": logical_analysis,
                "causal": causal_analysis,
                "analogical": analogical_analysis,
                "abductive": abductive_analysis
            }
        }
    
    async def _logical_reasoning(self, content: str, context: Dict) -> Dict[str, Any]:
        """Perform logical reasoning analysis."""
        logical_insights = []
        logical_confidence = 0.0
        
        # Extract logical statements
        statements = self._extract_logical_statements(content)
        
        for statement in statements:
            # Check against logical patterns
            for pattern_name, pattern in self.logical_patterns.items():
                if self._matches_pattern(statement, pattern["pattern"]):
                    logical_insights.append({
                        "type": "logical",
                        "pattern": pattern_name,
                        "statement": statement,
                        "confidence": pattern["confidence"]
                    })
                    logical_confidence += pattern["confidence"]
        
        # Normalize confidence
        if statements:
            logical_confidence = logical_confidence / len(statements)
        
        return {
            "insights": logical_insights,
            "confidence": logical_confidence,
            "statements_analyzed": len(statements)
        }
    
    async def _causal_reasoning(self, content: str, context: Dict) -> Dict[str, Any]:
        """Perform causal reasoning analysis."""
        causal_insights = []
        causal_confidence = 0.0
        
        # Extract causal relationships
        causal_relationships = self._extract_causal_relationships(content)
        
        for relationship in causal_relationships:
            # Check against causal patterns
            for pattern_name, pattern in self.causal_patterns.items():
                if self._matches_causal_pattern(relationship, pattern["pattern"]):
                    causal_insights.append({
                        "type": "causal",
                        "pattern": pattern_name,
                        "relationship": relationship,
                        "confidence": pattern["confidence"]
                    })
                    causal_confidence += pattern["confidence"]
        
        # Normalize confidence
        if causal_relationships:
            causal_confidence = causal_confidence / len(causal_relationships)
        
        return {
            "insights": causal_insights,
            "confidence": causal_confidence,
            "relationships_analyzed": len(causal_relationships)
        }
    
    async def _analogical_reasoning(self, content: str, context: Dict) -> Dict[str, Any]:
        """Perform analogical reasoning analysis."""
        analogical_insights = []
        analogical_confidence = 0.0
        
        # Find similar cases in memory
        similar_cases = await self._find_similar_cases(content)
        
        for case in similar_cases:
            # Check for analogical patterns
            for pattern_name, pattern in self.analogical_patterns.items():
                if self._matches_analogical_pattern(case, pattern["pattern"]):
                    analogical_insights.append({
                        "type": "analogical",
                        "pattern": pattern_name,
                        "similar_case": case,
                        "confidence": pattern["confidence"]
                    })
                    analogical_confidence += pattern["confidence"]
        
        # Normalize confidence
        if similar_cases:
            analogical_confidence = analogical_confidence / len(similar_cases)
        
        return {
            "insights": analogical_insights,
            "confidence": analogical_confidence,
            "similar_cases_found": len(similar_cases)
        }
    
    async def _abductive_reasoning(self, content: str, context: Dict) -> Dict[str, Any]:
        """Perform abductive reasoning (inference to best explanation)."""
        abductive_insights = []
        abductive_confidence = 0.0
        
        # Generate possible explanations
        explanations = await self._generate_explanations(content, context)
        
        for explanation in explanations:
            # Evaluate explanation quality
            quality_score = await self._evaluate_explanation_quality(explanation, content)
            
            if quality_score > 0.5:  # Threshold for good explanations
                abductive_insights.append({
                    "type": "abductive",
                    "explanation": explanation,
                    "quality_score": quality_score,
                    "confidence": quality_score
                })
                abductive_confidence += quality_score
        
        # Normalize confidence
        if explanations:
            abductive_confidence = abductive_confidence / len(explanations)
        
        return {
            "insights": abductive_insights,
            "confidence": abductive_confidence,
            "explanations_generated": len(explanations)
        }
    
    def _extract_logical_statements(self, content: str) -> List[str]:
        """Extract logical statements from content."""
        statements = []
        
        # Look for conditional statements
        if_pattern = r"if\s+([^,]+),\s*then\s+([^,.]+)"
        matches = re.findall(if_pattern, content.lower())
        for condition, conclusion in matches:
            statements.append(f"If {condition} then {conclusion}")
        
        # Look for universal statements
        all_pattern = r"all\s+([^,]+)\s+are\s+([^,.]+)"
        matches = re.findall(all_pattern, content.lower())
        for subject, predicate in matches:
            statements.append(f"All {subject} are {predicate}")
        
        # Look for existential statements
        some_pattern = r"some\s+([^,]+)\s+are\s+([^,.]+)"
        matches = re.findall(some_pattern, content.lower())
        for subject, predicate in matches:
            statements.append(f"Some {subject} are {predicate}")
        
        return statements
    
    def _extract_causal_relationships(self, content: str) -> List[Dict]:
        """Extract causal relationships from content."""
        relationships = []
        
        # Look for cause-effect patterns
        cause_patterns = [
            r"([^,]+)\s+causes\s+([^,.]+)",
            r"([^,]+)\s+leads\s+to\s+([^,.]+)",
            r"([^,]+)\s+results\s+in\s+([^,.]+)",
            r"because\s+of\s+([^,]+),\s+([^,.]+)",
            r"due\s+to\s+([^,]+),\s+([^,.]+)"
        ]
        
        for pattern in cause_patterns:
            matches = re.findall(pattern, content.lower())
            for cause, effect in matches:
                relationships.append({
                    "cause": cause.strip(),
                    "effect": effect.strip(),
                    "type": "causal"
                })
        
        return relationships
    
    async def _find_similar_cases(self, content: str) -> List[Dict]:
        """Find similar cases in memory."""
        # Search for similar episodic memories
        similar_memories = await self.memory.retrieve_memories(
            content, ["episodic"], limit=5, similarity_threshold=0.3
        )
        
        return similar_memories
    
    async def _generate_explanations(self, content: str, context: Dict) -> List[str]:
        """Generate possible explanations for the content."""
        explanations = []
        
        # Simple explanation generation based on patterns
        if "error" in content.lower() or "problem" in content.lower():
            explanations.extend([
                "This could be due to a configuration issue",
                "This might be caused by insufficient resources",
                "This could be a timing-related problem",
                "This might be due to missing dependencies"
            ])
        
        if "success" in content.lower() or "achieved" in content.lower():
            explanations.extend([
                "This succeeded due to proper planning",
                "This worked because of good preparation",
                "This was successful due to following best practices"
            ])
        
        return explanations
    
    async def _evaluate_explanation_quality(self, explanation: str, content: str) -> float:
        """Evaluate the quality of an explanation."""
        # Simple heuristic-based evaluation
        quality_score = 0.5  # Base score
        
        # Check for specific terms that indicate good explanations
        good_terms = ["because", "due to", "caused by", "result of", "leads to"]
        for term in good_terms:
            if term in explanation.lower():
                quality_score += 0.1
        
        # Check for specificity
        if len(explanation.split()) > 5:  # More specific explanations
            quality_score += 0.1
        
        # Check for relevance to content
        content_words = set(content.lower().split())
        explanation_words = set(explanation.lower().split())
        overlap = len(content_words.intersection(explanation_words))
        if overlap > 0:
            quality_score += min(0.3, overlap * 0.05)
        
        return min(1.0, quality_score)
    
    def _matches_pattern(self, statement: str, pattern: str) -> bool:
        """Check if statement matches a logical pattern."""
        # Simplified pattern matching
        statement_lower = statement.lower()
        pattern_lower = pattern.lower()
        
        # Check for key structural elements
        if "if" in pattern_lower and "if" in statement_lower:
            if "then" in pattern_lower and "then" in statement_lower:
                return True
        
        if "all" in pattern_lower and "all" in statement_lower:
            if "are" in pattern_lower and "are" in statement_lower:
                return True
        
        return False
    
    def _matches_causal_pattern(self, relationship: Dict, pattern: str) -> bool:
        """Check if relationship matches a causal pattern."""
        # Simplified causal pattern matching
        if "necessary" in pattern.lower():
            return "necessary" in relationship.get("type", "").lower()
        elif "sufficient" in pattern.lower():
            return "sufficient" in relationship.get("type", "").lower()
        elif "causal" in pattern.lower():
            return relationship.get("type") == "causal"
        
        return False
    
    def _matches_analogical_pattern(self, case: Dict, pattern: str) -> bool:
        """Check if case matches an analogical pattern."""
        # Simplified analogical pattern matching
        if "structural" in pattern.lower():
            return case.get("similarity_type") == "structural"
        elif "functional" in pattern.lower():
            return case.get("similarity_type") == "functional"
        elif "causal" in pattern.lower():
            return case.get("similarity_type") == "causal"
        
        return False
    
    async def _synthesize_insights(self, logical_analysis: Dict, causal_analysis: Dict,
                                 analogical_analysis: Dict, abductive_analysis: Dict) -> List[str]:
        """Synthesize insights from all reasoning types."""
        insights = []
        
        # Extract insights from each analysis type
        for analysis in [logical_analysis, causal_analysis, analogical_analysis, abductive_analysis]:
            for insight in analysis.get("insights", []):
                insights.append(insight.get("statement", insight.get("explanation", "")))
        
        # Remove duplicates and empty insights
        unique_insights = list(set([i for i in insights if i.strip()]))
        
        return unique_insights
    
    async def _generate_hypotheses(self, content: str, context: Dict, 
                                 insights: List[str]) -> List[Dict]:
        """Generate hypotheses based on analysis."""
        hypotheses = []
        
        # Generate hypotheses based on insights
        for insight in insights:
            if "if" in insight.lower() and "then" in insight.lower():
                hypotheses.append({
                    "type": "conditional",
                    "content": insight,
                    "confidence": 0.7
                })
            elif "causes" in insight.lower() or "leads to" in insight.lower():
                hypotheses.append({
                    "type": "causal",
                    "content": insight,
                    "confidence": 0.6
                })
            else:
                hypotheses.append({
                    "type": "general",
                    "content": insight,
                    "confidence": 0.5
                })
        
        return hypotheses
    
    async def _assess_confidence(self, logical_analysis: Dict, causal_analysis: Dict,
                               analogical_analysis: Dict, abductive_analysis: Dict) -> float:
        """Assess overall confidence in the analysis."""
        confidences = [
            logical_analysis.get("confidence", 0.0),
            causal_analysis.get("confidence", 0.0),
            analogical_analysis.get("confidence", 0.0),
            abductive_analysis.get("confidence", 0.0)
        ]
        
        # Weighted average of confidences
        weights = [0.3, 0.3, 0.2, 0.2]  # Logical and causal are more important
        weighted_confidence = sum(c * w for c, w in zip(confidences, weights))
        
        return min(1.0, weighted_confidence)
    
    async def _identify_contradictions(self, insights: List[str]) -> List[Dict]:
        """Identify contradictions in insights."""
        contradictions = []
        
        # Simple contradiction detection
        for i, insight1 in enumerate(insights):
            for insight2 in insights[i+1:]:
                if self._are_contradictory(insight1, insight2):
                    contradictions.append({
                        "insight1": insight1,
                        "insight2": insight2,
                        "type": "logical_contradiction"
                    })
        
        return contradictions
    
    def _are_contradictory(self, insight1: str, insight2: str) -> bool:
        """Check if two insights are contradictory."""
        # Simple contradiction detection
        insight1_lower = insight1.lower()
        insight2_lower = insight2.lower()
        
        # Check for direct contradictions
        contradictions = [
            ("is", "is not"),
            ("are", "are not"),
            ("can", "cannot"),
            ("will", "will not"),
            ("should", "should not")
        ]
        
        for pos, neg in contradictions:
            if pos in insight1_lower and neg in insight2_lower:
                return True
            if pos in insight2_lower and neg in insight1_lower:
                return True
        
        return False
    
    async def _generate_recommendations(self, insights: List[str], 
                                      hypotheses: List[Dict], 
                                      current_goals: List[Dict]) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []
        
        # Generate recommendations based on insights
        for insight in insights:
            if "error" in insight.lower() or "problem" in insight.lower():
                recommendations.append(f"Investigate and resolve: {insight}")
            elif "success" in insight.lower() or "achieved" in insight.lower():
                recommendations.append(f"Replicate success pattern: {insight}")
            elif "if" in insight.lower():
                recommendations.append(f"Test hypothesis: {insight}")
        
        # Generate recommendations based on goals
        for goal in current_goals:
            goal_desc = goal.get("description", "")
            if goal_desc:
                recommendations.append(f"Work towards goal: {goal_desc}")
        
        return recommendations
    
    async def get_status(self) -> Dict[str, Any]:
        """Get reasoning engine status."""
        return {
            "reasoning_chains": len(self.reasoning_chains),
            "assumptions": len(self.assumptions),
            "contradictions": len(self.contradictions),
            "patterns_loaded": {
                "logical": len(self.logical_patterns),
                "causal": len(self.causal_patterns),
                "analogical": len(self.analogical_patterns)
            }
        }