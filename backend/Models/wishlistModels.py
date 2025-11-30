from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from ..MainUtama.database import Base

class Wishlist(Base):
    __tablename__ = "wishlist_items"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Kunci Relasi (Foreign Key)
    user_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("books.id"))
    
    # Relasi
    user = relationship("User", back_populates="wishlist_items")
    book = relationship("Book", back_populates="wishlist_items")
    
    # Pastikan user tidak bisa wishlist buku yang sama 2x
    __table_args__ = (UniqueConstraint('user_id', 'book_id', name='_user_book_uc'),)