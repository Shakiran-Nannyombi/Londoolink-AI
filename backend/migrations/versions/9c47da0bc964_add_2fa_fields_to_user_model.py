"""Add 2FA fields to user model

Revision ID: 9c47da0bc964
Revises: fa98466add87
Create Date: 2025-12-26 09:57:06.187233

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c47da0bc964'
down_revision: Union[str, Sequence[str], None] = 'fa98466add87'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - columns already created in initial migration, nothing to do."""
    pass


def downgrade() -> None:
    """Downgrade schema - columns managed by initial migration."""
    pass
