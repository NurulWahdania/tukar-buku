from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..MainUtama import database, schemas
from ..Models import aboutContentModels, userModels
from .. import auth

router = APIRouter(prefix="/about", tags=["About Content"])

# GET (Publik) - Untuk halaman guest 'About.jsx'
@router.get("/", response_model=List[schemas.AboutContent])
def get_all_about_content(db: Session = Depends(database.get_db)):
    return db.query(aboutContentModels.AboutContent).all()

# POST (Hanya Admin) - Untuk 'AboutManagement.jsx'
@router.post("/", response_model=schemas.AboutContent, status_code=status.HTTP_201_CREATED)
def create_about_content(
    content: schemas.AboutContentCreate,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_content = db.query(aboutContentModels.AboutContent).filter(aboutContentModels.AboutContent.judul == content.judul).first()
    if db_content:
        raise HTTPException(status_code=400, detail="Content with this title already exists")

    db_content = aboutContentModels.AboutContent(**content.model_dump())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

# PUT (Hanya Admin) - Mengedit berdasarkan ID
@router.put("/{item_id}", response_model=schemas.AboutContent)
def update_about_content(
    item_id: int,
    item: schemas.AboutContentCreate,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_item = db.query(aboutContentModels.AboutContent).filter(aboutContentModels.AboutContent.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.judul = item.judul
    db_item.isi = item.isi
    db.commit()
    db.refresh(db_item)
    return db_item

# DELETE (Hanya Admin)
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_about_content(
    item_id: int,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_item = db.query(aboutContentModels.AboutContent).filter(aboutContentModels.AboutContent.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()