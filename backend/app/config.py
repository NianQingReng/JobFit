from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./jobfit.db"
    openai_api_key: str = ""
    openai_model: str = "gpt-3.5-turbo"

    class Config:
        env_file = ".env"


settings = Settings()
