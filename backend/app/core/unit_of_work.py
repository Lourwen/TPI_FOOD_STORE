
from app.core.database import session_factory


class UnitOfWork:

    def __init__(self):
        self.session = None

    def __enter__(self):
        self.session = session_factory()
        return self

    def commit(self):
        self.session.commit()

    def rollback(self):
        self.session.rollback()

    def __exit__(self, exc_type, exc_value, traceback):
        try:
            if exc_type:
                self.rollback()
            else:
                self.commit()
        except Exception:
            self.rollback()
            raise
        finally:
            self.session.close()

        return False


