from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from generator import generate_image
import os

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/generate")
async def generate(code: str = Form(...)):
    if not code or not code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
        
    try:
        output_path = generate_image(code)
        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Image generation failed")
        return FileResponse(output_path, media_type="image/png", filename="code-snapshot.png")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")