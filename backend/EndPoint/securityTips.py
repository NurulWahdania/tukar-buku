from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..MainUtama import database, schemas
from ..Models import securityTipModels, userModels
from .. import auth

router = APIRouter(prefix="/security-tips", tags=["Security Tips"])

# GET (Publik) - Untuk halaman user 'SecurityTips.jsx'
@router.get("/", response_model=List[schemas.SecurityTip])
def get_all_security_tips(db: Session = Depends(database.get_db)):
    return db.query(securityTipModels.SecurityTip).all()

# POST (Hanya Admin) - Untuk 'SecurityTipsManagement.jsx'
@router.post("/", response_model=schemas.SecurityTip, status_code=status.HTTP_201_CREATED)
def create_security_tip(
    tip: schemas.SecurityTipCreate,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_tip = securityTipModels.SecurityTip(**tip.model_dump())
    db.add(db_tip)
    db.commit()
    db.refresh(db_tip)
    return db_tip

# PUT (Hanya Admin)
@router.put("/{item_id}", response_model=schemas.SecurityTip)
def update_security_tip(
    item_id: int,
    item: schemas.SecurityTipCreate,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_item = db.query(securityTipModels.SecurityTip).filter(securityTipModels.SecurityTip.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.judul = item.judul
    db_item.isi = item.isi
    db.commit()
    db.refresh(db_item)
    return db_item

# DELETE (Hanya Admin)
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_security_tip(
    item_id: int,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_item = db.query(securityTipModels.SecurityTip).filter(securityTipModels.SecurityTip.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()