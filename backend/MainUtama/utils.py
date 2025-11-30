from passlib.context import CryptContext

# Use pbkdf2_sha256 to avoid bcrypt native dependency issues during development.
# pbkdf2_sha256 supports arbitrary length passwords (no 72-byte truncation).
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """
    Hash password using passlib pbkdf2_sha256.
    """
    if password is None:
        raise ValueError("Password must be provided")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain password against hashed password.
    """
    if plain_password is None or hashed_password is None:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False