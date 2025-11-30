from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import semua file yang kita butuhkan
from ..MainUtama import database, schemas
from ..Models import storeModels, userModels, roleModels # FIX: Tambahkan import roleModels
from .. import auth

router = APIRouter(
    prefix="/stores",
    tags=["Stores"]
)

# --- Endpoint 1: Mendaftarkan Toko Baru (Langsung Aktif) ---
@router.post("/", response_model=schemas.Store, status_code=status.HTTP_201_CREATED)
def create_store_for_current_user(
    store: schemas.StoreCreate, 
    db: Session = Depends(database.get_db), 
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    # 1. Cek apakah user sudah punya toko
    existing_store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == current_user.id).first()
    if existing_store:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a store registered"
        )
    
    # 2. Cek nama toko unik
    if db.query(storeModels.Store).filter(storeModels.Store.nama_toko == store.nama_toko).first():
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nama toko sudah digunakan"
        )

    # 3. Buat Toko
    # PERBAIKAN: Kita menghapus 'is_active=True' karena kolom itu tidak ada di database
    db_store = storeModels.Store(
        **store.model_dump(),
        owner_id=current_user.id
    )
    db.add(db_store)
    
    # 4. UPDATE ROLE USER JADI SELLER
    # Ini penting agar mereka langsung bisa akses menu Seller
    # FIX: Cari role berdasarkan nama, jangan hardcode ID (misal: ID 2 belum tentu seller)
    seller_role = db.query(roleModels.Role).filter(roleModels.Role.name == "seller").first()
    
    if seller_role and current_user.role.name.lower() == "user":
        current_user.role_id = seller_role.id
        db.add(current_user)      # Simpan perubahan user

    db.commit()
    db.refresh(db_store)
    
    return db_store

# --- Endpoint 2: Get Toko Saya ---
@router.get("/my-store", response_model=schemas.Store)
def get_my_store(
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == current_user.id).first()
    if not store:
        raise HTTPException(status_code=404, detail="User does not have a store")
    return store

# --- Endpoint 3: Get Toko by ID (Public) ---
@router.get("/{store_id}", response_model=schemas.Store)
def get_store_by_id(store_id: int, db: Session = Depends(database.get_db)):
    store = db.query(storeModels.Store).filter(storeModels.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store

# --- Endpoint 4: Update Toko ---
@router.put("/my-store", response_model=schemas.Store)
def update_my_store(
    store_update: schemas.StoreUpdate,
    db: Session = Depends(database.get_db),
    current_user: userModels.User = Depends(auth.get_current_active_user)
):
    db_store = db.query(storeModels.Store).filter(storeModels.Store.owner_id == current_user.id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    update_data = store_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_store, key, value)
        
    db.commit()
    db.refresh(db_store)
    return db_store

# --- Endpoint 5: Get All Stores ---
@router.get("/", response_model=List[schemas.Store])
def get_all_stores(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(storeModels.Store).offset(skip).limit(limit).all()