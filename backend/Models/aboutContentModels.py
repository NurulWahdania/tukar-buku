from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..MainUtama.database import Base

class AboutContent(Base):
    __tablename__ = "about_content"

    id = Column(Integer, primary_key=True, index=True)
    # [UBAH] judul -> title, isi -> content
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    
    image_url = Column(String(255), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # --- RELASI KE USER (ADMIN) ---
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    author = relationship("User", back_populates="about_contents")