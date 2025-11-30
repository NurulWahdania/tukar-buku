# app/Models/categoryModels.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..MainUtama.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True) # Tambahan sesuai ERD

    # Relasi Many-to-Many ke Buku
    # Kita gunakan string "book_category_details" agar SQLAlchemy mencari tabel yg dibuat di bookModels tadi
    books = relationship("Book", secondary="book_category_details", back_populates="categories")