"""
Hierarchical Planning System for AGI

Advanced planning with goal decomposition, constraint satisfaction,
and dynamic replanning capabilities.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
from collections import defaultdict, deque

logger = logging.getLogger("apex_orchestrator.agi.planning")


class HierarchicalPlanner:
    """
    Hierarchical planning system for AGI.
    
    Implements:
    - Goal decomposition and hierarchy
    - Constraint satisfaction
    - Dynamic replanning
    - Resource allocation
    - Temporal planning
    - Risk assessment
    """
    
    def __init__(self, memory_system):
        self.memory = memory_system
        self.goal_hierarchy = {}
        self.active_plans = {}
        self.planning_constraints = {}
        self.resource_allocations = {}
        self.risk_assessments = {}
        
        # Planning parameters
        self.max_plan_depth = 5
        self.planning_horizon = timedelta(hours=24)
        self.replanning_threshold = 0.3
        
        # Goal types
        self.goal_types = {
            "achievement": "Complete a specific task",
            "maintenance": "Maintain a state",
            "optimization": "Improve performance",
            "learning": "Acquire knowledge",
            "exploration": "Discover new information"
        }
        
        logger.info("Hierarchical planner initialized")
    
    async def initialize(self):
        """Initialize the planning system."""
        # Load existing goals and plans
        await self._load_existing_goals()
        
        # Initialize planning constraints
        await self._initialize_constraints()
        
        # Start planning monitoring
        asyncio.create_task(self._planning_monitor())
        
        logger.info("Hierarchical planner initialized")
    
    async def _load_existing_goals(self):
        """Load existing goals from memory."""
        # This would query memory for existing goals
        # For now, initialize with empty hierarchy
        self.goal_hierarchy = {
            "root": {
                "id": "root",
                "description": "Overall system objectives",
                "type": "achievement",
                "priority": 1.0,
                "status": "active",
                "subgoals": [],
                "created_at": datetime.utcnow().isoformat()
            }
        }
    
    async def _initialize_constraints(self):
        """Initialize planning constraints."""
        self.planning_constraints = {
            "temporal": {
                "max_duration": 3600,  # 1 hour in seconds
                "deadline_buffer": 300,  # 5 minutes
                "scheduling_window": 86400  # 24 hours
            },
            "resources": {
                "max_memory_usage": 0.8,  # 80% of available memory
                "max_cpu_usage": 0.7,  # 70% of available CPU
                "max_concurrent_tasks": 10
            },
            "safety": {
                "max_risk_level": 0.5,
                "require_approval": True,
                "sandbox_mode": True
            }
        }
    
    async def create_plan(self, reasoning_result: Dict, current_goals: List[Dict], 
                         emotional_state: Dict) -> Dict[str, Any]:
        """
        Create a hierarchical plan based on reasoning and goals.
        
        Args:
            reasoning_result: Results from reasoning engine
            current_goals: Current active goals
            emotional_state: Current emotional state
        
        Returns:
            Comprehensive plan with hierarchy and constraints
        """
        plan_start = datetime.utcnow()
        
        # Extract planning requirements
        requirements = await self._extract_requirements(reasoning_result, current_goals)
        
        # Generate high-level plan
        high_level_plan = await self._generate_high_level_plan(requirements)
        
        # Decompose into sub-plans
        detailed_plan = await self._decompose_plan(high_level_plan, requirements)
        
        # Apply constraints
        constrained_plan = await self._apply_constraints(detailed_plan)
        
        # Allocate resources
        resource_plan = await self._allocate_resources(constrained_plan)
        
        # Assess risks
        risk_assessment = await self._assess_risks(constrained_plan)
        
        # Generate execution schedule
        schedule = await self._generate_schedule(constrained_plan)
        
        # Create final plan
        final_plan = {
            "id": f"plan_{int(plan_start.timestamp())}",
            "intent": requirements.get("intent", "Execute plan"),
            "hierarchy": detailed_plan,
            "constraints": self.planning_constraints,
            "resources": resource_plan,
            "risks": risk_assessment,
            "schedule": schedule,
            "created_at": plan_start.isoformat(),
            "status": "ready",
            "priority": requirements.get("priority", 0.5),
            "emotional_context": emotional_state
        }
        
        # Store plan
        self.active_plans[final_plan["id"]] = final_plan
        
        # Store in memory
        await self._store_plan(final_plan)
        
        planning_time = (datetime.utcnow() - plan_start).total_seconds()
        logger.info(f"Plan created in {planning_time:.2f}s: {final_plan['intent']}")
        
        return final_plan
    
    async def _extract_requirements(self, reasoning_result: Dict, 
                                  current_goals: List[Dict]) -> Dict[str, Any]:
        """Extract planning requirements from reasoning and goals."""
        requirements = {
            "intent": "Execute plan",
            "priority": 0.5,
            "deadline": None,
            "constraints": [],
            "resources_needed": [],
            "dependencies": []
        }
        
        # Extract from reasoning result
        if reasoning_result.get("insights"):
            requirements["intent"] = reasoning_result["insights"][0] if reasoning_result["insights"] else "Execute plan"
        
        if reasoning_result.get("recommendations"):
            requirements["constraints"].extend(reasoning_result["recommendations"])
        
        # Extract from current goals
        if current_goals:
            highest_priority_goal = max(current_goals, key=lambda g: g.get("priority", 0))
            requirements["intent"] = highest_priority_goal.get("description", requirements["intent"])
            requirements["priority"] = highest_priority_goal.get("priority", 0.5)
            requirements["deadline"] = highest_priority_goal.get("deadline")
        
        return requirements
    
    async def _generate_high_level_plan(self, requirements: Dict) -> Dict[str, Any]:
        """Generate high-level plan structure."""
        intent = requirements["intent"]
        
        # Simple plan generation based on intent
        if "learn" in intent.lower():
            steps = [
                {"action": "identify_learning_goals", "description": "Identify what needs to be learned"},
                {"action": "gather_resources", "description": "Collect learning materials and resources"},
                {"action": "study", "description": "Study and process information"},
                {"action": "practice", "description": "Practice and apply knowledge"},
                {"action": "evaluate", "description": "Evaluate learning progress"}
            ]
        elif "create" in intent.lower() or "build" in intent.lower():
            steps = [
                {"action": "design", "description": "Design the solution"},
                {"action": "plan_implementation", "description": "Plan implementation approach"},
                {"action": "implement", "description": "Implement the solution"},
                {"action": "test", "description": "Test and validate"},
                {"action": "deploy", "description": "Deploy and monitor"}
            ]
        elif "solve" in intent.lower() or "fix" in intent.lower():
            steps = [
                {"action": "analyze_problem", "description": "Analyze the problem"},
                {"action": "identify_solutions", "description": "Identify potential solutions"},
                {"action": "evaluate_options", "description": "Evaluate solution options"},
                {"action": "implement_solution", "description": "Implement chosen solution"},
                {"action": "verify_fix", "description": "Verify the problem is resolved"}
            ]
        else:
            steps = [
                {"action": "analyze", "description": "Analyze the situation"},
                {"action": "plan", "description": "Create detailed plan"},
                {"action": "execute", "description": "Execute the plan"},
                {"action": "monitor", "description": "Monitor progress"},
                {"action": "complete", "description": "Complete and review"}
            ]
        
        return {
            "intent": intent,
            "steps": steps,
            "estimated_duration": len(steps) * 300,  # 5 minutes per step
            "complexity": "medium"
        }
    
    async def _decompose_plan(self, high_level_plan: Dict, 
                            requirements: Dict) -> Dict[str, Any]:
        """Decompose high-level plan into detailed sub-plans."""
        detailed_plan = {
            "level": 0,
            "intent": high_level_plan["intent"],
            "steps": [],
            "subplans": []
        }
        
        for i, step in enumerate(high_level_plan["steps"]):
            # Create detailed step
            detailed_step = {
                "id": f"step_{i+1}",
                "action": step["action"],
                "description": step["description"],
                "priority": 1.0 - (i * 0.1),  # Decreasing priority
                "estimated_duration": 300,  # 5 minutes
                "dependencies": [],
                "resources": [],
                "constraints": [],
                "success_criteria": f"Complete {step['description']}",
                "status": "pending"
            }
            
            # Add dependencies
            if i > 0:
                detailed_step["dependencies"].append(f"step_{i}")
            
            # Add resources based on action type
            if step["action"] in ["study", "learn", "analyze"]:
                detailed_step["resources"].append("memory")
                detailed_step["resources"].append("processing")
            elif step["action"] in ["implement", "create", "build"]:
                detailed_step["resources"].append("processing")
                detailed_step["resources"].append("storage")
            elif step["action"] in ["test", "verify", "evaluate"]:
                detailed_step["resources"].append("processing")
                detailed_step["resources"].append("validation")
            
            detailed_plan["steps"].append(detailed_step)
        
        return detailed_plan
    
    async def _apply_constraints(self, plan: Dict) -> Dict[str, Any]:
        """Apply planning constraints to the plan."""
        constrained_plan = plan.copy()
        
        # Apply temporal constraints
        total_duration = sum(step["estimated_duration"] for step in plan["steps"])
        max_duration = self.planning_constraints["temporal"]["max_duration"]
        
        if total_duration > max_duration:
            # Scale down durations
            scale_factor = max_duration / total_duration
            for step in constrained_plan["steps"]:
                step["estimated_duration"] = int(step["estimated_duration"] * scale_factor)
        
        # Apply resource constraints
        for step in constrained_plan["steps"]:
            if "memory" in step["resources"]:
                step["constraints"].append("memory_limit")
            if "processing" in step["resources"]:
                step["constraints"].append("cpu_limit")
        
        # Apply safety constraints
        for step in constrained_plan["steps"]:
            if step["action"] in ["implement", "deploy", "execute"]:
                step["constraints"].append("safety_review")
                step["constraints"].append("approval_required")
        
        return constrained_plan
    
    async def _allocate_resources(self, plan: Dict) -> Dict[str, Any]:
        """Allocate resources for the plan."""
        resource_allocation = {
            "memory": {"allocated": 0.0, "required": 0.0},
            "cpu": {"allocated": 0.0, "required": 0.0},
            "storage": {"allocated": 0.0, "required": 0.0},
            "network": {"allocated": 0.0, "required": 0.0}
        }
        
        # Calculate resource requirements
        for step in plan["steps"]:
            if "memory" in step["resources"]:
                resource_allocation["memory"]["required"] += 0.1
            if "processing" in step["resources"]:
                resource_allocation["cpu"]["required"] += 0.1
            if "storage" in step["resources"]:
                resource_allocation["storage"]["required"] += 0.05
            if "network" in step["resources"]:
                resource_allocation["network"]["required"] += 0.05
        
        # Allocate resources (simplified)
        for resource in resource_allocation:
            resource_allocation[resource]["allocated"] = min(
                resource_allocation[resource]["required"],
                self.planning_constraints["resources"].get(f"max_{resource}_usage", 0.8)
            )
        
        return resource_allocation
    
    async def _assess_risks(self, plan: Dict) -> Dict[str, Any]:
        """Assess risks for the plan."""
        risks = {
            "overall_risk": 0.0,
            "risk_factors": [],
            "mitigation_strategies": []
        }
        
        # Assess risks for each step
        for step in plan["steps"]:
            step_risks = await self._assess_step_risks(step)
            risks["risk_factors"].extend(step_risks)
        
        # Calculate overall risk
        if risks["risk_factors"]:
            risk_scores = [risk["severity"] for risk in risks["risk_factors"]]
            risks["overall_risk"] = sum(risk_scores) / len(risk_scores)
        
        # Generate mitigation strategies
        if risks["overall_risk"] > 0.3:
            risks["mitigation_strategies"].append("Implement additional safety checks")
            risks["mitigation_strategies"].append("Require human approval for high-risk steps")
            risks["mitigation_strategies"].append("Create rollback plan")
        
        return risks
    
    async def _assess_step_risks(self, step: Dict) -> List[Dict]:
        """Assess risks for a specific step."""
        risks = []
        
        # Risk based on action type
        if step["action"] in ["implement", "deploy", "execute"]:
            risks.append({
                "type": "execution_risk",
                "description": f"Risk of failure during {step['action']}",
                "severity": 0.6,
                "probability": 0.3
            })
        
        # Risk based on resources
        if "memory" in step["resources"]:
            risks.append({
                "type": "resource_risk",
                "description": "Risk of memory exhaustion",
                "severity": 0.4,
                "probability": 0.2
            })
        
        # Risk based on dependencies
        if step["dependencies"]:
            risks.append({
                "type": "dependency_risk",
                "description": "Risk due to dependency on other steps",
                "severity": 0.5,
                "probability": 0.4
            })
        
        return risks
    
    async def _generate_schedule(self, plan: Dict) -> Dict[str, Any]:
        """Generate execution schedule for the plan."""
        schedule = {
            "start_time": datetime.utcnow().isoformat(),
            "end_time": None,
            "milestones": [],
            "dependencies": []
        }
        
        current_time = datetime.utcnow()
        
        # Schedule steps
        for i, step in enumerate(plan["steps"]):
            step_start = current_time + timedelta(seconds=i * step["estimated_duration"])
            step_end = step_start + timedelta(seconds=step["estimated_duration"])
            
            milestone = {
                "step_id": step["id"],
                "start_time": step_start.isoformat(),
                "end_time": step_end.isoformat(),
                "description": step["description"],
                "status": "scheduled"
            }
            
            schedule["milestones"].append(milestone)
            
            # Add dependencies
            for dep in step["dependencies"]:
                schedule["dependencies"].append({
                    "from": dep,
                    "to": step["id"]
                })
        
        # Set end time
        if schedule["milestones"]:
            last_milestone = schedule["milestones"][-1]
            schedule["end_time"] = last_milestone["end_time"]
        
        return schedule
    
    async def _store_plan(self, plan: Dict):
        """Store plan in memory."""
        await self.memory.store_episodic_memory(
            event_type="plan_created",
            description=f"Created plan: {plan['intent']}",
            context=plan,
            importance_score=plan["priority"]
        )
    
    async def update_goals(self, goals: List[Dict]):
        """Update current goals."""
        self.goal_hierarchy["root"]["subgoals"] = goals
        
        # Update goal priorities
        for goal in goals:
            goal_id = goal.get("id", f"goal_{len(goals)}")
            if goal_id not in self.goal_hierarchy:
                self.goal_hierarchy[goal_id] = {
                    "id": goal_id,
                    "description": goal.get("description", ""),
                    "type": goal.get("type", "achievement"),
                    "priority": goal.get("priority", 0.5),
                    "status": goal.get("status", "active"),
                    "subgoals": [],
                    "created_at": datetime.utcnow().isoformat()
                }
    
    async def _planning_monitor(self):
        """Background planning monitoring loop."""
        while True:
            try:
                # Check for plan updates
                await self._monitor_plan_progress()
                
                # Check for replanning needs
                await self._check_replanning_needs()
                
                await asyncio.sleep(10.0)  # Check every 10 seconds
            except Exception as e:
                logger.error(f"Error in planning monitor: {e}")
                await asyncio.sleep(30.0)
    
    async def _monitor_plan_progress(self):
        """Monitor progress of active plans."""
        for plan_id, plan in self.active_plans.items():
            if plan["status"] == "active":
                # Check if plan is complete
                all_steps_complete = all(
                    step["status"] == "completed" for step in plan["hierarchy"]["steps"]
                )
                
                if all_steps_complete:
                    plan["status"] = "completed"
                    logger.info(f"Plan {plan_id} completed")
    
    async def _check_replanning_needs(self):
        """Check if replanning is needed."""
        for plan_id, plan in self.active_plans.items():
            if plan["status"] == "active":
                # Check if risks have increased
                if plan["risks"]["overall_risk"] > self.replanning_threshold:
                    logger.warning(f"High risk detected in plan {plan_id}, replanning may be needed")
    
    async def get_status(self) -> Dict[str, Any]:
        """Get planning system status."""
        return {
            "active_plans": len(self.active_plans),
            "goal_hierarchy_size": len(self.goal_hierarchy),
            "planning_constraints": self.planning_constraints,
            "max_plan_depth": self.max_plan_depth,
            "planning_horizon": str(self.planning_horizon)
        }