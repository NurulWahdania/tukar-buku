from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..MainUtama.database import Base

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    # [UBAH] judul -> title, isi -> content
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # --- RELASI KE USER (ADMIN) ---
    # ondelete="SET NULL": Jika Admin dihapus, pengumuman tetap ada tapi penulisnya jadi Null
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Relasi balik agar bisa akses data user dari object announcement
    author = relationship("User", back_populates="announcements")