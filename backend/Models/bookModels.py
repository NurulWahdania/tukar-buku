# app/Models/bookModels.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, Float, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from ..MainUtama.database import Base
import enum

# --- Association Table (Many-to-Many) ---
# Tabel ini tidak butuh file model sendiri, cukup didefinisikan di sini
book_category_association = Table(
    'book_category_details', Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id')),
    Column('category_id', Integer, ForeignKey('categories.id'))
)

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    
    title = Column(String(255), index=True, nullable=False)
    author = Column(String(255), index=True)
    condition = Column(String(100))
    price = Column(Float, nullable=True)
    is_barter = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    
    is_sold = Column(Boolean, default=False)
    status_verifikasi = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Foreign Key ke Toko (tetap One-to-Many)
    store_id = Column(Integer, ForeignKey("stores.id"))
    
    # --- RELASI ---
    store = relationship("Store", back_populates="books")
    
    # Relasi Many-to-Many ke Kategori
    categories = relationship("Category", secondary=book_category_association, back_populates="books")
    
    reviews = relationship("Review", back_populates="book", cascade="all, delete-orphan")
    wishlist_items = relationship("Wishlist", back_populates="book", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="book", cascade="all, delete-orphan")
    
    # Relasi ke Moderasi (Baru)
    moderations = relationship("Moderation", back_populates="book", cascade="all, delete-orphan")