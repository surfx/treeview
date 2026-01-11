import os
import json
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Caminho completo do arquivo
DB_PATH = r"D:\projetos\javascript\treeview\server\meu-servidor-rest\db_json\db_tree.json"

# Dados iniciais caso o arquivo não exista
INITIAL_DATA = [
    {
        "id": "1",
        "name": "Documentos",
        "type": "folder",
        "isOpen": True,
        "checked": False,
        "children": [
            {"id": "2", "name": "projeto_final.pdf", "type": "file", "checked": False},
            {"id": "3", "name": "notas.txt", "type": "file", "checked": False}
        ]
    }
]

def load_from_disk():
    """Lê os dados do arquivo JSON"""
    if not os.path.exists(DB_PATH):
        save_to_disk(INITIAL_DATA)
        return INITIAL_DATA
    
    try:
        with open(DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Erro ao ler arquivo: {e}")
        return INITIAL_DATA

def save_to_disk(data):
    """Salva os dados no arquivo JSON criando a pasta se necessário"""
    try:
        # Cria a pasta db_json se ela não existir
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        
        with open(DB_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Erro ao salvar arquivo: {e}")

@app.get("/tree")
async def get_tree():
    """Retorna os dados lidos do disco"""
    return load_from_disk()

@app.post("/tree")
async def save_tree(new_data: List = Body(...)):
    """Recebe os dados do front-end e grava no disco"""
    save_to_disk(new_data)
    return {"status": "sucesso", "mensagem": "Dados gravados no JSON"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)