from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

from .MainUtama import database
from .Models import roleModels 
from . import auth

from .EndPoint import (
    users, stores, categories, books, 
    reports, reviews, wishlist, transactions,
    announcements, securityTips, about, moderations
)

from .Models import (
    userModels, roleModels, storeModels, 
    categoryModels, bookModels, reportModels, 
    reviewModels, wishlistModels, transactionModels,
    announcementModels, securityTipModels, aboutContentModels, moderationModels
)
# --- Pembuatan Tabel ---
try:
    database.Base.metadata.create_all(bind=database.engine)
    print("Database tables created successfully (if they didn't exist).")
except Exception as e:
    print(f"Error creating database tables: {e}")

def seed_database():
    db: Session = database.SessionLocal()
    try:
        # 1. Seed Roles
        if db.query(roleModels.Role).count() == 0:
            print("Roles table is empty. Seeding initial data...")
            db.add_all([
                roleModels.Role(name="Admin"),
                roleModels.Role(name="Seller"),
                roleModels.Role(name="User")
            ])
            db.commit()
            print("Roles seeded successfully.")
        else:
            print("Roles table already has data. Seeding skipped.")
            
        # 2. Opsional: Seed About Content (karena frontend menampilkannya)
        if db.query(aboutContentModels.AboutContent).count() == 0:
            print("AboutContent table is empty. Seeding initial data...")
            db.add_all([
                aboutContentModels.AboutContent(judul="Visi & Misi", isi="Isi Visi & Misi Anda di sini..."),
                aboutContentModels.AboutContent(judul="Aturan Penggunaan", isi="Isi Aturan Penggunaan Anda di sini..."),
                aboutContentModels.AboutContent(judul="Manfaat Website", isi="Isi Manfaat Website Anda di sini...")
            ])
            db.commit()
            print("AboutContent seeded successfully.")

    except Exception as e:
        print(f"Error during database seeding: {e}")
        db.rollback()
    finally:
        db.close()

seed_database()

app = FastAPI(
    title="Tukar Buku API",
    description="API untuk aplikasi platform tukar buku.",
    version="0.1.0"
)

# --- Konfigurasi CORS ---
# Allow origins from env or fallback to wildcard for local development.
# In production, set ALLOWED_ORIGINS env to comma-separated trusted origins.
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    origins = [o.strip() for o in env_origins.split(",") if o.strip()]
else:
    origins = ["*"]  # development fallback; change to specific origins for production

print(f"[CORS] allow_origins = {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(users.router)
app.include_router(stores.router)
app.include_router(categories.router)
app.include_router(books.router)
app.include_router(reports.router)
app.include_router(reviews.router)
app.include_router(wishlist.router)
app.include_router(transactions.router)
app.include_router(announcements.router)
app.include_router(securityTips.router)
app.include_router(about.router)
app.include_router(moderations.router)  # Router Moderasi didaftarkan di sini

@app.get("/", tags=["Root"])
def read_root():
    """Endpoint root untuk memverifikasi server berjalan."""
    return {"message": "Selamat datang di Tukar Buku API!"}