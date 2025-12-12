from sqlalchemy import Column, ForeignKey, Integer, Float, Enum, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from ..MainUtama.database import Base
import enum

# Definisi Enum untuk Status Transaksi
class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    SHIPPING = "shipping"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    WAITING = "waiting" 

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    # Tambahkan native_enum=False agar kompatibel dengan berbagai DB dan mencegah error 500 saat insert string
    status = Column(Enum(TransactionStatus, native_enum=False), default=TransactionStatus.WAITING)
    total_price = Column(Float, nullable=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # --- Kunci Relasi (Foreign Key) ---
    # Nama kolom di DB: buyer_id (agar jelas ini pembeli)
    # TAPI di userModels.py tidak masalah, yang penting relasinya
    buyer_id = Column(Integer, ForeignKey("users.id")) 
    book_id = Column(Integer, ForeignKey("books.id"))
    
    # --- Relasi ---
    # PENTING: Nama variabel ini HARUS 'user' 
    # karena di userModels.py tertulis: back_populates="user"
    user = relationship("User", back_populates="transactions")
    
    # Relasi ke Buku
    book = relationship("Book", back_populates="transactions")