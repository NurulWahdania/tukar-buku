from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..MainUtama.database import Base

class SecurityTip(Base):
    __tablename__ = "security_tips"

    id = Column(Integer, primary_key=True, index=True)
    # [UBAH] judul -> title, isi -> content
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    
    icon_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # --- RELASI KE USER (ADMIN) ---
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    author = relationship("User", back_populates="security_tips")