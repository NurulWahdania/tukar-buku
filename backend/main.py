# # app/main.py
# from fastapi import FastAPI, Depends, HTTPException, status
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from fastapi.security import HTTPBasic, HTTPBasicCredentials
# from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
# from fastapi.openapi.utils import get_openapi
# from sqlalchemy.orm import Session
# import secrets
# import os

# from .MainUtama import database
# from .Models import roleModels, aboutContentModels
# from . import auth

# # Import Router
# from .EndPoint import (
#     users, stores, categories, books, 
#     reports, reviews, wishlist, transactions,
#     announcements, securityTips, about, moderations
# )

# # Import Models
# from .Models import (
#     userModels, roleModels, storeModels, 
#     categoryModels, bookModels, reportModels, 
#     reviewModels, wishlistModels, transactionModels,
#     announcementModels, securityTipModels, aboutContentModels, moderationModels
# )

# # --- KONFIGURASI KEAMANAN DOKUMENTASI (SWAGGER) ---
# # Ganti username dan password ini sesuai keinginan Anda untuk akses halaman /docs
# DOCS_USERNAME = "admin"
# DOCS_PASSWORD = "password123"

# security = HTTPBasic()

# def get_current_username_docs(credentials: HTTPBasicCredentials = Depends(security)):
#     """Fungsi untuk memvalidasi login saat membuka /docs"""
#     correct_username = secrets.compare_digest(credentials.username, DOCS_USERNAME)
#     correct_password = secrets.compare_digest(credentials.password, DOCS_PASSWORD)
#     if not (correct_username and correct_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect username or password",
#             headers={"WWW-Authenticate": "Basic"},
#         )
#     return credentials.username

# # --- DATABASE & SEEDING ---
# try:
#     database.Base.metadata.create_all(bind=database.engine)
# except Exception as e:
#     print(f"Error creating database tables: {e}")

# def seed_database():
#     db: Session = database.SessionLocal()
#     try:
#         if db.query(roleModels.Role).count() == 0:
#             db.add_all([
#                 roleModels.Role(name="Admin"),
#                 roleModels.Role(name="Seller"),
#                 roleModels.Role(name="User")
#             ])
#             db.commit()
            
#         if db.query(aboutContentModels.AboutContent).count() == 0:
#             db.add_all([
#                 aboutContentModels.AboutContent(judul="Visi & Misi", isi="Isi Visi & Misi..."),
#                 aboutContentModels.AboutContent(judul="Aturan Penggunaan", isi="Isi Aturan..."),
#                 aboutContentModels.AboutContent(judul="Manfaat Website", isi="Isi Manfaat...")
#             ])
#             db.commit()
#     except Exception as e:
#         print(f"Error seeding: {e}")
#         db.rollback()
#     finally:
#         db.close()

# seed_database()

# # --- INISIALISASI APP (Matikan docs url default) ---
# app = FastAPI(
#     title="Tukar Buku API",
#     description="API untuk aplikasi platform tukar buku.",
#     version="0.1.0",
#     docs_url=None,    # Matikan URL default
#     redoc_url=None,   # Matikan URL default
#     openapi_url=None  # Matikan URL default
# )

# # --- KONFIGURASI CORS ---
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Mount Static
# os.makedirs("static", exist_ok=True)
# app.mount("/static", StaticFiles(directory="static"), name="static")

# # --- CUSTOM PROTECTED DOCS ENDPOINTS ---

# @app.get("/docs", include_in_schema=False)
# async def get_swagger_documentation(username: str = Depends(get_current_username_docs)):
#     return get_swagger_ui_html(openapi_url="/openapi.json", title="docs")

# @app.get("/redoc", include_in_schema=False)
# async def get_redoc_documentation(username: str = Depends(get_current_username_docs)):
#     return get_redoc_html(openapi_url="/openapi.json", title="redoc")

# @app.get("/openapi.json", include_in_schema=False)
# async def get_open_api_endpoint(username: str = Depends(get_current_username_docs)):
#     return get_openapi(title="Tukar Buku API", version="0.1.0", routes=app.routes)

# # --- DAFTARKAN ROUTER ---
# app.include_router(users.router)
# app.include_router(stores.router)
# app.include_router(categories.router)
# app.include_router(books.router)
# app.include_router(reports.router)
# app.include_router(reviews.router)
# app.include_router(wishlist.router)
# app.include_router(transactions.router)
# app.include_router(announcements.router)
# app.include_router(securityTips.router)
# app.include_router(about.router)
# app.include_router(moderations.router)

# @app.get("/", tags=["Root"])
# def read_root():
#     return {"message": "Selamat datang di Tukar Buku API!"}

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

from .MainUtama import database
from .Models import roleModels, aboutContentModels
from . import auth

# Import Router
from .EndPoint import (
    users, stores, categories, books, 
    reports, reviews, wishlist, transactions,
    announcements, securityTips, about, moderations
)

# Import Models
from .Models import (
    userModels, roleModels, storeModels, 
    categoryModels, bookModels, reportModels, 
    reviewModels, wishlistModels, transactionModels,
    announcementModels, securityTipModels, aboutContentModels, moderationModels
)

# --- 1. Database & Seeding (Sama seperti sebelumnya) ---
try:
    database.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    print(f"Error DB: {e}")

def seed_database():
    db: Session = database.SessionLocal()
    try:
        if db.query(roleModels.Role).count() == 0:
            db.add_all([roleModels.Role(name="Admin"), roleModels.Role(name="Seller"), roleModels.Role(name="User")])
            db.commit()
        if db.query(aboutContentModels.AboutContent).count() == 0:
            db.add_all([
                aboutContentModels.AboutContent(judul="Visi & Misi", isi="..."),
                aboutContentModels.AboutContent(judul="Aturan Penggunaan", isi="..."),
                aboutContentModels.AboutContent(judul="Manfaat Website", isi="...")
            ])
            db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

seed_database()

# --- 2. Inisialisasi App ---
app = FastAPI(
    title="Tukar Buku API (Secured)",
    description="API Tertutup. Login via Authorize button untuk akses.",
    version="1.0.0"
)

# --- 3. CORS ---
env_origins = os.getenv("ALLOWED_ORIGINS")
origins = [o.strip() for o in env_origins.split(",") if o.strip()] if env_origins else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


# =================================================================
#  SISTEM KEAMANAN TERPUSAT (GLOBAL LOCK)
# =================================================================

# A. ROUTER PUBLIK (Hanya Auth)
# Router ini TIDAK digembok agar user bisa Login & Register
app.include_router(users.router_auth) 


# B. ROUTER PRIVAT (Semua Fitur Lainnya)
# Variabel 'lock' ini akan memaksa user login untuk semua router di bawah
lock = [Depends(auth.get_current_active_user)]

# Masukkan 'users.router_users' (Profil, List User) ke sini agar ikut terkunci
app.include_router(users.router_users, dependencies=lock)

# Masukkan semua router fitur lainnya dengan dependencies=lock
app.include_router(stores.router, dependencies=lock)
app.include_router(categories.router, dependencies=lock)
app.include_router(books.router, dependencies=lock)
app.include_router(reports.router, dependencies=lock)
app.include_router(reviews.router, dependencies=lock)
app.include_router(wishlist.router, dependencies=lock)
app.include_router(transactions.router, dependencies=lock)
app.include_router(announcements.router, dependencies=lock)
app.include_router(securityTips.router, dependencies=lock)
app.include_router(about.router, dependencies=lock)
app.include_router(moderations.router, dependencies=lock)


# --- 4. Root Endpoint (Juga Digembok) ---
@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Tukar Buku API is running!",
        "status": "online"
    }