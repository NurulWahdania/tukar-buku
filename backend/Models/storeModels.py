from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from ..MainUtama.database import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    
    # Kolom dari RegisterStore.jsx
    nama_toko = Column(String(255), index=True, nullable=False)
    nama_pemilik_toko = Column(String(255))
    email_toko = Column(String(100), unique=True, index=True)
    hp_toko = Column(String(20))
    alamat_toko = Column(String(500))
    store_photo_url = Column(String(255), nullable=True)

    # --- Kunci Relasi (Foreign Key) ---
    # Menghubungkan toko ini ke pemiliknya di tabel 'users'
    owner_id = Column(Integer, ForeignKey("users.id"), unique=True) # unique=True -> satu user satu toko

    # --- Mendefinisikan Relasi ---
    
    # Relasi ke User: Satu Toko dimiliki oleh satu User
    owner = relationship("User", back_populates="store")
    
    # Relasi ke Book: Satu Toko memiliki banyak Buku
    books = relationship("Book", back_populates="store")