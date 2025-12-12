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

# --- 1. Database & Seeding ---
try:
    database.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    print(f"Error creating database tables: {e}")

def seed_database():
    db: Session = database.SessionLocal()
    try:
        if db.query(roleModels.Role).count() == 0:
            db.add_all([
                roleModels.Role(name="Admin"),
                roleModels.Role(name="Seller"),
                roleModels.Role(name="User")
            ])
            db.commit()
        
        if db.query(aboutContentModels.AboutContent).count() == 0:
            db.add_all([
                aboutContentModels.AboutContent(title="Visi & Misi", content="..."),
                aboutContentModels.AboutContent(title="Aturan Penggunaan", content="..."),
                aboutContentModels.AboutContent(title="Manfaat Website", content="...")
            ])
            db.commit()
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

seed_database()

# --- 2. Inisialisasi App ---
app = FastAPI(
    title="Tukar Buku API",
    description="API Platform Tukar Buku.",
    version="1.0.0"
)

# --- 3. CORS ---
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    origins = [o.strip() for o in env_origins.split(",") if o.strip()]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


# =================================================================
#  KONFIGURASI ROUTER (PUBLIC VS PRIVATE)
# =================================================================

# -----------------------------------------------------------
# GROUP A: ROUTER PUBLIK (BISA DIAKSES TANPA LOGIN)
# -----------------------------------------------------------
# Router ini berisi endpoint "GET" (Baca) yang aman untuk publik.
# Endpoint "POST/PUT/DELETE" (Tulis) di dalamnya SUDAH DIPROTEKSI 
# oleh 'Depends' di file masing-masing (misal: admin_user / seller_user).

app.include_router(users.router_auth)     # Login & Register
app.include_router(categories.router)     # List Kategori (Create/Delete butuh Admin)
app.include_router(announcements.router)  # List Pengumuman (Create/Delete butuh Admin)
app.include_router(securityTips.router)   # List Tips (Create/Delete butuh Admin)
app.include_router(about.router)          # List About (Create/Delete butuh Admin)
app.include_router(books.router)          # List Buku & Detail (Upload/Edit butuh Seller)
app.include_router(stores.router)         # List Toko & Detail (Register butuh Auth)
app.include_router(reviews.router)        # List Review (Create butuh Auth)


# -----------------------------------------------------------
# GROUP B: ROUTER PRIVAT (WAJIB LOGIN - GLOBAL LOCK)
# -----------------------------------------------------------
# Router ini berisi fitur yang 100% membutuhkan user login.
# Kita pasang gembok global (dependencies) di sini.

lock = [Depends(auth.get_current_active_user)]

app.include_router(users.router_users, dependencies=lock) # Profil User
app.include_router(wishlist.router, dependencies=lock)    # Wishlist Saya
app.include_router(transactions.router, dependencies=lock)# Transaksi Saya
app.include_router(reports.router, dependencies=lock)     # Buat Laporan
app.include_router(moderations.router, dependencies=lock) # Moderasi (Admin)


# --- 4. Root Endpoint (Publik untuk Cek Status) ---
@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Tukar Buku API is running!",
        "status": "online"
    }