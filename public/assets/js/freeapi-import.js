export const SYNCED_FREE_LLM_PROVIDERS = [
  {
    "name": "Aion Labs",
    "url": "https://www.aionlabs.ai",
    "type": "永久免费层",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "aion-2.5",
        "name": "Aion 2.5",
        "context": "128K",
        "maxOutput": "32K",
        "modality": "Text (roleplay)",
        "rateLimit": "15 RPM, 20K TPD"
      },
      {
        "id": "aion-2.0",
        "name": "Aion 2.0",
        "context": "128K",
        "maxOutput": "32K",
        "modality": "Text (roleplay)",
        "rateLimit": "15 RPM, 20K TPD"
      },
      {
        "id": "aion-rp-llama-3.1-8b",
        "name": "Aion-RP 1.0 (8B)",
        "context": "32K",
        "maxOutput": "32K",
        "modality": "Text (roleplay)",
        "rateLimit": "15 RPM, 20K TPD"
      },
      {
        "id": "aion-3.0",
        "name": "Aion 3.0",
        "context": "128K",
        "maxOutput": "32K",
        "modality": "Text (roleplay, reasoning)",
        "rateLimit": "15 RPM, 20K TPD"
      },
      {
        "id": "aion-3.0-mini",
        "name": "Aion 3.0 Mini",
        "context": "128K",
        "maxOutput": "32K",
        "modality": "Text (roleplay, reasoning)",
        "rateLimit": "15 RPM, 20K TPD"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "Cohere",
    "url": "https://dashboard.cohere.com/api-keys",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "command-a-plus-05-2026",
        "name": "Command A+ (218B)",
        "context": "436K",
        "maxOutput": "64K",
        "modality": "Text + Image",
        "rateLimit": "20 RPM"
      },
      {
        "id": "command-a-03-2025",
        "name": "Command A (111B)",
        "context": "288K",
        "maxOutput": "8K",
        "modality": "Text",
        "rateLimit": "20 RPM"
      },
      {
        "id": "command-r-plus-08-2024",
        "name": "Command R+",
        "context": "128K",
        "maxOutput": "4K",
        "modality": "Text",
        "rateLimit": "20 RPM"
      },
      {
        "id": "command-r-08-2024",
        "name": "Command R",
        "context": "128K",
        "maxOutput": "4K",
        "modality": "Text",
        "rateLimit": "20 RPM"
      },
      {
        "id": "command-r7b-12-2024",
        "name": "Command R7B",
        "context": "128K",
        "maxOutput": "4K",
        "modality": "Text",
        "rateLimit": "20 RPM"
      },
      {
        "id": "command-a-reasoning-08-2025",
        "name": "Command A Reasoning",
        "context": "288K",
        "maxOutput": "~4K",
        "modality": "Text (reasoning)",
        "rateLimit": "20 RPM"
      },
      {
        "id": "command-a-translate-08-2025",
        "name": "Command A Translate",
        "context": "~9K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "20 RPM"
      },
      {
        "id": "command-a-vision-07-2025",
        "name": "Command A Vision",
        "context": "128K",
        "maxOutput": "~4K",
        "modality": "Text + Image",
        "rateLimit": "20 RPM"
      },
      {
        "id": "command-r7b-arabic-02-2025",
        "name": "Command R7B Arabic",
        "context": "128K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "20 RPM"
      },
      {
        "id": "c4ai-aya-expanse-32b",
        "name": "Aya Expanse 32B",
        "context": "128K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "20 RPM"
      },
      {
        "id": "c4ai-aya-vision-32b",
        "name": "Aya Vision 32B",
        "context": "16K",
        "maxOutput": "~4K",
        "modality": "Text + Image",
        "rateLimit": "20 RPM"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "Google Gemini",
    "url": "https://aistudio.google.com/app/apikey",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "gemini-3.6-flash",
        "name": "Gemini 3.6 Flash",
        "context": "1M",
        "maxOutput": "65K",
        "modality": "Text + Image + Audio + Video",
        "rateLimit": "15 RPM, 1,500 RPD"
      },
      {
        "id": "gemini-3.5-flash",
        "name": "Gemini 3.5 Flash",
        "context": "1M",
        "maxOutput": "65K",
        "modality": "Text + Image + Audio + Video",
        "rateLimit": "15 RPM, 1,500 RPD"
      },
      {
        "id": "gemini-3.5-flash-lite",
        "name": "Gemini 3.5 Flash-Lite",
        "context": "1M",
        "maxOutput": "65K",
        "modality": "Text + Image + Audio + Video",
        "rateLimit": "30 RPM, 1,500 RPD"
      },
      {
        "id": "gemini-3.1-flash-lite",
        "name": "Gemini 3.1 Flash-Lite",
        "context": "1M",
        "maxOutput": "65K",
        "modality": "Text + Image + Audio + Video",
        "rateLimit": "30 RPM, 1,500 RPD"
      },
      {
        "id": "gemini-2.5-flash",
        "name": "Gemini 2.5 Flash",
        "context": "1M",
        "maxOutput": "65K",
        "modality": "Text + Image + Audio + Video",
        "rateLimit": "15 RPM, 1,500 RPD"
      },
      {
        "id": "gemini-2.5-flash-lite",
        "name": "Gemini 2.5 Flash-Lite",
        "context": "1M",
        "maxOutput": "65K",
        "modality": "Text + Image + Audio + Video",
        "rateLimit": "30 RPM, 1,500 RPD"
      },
      {
        "id": "gemini-2.5-pro",
        "name": "Gemini 2.5 Pro",
        "context": "1M",
        "maxOutput": "65K",
        "modality": "Text + Image + Audio + Video",
        "rateLimit": "5 RPM, 50 RPD"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "Mistral AI",
    "url": "https://console.mistral.ai/api-keys",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "mistral-medium-2604",
        "name": "Mistral Medium 3.5 (128B)",
        "context": "256K",
        "maxOutput": "256K",
        "modality": "Text + Image + Code",
        "rateLimit": "~1 RPS, 500K TPM"
      },
      {
        "id": "mistral-small-2603",
        "name": "Mistral Small 4",
        "context": "256K",
        "maxOutput": "256K",
        "modality": "Text + Image + Code",
        "rateLimit": "~1 RPS, 500K TPM"
      },
      {
        "id": "mistral-large-2512",
        "name": "Mistral Large 3",
        "context": "256K",
        "maxOutput": "256K",
        "modality": "Text",
        "rateLimit": "~1 RPS, 500K TPM"
      },
      {
        "id": "ministral-8b-2512",
        "name": "Ministral 8B",
        "context": "256K",
        "maxOutput": "256K",
        "modality": "Text",
        "rateLimit": "~1 RPS, 500K TPM"
      },
      {
        "id": "codestral-2508",
        "name": "Codestral",
        "context": "256K",
        "maxOutput": "256K",
        "modality": "Code",
        "rateLimit": "~1 RPS, 500K TPM"
      },
      {
        "id": "ministral-3b-2512",
        "name": "Ministral 3B",
        "context": "128K",
        "maxOutput": "128K",
        "modality": "Text",
        "rateLimit": "~1 RPS, 500K TPM"
      },
      {
        "id": "ministral-14b-2512",
        "name": "Ministral 14B",
        "context": "256K",
        "maxOutput": "256K",
        "modality": "Text",
        "rateLimit": "~1 RPS, 500K TPM"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "Z AI (Zhipu AI)",
    "url": "https://open.bigmodel.cn/usercenter/apikeys",
    "type": "永久免费层",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "glm-4.7-flash",
        "name": "GLM-4.7-Flash",
        "context": "200K",
        "maxOutput": "128K",
        "modality": "Text (reasoning)",
        "rateLimit": "1 concurrent request"
      },
      {
        "id": "glm-4.5-flash",
        "name": "GLM-4.5-Flash",
        "context": "128K",
        "maxOutput": "~96K",
        "modality": "Text (reasoning)",
        "rateLimit": "1 concurrent request"
      },
      {
        "id": "glm-4.6v-flash",
        "name": "GLM-4.6V-Flash",
        "context": "128K",
        "maxOutput": "~4K",
        "modality": "Text + Image",
        "rateLimit": "1 concurrent request"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "Cerebras",
    "url": "https://cloud.cerebras.ai/",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "gpt-oss-120b",
        "name": "gpt-oss-120b",
        "context": "131K (65K on free)",
        "maxOutput": "32K (free) / 40K (paid)",
        "modality": "Text",
        "rateLimit": "5 RPM, 30K TPM, 1M TPD"
      },
      {
        "id": "zai-glm-4.7",
        "name": "zai-glm-4.7 (deprecated Aug 2026)",
        "context": "131K (64K on free)",
        "maxOutput": "40K",
        "modality": "Text",
        "rateLimit": "5 RPM, 30K TPM, 1M TPD"
      },
      {
        "id": "gemma-4-31b",
        "name": "gemma-4-31b",
        "context": "131K (65K on free)",
        "maxOutput": "32K (free) / 40K (paid)",
        "modality": "Text + Image",
        "rateLimit": "15 RPM, 30K TPM, 1M TPD"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "Cloudflare Workers AI",
    "url": "https://dash.cloudflare.com/profile/api-tokens",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        "name": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        "context": "131K",
        "maxOutput": "Shared w/ context",
        "modality": "Text",
        "rateLimit": "10K neurons/day (shared)"
      },
      {
        "id": "@cf/meta/llama-4-scout-17b-16e-instruct",
        "name": "@cf/meta/llama-4-scout-17b-16e-instruct",
        "context": "Up to 10M",
        "maxOutput": "Shared w/ context",
        "modality": "Multimodal",
        "rateLimit": "10K neurons/day (shared)"
      },
      {
        "id": "@cf/openai/gpt-oss-120b",
        "name": "@cf/openai/gpt-oss-120b",
        "context": "128K",
        "maxOutput": "Shared w/ context",
        "modality": "Text",
        "rateLimit": "10K neurons/day (shared)"
      },
      {
        "id": "@cf/moonshotai/kimi-k2.7-code",
        "name": "@cf/moonshotai/kimi-k2.7-code",
        "context": "262K",
        "maxOutput": "Shared w/ context",
        "modality": "Text (code)",
        "rateLimit": "10K neurons/day (shared)"
      },
      {
        "id": "@cf/google/gemma-4-26b-a4b-it",
        "name": "@cf/google/gemma-4-26b-a4b-it",
        "context": "256K",
        "maxOutput": "Shared w/ context",
        "modality": "Text",
        "rateLimit": "10K neurons/day (shared)"
      },
      {
        "id": "@cf/zhipuai/glm-4.7-flash",
        "name": "@cf/zhipuai/glm-4.7-flash",
        "context": "131K",
        "maxOutput": "Shared w/ context",
        "modality": "Text",
        "rateLimit": "10K neurons/day (shared)"
      },
      {
        "id": "@cf/mistralai/mistral-small-3.1-24b-instruct",
        "name": "@cf/mistralai/mistral-small-3.1-24b-instruct",
        "context": "128K",
        "maxOutput": "Shared w/ context",
        "modality": "Text",
        "rateLimit": "10K neurons/day (shared)"
      },
      {
        "id": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
        "name": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
        "context": "32K",
        "maxOutput": "Shared w/ context",
        "modality": "Text (reasoning)",
        "rateLimit": "10K neurons/day (shared)"
      },
      {
        "id": null,
        "name": "+ 42 more models",
        "context": "Varies",
        "maxOutput": "Varies",
        "modality": "Text, Image, Audio, Embeddings",
        "rateLimit": "10K neurons/day (shared)"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "GitHub Models",
    "url": "https://github.com/marketplace/models",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "openai/gpt-5",
        "name": "gpt-5",
        "context": "200K",
        "maxOutput": "32K",
        "modality": "Text",
        "rateLimit": "10 RPM, 50 RPD"
      },
      {
        "id": "openai/gpt-4.1",
        "name": "gpt-4.1",
        "context": "1M",
        "maxOutput": "32K",
        "modality": "Text",
        "rateLimit": "10 RPM, 50 RPD"
      },
      {
        "id": "openai/gpt-4.1-mini",
        "name": "gpt-4.1-mini",
        "context": "1M",
        "maxOutput": "32K",
        "modality": "Text",
        "rateLimit": "15 RPM, 150 RPD"
      },
      {
        "id": "openai/gpt-4o",
        "name": "gpt-4o",
        "context": "128K",
        "maxOutput": "16K",
        "modality": "Text + Vision",
        "rateLimit": "10 RPM, 50 RPD"
      },
      {
        "id": "openai/o4-mini",
        "name": "o4-mini",
        "context": "200K",
        "maxOutput": "100K",
        "modality": "Text (reasoning)",
        "rateLimit": "10 RPM, 50 RPD"
      },
      {
        "id": "meta/Llama-4-Scout-17B-16E-Instruct",
        "name": "Llama-4-Scout-17B-16E-Instruct",
        "context": "512K",
        "maxOutput": "~4K",
        "modality": "Text + Vision",
        "rateLimit": "15 RPM, 150 RPD"
      },
      {
        "id": "meta/Llama-4-Maverick-17B-128E-Instruct-FP8",
        "name": "Llama-4-Maverick-17B-128E-Instruct-FP8",
        "context": "256K",
        "maxOutput": "~4K",
        "modality": "Text + Vision",
        "rateLimit": "10 RPM, 50 RPD"
      },
      {
        "id": "meta/Llama-3.3-70B-Instruct",
        "name": "Llama-3.3-70B-Instruct",
        "context": "131K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "15 RPM, 150 RPD"
      },
      {
        "id": "deepseek/DeepSeek-R1",
        "name": "DeepSeek-R1",
        "context": "64K",
        "maxOutput": "8K",
        "modality": "Text (reasoning)",
        "rateLimit": "15 RPM, 150 RPD"
      },
      {
        "id": "mistral-small-2503",
        "name": "Mistral-Small-3.1",
        "context": "128K",
        "maxOutput": "~4K",
        "modality": "Text + Vision",
        "rateLimit": "15 RPM, 150 RPD"
      },
      {
        "id": null,
        "name": "+ 35 more models",
        "context": "Varies",
        "maxOutput": "Varies",
        "modality": "Text / Image",
        "rateLimit": "Varies by tier"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "Groq",
    "url": "https://console.groq.com/keys",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "llama-3.3-70b-versatile",
        "name": "llama-3.3-70b-versatile",
        "context": "131K",
        "maxOutput": "32K",
        "modality": "Text",
        "rateLimit": "30 RPM, 1,000 RPD"
      },
      {
        "id": "llama-3.1-8b-instant",
        "name": "llama-3.1-8b-instant",
        "context": "131K",
        "maxOutput": "131K",
        "modality": "Text",
        "rateLimit": "30 RPM, 14,400 RPD"
      },
      {
        "id": "openai/gpt-oss-120b",
        "name": "openai/gpt-oss-120b",
        "context": "131K",
        "maxOutput": "65K",
        "modality": "Text",
        "rateLimit": "30 RPM, 1,000 RPD"
      },
      {
        "id": "openai/gpt-oss-20b",
        "name": "openai/gpt-oss-20b",
        "context": "131K",
        "maxOutput": "65K",
        "modality": "Text",
        "rateLimit": "30 RPM, 1,000 RPD"
      },
      {
        "id": "groq/compound",
        "name": "groq/compound",
        "context": "131K",
        "maxOutput": "8K",
        "modality": "Text",
        "rateLimit": "30 RPM, 250 RPD"
      },
      {
        "id": "groq/compound-mini",
        "name": "groq/compound-mini",
        "context": "131K",
        "maxOutput": "8K",
        "modality": "Text",
        "rateLimit": "30 RPM, 250 RPD"
      },
      {
        "id": "qwen/qwen3.6-27b",
        "name": "qwen/qwen3.6-27b",
        "context": "131K",
        "maxOutput": "16K",
        "modality": "Text",
        "rateLimit": "30 RPM, 1,000 RPD"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "Hugging Face",
    "url": "https://huggingface.co/settings/tokens",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "meta-llama/Llama-3.1-8B-Instruct",
        "name": "Meta-Llama-3.1-8B-Instruct",
        "context": "128K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "Credit-metered"
      },
      {
        "id": "google/gemma-3-4b-it",
        "name": "gemma-3-4b-it",
        "context": "131K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "Credit-metered"
      },
      {
        "id": "microsoft/phi-4",
        "name": "phi-4",
        "context": "16K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "Credit-metered"
      },
      {
        "id": "Qwen/Qwen2.5-Coder-7B-Instruct",
        "name": "Qwen2.5-Coder-7B-Instruct",
        "context": "131K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "Credit-metered"
      },
      {
        "id": "Qwen/Qwen2.5-7B-Instruct",
        "name": "Qwen2.5-7B-Instruct",
        "context": "131K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "Credit-metered"
      },
      {
        "id": null,
        "name": "+ thousands of community models",
        "context": "Varies",
        "maxOutput": "Varies",
        "modality": "Text, Image, Audio, Embeddings",
        "rateLimit": "100K credits/month free"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "Kilo Code",
    "url": "https://kilo.ai",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "nvidia/nemotron-3-ultra-550b-a55b:free",
        "name": "nvidia/nemotron-3-ultra-550b-a55b:free",
        "context": "1M",
        "maxOutput": "65K",
        "modality": "Text",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "stepfun/step-3.7-flash:free",
        "name": "stepfun/step-3.7-flash:free",
        "context": "262K",
        "maxOutput": "262K",
        "modality": "Text",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "nvidia/nemotron-3-super-120b-a12b:free",
        "name": "nvidia/nemotron-3-super-120b-a12b:free",
        "context": "262K",
        "maxOutput": "262K",
        "modality": "Text",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "name": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "context": "256K",
        "maxOutput": "65K",
        "modality": "Text (reasoning)",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "inclusionai/ling-3.0-flash:free",
        "name": "inclusionai/ling-3.0-flash:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Text",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "poolside/laguna-s-2.1:free",
        "name": "poolside/laguna-s-2.1:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Text (code)",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "poolside/laguna-xs-2.1:free",
        "name": "poolside/laguna-xs-2.1:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Text (code)",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "cohere/north-mini-code:free",
        "name": "cohere/north-mini-code:free",
        "context": "256K",
        "maxOutput": "64K",
        "modality": "Text (code)",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "openrouter/free",
        "name": "openrouter/free",
        "context": "Varies",
        "maxOutput": "Varies",
        "modality": "Text",
        "rateLimit": "~200 req/hr"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "LLM7.io",
    "url": "https://token.llm7.io",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "deepseek-r1-0528",
        "name": "deepseek-r1-0528",
        "context": "—",
        "maxOutput": "—",
        "modality": "Text (reasoning)",
        "rateLimit": "30 RPM (120 with token)"
      },
      {
        "id": "deepseek-v3-0324",
        "name": "deepseek-v3-0324",
        "context": "—",
        "maxOutput": "—",
        "modality": "Text",
        "rateLimit": "30 RPM (120 with token)"
      },
      {
        "id": "gemini-2.5-flash-lite",
        "name": "gemini-2.5-flash-lite",
        "context": "—",
        "maxOutput": "—",
        "modality": "Text + Vision",
        "rateLimit": "30 RPM (120 with token)"
      },
      {
        "id": "gpt-4o-mini",
        "name": "gpt-4o-mini",
        "context": "—",
        "maxOutput": "—",
        "modality": "Text + Vision",
        "rateLimit": "30 RPM (120 with token)"
      },
      {
        "id": "mistral-small-3.1-24b",
        "name": "mistral-small-3.1-24b",
        "context": "32K",
        "maxOutput": "—",
        "modality": "Text",
        "rateLimit": "30 RPM (120 with token)"
      },
      {
        "id": "qwen2.5-coder-32b",
        "name": "qwen2.5-coder-32b",
        "context": "—",
        "maxOutput": "—",
        "modality": "Text (code)",
        "rateLimit": "30 RPM (120 with token)"
      },
      {
        "id": null,
        "name": "+ ~24 more models",
        "context": "Varies",
        "maxOutput": "Varies",
        "modality": "Text",
        "rateLimit": "30 RPM (120 with token)"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "ModelScope",
    "url": "https://modelscope.cn/my/myaccesstoken",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "Qwen/Qwen3.5-35B-A3B",
        "name": "Qwen/Qwen3.5-35B-A3B",
        "context": "—",
        "maxOutput": "—",
        "modality": "Text",
        "rateLimit": "2,000 RPD total; <=500 RPD/model (dynamic)"
      },
      {
        "id": "Qwen/Qwen3.5-27B",
        "name": "Qwen/Qwen3.5-27B",
        "context": "—",
        "maxOutput": "—",
        "modality": "Text",
        "rateLimit": "2,000 RPD total; <=500 RPD/model (dynamic)"
      },
      {
        "id": null,
        "name": "+ API-Inference-enabled models",
        "context": "Varies",
        "maxOutput": "Varies",
        "modality": "LLM, MLLM",
        "rateLimit": "Dynamic quotas + dynamic concurrency"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "NVIDIA NIM",
    "url": "https://build.nvidia.com/explore/discover",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "deepseek-ai/deepseek-v4-flash",
        "name": "deepseek-ai/deepseek-v4-flash",
        "context": "1M",
        "maxOutput": "~64K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "nvidia/nemotron-3-super-120b-a12b",
        "name": "nvidia/nemotron-3-super-120b-a12b",
        "context": "262K",
        "maxOutput": "262K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "nvidia/nemotron-3-nano-30b-a3b",
        "name": "nvidia/nemotron-3-nano-30b-a3b",
        "context": "128K",
        "maxOutput": "32K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "nvidia/llama-3.1-nemotron-ultra-253b-v1",
        "name": "nvidia/llama-3.1-nemotron-ultra-253b-v1",
        "context": "128K",
        "maxOutput": "4K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "meta/llama-3.3-70b-instruct",
        "name": "meta/llama-3.3-70b-instruct",
        "context": "128K",
        "maxOutput": "4K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "mistralai/mistral-nemotron",
        "name": "mistralai/mistral-nemotron",
        "context": "128K",
        "maxOutput": "8K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "google/gemma-4-31b-it",
        "name": "google/gemma-4-31b-it",
        "context": "128K",
        "maxOutput": "8K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "mistralai/mistral-large-2-instruct",
        "name": "mistralai/mistral-large-2-instruct",
        "context": "128K",
        "maxOutput": "4K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "minimaxai/minimax-m3",
        "name": "minimaxai/minimax-m3",
        "context": "1M",
        "maxOutput": "~64K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "mistralai/mistral-medium-3.5-128b",
        "name": "mistralai/mistral-medium-3.5-128b",
        "context": "262K",
        "maxOutput": "262K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "nvidia/nemotron-3-ultra-550b-a55b",
        "name": "nvidia/nemotron-3-ultra-550b-a55b",
        "context": "262K",
        "maxOutput": "262K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "openai/gpt-oss-120b",
        "name": "openai/gpt-oss-120b",
        "context": "131K",
        "maxOutput": "131K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "openai/gpt-oss-20b",
        "name": "openai/gpt-oss-20b",
        "context": "131K",
        "maxOutput": "131K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": "deepseek-ai/deepseek-v4-pro",
        "name": "deepseek-ai/deepseek-v4-pro",
        "context": "128K",
        "maxOutput": "~64K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": null,
        "name": "+ 85 more models",
        "context": "Varies",
        "maxOutput": "Varies",
        "modality": "Text, Image, Video, Speech, Embeddings",
        "rateLimit": "~40 RPM"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "Ollama Cloud",
    "url": "https://ollama.com/settings/keys",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "deepseek-v4-pro",
        "name": "deepseek-v4-pro",
        "context": "128K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "deepseek-v4-flash",
        "name": "deepseek-v4-flash",
        "context": "1M",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "minimax-m3",
        "name": "minimax-m3",
        "context": "1M",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "kimi-k3",
        "name": "kimi-k3",
        "context": "128K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "gpt-oss:120b",
        "name": "gpt-oss:120b",
        "context": "128K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "gpt-oss:20b",
        "name": "gpt-oss:20b",
        "context": "131K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "nemotron-3-ultra",
        "name": "nemotron-3-ultra",
        "context": "262K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "mistral-large-3:675b",
        "name": "mistral-large-3:675b",
        "context": "128K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "qwen3.5:397b",
        "name": "qwen3.5:397b",
        "context": "131K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": null,
        "name": "+ 10 more cloud models",
        "context": "Varies",
        "maxOutput": "Varies",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "OpenRouter",
    "url": "https://openrouter.ai/keys",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "nvidia/nemotron-3-super-120b-a12b:free",
        "name": "nvidia/nemotron-3-super-120b-a12b:free",
        "context": "262K",
        "maxOutput": "262K",
        "modality": "Text",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": "openai/gpt-oss-20b:free",
        "name": "openai/gpt-oss-20b:free",
        "context": "131K",
        "maxOutput": "32K",
        "modality": "Text",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": "cohere/north-mini-code:free",
        "name": "cohere/north-mini-code:free",
        "context": "256K",
        "maxOutput": "64K",
        "modality": "Text (code)",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": "google/gemma-4-26b-a4b-it:free",
        "name": "google/gemma-4-26b-a4b-it:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Text + Image",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": "google/gemma-4-31b-it:free",
        "name": "google/gemma-4-31b-it:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Text + Image",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": "inclusionai/ling-3.0-flash:free",
        "name": "inclusionai/ling-3.0-flash:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Text",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": "nvidia/nemotron-3-nano-30b-a3b:free",
        "name": "nvidia/nemotron-3-nano-30b-a3b:free",
        "context": "256K",
        "maxOutput": "—",
        "modality": "Text",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": "nvidia/nemotron-nano-9b-v2:free",
        "name": "nvidia/nemotron-nano-9b-v2:free",
        "context": "128K",
        "maxOutput": "—",
        "modality": "Text",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": "nvidia/nemotron-nano-12b-v2-vl:free",
        "name": "nvidia/nemotron-nano-12b-v2-vl:free",
        "context": "128K",
        "maxOutput": "128K",
        "modality": "Text + Image",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": "poolside/laguna-s-2.1:free",
        "name": "poolside/laguna-s-2.1:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Text (code)",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": "poolside/laguna-xs-2.1:free",
        "name": "poolside/laguna-xs-2.1:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Text (code)",
        "rateLimit": "20 RPM, 50 RPD"
      },
      {
        "id": null,
        "name": "+ ~12 more free models",
        "context": "Varies",
        "maxOutput": "Varies",
        "modality": "Text / Image",
        "rateLimit": "20 RPM, 50 RPD"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "OVHcloud AI Endpoints",
    "url": "https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "Qwen3.5-397B-A17B",
        "name": "Qwen3.5-397B-A17B",
        "context": "131K",
        "maxOutput": "~32K",
        "modality": "Text",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "gpt-oss-120b",
        "name": "gpt-oss-120b",
        "context": "128K",
        "maxOutput": "~32K",
        "modality": "Text",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "gpt-oss-20b",
        "name": "gpt-oss-20b",
        "context": "128K",
        "maxOutput": "~8K",
        "modality": "Text",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "Meta-Llama-3_3-70B-Instruct",
        "name": "Meta-Llama-3_3-70B-Instruct",
        "context": "131K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "Qwen3.6-27B",
        "name": "Qwen3.6-27B",
        "context": "131K",
        "maxOutput": "~32K",
        "modality": "Text",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "Qwen3.5-9B",
        "name": "Qwen3.5-9B",
        "context": "131K",
        "maxOutput": "~8K",
        "modality": "Text",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "Qwen3-32B",
        "name": "Qwen3-32B",
        "context": "131K",
        "maxOutput": "~32K",
        "modality": "Text",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "Qwen3-Coder-30B-A3B-Instruct",
        "name": "Qwen3-Coder-30B-A3B-Instruct",
        "context": "262K",
        "maxOutput": "~32K",
        "modality": "Text (code)",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "Qwen2.5-VL-72B-Instruct",
        "name": "Qwen2.5-VL-72B-Instruct",
        "context": "128K",
        "maxOutput": "~8K",
        "modality": "Text + Vision",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "Mistral-Small-3.2-24B-Instruct-2506",
        "name": "Mistral-Small-3.2-24B-Instruct",
        "context": "128K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "Mistral-Nemo-Instruct-2407",
        "name": "Mistral-Nemo-Instruct-2407",
        "context": "128K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "2 RPM (anonymous)"
      },
      {
        "id": "Mistral-7B-Instruct-v0.3",
        "name": "Mistral-7B-Instruct-v0.3",
        "context": "32K",
        "maxOutput": "~4K",
        "modality": "Text",
        "rateLimit": "2 RPM (anonymous)"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "SambaNova",
    "url": "https://cloud.sambanova.ai/apis",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "DeepSeek-V3.1",
        "name": "DeepSeek-V3.1",
        "context": "128K",
        "maxOutput": "~8K",
        "modality": "Text",
        "rateLimit": "20 RPM, 20 RPD, 200K TPD"
      },
      {
        "id": "DeepSeek-V3.2",
        "name": "DeepSeek-V3.2 (Preview)",
        "context": "128K",
        "maxOutput": "~8K",
        "modality": "Text",
        "rateLimit": "20 RPM, 20 RPD, 200K TPD"
      },
      {
        "id": "Meta-Llama-3.3-70B-Instruct",
        "name": "Meta-Llama-3.3-70B-Instruct",
        "context": "128K",
        "maxOutput": "~3K",
        "modality": "Text",
        "rateLimit": "20 RPM, 20 RPD, 200K TPD"
      },
      {
        "id": "gpt-oss-120b",
        "name": "gpt-oss-120b",
        "context": "128K",
        "maxOutput": "~128K",
        "modality": "Text",
        "rateLimit": "20 RPM, 20 RPD, 200K TPD"
      },
      {
        "id": "MiniMax-M2.7",
        "name": "MiniMax-M2.7",
        "context": "128K",
        "maxOutput": "~192K",
        "modality": "Text",
        "rateLimit": "20 RPM, 20 RPD, 200K TPD"
      },
      {
        "id": "gemma-4-31B-it",
        "name": "gemma-4-31B-it (Preview)",
        "context": "128K",
        "maxOutput": "~128K",
        "modality": "Text + Image + Video",
        "rateLimit": "20 RPM, 20 RPD, 200K TPD"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "SiliconFlow",
    "url": "https://cloud.siliconflow.cn/account/ak",
    "type": "永久免费层",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "Qwen/Qwen3-8B",
        "name": "Qwen/Qwen3-8B",
        "context": "131K",
        "maxOutput": "131K",
        "modality": "Text",
        "rateLimit": "30 RPM, 60K TPM"
      },
      {
        "id": "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
        "name": "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
        "context": "131K",
        "maxOutput": "Configurable",
        "modality": "Text (reasoning)",
        "rateLimit": "30 RPM, 60K TPM"
      }
    ],
    "limits": "见上游",
    "note": "自动同步自 mnfst/awesome-free-llm-apis，请以官方页面为准。",
    "source": "mnfst/awesome-free-llm-apis"
  },
  {
    "name": "ChatAnywhere",
    "url": "https://chatanywhere.tech",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** Unknown",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "硅基流动 / SiliconFlow",
    "url": "https://siliconflow.cn",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 1000 RPM (each model)",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "OpenRouter",
    "url": "https://openrouter.ai",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 20 RPM / 200 RPD (each model)",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "书生 / Intern AI",
    "url": "https://chat.intern-ai.org.cn",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 10 RPM",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Google Gemini",
    "url": "https://aistudio.google.com",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 5 RPM / 20 RPD",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Cohere",
    "url": "https://cohere.ai",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 20 RPM",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Bigmodel",
    "url": "https://bigmodel.cn",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 15 RPM / 150 RPD",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Github Models",
    "url": "https://github.com/marketplace?type=models",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 15 RPM / 150 RPD",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "NVIDIA NIM",
    "url": "https://build.nvidia.com/",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 40 RPM",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "LLM7",
    "url": "https://llm7.io/",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 2 RPS / 20 RPM / 100RPH",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "ModelScope",
    "url": "https://modelscope.cn",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 2000 RPD",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Kilo Gateway",
    "url": "https://kilo.ai/leaderboard#all-models",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 200RPH (Hour)",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "HuggingFace",
    "url": "https://huggingface.co/models?inference_provider=all&sort=trending",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 300 RPH (Hour)",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Groq",
    "url": "https://groq.com",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 30 RPM / 1000 RPD",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Celebras",
    "url": "https://celebras.ai",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 30 RPM / 900 RPH / 1440 RPD",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Mistral",
    "url": "https://mistral.ai",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** Unknown",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "OpenCode Zen",
    "url": "https://opencode.ai",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** Unknown",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Token平台 / DXNT",
    "url": "https://dxnt.com",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** Unknown",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Agens AI",
    "url": "https://platform.agnes-ai.com/",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** Unknown",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "Cloudflare Workers AI",
    "url": "https://developers.cloudflare.com/workers-ai/models/",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 10k Neurons Per Day",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "SenseNova",
    "url": "https://platform.sensenova.cn",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 1500 Per 5 Hours",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  },
  {
    "name": "G4F",
    "url": "https://g4f.dev/",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** Unknown",
    "note": "自动同步自 for-the-zero/Free-LLM-Collection，请以官方页面为准。",
    "source": "for-the-zero/Free-LLM-Collection"
  }
];
export const FREE_LLM_SYNC_META = {
  "generatedAt": "2026-08-07T03:19:52.683Z",
  "sources": [
    {
      "repo": "mnfst/awesome-free-llm-apis",
      "path": "data.json",
      "status": "ok",
      "count": 19
    },
    {
      "repo": "cheahjs/free-llm-api-resources",
      "path": "README.md",
      "status": "error",
      "error": "Error: 404"
    },
    {
      "repo": "nejib1/Free-LLM",
      "path": "README.md",
      "status": "ok",
      "count": 0
    },
    {
      "repo": "for-the-zero/Free-LLM-Collection",
      "path": "README.md",
      "status": "ok",
      "count": 22
    },
    {
      "repo": "guihuashaoxiang/FreeLLM-API-KeyHub",
      "path": "README.md",
      "status": "ok",
      "count": 0
    }
  ]
};
