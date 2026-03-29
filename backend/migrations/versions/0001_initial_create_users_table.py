"""Initial migration - create users table

Revision ID: 0001_initial
Revises: 
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('profile_picture_url', sa.String(500), nullable=True),
        sa.Column('timezone', sa.String(50), server_default='UTC'),
        sa.Column('language_preference', sa.String(10), server_default='en'),
        sa.Column('notification_preferences', sa.Text(), nullable=True),
        sa.Column('two_factor_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('two_factor_secret', sa.String(32), nullable=True),
        sa.Column('backup_codes', sa.Text(), nullable=True),
        sa.Column('encrypted_google_token', sa.Text(), nullable=True),
        sa.Column('auth0_sub', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_users_id', 'users', ['id'])
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_phone_number', 'users', ['phone_number'])
    op.create_index('ix_users_auth0_sub', 'users', ['auth0_sub'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_users_auth0_sub', table_name='users')
    op.drop_index('ix_users_phone_number', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_id', table_name='users')
    op.drop_table('users')
