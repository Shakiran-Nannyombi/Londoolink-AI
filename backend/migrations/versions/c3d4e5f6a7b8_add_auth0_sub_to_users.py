"""Add auth0_sub to users

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2025-12-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add auth0_sub column to users table."""
    op.add_column('users', sa.Column('auth0_sub', sa.String(255), nullable=True))
    op.create_index(op.f('ix_users_auth0_sub'), 'users', ['auth0_sub'], unique=True)


def downgrade() -> None:
    """Remove auth0_sub column from users table."""
    op.drop_index(op.f('ix_users_auth0_sub'), table_name='users')
    op.drop_column('users', 'auth0_sub')
