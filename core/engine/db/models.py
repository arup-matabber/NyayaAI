from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="lawyer") # lawyer, admin, intern
    created_at = Column(DateTime, default=datetime.utcnow)
    
    cases = relationship("Case", back_populates="owner")

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    status = Column(String, default="Active") # Active, Completed, Closed
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="cases")
    documents = relationship("Document", back_populates="case")
    logs = relationship("CaseLog", back_populates="case")
    pdfs = relationship("PDFArtifact", back_populates="case")

class Template(Base):
    __tablename__ = "templates"
    id = Column(Integer, primary_key=True, index=True)
    court_type = Column(String, index=True)
    document_type = Column(String, index=True)
    latex_content = Column(Text)
    version_number = Column(Integer, default=1)
    is_active = Column(Integer, default=1) # 1 for True, 0 for False

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    type = Column(String) # Motion, Petition, Draft, etc.
    content_draft = Column(Text)
    final_latex = Column(Text, nullable=True)
    status = Column(String, default="Draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    case = relationship("Case", back_populates="documents")
    template = relationship("Template")
    metadata_entries = relationship("DocumentMetadata", back_populates="document")

class DocumentMetadata(Base):
    __tablename__ = "document_metadata"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    metadata_key = Column(String) # parties, court, citations
    metadata_value = Column(Text)
    
    document = relationship("Document", back_populates="metadata_entries")

class CaseLog(Base):
    __tablename__ = "case_logs"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    interaction_log = Column(Text)
    embedding_vector = Column(Text, nullable=True) # Could be actual vectors later or JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    
    case = relationship("Case", back_populates="logs")

class PDFArtifact(Base):
    __tablename__ = "pdf_artifacts"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    file_path = Column(String)
    ocr_confidence_score = Column(Float, nullable=True)
    parsed_text = Column(Text, nullable=True)
    
    case = relationship("Case", back_populates="pdfs")
