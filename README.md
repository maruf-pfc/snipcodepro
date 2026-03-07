# Code Snapshot

**Code Snapshot** is a lightweight tool that converts pasted code into **beautiful, social-media-ready PNG images**.
It provides a **clean browser interface** utilizing a split side-by-side view highlighting code with Pygments, and generates natively stylized PNG snapshots mimicking a sleek macOS window.

Perfect for sharing code snippets on:
- LinkedIn
- Twitter / X
- Dev communities
- Blogs
- Tutorials
- Documentation

---

## Features

- VS Code–style **interactive Monaco code editor**
- Side-by-Side Live layout for instant feedback
- **Pygments Syntax Highlighting** with Monokai aesthetic
- Custom **JetBrains Mono** typography support
- **Mac terminal-styled snapshots** with drop shadows and curved borders
- Fast backend powered by FastAPI and Pillow

---

## Tech Stack

Backend
- FastAPI
- Pillow (Image Generation Engine)
- Pygments (Lexical Syntax Highlighting)

Frontend
- HTML/CSS (Modern Flexbox + Glassmorphism Theme)
- Vanilla JavaScript
- Monaco Editor

---

## Installation

Clone the repository
```bash
git clone https://github.com/yourusername/code-snapshot.git
cd code-snapshot
```

Install dependencies into a virtual environment
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Running the App

Start the development server:
```bash
uvicorn app:app --reload
```

Open your browser to:
`http://localhost:8000`

Ensure you select your target language from the dropdown before generating the snapshot to get perfect syntax highlighting!

---

## Project Structure

```txt
code-snapshot
│
├── app.py                 # FastAPI application and routes
├── generator.py           # Custom Pillow image generation & Pygments parsing
├── requirements.txt       # Project dependencies
├── README.md              # Documentation
├── JetBrainsMono.ttf      # Developer Font Engine
│
├── templates
│   └── index.html         # Web UI (Side-by-Side Layout)
│
├── static
│   └── style.css          # Modern UI Theme Styles
│
└── outputs                # Automatically stores generated images
```

---

## Output Example
The generated image mimics a high-resolution macOS application window containing your highlighted code snippet, right-aligned line numbers, and an immersive drop shadow. 

---

## License

Apache License 2.0

---

## Author

**Md. Maruf Sarker**
Software Engineering Enthusiast | Competitive Programmer | Content Creator for Tech Learners
