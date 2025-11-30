# app/Models/moderationModels.py
from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..MainUtama.database import Base

class Moderation(Base):
    __tablename__ = "moderations"

    id = Column(Integer, primary_key=True, index=True)
    
    aksi = Column(String(50), nullable=False) # Contoh: "APPROVE", "REJECT", "TAKEDOWN"
    catatan_admin = Column(Text, nullable=True)
    tanggal_aksi = Column(DateTime(timezone=True), server_default=func.now())

    # Foreign Keys
    admin_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("books.id"))

    # Relasi
    admin = relationship("User") # Admin yang melakukan aksi
    book = relationship("Book", back_populates="moderations")