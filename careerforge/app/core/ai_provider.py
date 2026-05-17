"""
app/core/ai_provider.py — Unified AI provider with fallback chain

Priority: Groq (free + fast) → Gemini → Anthropic
All return plain text; callers parse JSON themselves.
"""
import httpx
import json
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIProvider:
    """
    Single interface for all LLM calls.
    Tries providers in order until one succeeds.
    """

    async def complete(
        self,
        prompt: str,
        system: str = "",
        max_tokens: int = 1500,
        json_mode: bool = False,
    ) -> str:
        """
        Returns the text completion. Raises on total failure.
        json_mode=True adds a reminder to return only JSON.
        """
        if json_mode:
            system = (system + "\nIMPORTANT: Return ONLY valid JSON, no markdown, no extra text.").strip()

        errors = []

        if settings.GROQ_API_KEY:
            try:
                return await self._groq(prompt, system, max_tokens)
            except Exception as e:
                errors.append(f"Groq: {e}")
                logger.warning(f"Groq failed, trying next provider: {e}")

        if settings.GEMINI_API_KEY:
            try:
                return await self._gemini(prompt, system, max_tokens)
            except Exception as e:
                errors.append(f"Gemini: {e}")
                logger.warning(f"Gemini failed, trying next provider: {e}")

        if settings.ANTHROPIC_API_KEY:
            try:
                return await self._anthropic(prompt, system, max_tokens)
            except Exception as e:
                errors.append(f"Anthropic: {e}")
                logger.warning(f"Anthropic failed: {e}")

        raise RuntimeError(f"All AI providers failed: {'; '.join(errors)}")

    async def complete_json(self, prompt: str, system: str = "", max_tokens: int = 1500) -> dict:
        """Convenience wrapper that parses and returns JSON."""
        text = await self.complete(prompt, system, max_tokens, json_mode=True)
        return self._parse_json(text)

    # ── Provider implementations ──

    async def _groq(self, prompt: str, system: str, max_tokens: int) -> str:
        """Groq API — llama-3.3-70b-versatile, free tier, ~200 tok/s"""
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT) as client:
            r = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.GROQ_MODEL,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": 0.7,
                },
            )
            r.raise_for_status()
            data = r.json()
            return data["choices"][0]["message"]["content"]

    async def _gemini(self, prompt: str, system: str, max_tokens: int) -> str:
        """Google Gemini 1.5 Flash — fast and free tier available"""
        full_prompt = f"{system}\n\n{prompt}".strip() if system else prompt

        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT) as client:
            r = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent",
                params={"key": settings.GEMINI_API_KEY},
                json={
                    "contents": [{"parts": [{"text": full_prompt}]}],
                    "generationConfig": {
                        "maxOutputTokens": max_tokens,
                        "temperature": 0.7,
                    },
                },
            )
            r.raise_for_status()
            data = r.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    async def _anthropic(self, prompt: str, system: str, max_tokens: int) -> str:
        """Anthropic Claude — used as last resort"""
        body = {
            "model": "claude-sonnet-4-20250514",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            body["system"] = system

        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT) as client:
            r = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json=body,
            )
            r.raise_for_status()
            data = r.json()
            return data["content"][0]["text"]

    @staticmethod
    def _parse_json(text: str) -> dict:
        """Extract JSON from LLM output (handles markdown fences)."""
        text = text.strip()
        # Strip markdown fences
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
        # Find first { or [
        for start_char, end_char in [("{", "}"), ("[", "]")]:
            start = text.find(start_char)
            end = text.rfind(end_char)
            if start != -1 and end != -1:
                try:
                    return json.loads(text[start : end + 1])
                except json.JSONDecodeError:
                    continue
        raise ValueError(f"No valid JSON found in AI response: {text[:200]}")


# Singleton instance used by all services
ai = AIProvider()
