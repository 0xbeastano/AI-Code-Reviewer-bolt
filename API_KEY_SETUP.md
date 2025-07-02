# 🔑 API Key Setup Guide

This guide helps you configure the correct API keys for the AI Code Review Agent Pro application.

## 🚨 **Important: Claude API Key Format**

The application is currently configured to use **Claude 3 Haiku** as the default model for optimal speed and cost efficiency. However, you need a valid Claude API key.

### ❌ **Current Issue**
The provided API key `AIzaSyCNii-Ghkyz67wA_vLFzuTqkZpTNbfbH-k` appears to be a **Google API key format**, not a Claude API key.

### ✅ **Correct Claude API Key Format**
Claude API keys should:
- Start with `sk-ant-`
- Be much longer (typically 100+ characters)
- Example format: `sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

## 🛠 **How to Get Claude API Keys**

### 1. **Visit Anthropic Console**
Go to: [https://console.anthropic.com/](https://console.anthropic.com/)

### 2. **Create Account/Sign In**
- Sign up for an Anthropic account
- Verify your email address

### 3. **Generate API Key**
- Navigate to "API Keys" section
- Click "Create Key"
- Copy the generated key (starts with `sk-ant-`)

### 4. **Update Environment Variables**
Add to your `.env` file:
```bash
VITE_CLAUDE_API_KEY=sk-ant-api03-YOUR_ACTUAL_CLAUDE_KEY_HERE
```

## 🔄 **Current Workaround**

The application has been temporarily configured to:
1. **Default to OpenAI (GPT-4o)** until a valid Claude key is provided
2. **Gracefully fallback** to mock data if Claude API fails
3. **Continue working** without crashes

## 📝 **Complete Environment Setup**

Create a `.env` file with all required keys:

```bash
# AI API Keys
VITE_CLAUDE_API_KEY=sk-ant-api03-YOUR_CLAUDE_KEY_HERE
VITE_OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OAuth Configuration
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Security
VITE_ENCRYPTION_SECRET=your_encryption_secret_here
```

## 🎯 **API Key Priority**

The application will use APIs in this order:
1. **Claude API** (if valid key provided and Claude model selected)
2. **OpenAI API** (if OpenAI model selected or Claude unavailable)
3. **Mock Data** (fallback for demo purposes)

## 💰 **Cost Comparison**

| Provider | Model | Cost per 1K tokens | Speed | Quality |
|----------|-------|-------------------|--------|---------|
| **Claude** | Haiku | $0.00025 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Claude** | Sonnet | $0.003 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **OpenAI** | GPT-4o | $0.005 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🔧 **Troubleshooting**

### Error: "Something went wrong"
**Cause**: Invalid Claude API key format  
**Solution**: Get a proper Claude API key starting with `sk-ant-`

### Error: "Claude client not initialized"
**Cause**: No Claude API key in environment variables  
**Solution**: Add `VITE_CLAUDE_API_KEY` to your `.env` file

### Using Mock Data
**Cause**: No valid API keys configured  
**Solution**: Add at least one valid API key (Claude or OpenAI)

## 🚀 **Quick Start**

1. **Get Claude API key** from [Anthropic Console](https://console.anthropic.com/)
2. **Add to .env file**: `VITE_CLAUDE_API_KEY=sk-ant-your-key-here`
3. **Restart the application**: `npm run dev`
4. **Verify in console**: Look for "Claude client initialized successfully"

## 📞 **Support**

If you continue to experience issues:
1. Check browser console for detailed error messages
2. Verify API key format starts with `sk-ant-`
3. Ensure environment variables are properly loaded
4. Test with a known working OpenAI key as fallback

**The application is designed to be resilient and will work with partial configuration, but optimal performance requires valid Claude API keys.**