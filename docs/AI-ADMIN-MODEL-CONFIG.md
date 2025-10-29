# AI Admin Model Configuration

Guide to configuring which AI model the AI Admin uses for code generation.

## Overview

The AI Admin agent uses OpenAI's GPT models to generate code patches. You can configure which model to use through environment variables or code.

## Default Model

**Current Default:** `gpt-4o`

This is OpenAI's latest and most capable model, providing:
- Better code generation quality
- Improved reasoning capabilities
- More accurate patch generation
- Better adherence to instructions

## Supported Models

### Recommended Models

| Model | Description | Best For |
|-------|-------------|----------|
| **gpt-4o** | Latest GPT-4 Omni model | Best quality, recommended for production |
| **gpt-4-turbo** | GPT-4 Turbo | Good balance of speed and quality |
| **gpt-4** | Original GPT-4 | High quality, slower |
| **gpt-3.5-turbo** | GPT-3.5 Turbo | Faster, lower cost, less accurate |

### Model Comparison

| Model | Speed | Quality | Cost | Recommended |
|-------|-------|---------|------|-------------|
| gpt-4o | Fast | Excellent | Medium | ✅ Yes |
| gpt-4-turbo | Fast | Excellent | Medium | ✅ Yes |
| gpt-4 | Slow | Excellent | High | ⚠️ Expensive |
| gpt-3.5-turbo | Very Fast | Good | Low | ⚠️ Less accurate |

## Configuration Methods

### Method 1: Environment Variable (Recommended)

Add to your `.env` file:

```bash
# AI Admin Model Configuration
AI_ADMIN_MODEL=gpt-4o
```

**Available in Vercel:**
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add: `AI_ADMIN_MODEL` = `gpt-4o`
4. Redeploy

### Method 2: Code Configuration

Modify `/src/lib/ai-admin/agent.ts`:

```typescript
// In getAIAdminAgent() function
export function getAIAdminAgent(model?: string): AIAdminAgent {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  // Pass custom model
  return new AIAdminAgent(apiKey, process.cwd(), model || 'gpt-4o');
}
```

### Method 3: Per-Request Override

When calling the AI Admin agent directly:

```typescript
import { AIAdminAgent } from '@/lib/ai-admin/agent';

const agent = new AIAdminAgent(
  process.env.OPENAI_API_KEY!,
  process.cwd(),
  'gpt-4-turbo' // Custom model
);
```

## Priority Order

The AI Admin selects the model in this order:

1. **Constructor parameter** (if provided)
2. **Environment variable** `AI_ADMIN_MODEL`
3. **Default** `gpt-4o`

```typescript
// Priority: constructor > env > default
this.model = model || process.env.AI_ADMIN_MODEL || 'gpt-4o';
```

## Model Selection Guide

### Use `gpt-4o` (Default) When:
- ✅ You want the best quality patches
- ✅ You need accurate code generation
- ✅ You want good speed and quality balance
- ✅ You're in production

### Use `gpt-4-turbo` When:
- ✅ You want slightly faster responses
- ✅ You need excellent quality
- ✅ You're okay with slightly higher costs

### Use `gpt-4` When:
- ⚠️ You need the absolute best quality
- ⚠️ Speed is not a concern
- ⚠️ Cost is not a concern

### Use `gpt-3.5-turbo` When:
- ⚠️ You're testing/developing
- ⚠️ Cost is a major concern
- ⚠️ You're okay with lower accuracy
- ❌ **NOT recommended for production**

## Testing Different Models

### Local Testing

```bash
# Test with gpt-4o
AI_ADMIN_MODEL=gpt-4o npm run dev

# Test with gpt-4-turbo
AI_ADMIN_MODEL=gpt-4-turbo npm run dev

# Test with gpt-3.5-turbo (not recommended)
AI_ADMIN_MODEL=gpt-3.5-turbo npm run dev
```

### Vercel Testing

1. Create a preview deployment with different model
2. Set environment variable for preview only
3. Test patch generation quality
4. Compare results

## Cost Considerations

### Pricing (as of 2025)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| gpt-4o | $5.00 | $15.00 |
| gpt-4-turbo | $10.00 | $30.00 |
| gpt-4 | $30.00 | $60.00 |
| gpt-3.5-turbo | $0.50 | $1.50 |

### Typical Patch Generation Cost

| Model | Avg Cost per Patch | Quality |
|-------|-------------------|---------|
| gpt-4o | $0.05 - $0.15 | Excellent |
| gpt-4-turbo | $0.10 - $0.30 | Excellent |
| gpt-4 | $0.30 - $0.90 | Excellent |
| gpt-3.5-turbo | $0.01 - $0.03 | Good |

**Note:** Costs vary based on:
- Codebase size
- Patch complexity
- Number of files analyzed
- System prompt length

## Monitoring Model Usage

### Check Current Model

The AI Admin logs which model it's using on initialization:

```
[AI Admin] [2025-10-29T12:00:00.000Z] [INFO] AI Admin initialized with model: gpt-4o
```

### View in Vercel Logs

1. Go to Vercel Dashboard
2. Select your deployment
3. View **Functions** logs
4. Look for AI Admin initialization messages

### OpenAI Dashboard

Monitor usage and costs:
1. Visit https://platform.openai.com/usage
2. View API usage by model
3. Track costs over time

## Troubleshooting

### Model Not Found Error

```
Error: The model `gpt-4o` does not exist
```

**Solution:** Check if your OpenAI account has access to the model. Some models require:
- Paid account
- API access approval
- Minimum usage tier

### Invalid Model Name

```
Error: Invalid model specified
```

**Solution:** Use exact model names:
- ✅ `gpt-4o`
- ✅ `gpt-4-turbo`
- ✅ `gpt-4`
- ✅ `gpt-3.5-turbo`
- ❌ `gpt4`
- ❌ `gpt-4-omni`

### Rate Limit Errors

```
Error: Rate limit exceeded
```

**Solution:**
- Upgrade OpenAI plan
- Reduce patch generation frequency
- Use slower model (more quota)

## Best Practices

### 1. Use Environment Variables

```bash
# .env
AI_ADMIN_MODEL=gpt-4o
```

**Benefits:**
- Easy to change without code changes
- Different models per environment
- No hardcoded values

### 2. Set Per Environment

```bash
# Development
AI_ADMIN_MODEL=gpt-3.5-turbo  # Faster, cheaper for testing

# Production
AI_ADMIN_MODEL=gpt-4o  # Best quality for real patches
```

### 3. Monitor Costs

- Set up billing alerts in OpenAI dashboard
- Track usage per model
- Review costs monthly

### 4. Test Before Production

- Test patches with new model in staging
- Verify quality meets requirements
- Compare with previous model

## Advanced Configuration

### Custom Model Parameters

Modify `/src/lib/ai-admin/agent.ts` to customize:

```typescript
const response = await this.openai.chat.completions.create({
  model: this.model,
  messages: [...],
  response_format: { type: 'json_object' },
  temperature: 0.3,  // Lower = more deterministic
  max_tokens: 4096,  // Limit response length
  top_p: 1.0,        // Nucleus sampling
});
```

### Temperature Settings

| Temperature | Behavior | Use Case |
|-------------|----------|----------|
| 0.0 - 0.3 | Very deterministic | Code generation (current) |
| 0.4 - 0.7 | Balanced | General use |
| 0.8 - 1.0 | Creative | Brainstorming |

**Current:** `0.3` (good for code generation)

## Future Models

When OpenAI releases new models:

1. **Update default** in `/src/lib/ai-admin/agent.ts`
2. **Test thoroughly** in staging
3. **Update documentation**
4. **Notify users** of changes

## Support

For issues with model configuration:
1. Check Vercel environment variables
2. Review OpenAI API logs
3. Verify API key has model access
4. Check OpenAI account tier

## References

- [OpenAI Models Documentation](https://platform.openai.com/docs/models)
- [OpenAI Pricing](https://openai.com/pricing)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

**Last Updated:** October 29, 2025  
**Default Model:** `gpt-4o`  
**Recommended:** `gpt-4o` or `gpt-4-turbo`

