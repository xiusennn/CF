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
        "maxOutput": "~8K",
        "modality": "Text (roleplay)",
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
        "context": "128K",
        "maxOutput": "4K",
        "modality": "Text",
        "rateLimit": "20 RPM"
      },
      {
        "id": "command-a-03-2025",
        "name": "Command A (111B)",
        "context": "256K",
        "maxOutput": "4K",
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
        "id": "gemini-3.5-flash",
        "name": "Gemini 3.5 Flash",
        "context": "1M",
        "maxOutput": "64K",
        "modality": "Text + Image + Audio + Video",
        "rateLimit": "15 RPM, 1,500 RPD"
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
        "id": "gemini-2.5-pro",
        "name": "Gemini 2.5 Pro",
        "context": "2M",
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
        "id": "mistral-large-2411",
        "name": "Mistral Large 3",
        "context": "256K",
        "maxOutput": "256K",
        "modality": "Text",
        "rateLimit": "~1 RPS, 500K TPM"
      },
      {
        "id": "open-mistral-nemo",
        "name": "Mistral Nemo (12B)",
        "context": "128K",
        "maxOutput": "128K",
        "modality": "Text",
        "rateLimit": "~1 RPS, 500K TPM"
      },
      {
        "id": "codestral-2501",
        "name": "Codestral",
        "context": "256K",
        "maxOutput": "256K",
        "modality": "Code",
        "rateLimit": "~1 RPS, 500K TPM"
      },
      {
        "id": "pixtral-large-2411",
        "name": "Pixtral Large",
        "context": "128K",
        "maxOutput": "128K",
        "modality": "Text + Image",
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
        "modality": "Text",
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
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": [
      {
        "id": "gpt-oss-120b",
        "name": "gpt-oss-120b",
        "context": "128K (8K on free)",
        "maxOutput": "8K",
        "modality": "Text",
        "rateLimit": "30 RPM, 14,400 RPD, 1M TPD"
      },
      {
        "id": "zai-glm-4.7",
        "name": "zai-glm-4.7",
        "context": "128K (8K on free)",
        "maxOutput": "8K",
        "modality": "Text",
        "rateLimit": "10 RPM, 100 RPD, 1M TPD"
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
        "rateLimit": "30 RPM, 1,000 RPD"
      },
      {
        "id": "llama-4-scout-17b-16e-instruct",
        "name": "llama-4-scout-17b-16e-instruct",
        "context": "131K",
        "maxOutput": "8K",
        "modality": "Text + Vision",
        "rateLimit": "30 RPM, 1,000 RPD"
      },
      {
        "id": "qwen3-32b",
        "name": "qwen3-32b",
        "context": "131K",
        "maxOutput": "131K",
        "modality": "Text",
        "rateLimit": "30 RPM, 1,000 RPD"
      },
      {
        "id": "gpt-oss-120b",
        "name": "gpt-oss-120b",
        "context": "131K",
        "maxOutput": "32K",
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
        "context": "128K",
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
        "id": "x-ai/grok-code-fast-1:free",
        "name": "x-ai/grok-code-fast-1:free",
        "context": "256K",
        "maxOutput": "—",
        "modality": "Text (code)",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "minimax/minimax-m2.5:free",
        "name": "minimax/minimax-m2.5:free",
        "context": "196K",
        "maxOutput": "8K",
        "modality": "Text",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "bytedance-seed/dola-seed-2.0-pro:free",
        "name": "bytedance-seed/dola-seed-2.0-pro:free",
        "context": "—",
        "maxOutput": "—",
        "modality": "Text",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "nvidia/nemotron-3-super-120b-a12b:free",
        "name": "nvidia/nemotron-3-super-120b-a12b:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Text",
        "rateLimit": "~200 req/hr"
      },
      {
        "id": "arcee-ai/trinity-large-thinking:free",
        "name": "arcee-ai/trinity-large-thinking:free",
        "context": "—",
        "maxOutput": "—",
        "modality": "Text (reasoning)",
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
        "id": "minimax/minimax-m2.7",
        "name": "minimax/minimax-m2.7",
        "context": "128K",
        "maxOutput": "8K",
        "modality": "Text",
        "rateLimit": "~40 RPM"
      },
      {
        "id": null,
        "name": "+ 90 more models",
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
        "id": "gpt-oss:120b-cloud",
        "name": "gpt-oss:120b-cloud",
        "context": "128K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "deepseek-v3.1:671b-cloud",
        "name": "deepseek-v3.1:671b-cloud",
        "context": "128K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "qwen3-coder:480b-cloud",
        "name": "qwen3-coder:480b-cloud",
        "context": "128K",
        "maxOutput": "Model-dependent",
        "modality": "Text (code)",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "kimi-k2:1t-cloud",
        "name": "kimi-k2:1t-cloud",
        "context": "262K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "glm-4.6:cloud",
        "name": "glm-4.6:cloud",
        "context": "128K",
        "maxOutput": "Model-dependent",
        "modality": "Text",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": "deepseek-r1:cloud",
        "name": "deepseek-r1:cloud",
        "context": "128K",
        "maxOutput": "Model-dependent",
        "modality": "Text (reasoning)",
        "rateLimit": "Session/weekly limits (unpublished)"
      },
      {
        "id": null,
        "name": "+ 30 more cloud models",
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
        "id": "qwen/qwen3-coder:free",
        "name": "qwen/qwen3-coder:free",
        "context": "1M",
        "maxOutput": "262K",
        "modality": "Text (code)",
        "rateLimit": "20 RPM, 200 RPD"
      },
      {
        "id": "nvidia/nemotron-3-ultra-550b-a55b:free",
        "name": "nvidia/nemotron-3-ultra-550b-a55b:free",
        "context": "1M",
        "maxOutput": "65K",
        "modality": "Text",
        "rateLimit": "20 RPM, 200 RPD"
      },
      {
        "id": "nvidia/nemotron-3-super-120b-a12b:free",
        "name": "nvidia/nemotron-3-super-120b-a12b:free",
        "context": "1M",
        "maxOutput": "262K",
        "modality": "Text",
        "rateLimit": "20 RPM, 200 RPD"
      },
      {
        "id": "openai/gpt-oss-120b:free",
        "name": "openai/gpt-oss-120b:free",
        "context": "131K",
        "maxOutput": "131K",
        "modality": "Text",
        "rateLimit": "20 RPM, 200 RPD"
      },
      {
        "id": "openai/gpt-oss-20b:free",
        "name": "openai/gpt-oss-20b:free",
        "context": "131K",
        "maxOutput": "8K",
        "modality": "Text",
        "rateLimit": "20 RPM, 200 RPD"
      },
      {
        "id": "meta-llama/llama-3.3-70b-instruct:free",
        "name": "meta-llama/llama-3.3-70b-instruct:free",
        "context": "131K",
        "maxOutput": "~16K",
        "modality": "Text",
        "rateLimit": "20 RPM, 200 RPD"
      },
      {
        "id": "nousresearch/hermes-3-llama-3.1-405b:free",
        "name": "nousresearch/hermes-3-llama-3.1-405b:free",
        "context": "131K",
        "maxOutput": "~16K",
        "modality": "Text",
        "rateLimit": "20 RPM, 200 RPD"
      },
      {
        "id": "google/gemma-4-31b-it:free",
        "name": "google/gemma-4-31b-it:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Multimodal",
        "rateLimit": "20 RPM, 200 RPD"
      },
      {
        "id": "poolside/laguna-m.1:free",
        "name": "poolside/laguna-m.1:free",
        "context": "262K",
        "maxOutput": "32K",
        "modality": "Text",
        "rateLimit": "20 RPM, 200 RPD"
      },
      {
        "id": "qwen/qwen3-next-80b-a3b-instruct:free",
        "name": "qwen/qwen3-next-80b-a3b-instruct:free",
        "context": "262K",
        "maxOutput": "~32K",
        "modality": "Text",
        "rateLimit": "20 RPM, 200 RPD"
      },
      {
        "id": null,
        "name": "+ ~12 more free models",
        "context": "Varies",
        "maxOutput": "Varies",
        "modality": "Text / Image",
        "rateLimit": "20 RPM, 200 RPD"
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
        "maxOutput": "~8K",
        "modality": "Text",
        "rateLimit": "20 RPM, 20 RPD, 200K TPD"
      },
      {
        "id": "gpt-oss-120b",
        "name": "gpt-oss-120b",
        "context": "128K",
        "maxOutput": "~8K",
        "modality": "Text",
        "rateLimit": "20 RPM, 20 RPD, 200K TPD"
      },
      {
        "id": "MiniMax-M2.7",
        "name": "MiniMax-M2.7",
        "context": "128K",
        "maxOutput": "~8K",
        "modality": "Text",
        "rateLimit": "20 RPM, 20 RPD, 200K TPD"
      },
      {
        "id": "gemma-4-31B-it",
        "name": "gemma-4-31B-it (Preview)",
        "context": "128K",
        "maxOutput": "~8K",
        "modality": "Text",
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
    "name": "OpenRouter",
    "url": "https://openrouter.ai",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "**",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Google AI Studio",
    "url": "https://aistudio.google.com",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "</th></tr></thead><tbody>",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Mistral (La Plateforme)",
    "url": "https://console.mistral.ai/",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** Set per-model and per-organization — check [your limits page](https://admin.mistral.ai/plateforme/limits). As of July 2026 a new free account sees anywhere f",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Mistral (Codestral)",
    "url": "https://codestral.mistral.ai/",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 30 requests/minute, 2,000 requests/day",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "HuggingFace Inference Providers",
    "url": "https://huggingface.co/docs/inference-providers/en/index",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "ed to models smaller than 10GB. Some popular models are supported even if they exceed 10GB.",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Vercel AI Gateway",
    "url": "https://vercel.com/docs/ai-gateway",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": ".",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Kilo Gateway",
    "url": "https://kilo.ai/docs/gateway",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** [200 requests/hour per IP, shared across all free models](https://kilo.ai/docs/gateway/usage-and-billing#rate-limiting)",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "OpenCode Zen",
    "url": "https://opencode.ai/docs/zen/",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "</th></tr></thead><tbody>",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Groq",
    "url": "https://console.groq.com",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "</th></tr></thead><tbody>",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Cohere",
    "url": "https://cohere.com",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "**",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Cloudflare Workers AI",
    "url": "https://developers.cloudflare.com/workers-ai",
    "type": "限速免费",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** [10,000 neurons/day](https://developers.cloudflare.com/workers-ai/platform/pricing/#free-allocation)",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Fireworks",
    "url": "https://fireworks.ai/",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $1",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Baseten",
    "url": "https://app.baseten.co/",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $30",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Nebius",
    "url": "https://tokenfactory.nebius.com/",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $1",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Novita",
    "url": "https://novita.ai/?ref=ytblmjc&utm_source=affiliate",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $0.5 for 1 year",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "AI21",
    "url": "https://studio.ai21.com/",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $10 for 3 months",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Upstage",
    "url": "https://console.upstage.ai/",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $10 for 3 months",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "NLP Cloud",
    "url": "https://nlpcloud.com/home",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $15",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Alibaba Cloud (International) Model Studio",
    "url": "https://bailian.console.alibabacloud.com/",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 1 million tokens/model, valid for 90 days (Singapore endpoint only)",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Modal",
    "url": "https://modal.com",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $30/month on the Starter plan",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Inference.net",
    "url": "https://inference.net",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $1, $25 on responding to email survey",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Hyperbolic",
    "url": "https://app.hyperbolic.ai/",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $1",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "SambaNova Cloud",
    "url": "https://cloud.sambanova.ai/",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** $5 for 3 months",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
  },
  {
    "name": "Scaleway Generative APIs",
    "url": "https://console.scaleway.com/generative-api/models",
    "type": "试用 Token / 注册赠送额度",
    "region": "待确认",
    "auth": "见官网",
    "models": "见官网",
    "limits": "** 1,000,000 free tokens, plus 60 minutes of audio transcription",
    "note": "自动同步自 cheahjs/free-llm-api-resources，请以官方页面为准。",
    "source": "cheahjs/free-llm-api-resources"
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
  "generatedAt": "2026-07-30T14:33:27.400Z",
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
      "status": "ok",
      "count": 26
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
