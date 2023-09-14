"""empty message

Revision ID: ba95be4977af
Revises: 92132f67f798
Create Date: 2023-09-13 00:38:38.752608

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ba95be4977af'
down_revision = '92132f67f798'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('language',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('proficiency',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('trait',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('race_languages',
    sa.Column('race_id', sa.Integer(), nullable=True),
    sa.Column('language_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['language_id'], ['language.id'], ),
    sa.ForeignKeyConstraint(['race_id'], ['race.id'], )
    )
    op.create_table('race_proficiencies',
    sa.Column('race_id', sa.Integer(), nullable=True),
    sa.Column('proficiency_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['proficiency_id'], ['proficiency.id'], ),
    sa.ForeignKeyConstraint(['race_id'], ['race.id'], )
    )
    op.create_table('race_traits',
    sa.Column('race_id', sa.Integer(), nullable=True),
    sa.Column('trait_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['race_id'], ['race.id'], ),
    sa.ForeignKeyConstraint(['trait_id'], ['trait.id'], )
    )
    op.create_table('subrace',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('race_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['race_id'], ['race.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    with op.batch_alter_table('race', schema=None) as batch_op:
        batch_op.add_column(sa.Column('ability_score_bonus', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('language_desc', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('parent_race_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('has_subrace', sa.Boolean(), nullable=True))
        batch_op.create_foreign_key(None, 'race', ['parent_race_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('race', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('has_subrace')
        batch_op.drop_column('parent_race_id')
        batch_op.drop_column('language_desc')
        batch_op.drop_column('ability_score_bonus')

    op.drop_table('subrace')
    op.drop_table('race_traits')
    op.drop_table('race_proficiencies')
    op.drop_table('race_languages')
    op.drop_table('trait')
    op.drop_table('proficiency')
    op.drop_table('language')
    # ### end Alembic commands ###