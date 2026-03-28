"""Add vault columns to connected_services

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2025-12-26 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add vault-related columns to connected_services table."""
    op.add_column('connected_services', sa.Column('vault_backed', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('connected_services', sa.Column('auth0_sub', sa.String(length=255), nullable=True))
    op.add_column('connected_services', sa.Column('granted_scopes', sa.Text(), nullable=True))
    op.add_column('connected_services', sa.Column('last_token_used', sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f('ix_connected_services_auth0_sub'), 'connected_services', ['auth0_sub'], unique=False)


def downgrade() -> None:
    """Remove vault-related columns from connected_services table."""
    op.drop_index(op.f('ix_connected_services_auth0_sub'), table_name='connected_services')
    op.drop_column('connected_services', 'last_token_used')
    op.drop_column('connected_services', 'granted_scopes')
    op.drop_column('connected_services', 'auth0_sub')
    op.drop_column('connected_services', 'vault_backed')
