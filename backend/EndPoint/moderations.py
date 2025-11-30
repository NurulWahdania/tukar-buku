# app/EndPoint/moderations.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..MainUtama import database, schemas
from ..Models import moderationModels, bookModels, userModels
from .. import auth

router = APIRouter(prefix="/moderations", tags=["Moderations"])

# POST: Admin melakukan aksi moderasi (Approve/Reject)
@router.post("/", response_model=schemas.Moderation, status_code=status.HTTP_201_CREATED)
def create_moderation_log(
    mod: schemas.ModerationCreate,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    # 1. Cek Buku
    book = db.query(bookModels.Book).filter(bookModels.Book.id == mod.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # 2. Simpan Log Moderasi
    new_mod = moderationModels.Moderation(
        aksi=mod.aksi,
        catatan_admin=mod.catatan_admin,
        book_id=mod.book_id,
        admin_id=admin_user.id
    )
    db.add(new_mod)
    
    # 3. Update Status Buku Otomatis
    if mod.aksi.upper() == "APPROVED":
        book.status_verifikasi = bookModels.VerificationStatus.APPROVED
    elif mod.aksi.upper() == "REJECTED":
        book.status_verifikasi = bookModels.VerificationStatus.REJECTED
        
    db.commit()
    db.refresh(new_mod)
    db.refresh(book)
    
    return new_mod

# GET: Lihat riwayat moderasi suatu buku (Khusus Admin)
@router.get("/book/{book_id}", response_model=List[schemas.Moderation])
def get_moderation_history(
    book_id: int,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    return db.query(moderationModels.Moderation).filter(moderationModels.Moderation.book_id == book_id).all()