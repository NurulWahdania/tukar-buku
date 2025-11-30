from sqlalchemy import Column, ForeignKey, Integer, String, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from ..MainUtama.database import Base
import enum

class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    deskripsi = Column(Text, nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Kunci Relasi (Foreign Key)
    pelapor_id = Column(Integer, ForeignKey("users.id"))
    terlapor_id = Column(Integer, ForeignKey("users.id"))
    
    # Relasi
    pelapor = relationship("User", foreign_keys=[pelapor_id], back_populates="reports_sent")
    terlapor = relationship("User", foreign_keys=[terlapor_id], back_populates="reports_received")