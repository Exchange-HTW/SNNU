from sqlalchemy import Column, Integer, String, Text
from database import Base

class School(Base):
    __tablename__ = "schools"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    base_info = Column(Text, comment="JSON string or raw text with full info about the university")

class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, index=True, unique=True)
    name = Column(String)

class Audience(Base):
    __tablename__ = "audiences"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True)
    description = Column(Text)
