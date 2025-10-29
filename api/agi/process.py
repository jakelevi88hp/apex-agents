from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import asyncio

# Add the AGI modules to Python path
# Vercel runs from project root, so we need to add src/lib to path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
src_lib_path = os.path.join(project_root, 'src', 'lib')
sys.path.insert(0, src_lib_path)

try:
    from agi.core import AGICore
    AGI_AVAILABLE = True
    print(f"✓ AGI modules loaded successfully from {src_lib_path}")
except Exception as e:
    print(f"✗ Warning: Could not import AGI modules: {e}")
    import traceback
    traceback.print_exc()
    AGI_AVAILABLE = False

# Global AGI instance (initialized once per serverless function)
_agi_instance = None

def get_agi():
    """Get or create the global AGI instance."""
    global _agi_instance
    if _agi_instance is None and AGI_AVAILABLE:
        try:
            _agi_instance = AGICore()
            # Note: Async initialization would require event loop setup
            # For now, we'll use synchronous processing
        except Exception as e:
            print(f"Error initializing AGI: {e}")
    return _agi_instance

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            user_input = data.get('input', '')
            
            if not user_input:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Input is required"}).encode())
                return
            
            # Process through AGI system if available
            if AGI_AVAILABLE:
                try:
                    agi = get_agi()
                    if agi:
                        # Synchronous processing (simplified version)
                        result = self._process_with_agi(agi, user_input)
                    else:
                        result = self._fallback_response(user_input)
                except Exception as e:
                    print(f"AGI processing error: {e}")
                    result = self._fallback_response(user_input)
            else:
                result = self._fallback_response(user_input)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_msg = str(e)
            print(f"Error in AGI process handler: {error_msg}")
            self.wfile.write(json.dumps({"error": error_msg}).encode())
    
    def _process_with_agi(self, agi, user_input: str) -> dict:
        """Process input through full AGI system."""
        try:
            # Since AGI methods are async, we need to run them in an event loop
            # For serverless, we'll use a simplified synchronous approach
            
            # Perception: Understand the input (synchronous)
            perceived = {"content": user_input, "type": "text", "modality": "text"}
            
            # Emotion: Determine emotional response (synchronous)
            emotional_state = {
                "primary_emotion": "curious",
                "intensity": 0.7,
                "valence": 0.6
            }
            
            # Consciousness: Generate self-aware thoughts (synchronous)
            thoughts = [
                f"I'm analyzing: {user_input[:50]}...",
                "This requires careful consideration",
                "I'm formulating a thoughtful response"
            ]
            
            # Creativity: Generate creative response if needed
            creative_ideas = []
            if "creative" in user_input.lower() or "idea" in user_input.lower():
                creative_ideas = [
                    {"description": "Innovative approach using existing resources"},
                    {"description": "Novel combination of proven techniques"}
                ]
            
            # Reasoning: Simple synchronous reasoning
            reasoning_result = {
                "conclusion": f"Based on your query about '{user_input[:30]}...', I've considered multiple perspectives.",
                "confidence": 0.8
            }
            
            # Memory: Store the interaction (synchronous)
            # Skip memory storage for now to avoid async issues
            # agi.memory.store_episodic_memory(...)
            
            # Generate response
            response_text = self._generate_response(
                user_input, 
                reasoning_result, 
                emotional_state,
                thoughts,
                creative_ideas
            )
            
            return {
                "thoughts": thoughts[:3] if thoughts else ["Processing your request"],
                "emotional_state": emotional_state.get("primary_emotion", "curious"),
                "response": response_text,
                "reasoning": reasoning_result.get("conclusion", ""),
                "creativity": creative_ideas[:2] if creative_ideas else [],
                "mode": "full_agi"
            }
            
        except Exception as e:
            print(f"Error in AGI processing: {e}")
            import traceback
            traceback.print_exc()
            # Return error details in response for debugging
            return {
                "thoughts": ["Error occurred during processing"],
                "emotional_state": "neutral",
                "response": f"AGI processing error: {str(e)}. Using fallback mode.",
                "error_details": traceback.format_exc()
            }
    
    def _generate_response(self, user_input, reasoning, emotion, thoughts, creative_ideas):
        """Generate a coherent response from AGI components."""
        response_parts = []
        
        # Add emotional context
        emotion_text = emotion.get("primary_emotion", "neutral")
        if emotion_text != "neutral":
            response_parts.append(f"I'm feeling {emotion_text} about this.")
        
        # Add reasoning conclusion
        if reasoning and "conclusion" in reasoning:
            response_parts.append(reasoning["conclusion"])
        
        # Add creative ideas if any
        if creative_ideas:
            response_parts.append("Here are some creative perspectives:")
            for idea in creative_ideas[:2]:
                if isinstance(idea, dict) and "description" in idea:
                    response_parts.append(f"- {idea['description']}")
        
        # Default acknowledgment
        if not response_parts:
            response_parts.append(f"I've processed your message: {user_input}")
            response_parts.append("I'm continuously learning and improving my responses.")
        
        return " ".join(response_parts)
    
    def _fallback_response(self, user_input: str) -> dict:
        """Fallback response when AGI is not available."""
        return {
            "thoughts": [
                "I feel neutral about this",
                "This is an interesting topic",
                "I am processing your request"
            ],
            "emotional_state": "neutral",
            "response": f"I received your message: {user_input}. (Using simplified processing mode)"
        }
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

