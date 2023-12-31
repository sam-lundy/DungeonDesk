"""empty message

Revision ID: edbe5ce0ba17
Revises: 3af6808d30f3
Create Date: 2023-10-04 21:40:41.197282

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'edbe5ce0ba17'
down_revision = '3af6808d30f3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('post_like',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('post_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=False),
    sa.Column('like_value', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['post_id'], ['post.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.uid'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('post_like')
    # ### end Alembic commands ###
