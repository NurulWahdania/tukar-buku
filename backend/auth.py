import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session, joinedload

# Import dari file-file yang sudah kita buat
from .MainUtama import database, schemas, utils
from .Models import userModels

# --- Konfigurasi JWT ---
SECRET_KEY = os.environ.get("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 hari

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# --- Fungsi Inti Auth (Tidak Berubah) ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Membuat token JWT baru."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def authenticate_user(db: Session, username: str, password: str):
    """
    Memeriksa apakah username dan password valid.
    """
    user = db.query(userModels.User).filter(userModels.User.username == username).first()
    if not user:
        return False
    
    if not utils.verify_password(password, user.hashed_password):
        return False
        
    return user


# --- Fungsi Dependency untuk Melindungi Endpoint ---

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """
    Mengambil user dari token. 
    Relasi 'role' dan 'store' dimuat.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        
        if username is None or user_id is None:
            raise credentials_exception
    
    except JWTError:
        raise credentials_exception
    
    # Gunakan joinedload untuk relasi 'role' dan 'store'
    user = db.query(userModels.User).options(
        joinedload(userModels.User.role),
        joinedload(userModels.User.store)
    ).filter(userModels.User.id == user_id).first()
    
    if user is None:
        raise credentials_exception
        
    return user


async def get_current_active_user(current_user: userModels.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# --- Dependency untuk Hak Akses (Role) ---

def get_current_admin_user(current_user: userModels.User = Depends(get_current_active_user)):
    # Melakukan pengecekan defensif untuk menghindari AttributeError
    if current_user.role is None or current_user.role.name.lower() != "admin": 
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="The user does not have admin privileges"
        )
    return current_user

def get_current_seller_user(current_user: userModels.User = Depends(get_current_active_user)):
    # Melakukan pengecekan defensif untuk menghindari AttributeError
    if current_user.role is None or current_user.role.name.lower() not in ["seller", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="The user does not have seller privileges"
        )
    return current_user
