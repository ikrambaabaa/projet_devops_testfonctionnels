from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    TIMESTAMP
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


# =========================
# PROJECT
# =========================

class Project(Base):

    __tablename__ = "project"

    id = Column(Integer, primary_key=True)

    name = Column(String(255))

    description = Column(Text)

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    sfd_documents = relationship(
        "SFDDocument",
        back_populates="project"
    )


# =========================
# SFD DOCUMENT
# =========================
class SFDDocument(Base):

    __tablename__ = "sfd_document"

    id = Column(Integer, primary_key=True)

    project_id = Column(
        Integer,
        ForeignKey("project.id")
    )

    parent_id = Column(
        Integer,
        ForeignKey("sfd_document.id"),
        nullable=True
    )

    title = Column(String(255))

    content = Column(Text)

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    project = relationship(
        "Project",
        back_populates="sfd_documents"
    )

    children = relationship(
        "SFDDocument"
    )

    test_cases = relationship(
        "TestCase",
        back_populates="sfd"
    )
# =========================
# TEST CASE
# =========================

class TestCase(Base):

    __tablename__ = "test_case"

    id = Column(Integer, primary_key=True)

    sfd_id = Column(
        Integer,
        ForeignKey("sfd_document.id")
    )

    parent_test_id = Column(
        Integer,
        ForeignKey("test_case.id"),
        nullable=True
    )

    version = Column(Integer)

    title = Column(String(500))

    regle_metier = Column(String(255))

    priorite = Column(String(20))

    severite = Column(String(20))

    type = Column(String(20))

    score = Column(Integer)

    status = Column(String(20))

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )

    sfd = relationship(
        "SFDDocument",
        back_populates="test_cases"
    )

    steps = relationship(
        "TestStep",
        back_populates="test_case"
    )

    executions = relationship(
        "TestExecution",
        back_populates="test_case"
    )


# =========================
# TEST STEP
# =========================

class TestStep(Base):

    __tablename__ = "test_step"

    id = Column(Integer, primary_key=True)

    test_case_id = Column(
        Integer,
        ForeignKey("test_case.id")
    )

    step_order = Column(Integer)

    description = Column(Text)

    test_case = relationship(
        "TestCase",
        back_populates="steps"
    )

    expected_results = relationship(
        "ExpectedResult",
        back_populates="step"
    )

    step_results = relationship(
        "StepResult",
        back_populates="step"
    )


# =========================
# EXPECTED RESULT
# =========================

class ExpectedResult(Base):

    __tablename__ = "expected_result"

    id = Column(Integer, primary_key=True)

    test_case_id = Column(
        Integer,
        ForeignKey("test_case.id")
    )

    step_id = Column(
        Integer,
        ForeignKey("test_step.id")
    )

    description = Column(Text)

    step = relationship(
        "TestStep",
        back_populates="expected_results"
    )


# =========================
# TEST EXECUTION
# =========================

class TestExecution(Base):

    __tablename__ = "test_execution"

    id = Column(Integer, primary_key=True)

    test_case_id = Column(
        Integer,
        ForeignKey("test_case.id")
    )

    execution_date = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    executed_by = Column(String(255))

    environment = Column(String(255))

    status = Column(String(20))

    comments = Column(Text)

    test_case = relationship(
        "TestCase",
        back_populates="executions"
    )

    step_results = relationship(
        "StepResult",
        back_populates="execution"
    )


# =========================
# STEP RESULT
# =========================

class StepResult(Base):

    __tablename__ = "step_result"

    id = Column(Integer, primary_key=True)

    test_execution_id = Column(
        Integer,
        ForeignKey("test_execution.id")
    )

    step_id = Column(
        Integer,
        ForeignKey("test_step.id")
    )

    result = Column(String(20))

    comment = Column(Text)

    execution = relationship(
        "TestExecution",
        back_populates="step_results"
    )

    step = relationship(
        "TestStep",
        back_populates="step_results"
    )