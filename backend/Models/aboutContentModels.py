from sqlalchemy import Column, Integer, String, Text
from ..MainUtama.database import Base

class AboutContent(Base):
    __tablename__ = "about_content"

    id = Column(Integer, primary_key=True, index=True)
    # Judul akan jadi 'Visi & Misi', 'Aturan Penggunaan', 'Manfaat Website'
    judul = Column(String(255), unique=True, nullable=False) 
    isi = Column(Text, nullable=True)