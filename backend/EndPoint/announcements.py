from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..MainUtama import database, schemas
from ..Models import announcementModels, userModels
from .. import auth

router = APIRouter(prefix="/announcements", tags=["Announcements"])

# GET (Publik) - Untuk halaman user 'Announcement.jsx'
@router.get("/", response_model=List[schemas.Announcement])
def get_all_announcements(db: Session = Depends(database.get_db)):
    return db.query(announcementModels.Announcement).all()

# POST (Hanya Admin) - Untuk 'AnnouncementManagement.jsx'
@router.post("/", response_model=schemas.Announcement, status_code=status.HTTP_201_CREATED)
def create_announcement(
    announcement: schemas.AnnouncementCreate,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_announcement = announcementModels.Announcement(**announcement.model_dump())
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    return db_announcement

# PUT (Hanya Admin)
@router.put("/{item_id}", response_model=schemas.Announcement)
def update_announcement(
    item_id: int,
    item: schemas.AnnouncementCreate,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_item = db.query(announcementModels.Announcement).filter(announcementModels.Announcement.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.judul = item.judul
    db_item.isi = item.isi
    db.commit()
    db.refresh(db_item)
    return db_item

# DELETE (Hanya Admin)
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    item_id: int,
    db: Session = Depends(database.get_db),
    admin_user: userModels.User = Depends(auth.get_current_admin_user)
):
    db_item = db.query(announcementModels.Announcement).filter(announcementModels.Announcement.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()