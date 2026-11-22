
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UsuarioRead(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
