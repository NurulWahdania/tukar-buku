from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Impor Enum status dari model Anda
from ..Models.bookModels import VerificationStatus
from ..Models.reportModels import ReportStatus
from ..Models.transactionModels import TransactionStatus

# ==================
# Skema untuk Role
# ==================

class RoleBase(BaseModel):
    name: str

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    class Config:
        from_attributes = True

# ==================
# Skema untuk Category
# ==================

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# ==================
# Skema untuk Store
# ==================

class StoreBase(BaseModel):
    nama_toko: str
    nama_pemilik_toko: Optional[str] = None
    email_toko: Optional[EmailStr] = None
    hp_toko: Optional[str] = None
    alamat_toko: Optional[str] = None
    store_photo_url: Optional[str] = None

class StoreCreate(StoreBase):
    pass 

class StoreUpdate(StoreBase):
    pass

class Store(StoreBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True

# ==================
# Skema untuk Book (UPDATED MANY-TO-MANY)
# ==================

class BookBase(BaseModel):
    title: str
    author: Optional[str] = None
    condition: Optional[str] = None
    price: Optional[float] = None
    is_barter: Optional[bool] = False
    description: Optional[str] = None
    image_url: Optional[str] = None
    # category_id dihapus dari Base karena sekarang menggunakan List di Create/Read

# 'Create' model: Data untuk mengunggah buku baru
class BookCreate(BookBase):
    # Menggunakan List[int] karena satu buku bisa punya banyak kategori
    category_ids: List[int] = []

# 'Update' model: Data untuk memperbarui buku
class BookUpdate(BookBase):
    category_ids: Optional[List[int]] = None

# 'Book' model (read): Data buku lengkap yang dikirim ke frontend
class Book(BookBase):
    id: int
    store_id: int
    is_sold: bool
    status_verifikasi: VerificationStatus
    created_at: datetime
    
    # Relasi
    store: Store
    # Mengembalikan daftar kategori (List)
    categories: List[Category] = []

    class Config:
        from_attributes = True

# ==================
# Skema untuk Moderasi (BARU)
# ==================

class ModerationBase(BaseModel):
    aksi: str # "APPROVE", "REJECT", dll
    catatan_admin: Optional[str] = None
    book_id: int

class ModerationCreate(ModerationBase):
    pass

class Moderation(ModerationBase):
    id: int
    admin_id: int
    tanggal_aksi: datetime

    class Config:
        from_attributes = True

# ==================
# Skema untuk User
# ==================

class UserBase(BaseModel):
    username: str
    email: EmailStr
    nama_lengkap: Optional[str] = None
    profile_photo_url: Optional[str] = None
    nomor_hp: Optional[str] = None
    jurusan: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role_id: int

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nama_lengkap: Optional[str] = None
    profile_photo_url: Optional[str] = None
    nomor_hp: Optional[str] = None
    jurusan: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    role: Role
    store: Optional[Store] = None

    class Config:
        from_attributes = True

# ==================
# Skema untuk Token
# ==================

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None

# ==================
# Skema untuk Report
# ==================

class ReportBase(BaseModel):
    terlapor_id: int
    deskripsi: str

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: int
    pelapor_id: int
    status: ReportStatus
    created_at: datetime

    class Config:
        from_attributes = True

# ==================
# Skema untuk Review
# ==================

class ReviewBase(BaseModel):
    book_id: int
    rating: float
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int
    user_id: int
    created_at: datetime
    
    # Tambahkan ini agar frontend bisa baca nama user dan judul buku
    user: Optional[UserBase] = None 
    book: Optional[BookBase] = None

    class Config:
        from_attributes = True

# ==================
# Skema untuk Wishlist
# ==================

class WishlistBase(BaseModel):
    book_id: int

class WishlistCreate(WishlistBase):
    pass

class Wishlist(WishlistBase):
    id: int
    user_id: int
    book: Book

    class Config:
        from_attributes = True

# ==================
# Skema untuk Transaction
# ==================

class TransactionBase(BaseModel):
    book_id: int
    total_price: Optional[float] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    user_id: int
    status: TransactionStatus
    created_at: datetime
    book: Book

    class Config:
        from_attributes = True

# ==================
# Skema Lainnya
# ==================

# --- Announcement Schemas (UPDATED) ---
class AnnouncementBase(BaseModel):
    title: str
    content: str
    is_active: Optional[int] = 1

class AnnouncementCreate(AnnouncementBase):
    pass

class Announcement(AnnouncementBase):
    id: int
    created_at: datetime
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True

# --- AboutContent Schemas (UPDATED) ---
class AboutContentBase(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None

class AboutContentCreate(AboutContentBase):
    pass

class AboutContent(AboutContentBase):
    id: int
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True

# --- SecurityTip Schemas (UPDATED) ---
class SecurityTipBase(BaseModel):
    title: str
    content: str
    icon_name: Optional[str] = None

class SecurityTipCreate(SecurityTipBase):
    pass

class SecurityTip(SecurityTipBase):
    id: int
    created_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True