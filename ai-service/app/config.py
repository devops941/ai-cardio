"""Typed settings read from the environment (Section 4.3)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    ANTHROPIC_API_KEY: str = "sk-ant-your-key-here"
    GROQ_API_KEY: str = ""
    INTERNAL_API_KEY: str = "change-me-internal-key"
    CORS_ORIGIN: str = "http://localhost:3000"
    CHROMA_PATH: str = "./data/chroma"
    EMBED_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    LLM_MODEL: str = "claude-sonnet-4-5"
    GUARD_MODEL: str = "claude-haiku-4-5"
    GROQ_LLM_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_GUARD_MODEL: str = "llama-3.1-8b-instant"
    LLM_PROVIDER: str = "auto"  # auto | anthropic | groq
    LLM_MOCK: bool = True
    LLM_MOCK_FAIL: str = ""  # unavailable | bad_json
    LLM_MAX_TOKENS: int = 1500
    GUARD_TIMEOUT_S: float = 8.0
    LLM_TIMEOUT_S: float = 25.0
    SIM_THRESHOLD: float = 0.35
    TOP_K: int = 5
    MODELS_DIR: str = "./models"
    DATASET_PATH: str = "./datasets/heart_cleveland.csv"
    MAX_UPLOAD_MB: int = 20


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
