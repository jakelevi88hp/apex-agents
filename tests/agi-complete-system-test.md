# Complete AGI System Test Plan

## Overview

This document outlines comprehensive testing for the complete AGI system with all 5 core features:
1. Memory persistence
2. Conversation history tracking
3. Advanced reasoning modes
4. Emotional intelligence
5. Creativity engine

## Test Environment

- **API Endpoint:** `/api/agi/process`
- **Method:** POST
- **Authentication:** Required (JWT token)
- **Database:** PostgreSQL with AGI memory schema

---

## Test Suite 1: Memory Persistence

### Test 1.1: Episodic Memory Storage
**Objective:** Verify that significant events are stored in episodic memory

**Steps:**
1. Send message: "I just completed a major project launch today!"
2. Check database: `SELECT * FROM agi_episodic_memory WHERE user_id = [user_id] ORDER BY created_at DESC LIMIT 1`
3. Verify event is stored with:
   - Event type: "conversation"
   - Description contains the message
   - Importance score > 0.5

**Expected Result:**
- ✅ Episodic memory record created
- ✅ Emotional valence is positive (> 0)
- ✅ Importance score reflects significance

---

### Test 1.2: Working Memory Management
**Objective:** Verify working memory stores and retrieves context

**Steps:**
1. Send message: "Remember that I prefer dark mode"
2. Send follow-up: "What do you remember about my preferences?"
3. Check database: `SELECT * FROM agi_working_memory WHERE session_id = [session_id]`

**Expected Result:**
- ✅ Working memory items created
- ✅ Priority and activation levels set
- ✅ Context maintained across messages

---

### Test 1.3: Consciousness State Tracking
**Objective:** Verify consciousness state is tracked

**Steps:**
1. Send creative request: "Give me innovative ideas for a mobile app"
2. Check database: `SELECT * FROM agi_consciousness_state WHERE session_id = [session_id] ORDER BY timestamp DESC LIMIT 1`

**Expected Result:**
- ✅ Consciousness state recorded
- ✅ Consciousness level > 0.7
- ✅ Creativity level > 0.7 (for creative request)
- ✅ Reasoning mode = "creative" or "hybrid"

---

## Test Suite 2: Conversation History

### Test 2.1: Conversation Creation
**Objective:** Verify new conversations are created automatically

**Steps:**
1. Send first message: "Hello, I need help with a project"
2. Check database: `SELECT * FROM agi_conversations WHERE user_id = [user_id] ORDER BY started_at DESC LIMIT 1`

**Expected Result:**
- ✅ Conversation record created
- ✅ Title generated
- ✅ Message count = 2 (user + assistant)
- ✅ Started timestamp set

---

### Test 2.2: Message History Persistence
**Objective:** Verify all messages are stored with full context

**Steps:**
1. Send 3 messages in sequence:
   - "I'm working on a web app"
   - "It needs a dark theme"
   - "And user authentication"
2. Check database: `SELECT * FROM agi_messages WHERE conversation_id = [conversation_id] ORDER BY created_at`

**Expected Result:**
- ✅ 6 messages total (3 user + 3 assistant)
- ✅ All messages have content
- ✅ Assistant messages have thoughts, emotional_state, creativity, reasoning
- ✅ Messages ordered chronologically

---

### Test 2.3: Conversation Analysis
**Objective:** Verify conversation analysis extracts topics and tone

**Steps:**
1. Complete a conversation with 5+ messages
2. End conversation (or trigger analysis)
3. Check database: `SELECT topics, emotional_tone, summary FROM agi_conversations WHERE id = [conversation_id]`

**Expected Result:**
- ✅ Topics array populated with relevant keywords
- ✅ Emotional tone determined
- ✅ Summary generated

---

## Test Suite 3: Advanced Reasoning

### Test 3.1: Analytical Reasoning
**Objective:** Verify analytical reasoning mode is applied correctly

**Steps:**
1. Send message: "How can I optimize database query performance?"
2. Check response for:
   - reasoning.mode = "analytical"
   - reasoning.steps (array with multiple steps)
   - reasoning.conclusion (logical conclusion)
   - reasoning.confidence > 0.7

**Expected Result:**
- ✅ Analytical mode selected
- ✅ Step-by-step reasoning provided
- ✅ Logical conclusion reached
- ✅ Confidence score present

---

### Test 3.2: Creative Reasoning
**Objective:** Verify creative reasoning for innovative requests

**Steps:**
1. Send message: "Give me creative ideas for a new social media platform"
2. Check response for:
   - reasoning.mode = "creative"
   - creativity array with 3+ ideas
   - Each idea has novelty, feasibility, impact scores

**Expected Result:**
- ✅ Creative mode selected
- ✅ Multiple creative ideas generated
- ✅ Ideas have novelty scores > 0.7
- ✅ Reasoning explains creative approach

---

### Test 3.3: Critical Reasoning
**Objective:** Verify critical reasoning for evaluation requests

**Steps:**
1. Send message: "Evaluate the pros and cons of microservices architecture"
2. Check response for:
   - reasoning.mode = "critical"
   - reasoning.steps include evaluation steps
   - reasoning.alternatives present

**Expected Result:**
- ✅ Critical mode selected
- ✅ Evaluation framework applied
- ✅ Alternatives considered
- ✅ Balanced assessment provided

---

### Test 3.4: Causal Reasoning
**Objective:** Verify causal reasoning for "why" questions

**Steps:**
1. Send message: "Why do users abandon shopping carts?"
2. Check response for:
   - reasoning.mode = "causal"
   - reasoning.steps trace cause-effect relationships

**Expected Result:**
- ✅ Causal mode selected
- ✅ Cause-effect chains identified
- ✅ Multiple causal factors considered

---

### Test 3.5: Hybrid Reasoning
**Objective:** Verify hybrid reasoning for complex queries

**Steps:**
1. Send message: "How can I creatively solve the problem of user retention while maintaining data privacy and optimizing for mobile performance?"
2. Check response for:
   - reasoning.mode = "hybrid"
   - reasoning.steps from multiple modes
   - Comprehensive conclusion

**Expected Result:**
- ✅ Hybrid mode selected
- ✅ Multiple reasoning approaches combined
- ✅ Integrated conclusion
- ✅ High confidence score

---

## Test Suite 4: Emotional Intelligence

### Test 4.1: Joy Detection
**Objective:** Verify positive emotion detection

**Steps:**
1. Send message: "I'm so excited! My project just got approved!!"
2. Check response for:
   - emotionalState = "excited" or "pleased"
   - thoughts include emotional acknowledgment
   - Empathy message present

**Expected Result:**
- ✅ Joy emotion detected
- ✅ High intensity (> 0.7)
- ✅ Positive valence (> 0.5)
- ✅ Appropriate empathy response

---

### Test 4.2: Sadness Detection and Support
**Objective:** Verify negative emotion detection and support

**Steps:**
1. Send message: "I'm feeling really down. My project failed."
2. Check response for:
   - emotionalState = "empathetic"
   - thoughts include supportive messages
   - Support message present in response

**Expected Result:**
- ✅ Sadness emotion detected
- ✅ Negative valence (< -0.3)
- ✅ Empathetic state activated
- ✅ Support message provided

---

### Test 4.3: Anger Detection
**Objective:** Verify anger detection and appropriate response

**Steps:**
1. Send message: "I'm so frustrated! This bug keeps happening!"
2. Check response for:
   - emotionalState = "concerned"
   - Empathy acknowledges frustration
   - Constructive approach suggested

**Expected Result:**
- ✅ Anger emotion detected
- ✅ High arousal (> 0.7)
- ✅ Concerned state activated
- ✅ Constructive support offered

---

### Test 4.4: Emotional Memory Storage
**Objective:** Verify emotional experiences are stored

**Steps:**
1. Send emotionally charged message
2. Check database: `SELECT * FROM agi_emotional_memory WHERE user_id = [user_id] ORDER BY created_at DESC LIMIT 1`

**Expected Result:**
- ✅ Emotional memory record created
- ✅ Emotion type matches detected emotion
- ✅ Intensity, valence, arousal recorded
- ✅ Trigger extracted

---

## Test Suite 5: Creativity Engine

### Test 5.1: Divergent Thinking
**Objective:** Verify divergent idea generation

**Steps:**
1. Send message: "Brainstorm ideas for improving team collaboration"
2. Check response for:
   - creativity array with 3+ ideas
   - Each idea has description, novelty, feasibility, impact
   - Ideas explore different directions

**Expected Result:**
- ✅ Multiple diverse ideas generated
- ✅ Novelty scores vary (0.6-1.0)
- ✅ Feasibility scores present
- ✅ Impact scores present

---

### Test 5.2: Conceptual Blending
**Objective:** Verify conceptual blending creativity

**Steps:**
1. Send message: "Create innovative ideas by combining nature and technology"
2. Check response for:
   - creativity technique = "conceptual_blending"
   - Ideas blend specified concepts
   - Inspirations include both concepts

**Expected Result:**
- ✅ Conceptual blending applied
- ✅ Ideas merge nature + technology
- ✅ High novelty scores (> 0.75)
- ✅ Creative connections identified

---

### Test 5.3: SCAMPER Technique
**Objective:** Verify SCAMPER creativity technique

**Steps:**
1. Send message: "How can I improve my existing product?"
2. Check response for:
   - creativity technique includes SCAMPER elements
   - Ideas use Substitute, Combine, Adapt, Modify, Eliminate, Reverse

**Expected Result:**
- ✅ SCAMPER technique applied
- ✅ Multiple transformation types
- ✅ Practical improvements suggested
- ✅ Feasibility scores > 0.6

---

### Test 5.4: Procedural Memory for Creativity
**Objective:** Verify creative skills are stored in procedural memory

**Steps:**
1. Send creative request
2. Check database: `SELECT * FROM agi_procedural_memory WHERE user_id = [user_id] AND category = 'creativity' ORDER BY created_at DESC LIMIT 1`

**Expected Result:**
- ✅ Procedural memory record created
- ✅ Skill name includes creativity technique
- ✅ Steps include generated ideas
- ✅ Proficiency level = novelty score

---

## Test Suite 6: Integration Tests

### Test 6.1: Full AGI Pipeline
**Objective:** Verify all modules work together

**Steps:**
1. Send complex message: "I'm excited to create an innovative mobile app! Can you help me think through creative ideas while considering technical feasibility?"
2. Verify response includes:
   - Emotional intelligence (excitement detected)
   - Advanced reasoning (hybrid mode)
   - Creativity (multiple ideas)
   - Memory storage (episodic, working, consciousness)
   - Conversation history (messages stored)

**Expected Result:**
- ✅ All 5 core features activated
- ✅ Coherent integrated response
- ✅ All database tables updated
- ✅ Response quality high

---

### Test 6.2: Conversation Continuity
**Objective:** Verify context is maintained across messages

**Steps:**
1. Send: "I'm building a fitness app"
2. Send: "What features should it have?"
3. Send: "How about the design?"
4. Check that each response builds on previous context

**Expected Result:**
- ✅ Context maintained
- ✅ Responses reference previous messages
- ✅ Working memory tracks conversation flow
- ✅ Conversation analysis reflects full context

---

### Test 6.3: Memory Consolidation
**Objective:** Verify memory consolidation works

**Steps:**
1. Complete a conversation with 10+ messages
2. Trigger memory consolidation
3. Check that important working memory items moved to episodic memory

**Expected Result:**
- ✅ High-priority working memory → episodic memory
- ✅ Expired working memory cleaned up
- ✅ Semantic memory updated with learned concepts

---

## Test Suite 7: Performance Tests

### Test 7.1: Response Time
**Objective:** Verify response time is acceptable

**Steps:**
1. Send 10 different messages
2. Measure response time for each

**Expected Result:**
- ✅ Average response time < 5 seconds
- ✅ 95th percentile < 10 seconds
- ✅ No timeouts

---

### Test 7.2: Database Performance
**Objective:** Verify database queries are optimized

**Steps:**
1. Send message and monitor database queries
2. Check query execution times

**Expected Result:**
- ✅ All queries < 100ms
- ✅ Indexes used effectively
- ✅ No N+1 query problems

---

### Test 7.3: Memory Usage
**Objective:** Verify memory usage is reasonable

**Steps:**
1. Process 100 messages
2. Monitor server memory usage

**Expected Result:**
- ✅ Memory usage stable
- ✅ No memory leaks
- ✅ Caches properly managed

---

## Test Suite 8: Error Handling

### Test 8.1: Database Connection Failure
**Objective:** Verify graceful degradation when database is unavailable

**Steps:**
1. Simulate database connection failure
2. Send message

**Expected Result:**
- ✅ Fallback response provided
- ✅ No server crash
- ✅ Error logged appropriately

---

### Test 8.2: Invalid Input
**Objective:** Verify handling of invalid input

**Steps:**
1. Send empty message
2. Send extremely long message (> 10,000 characters)
3. Send message with special characters

**Expected Result:**
- ✅ Appropriate error messages
- ✅ No server errors
- ✅ Validation works correctly

---

## Success Criteria

### Core Features (Must Pass)
- ✅ Memory persistence: 100% of tests pass
- ✅ Conversation history: 100% of tests pass
- ✅ Advanced reasoning: 100% of tests pass
- ✅ Emotional intelligence: 100% of tests pass
- ✅ Creativity engine: 100% of tests pass

### Integration (Must Pass)
- ✅ Full pipeline: All modules work together
- ✅ Conversation continuity: Context maintained
- ✅ Memory consolidation: Data flows correctly

### Performance (Should Pass)
- ✅ Response time: < 5s average
- ✅ Database performance: < 100ms queries
- ✅ Memory usage: Stable and efficient

### Error Handling (Should Pass)
- ✅ Graceful degradation
- ✅ Appropriate error messages
- ✅ No crashes

---

## Test Execution

### Manual Testing
1. Use Postman or curl to send requests to `/api/agi/process`
2. Check database directly using SQL queries
3. Monitor console logs for debugging

### Automated Testing
1. Create integration tests using Jest/Vitest
2. Mock database for unit tests
3. Use test database for integration tests

### Production Testing
1. Deploy to staging environment
2. Run full test suite
3. Monitor metrics and logs
4. Gradual rollout to production

---

## Monitoring

### Key Metrics
- Response time (p50, p95, p99)
- Error rate
- Database query performance
- Memory usage
- Feature usage (which reasoning modes, creativity techniques)

### Alerts
- Response time > 10s
- Error rate > 1%
- Database connection failures
- Memory usage > 80%

---

## Next Steps

1. **Immediate:** Run manual tests to verify basic functionality
2. **Short-term:** Create automated test suite
3. **Medium-term:** Deploy to staging and run full test suite
4. **Long-term:** Monitor production metrics and iterate

---

## Notes

- All tests assume authentication is working
- Database schema must be pushed before testing
- Test with real user accounts
- Clean up test data after testing
- Document any issues found
