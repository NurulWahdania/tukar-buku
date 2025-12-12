from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

# Import 'Base' dari file database.py
from ..MainUtama.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # Kolom dari Register.jsx
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    nama_lengkap = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    
    # Kolom dari Profile.jsx
    profile_photo_url = Column(String(255), nullable=True)
    nomor_hp = Column(String(20), nullable=True)
    jurusan = Column(String(100), nullable=True) # Anda memiliki ini di Profile.jsx
    
    is_active = Column(Boolean, default=True)

    # --- Kunci Relasi (Foreign Key) ---
    role_id = Column(Integer, ForeignKey("roles.id"))

    # --- Mendefinisikan Relasi ---
    
    # Relasi ke Role: Banyak Pengguna (User) memiliki satu Peran (Role)
    role = relationship("Role", back_populates="users")
    
    # Relasi ke Store: Satu User bisa memiliki satu Store
    # 'uselist=False' berarti ini relasi one-to-one
    store = relationship("Store", back_populates="owner", uselist=False)
    
    # Relasi ke Review: Satu User bisa menulis banyak Review
    reviews = relationship("Review", back_populates="user")
    
    # Relasi ke Report (Pelapor): Satu User bisa membuat banyak Laporan
    reports_sent = relationship("Report", foreign_keys="[Report.pelapor_id]", back_populates="pelapor")
    
    # Relasi ke Report (Terlapor): Satu User bisa dilaporkan banyak kali
    reports_received = relationship("Report", foreign_keys="[Report.terlapor_id]", back_populates="terlapor")
    
    # Relasi ke Wishlist: Satu User punya banyak Wishlist item
    wishlist_items = relationship("Wishlist", back_populates="user")
    
    # Relasi ke Transaction: Satu User bisa punya banyak Transaksi
    transactions = relationship("Transaction", back_populates="user")

        # --- RELASI BARU (FITUR ADMIN) ---
    # Menghubungkan User (Admin) ke konten yang mereka buat
    announcements = relationship("Announcement", back_populates="author")
    about_contents = relationship("AboutContent", back_populates="author")
    security_tips = relationship("SecurityTip", back_populates="author")