from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

# Import semua file yang telah kita buat
from ..MainUtama import database, schemas, utils
from ..Models import userModels, roleModels
from .. import auth

# Membuat router baru. 'tags' akan mengelompokkan endpoint di dokumentasi API
router = APIRouter(
    tags=["Authentication & Users"]
)

# --- Endpoint 1: Registrasi User Baru ---
@router.post("/register", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # ensure role_id defaults to User (id=3) if not provided by client
    try:
        incoming_role = getattr(user, "role_id", None)
    except Exception:
        incoming_role = None
    if incoming_role is None:
        user.role_id = 3

    # 1. Cek apakah username sudah ada
    db_user = db.query(userModels.User).filter(userModels.User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
        
    # 2. Cek apakah email sudah ada
    db_email = db.query(userModels.User).filter(userModels.User.email == user.email).first()
    if db_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 3. Tetapkan peran (role) default sebagai "User"
    user_role = db.query(roleModels.Role).filter(roleModels.Role.name == "User").first()
    if not user_role:
        # Fallback jika tabel role belum di-seed dengan benar, ambil ID 3
        role_id = 3 
    else:
        role_id = user_role.id

    # 4. Buat hash untuk password
    hashed_password = utils.get_password_hash(user.password)
    
    # 5. Buat objek User baru
    db_user = userModels.User(
        username=user.username,
        email=user.email,
        nama_lengkap=user.nama_lengkap,
        hashed_password=hashed_password,
        role_id=role_id
    )
    
    # 6. Simpan ke database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


# --- Endpoint 2: Login dan Dapatkan Token ---
@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(database.get_db)
):
    # 1. Autentikasi user
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2. Buat token JWT
    access_token = auth.create_access_token(
        data={"sub": user.username, "id": user.id}
    )
    
    # 3. Kembalikan token
    return {"access_token": access_token, "token_type": "bearer"}


# --- Endpoint 3: Ambil Profil Sendiri ('/users/me') ---
@router.get("/users/me", response_model=schemas.User)
def read_users_me(
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    return current_user


# --- Endpoint 4: Update Profil Sendiri (PERBAIKAN ALAMAT URL) ---
@router.put("/users/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    # Update field satu per satu jika ada data yang dikirim
    if user_update.nama_lengkap is not None:
        current_user.nama_lengkap = user_update.nama_lengkap
    
    if user_update.email is not None:
        # Cek apakah email sudah dipakai user LAIN
        existing_email = db.query(userModels.User).filter(userModels.User.email == user_update.email).first()
        if existing_email and existing_email.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already registered by another user")
        current_user.email = user_update.email
        
    if user_update.nomor_hp is not None:
        current_user.nomor_hp = user_update.nomor_hp
        
    if user_update.jurusan is not None:
        current_user.jurusan = user_update.jurusan
        
    if user_update.profile_photo_url is not None:
        current_user.profile_photo_url = user_update.profile_photo_url
        
    db.commit()
    db.refresh(current_user)
    return current_user


# --- Endpoint 5: Mendapatkan Semua User (Khusus Admin) ---
# Digunakan di halaman UserManagement.jsx
@router.get("/users", response_model=List[schemas.User])
def get_all_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    return db.query(userModels.User).offset(skip).limit(limit).all()