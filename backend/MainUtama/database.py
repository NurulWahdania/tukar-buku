from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# --- ISI DETAIL DATABASE ANDA DI SINI ---
# Pastikan ini adalah kredensial yang BENAR
DB_USER = "root"
DB_PASSWORD = ""  # Ganti dengan password MySQL Anda
DB_HOST = "localhost"
DB_NAME = "tukar_buku_db"
# ----------------------------------------

# --- 1. OTOMATIS BUAT DATABASE JIKA BELUM ADA ---
# Buat koneksi ke server MySQL (tanpa menentukan database)
server_connection_string = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}"

try:
    # Buat engine sementara hanya untuk membuat database
    temp_engine = create_engine(server_connection_string)
    
    with temp_engine.connect() as conn:
        # 'CREATE DATABASE' tidak bisa dijalankan dalam blok transaksi,
        # jadi kita set isolasi level ke "AUTOCOMMIT"
        conn.execution_options(isolation_level="AUTOCOMMIT")
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}"))
    
    print(f"Database '{DB_NAME}' checked/created successfully.")
    temp_engine.dispose() # Tutup engine sementara

except Exception as e:
    print(f"CRITICAL ERROR: Could not connect to MySQL server or create database: {e}")
    # Jika ini gagal (misal: password salah), sisa kode akan gagal,
    # yang mana tidak apa-apa karena koneksi memang bermasalah.
# ----------------------------------------------------


# --- 2. BUAT KONEKSI UTAMA & SESSION ---
# Sekarang kita bisa dengan aman terhubung ke DB_NAME karena kita tahu itu ada
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"


# Membuat 'engine' SQLAlchemy utama
# 'engine' inilah yang terhubung ke database
engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

# Membuat 'SessionLocal' class
# Ini akan menjadi sesi database yang kita gunakan di setiap request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Membuat 'Base' class
# Semua model (tabel) kita akan mewarisi dari class ini
Base = declarative_base()


# Fungsi dependency untuk mendapatkan sesi database di setiap endpoint
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()