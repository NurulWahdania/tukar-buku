from sqlalchemy import Column, ForeignKey, Integer, String, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from ..MainUtama.database import Base

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Kunci Relasi (Foreign Key)
    user_id = Column(Integer, ForeignKey("users.id")) # Penulis review
    book_id = Column(Integer, ForeignKey("books.id")) # Buku yang di-review
    
    # Relasi
    user = relationship("User", back_populates="reviews")
    book = relationship("Book", back_populates="reviews")