"""empty message

Revision ID: 0a68fc7db6bb
Revises: 20f5aff9bdb5
Create Date: 2023-09-19 23:24:58.549640

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0a68fc7db6bb'
down_revision = '20f5aff9bdb5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('ability_score',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('full_name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('classes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('hit_dice', sa.String(), nullable=False),
    sa.Column('default_proficiencies', sa.PickleType(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('equipment',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('language',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('proficiency',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('proficiency_type', sa.Enum('SKILL', 'TOOL', 'LANGUAGE', name='proficiency_types'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('race',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('parent_race_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['parent_race_id'], ['race.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('skill',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('trait',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('user',
    sa.Column('uid', sa.String(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('date_created', sa.DateTime(), nullable=True),
    sa.Column('profile_pic', sa.String(length=255), nullable=False),
    sa.Column('timezone', sa.String(length=50), nullable=True),
    sa.Column('location', sa.String(length=100), nullable=True),
    sa.Column('bio', sa.String(length=1000), nullable=False),
    sa.PrimaryKeyConstraint('uid'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('character_sheet',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.Column('race_name', sa.String(length=50), nullable=False),
    sa.Column('class_name', sa.String(length=50), nullable=False),
    sa.Column('background', sa.String(length=50), nullable=False),
    sa.Column('level', sa.Integer(), nullable=False),
    sa.Column('prof_bonus', sa.Integer(), nullable=False),
    sa.Column('inspiration', sa.Integer(), nullable=False),
    sa.Column('characterPic', sa.String(length=255), nullable=False),
    sa.Column('armor_class', sa.Integer(), nullable=False),
    sa.Column('current_hp', sa.Integer(), nullable=False),
    sa.Column('max_hp', sa.Integer(), nullable=False),
    sa.Column('user_uid', sa.String(), nullable=False),
    sa.CheckConstraint('level>=1 AND level<=20', name='level_check'),
    sa.ForeignKeyConstraint(['user_uid'], ['user.uid'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('character_sheet', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_character_sheet_user_uid'), ['user_uid'], unique=False)

    op.create_table('class_saving_throws',
    sa.Column('class_id', sa.Integer(), nullable=True),
    sa.Column('ability_score_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['ability_score_id'], ['ability_score.id'], ),
    sa.ForeignKeyConstraint(['class_id'], ['classes.id'], )
    )
    op.create_table('race_ability_bonuses',
    sa.Column('race_id', sa.Integer(), nullable=True),
    sa.Column('ability_score_id', sa.Integer(), nullable=True),
    sa.Column('bonus', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['ability_score_id'], ['ability_score.id'], ),
    sa.ForeignKeyConstraint(['race_id'], ['race.id'], )
    )
    op.create_table('sub_class',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('class_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('ability_modifiers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('character_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.Column('value', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['character_id'], ['character_sheet.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('character_ability_values',
    sa.Column('character_id', sa.Integer(), nullable=False),
    sa.Column('ability_score_id', sa.Integer(), nullable=False),
    sa.Column('value', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['ability_score_id'], ['ability_score.id'], ),
    sa.ForeignKeyConstraint(['character_id'], ['character_sheet.id'], ),
    sa.PrimaryKeyConstraint('character_id', 'ability_score_id')
    )
    op.create_table('character_equipments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('character_id', sa.Integer(), nullable=False),
    sa.Column('equipment_id', sa.Integer(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['character_id'], ['character_sheet.id'], ),
    sa.ForeignKeyConstraint(['equipment_id'], ['equipment.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('character_proficiencies',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('character_id', sa.Integer(), nullable=False),
    sa.Column('proficiency_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['character_id'], ['character_sheet.id'], ),
    sa.ForeignKeyConstraint(['proficiency_id'], ['proficiency.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('character_skill',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('character_id', sa.Integer(), nullable=False),
    sa.Column('skill_id', sa.Integer(), nullable=False),
    sa.Column('modifier', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['character_id'], ['character_sheet.id'], ),
    sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('character_skill')
    op.drop_table('character_proficiencies')
    op.drop_table('character_equipments')
    op.drop_table('character_ability_values')
    op.drop_table('ability_modifiers')
    op.drop_table('sub_class')
    op.drop_table('race_ability_bonuses')
    op.drop_table('class_saving_throws')
    with op.batch_alter_table('character_sheet', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_character_sheet_user_uid'))

    op.drop_table('character_sheet')
    op.drop_table('user')
    op.drop_table('trait')
    op.drop_table('skill')
    op.drop_table('race')
    op.drop_table('proficiency')
    op.drop_table('language')
    op.drop_table('equipment')
    op.drop_table('classes')
    op.drop_table('ability_score')
    # ### end Alembic commands ###
