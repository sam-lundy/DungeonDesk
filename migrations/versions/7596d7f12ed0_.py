"""empty message

Revision ID: 7596d7f12ed0
Revises: 
Create Date: 2023-08-31 16:56:45.948193

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7596d7f12ed0'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('uid', sa.String(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('date_created', sa.DateTime(), nullable=True),
    sa.Column('profile_pic', sa.String(length=120), nullable=False),
    sa.Column('bio', sa.String(length=500), nullable=False),
    sa.PrimaryKeyConstraint('uid'),
    sa.UniqueConstraint('username')
    )
    op.create_table('character_sheet',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('attributes', sa.JSON(), nullable=True),
    sa.Column('user_uid', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['user_uid'], ['user.uid'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('character_sheet', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_character_sheet_user_uid'), ['user_uid'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('character_sheet', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_character_sheet_user_uid'))

    op.drop_table('character_sheet')
    op.drop_table('user')
    # ### end Alembic commands ###
