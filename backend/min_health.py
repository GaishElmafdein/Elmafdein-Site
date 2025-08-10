from fastapi import FastAPI

app = FastAPI()

@app.get('/health')
async def health():
    return {"ok": True}
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health():
    return {"ok": True}
