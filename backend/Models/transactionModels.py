from sqlalchemy import Column, ForeignKey, Integer, String, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from ..MainUtama.database import Base
import enum

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    SHIPPING = "shipping"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    total_price = Column(Float, nullable=True) # Harga saat transaksi (jika bukan barter)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Kunci Relasi (Foreign Key)
    user_id = Column(Integer, ForeignKey("users.id")) # Pembeli
    book_id = Column(Integer, ForeignKey("books.id")) # Buku yang dibeli
    
    # Relasi
    user = relationship("User", back_populates="transactions")
    book = relationship("Book", back_populates="transactions")