from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

# Import 'Base' dari file database.py kita
from ..MainUtama.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False) # Misal: "Admin", "Seller", "User"

    # Mendefinisikan relasi: Satu Peran (Role) bisa dimiliki oleh banyak Pengguna (User)
    users = relationship("User", back_populates="role")