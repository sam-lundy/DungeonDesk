"""empty message

Revision ID: d9c3846096e1
Revises: 8593a034f4c4
Create Date: 2023-09-22 18:39:18.572858

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd9c3846096e1'
down_revision = '8593a034f4c4'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('proficiency', schema=None) as batch_op:
        batch_op.drop_column('proficiency_type')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('proficiency', schema=None) as batch_op:
        batch_op.add_column(sa.Column('proficiency_type', postgresql.ENUM('SKILL', 'TOOL', 'LANGUAGE', name='proficiency_types'), autoincrement=False, nullable=False))

    # ### end Alembic commands ###
