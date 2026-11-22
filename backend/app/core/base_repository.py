
from typing import Generic, TypeVar

from sqlmodel import SQLModel, Session, select


ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):

    def __init__(self, model: type[ModelType], session: Session):
        self.model = model
        self.session = session

    def get_by_id(self, entity_id: int):
        return self.session.get(self.model, entity_id)

    def get_all(self):
        statement = select(self.model)
        return self.session.exec(statement).all()

    def add(self, entity: ModelType):
        self.session.add(entity)
        self.session.flush()
        return entity

    def delete(self, entity: ModelType):
        self.session.delete(entity)
        self.session.flush()
