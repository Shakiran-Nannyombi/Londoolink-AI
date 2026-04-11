"""Add backboard_assistants table

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2025-01-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'backboard_assistants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('assistant_id', sa.String(length=255), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_backboard_assistants_id'), 'backboard_assistants', ['id'], unique=False)
    op.create_index(op.f('ix_backboard_assistants_user_id'), 'backboard_assistants', ['user_id'], unique=True)
    op.create_index(op.f('ix_backboard_assistants_assistant_id'), 'backboard_assistants', ['assistant_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_backboard_assistants_assistant_id'), table_name='backboard_assistants')
    op.drop_index(op.f('ix_backboard_assistants_user_id'), table_name='backboard_assistants')
    op.drop_index(op.f('ix_backboard_assistants_id'), table_name='backboard_assistants')
    op.drop_table('backboard_assistants')
