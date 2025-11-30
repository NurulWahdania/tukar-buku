from sqlalchemy import Column, Integer, String, Text
from ..MainUtama.database import Base

class SecurityTip(Base):
    __tablename__ = "security_tips"

    id = Column(Integer, primary_key=True, index=True)
    judul = Column(String(255), nullable=False)
    isi = Column(Text, nullable=True)