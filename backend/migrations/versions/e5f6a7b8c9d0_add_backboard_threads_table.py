"""Add backboard_threads table

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2025-01-15 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, Sequence[str], None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'backboard_threads',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('thread_id', sa.String(length=255), nullable=False),
        sa.Column('thread_type', sa.String(length=50), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=False,
        ),
        sa.Column(
            'last_message_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_backboard_threads_id'), 'backboard_threads', ['id'], unique=False)
    op.create_index(op.f('ix_backboard_threads_user_id'), 'backboard_threads', ['user_id'], unique=False)
    op.create_index(op.f('ix_backboard_threads_thread_id'), 'backboard_threads', ['thread_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_backboard_threads_thread_id'), table_name='backboard_threads')
    op.drop_index(op.f('ix_backboard_threads_user_id'), table_name='backboard_threads')
    op.drop_index(op.f('ix_backboard_threads_id'), table_name='backboard_threads')
    op.drop_table('backboard_threads')
